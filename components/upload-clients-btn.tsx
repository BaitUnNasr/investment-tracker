"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
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

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClientRow {
  rowNum: number
  clientCode: string
  firstName: string
  lastName: string
  branchCode: string
  email: string
  phone: string
  schemeType: string
  weeklyAmount: number | null
  accountNumber: string
  startDate: string
  errors: string[]
}

interface UploadResult {
  inserted: number
  skipped: number
  errors: string[]
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = "" }
    else { current += ch }
  }
  result.push(current.trim())
  return result
}

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/
const VALID_SCHEMES = ["RTD", "DSTD", "LTD"]

function validateClientRow(row: Omit<ClientRow, "errors">): string[] {
  const errs: string[] = []
  // Required
  if (!row.clientCode) errs.push("Client code is missing")
  if (!row.firstName)  errs.push("First name is missing")
  if (!row.lastName)   errs.push("Last name is missing")
  if (!row.branchCode) errs.push("Branch code is missing")
  // Account fields — only validate if any are present
  if (row.schemeType && !VALID_SCHEMES.includes(row.schemeType.toUpperCase()))
    errs.push(`Scheme must be RTD, DSTD or LTD (got "${row.schemeType}")`)
  if (row.weeklyAmount !== null && row.weeklyAmount !== undefined && row.weeklyAmount <= 0)
    errs.push("Weekly amount must be > 0")
  if (row.startDate && !DATE_RE.test(row.startDate))
    errs.push("Start date must be DD/MM/YYYY")
  return errs
}

function parseAndValidateCsv(text: string): ClientRow[] {
  // Expected header: Client Code,First Name,Last Name,Branch Code,Email,Phone,Scheme Type,Weekly Amount,Account Number,Start Date
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const rows: ClientRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    if (cols.every((c) => !c) || cols.length < 4) continue
    const weeklyAmount = parseFloat((cols[7] ?? "").replace(/,/g, "")) || null
    const base = {
      rowNum:        i,
      clientCode:    cols[0] ?? "",
      firstName:     cols[1] ?? "",
      lastName:      cols[2] ?? "",
      branchCode:    cols[3] ?? "",
      email:         cols[4] ?? "",
      phone:         cols[5] ?? "",
      schemeType:    (cols[6] ?? "").toUpperCase(),
      weeklyAmount,
      accountNumber: cols[8] ?? "",
      startDate:     cols[9] ?? "",
    }
    rows.push({ ...base, errors: validateClientRow(base) })
  }
  return rows
}

// ─── Component ────────────────────────────────────────────────────────────────

type Step = "idle" | "preview" | "uploading" | "done"

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
    reader.onload = (e) => { setRows(parseAndValidateCsv(e.target?.result as string)); setStep("preview") }
    reader.readAsText(f)
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
        Import CSV
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v, details) => {
          if (!v && (details?.reason === "outside-press" || details?.reason === "escape-key")) return
          setOpen(v); if (!v) reset()
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-[90vw] sm:max-w-[90vw] flex-col gap-0 p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Import Clients</DialogTitle>
            <DialogDescription>
              CSV columns (in order):{" "}
              <span className="font-mono font-medium text-foreground">
                Client Code · First Name · Last Name · Branch Code · Email · Phone · Scheme Type · Weekly Amount · Account Number · Start Date (DD/MM/YYYY)
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
            {/* File picker */}
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            {!file ? (
              <button onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center transition-colors hover:border-muted-foreground/60 hover:bg-muted/30">
                <UploadIcon className="size-10 text-muted-foreground" />
                <p className="text-sm font-medium">Click to select CSV file</p>
                <p className="text-xs text-muted-foreground">Client list format (.csv)</p>
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <FileIcon className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {step === "idle" ? "Parsing…" : `${rows.length} rows found`}
                  </p>
                </div>
                {step !== "uploading" && step !== "done" && (
                  <Button variant="ghost" size="sm" onClick={reset}>Change</Button>
                )}
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
            {(step === "preview" || step === "uploading" || step === "done") && rows.length > 0 && (
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
                          <td className={`px-3 py-2 ${!VALID_SCHEMES.includes(r.schemeType) ? "text-red-600" : ""}`}>{r.schemeType || "—"}</td>
                          <td className={`px-3 py-2 text-right font-medium ${!r.weeklyAmount || r.weeklyAmount <= 0 ? "text-red-600" : ""}`}>
                            {r.weeklyAmount ?? <span className="italic text-muted-foreground">0</span>}
                          </td>
                          <td className={`px-3 py-2 font-mono ${!r.accountNumber ? "text-red-600" : ""}`}>{r.accountNumber || "—"}</td>
                          <td className={`px-3 py-2 ${!DATE_RE.test(r.startDate) ? "text-red-600" : ""}`}>{r.startDate || "—"}</td>
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
                No data rows found. Check the CSV has the correct 10-column format.
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
