"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircleIcon, FileIcon, UploadIcon, AlertCircleIcon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────

type FundType = "TEF" | "TGF"

interface NavRow {
  rowNum: number
  date: string
  navValue: number | null
  errors: string[]
}

interface UploadResult {
  inserted: number
  skipped: number
  errors: string[]
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/

function parseAndValidateNavCsv(text: string): NavRow[] {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const rows: NavRow[] = []
  const seenDates = new Map<string, number>()

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    if (cols.every((c) => !c) || cols.length < 2) continue

    const rowNum   = i
    const date     = cols[0] ?? ""
    const rawNav   = (cols[1] ?? "").replace(/,/g, "")
    const navValue = rawNav ? parseFloat(rawNav) : null
    const errors: string[] = []

    if (!DATE_RE.test(date)) {
      errors.push("Invalid date format (expected DD/MM/YYYY)")
    } else if (seenDates.has(date)) {
      errors.push(`Duplicate date — already on row ${seenDates.get(date)}`)
    } else {
      seenDates.set(date, rowNum)
    }

    if (navValue === null || isNaN(navValue)) {
      errors.push("NAV is not a valid number")
    } else if (navValue <= 0) {
      errors.push("NAV must be greater than zero")
    }

    rows.push({ rowNum, date, navValue: navValue !== null && !isNaN(navValue) ? navValue : null, errors })
  }

  return rows
}

// ─── Component ───────────────────────────────────────────────────────────────

type Step = "idle" | "preview" | "uploading" | "done"

export function UploadNavBtn() {
  const [open, setOpen]       = useState(false)
  const [fundType, setFundType] = useState<FundType>("TEF")
  const [file, setFile]       = useState<File | null>(null)
  const [rows, setRows]       = useState<NavRow[]>([])
  const [step, setStep]       = useState<Step>("idle")
  const [result, setResult]   = useState<UploadResult | null>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  const validRows   = rows.filter((r) => r.errors.length === 0)
  const invalidRows = rows.filter((r) => r.errors.length > 0)

  function handleFileSelect(f: File) {
    setFile(f)
    setStep("idle")
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setRows(parseAndValidateNavCsv(e.target?.result as string))
      setStep("preview")
    }
    reader.readAsText(f)
  }

  async function handleConfirmUpload() {
    setStep("uploading")
    try {
      const res  = await fetch("/api/upload/nav", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fundType,
          rows: validRows.map((r) => ({ date: r.date, navValue: r.navValue })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setResult(data)
      setStep("done")
      toast.success(`Uploaded ${data.inserted} NAV entries for ${fundType}`)
    } catch (err) {
      setStep("preview")
      toast.error(err instanceof Error ? err.message : "Upload failed")
    }
  }

  function reset() {
    setFile(null)
    setRows([])
    setStep("idle")
    setResult(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UploadIcon className="mr-2 size-4" />
        Upload NAV (CSV)
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v, details) => {
          if (!v && (details?.reason === "outside-press" || details?.reason === "escape-key")) return
          setOpen(v)
          if (!v) reset()
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-[90vw] sm:max-w-[90vw] flex-col gap-0 p-0">

          {/* Header */}
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Upload NAV Data</DialogTitle>
            <DialogDescription>
              Two-column CSV:{" "}
              <span className="font-mono font-medium text-foreground">Date, NAV</span>
              {" "}(e.g.{" "}
              <span className="font-mono">07/02/2026,18.4521</span>)
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">

            {/* Fund selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fund</label>
              <Select
                value={fundType}
                onValueChange={(v) => {
                  setFundType(v as FundType)
                  if (step === "done") { setStep("preview"); setResult(null) }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEF">Tata Ethical Fund (TEF)</SelectItem>
                  <SelectItem value="TGF">Tata Gold Fund (TGF)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File picker */}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {!file ? (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center transition-colors hover:border-muted-foreground/60 hover:bg-muted/30"
              >
                <UploadIcon className="size-10 text-muted-foreground" />
                <p className="text-sm font-medium">Click to select CSV file</p>
                <p className="text-xs text-muted-foreground">Two columns: Date, NAV</p>
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

            {/* Validation summary */}
            {(step === "preview" || step === "uploading" || step === "done") && rows.length > 0 && (
              <div className={`flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3 text-sm ${
                invalidRows.length === 0
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                  : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
              }`}>
                <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircleIcon className="size-4" />
                  {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 font-medium text-yellow-700 dark:text-yellow-400">
                    <AlertCircleIcon className="size-4" />
                    {invalidRows.length} invalid — will be skipped
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
                      <th className="px-3 py-2.5 text-left font-medium">Date</th>
                      <th className="px-3 py-2.5 text-right font-medium">NAV (₹)</th>
                      <th className="px-3 py-2.5 text-left font-medium">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const isValid = r.errors.length === 0
                      return (
                        <tr
                          key={r.rowNum}
                          className={`border-t ${
                            isValid ? "hover:bg-muted/30" : "bg-red-50 dark:bg-red-950/20"
                          }`}
                        >
                          <td className="px-2 py-2 text-center">
                            {isValid
                              ? <CheckCircleIcon className="size-3.5 text-emerald-500" />
                              : <XCircleIcon className="size-3.5 text-red-500" />
                            }
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{r.rowNum}</td>
                          <td className={`px-3 py-2 ${!DATE_RE.test(r.date) ? "text-red-600" : ""}`}>
                            {r.date || <span className="italic text-muted-foreground">—</span>}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-medium ${
                            r.navValue === null || r.navValue <= 0 ? "text-red-600" : ""
                          }`}>
                            {r.navValue !== null
                              ? r.navValue.toFixed(4)
                              : <span className="italic text-muted-foreground">invalid</span>
                            }
                          </td>
                          <td className="px-3 py-2">
                            {r.errors.length > 0 && (
                              <ul className="space-y-0.5">
                                {r.errors.map((e, i) => (
                                  <li key={i} className="text-red-600 dark:text-red-400">{e}</li>
                                ))}
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
                No data rows found. Expected format: header row, then Date,NAV rows.
              </div>
            )}

            {/* Result */}
            {step === "done" && result && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="size-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Upload complete
                  </p>
                </div>
                <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-500">
                  {result.inserted} inserted · {result.skipped} already existed (skipped)
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i} className="text-xs text-red-600 dark:text-red-400">{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            {step === "preview" && validRows.length > 0 && (
              <Button onClick={handleConfirmUpload}>
                <UploadIcon className="mr-2 size-4" />
                Confirm &amp; Upload {validRows.length} rows
                {invalidRows.length > 0 && (
                  <span className="ml-1 opacity-60">({invalidRows.length} skipped)</span>
                )}
              </Button>
            )}
            {step === "uploading" && <Button disabled>Uploading…</Button>}
            {step === "done" && (
              <Button variant="outline" onClick={reset}>Upload another file</Button>
            )}
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </>
  )
}
