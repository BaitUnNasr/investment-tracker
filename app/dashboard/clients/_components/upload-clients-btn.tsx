"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircleIcon, FileIcon, UploadIcon, AlertCircleIcon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"
import { validateClientRows } from "@/app/dashboard/clients/actions"

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClientRow {
  rowNum: number
  clientCode: string
  firstName: string
  lastName: string
  branchCode: string
  email: string
  phone: string
  address: string
  accountNumber: string
  schemeType: string
  weeklyAmount: number | null
  startDate: string
  errors: string[]
}

interface UploadResult {
  inserted: number
  skipped: number
  errors: string[]
}

// ─── Excel helpers ─────────────────────────────────────────────────────────

const DATE_RE    = /^\d{2}\/\d{2}\/\d{4}$/
const VALID_SCHEMES = ["RTD", "DSTD", "LTD"]

/** Convert any cell value to a DD/MM/YYYY string, or return the raw string */
function normalizeDateCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return ""
  // SheetJS serial number → JS Date
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value)
    if (!d) return String(value)
    const dd   = String(d.d).padStart(2, "0")
    const mm   = String(d.m).padStart(2, "0")
    const yyyy = String(d.y)
    return `${dd}/${mm}/${yyyy}`
  }
  // Already a string — accept DD/MM/YYYY or YYYY-MM-DD and normalise
  const s = String(value).trim()
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
  return s
}

function str(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function validateClientRow(row: Omit<ClientRow, "errors">): string[] {
  const errs: string[] = []
  if (!row.clientCode) errs.push("Client code is missing")
  if (!row.firstName)  errs.push("First name is missing")
  if (!row.lastName)   errs.push("Last name is missing")
  if (!row.branchCode) errs.push("Branch code is missing")
  if (row.schemeType && !VALID_SCHEMES.includes(row.schemeType.toUpperCase()))
    errs.push(`Scheme must be RTD, DSTD or LTD (got "${row.schemeType}")`)
  if (row.weeklyAmount !== null && row.weeklyAmount !== undefined && row.weeklyAmount <= 0)
    errs.push("Weekly amount must be > 0")
  if (row.startDate && !DATE_RE.test(row.startDate))
    errs.push("Start date must be DD/MM/YYYY")
  return errs
}

function parseAndValidateExcel(buffer: ArrayBuffer): ClientRow[] {
  const wb   = XLSX.read(buffer, { type: "array", cellDates: false })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  // Get raw rows as arrays (header row = index 0)
  const data = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" })
  if (data.length < 2) return []

  const rows: ClientRow[] = []
  for (let i = 1; i < data.length; i++) {
    const cols = data[i] as unknown[]
    // Skip fully empty rows
    if (cols.every((c) => c === "" || c === null || c === undefined)) continue

    const weeklyRaw   = cols[9]
    const weeklyAmount = typeof weeklyRaw === "number" && weeklyRaw > 0
      ? weeklyRaw
      : parseFloat(str(weeklyRaw).replace(/,/g, "")) || null

    const base = {
      rowNum:        i,
      clientCode:    str(cols[0]),
      firstName:     str(cols[1]),
      lastName:      str(cols[2]),
      branchCode:    str(cols[3]),
      email:         str(cols[4]),
      phone:         str(cols[5]),
      address:       str(cols[6]),
      accountNumber: str(cols[7]),
      schemeType:    str(cols[8]).toUpperCase(),
      weeklyAmount,
      startDate:     normalizeDateCell(cols[10]),
    }
    rows.push({ ...base, errors: validateClientRow(base) })
  }
  return rows
}

// ─── Component ────────────────────────────────────────────────────────────────

type Step = "idle" | "validating" | "preview" | "uploading" | "done"

export function UploadClientsBtn() {
  const [open, setOpen]     = useState(false)
  const [file, setFile]     = useState<File | null>(null)
  const [rows, setRows]     = useState<ClientRow[]>([])
  const [step, setStep]     = useState<Step>("idle")
  const [result, setResult] = useState<UploadResult | null>(null)
  const inputRef            = useRef<HTMLInputElement>(null)
  const router              = useRouter()

  const validRows   = rows.filter((r) => r.errors.length === 0)
  const invalidRows = rows.filter((r) => r.errors.length > 0)

  function handleFileSelect(f: File) {
    setFile(f); setStep("idle"); setResult(null)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const parsed = parseAndValidateExcel(e.target?.result as ArrayBuffer)
      setRows(parsed)
      setStep("validating")
      try {
        const serverErrors = await validateClientRows(
          parsed.map((r) => ({
            rowNum:        r.rowNum,
            clientCode:    r.clientCode,
            accountNumber: r.accountNumber,
            branchCode:    r.branchCode,
          }))
        )
        // Merge server-side errors into the rows
        if (Object.keys(serverErrors).length > 0) {
          setRows(parsed.map((r) =>
            serverErrors[r.rowNum]
              ? { ...r, errors: [...r.errors, ...serverErrors[r.rowNum]] }
              : r
          ))
        }
      } catch {
        toast.error("Could not run server validation — check your connection.")
      }
      setStep("preview")
    }
    reader.readAsArrayBuffer(f)
  }

  async function handleConfirmUpload() {
    setStep("uploading")
    try {
      const res = await fetch("/api/upload/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setResult(data)
      setStep("done")
      toast.success(`Imported ${data.inserted} clients`)
      router.refresh()
    } catch (err) {
      setStep("preview")
      toast.error(err instanceof Error ? err.message : "Upload failed")
    }
  }

  function reset() {
    setFile(null); setRows([]); setStep("idle"); setResult(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <UploadIcon className="mr-2 size-4" />
        Import Excel
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v); if (!v) reset()
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-[90vw] sm:max-w-[90vw] flex-col gap-0 p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Import Clients</DialogTitle>
            <DialogDescription>
              Excel columns (in order):{" "}
              <span className="font-mono font-medium text-foreground">
                Client Code · First Name · Last Name · Branch Code · Email · Phone · Address · Account Number · Scheme Type · Weekly Amount · Start Date (DD/MM/YYYY)
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
            {/* File picker */}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {!file ? (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center transition-colors hover:border-muted-foreground/60 hover:bg-muted/30"
              >
                <UploadIcon className="size-10 text-muted-foreground" />
                <p className="text-sm font-medium">Click to select Excel file</p>
                <p className="text-xs text-muted-foreground">Client list format (.xlsx, .xls)</p>
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <FileIcon className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {step === "idle"       ? "Parsing…"
                     : step === "validating" ? "Validating against database…"
                     : `${rows.length} rows found`}
                  </p>
                </div>
                {step !== "uploading" && step !== "done" && (
                  <Button variant="ghost" size="sm" onClick={reset}>Change</Button>
                )}
              </div>
            )}

            {/* Validating spinner */}
            {step === "validating" && (
              <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
                <svg className="size-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Checking branch codes, duplicate client codes and account numbers…
              </div>
            )}

            {/* Summary banner */}
            {(step === "preview" || step === "uploading" || step === "done") && rows.length > 0 && (
              <div className={`flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3 text-sm ${
                invalidRows.length === 0
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                  : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
              }`}>
                <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircleIcon className="size-4" />{validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 font-medium text-yellow-700 dark:text-yellow-400">
                    <AlertCircleIcon className="size-4" />{invalidRows.length} invalid — will be skipped
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{rows.length} total rows</span>
              </div>
            )}

            {/* Full row table */}
            {(step === "validating" || step === "preview" || step === "uploading" || step === "done") && rows.length > 0 && (
              <div className="overflow-auto rounded-md border text-xs">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
                    <tr>
                      <th className="w-7 px-2 py-2.5" />
                      <th className="px-3 py-2.5 text-left font-medium">#</th>
                      <th className="px-3 py-2.5 text-left font-medium">Client Code</th>
                      <th className="px-3 py-2.5 text-left font-medium">First Name</th>
                      <th className="px-3 py-2.5 text-left font-medium">Last Name</th>
                      <th className="px-3 py-2.5 text-left font-medium">Branch</th>
                      <th className="px-3 py-2.5 text-left font-medium">Scheme</th>
                      <th className="px-3 py-2.5 text-right font-medium">Weekly (₹)</th>
                      <th className="px-3 py-2.5 text-left font-medium">Account No</th>
                      <th className="px-3 py-2.5 text-left font-medium">Start Date</th>
                      <th className="px-3 py-2.5 text-left font-medium">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const isValid = r.errors.length === 0
                      return (
                        <tr key={r.rowNum} className={`border-t ${isValid ? "hover:bg-muted/30" : "bg-red-50 dark:bg-red-950/20"}`}>
                          <td className="px-2 py-2 text-center">
                            {isValid
                              ? <CheckCircleIcon className="size-3.5 text-emerald-500" />
                              : <XCircleIcon className="size-3.5 text-red-500" />}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{r.rowNum}</td>
                          <td className={`px-3 py-2 font-mono ${!r.clientCode ? "text-red-600" : ""}`}>
                            {r.clientCode || <span className="italic text-muted-foreground">missing</span>}
                          </td>
                          <td className={`px-3 py-2 ${!r.firstName ? "text-red-600" : ""}`}>{r.firstName || "—"}</td>
                          <td className={`px-3 py-2 ${!r.lastName ? "text-red-600" : ""}`}>{r.lastName || "—"}</td>
                          <td className={`px-3 py-2 font-mono ${!r.branchCode ? "text-red-600" : ""}`}>{r.branchCode || "—"}</td>
                          <td className={`px-3 py-2 ${r.schemeType && !VALID_SCHEMES.includes(r.schemeType) ? "text-red-600" : ""}`}>
                            {r.schemeType || "—"}
                          </td>
                          <td className={`px-3 py-2 text-right font-medium ${r.weeklyAmount !== null && r.weeklyAmount <= 0 ? "text-red-600" : ""}`}>
                            {r.weeklyAmount ?? <span className="italic text-muted-foreground">—</span>}
                          </td>
                          <td className="px-3 py-2 font-mono">{r.accountNumber || "—"}</td>
                          <td className={`px-3 py-2 ${r.startDate && !DATE_RE.test(r.startDate) ? "text-red-600" : ""}`}>
                            {r.startDate || "—"}
                          </td>
                          <td className="min-w-[180px] px-3 py-2">
                            {r.errors.length > 0 && (
                              <ul className="space-y-0.5">
                                {r.errors.map((e, i) => <li key={i} className="text-red-600 dark:text-red-400">{e}</li>)}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {step === "preview" && rows.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-800 dark:bg-yellow-950/30">
                <AlertCircleIcon className="size-4 shrink-0 text-yellow-600" />
                No data rows found. Check the Excel file has the correct 11-column format.
              </div>
            )}

            {step === "done" && result && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="size-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Import complete</p>
                </div>
                <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-500">
                  {result.inserted} inserted · {result.skipped} skipped
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.errors.slice(0, 10).map((e, i) => <li key={i} className="text-xs text-red-600 dark:text-red-400">{e}</li>)}
                    {result.errors.length > 10 && <li className="text-xs text-muted-foreground">…and {result.errors.length - 10} more</li>}
                  </ul>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            {step === "validating" && <Button disabled>Validating…</Button>}
            {step === "preview" && validRows.length > 0 && (
              <Button onClick={handleConfirmUpload}>
                <UploadIcon className="mr-2 size-4" />
                Confirm &amp; Import {validRows.length} clients
                {invalidRows.length > 0 && <span className="ml-1 opacity-60">({invalidRows.length} skipped)</span>}
              </Button>
            )}
            {step === "uploading" && <Button disabled>Importing…</Button>}
            {step === "done" && <Button variant="outline" onClick={reset}>Import another file</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
