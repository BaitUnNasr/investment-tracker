"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SaveIcon, AlertCircleIcon } from "lucide-react"

const FUNDS = [
  {
    key: "TEF",
    label: "Tata Ethical Fund (TEF)",
    description: "Equity mutual fund — Sharia-compliant",
    color: "bg-blue-500",
  },
  {
    key: "TGF",
    label: "Tata Gold Fund (TGF)",
    description: "Gold-backed fund for capital preservation",
    color: "bg-amber-500",
  },
  {
    key: "PROPERTY",
    label: "Property",
    description: "Real estate investment allocation",
    color: "bg-emerald-500",
  },
]

export default function FundSettingsPage() {
  const [allocations, setAllocations] = useState({
    TEF: "35",
    TGF: "30",
    PROPERTY: "35",
  })

  const total = Object.values(allocations).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0,
  )
  const isValid = Math.abs(total - 100) < 0.01

  function handleChange(key: string, value: string) {
    setAllocations((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!isValid) {
      toast.error("Allocations must sum to exactly 100%")
      return
    }
    // TODO: call API to persist settings
    toast.success("Fund allocation settings saved successfully")
  }

  return (
    <>
      <SiteHeader title="Fund Allocation Settings" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <h2 className="text-xl font-semibold">Fund Allocation Settings</h2>
          <p className="text-sm text-muted-foreground">
            Define how each client&apos;s investment is split across funds. Total must equal 100%.
          </p>
        </div>

        <div className="grid gap-4 @xl/main:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Percentages</CardTitle>
              <CardDescription>
                These percentages apply to all new transactions. Existing allotments are not
                retroactively recalculated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {FUNDS.map((fund) => (
                <div key={fund.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`size-3 rounded-full ${fund.color}`} />
                    <Label htmlFor={fund.key} className="font-medium">
                      {fund.label}
                    </Label>
                  </div>
                  <p className="pl-5 text-xs text-muted-foreground">{fund.description}</p>
                  <div className="flex items-center gap-2 pl-5">
                    <Input
                      id={fund.key}
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={allocations[fund.key as keyof typeof allocations]}
                      onChange={(e) => handleChange(fund.key, e.target.value)}
                      className="w-28 font-mono"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span
                    className={`text-lg font-bold ${isValid ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {total.toFixed(2)}%
                  </span>
                </div>
                {!isValid && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
                    <AlertCircleIcon className="size-4" />
                    Total must equal exactly 100%
                  </div>
                )}
              </div>

              <Button onClick={handleSave} disabled={!isValid} className="w-full">
                <SaveIcon className="mr-2 size-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Visual breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Allocation Preview</CardTitle>
              <CardDescription>
                Example: for ₹1,000 investment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {FUNDS.map((fund) => {
                const pct = parseFloat(allocations[fund.key as keyof typeof allocations]) || 0
                const amount = (pct / 100) * 1000
                return (
                  <div key={fund.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`size-2.5 rounded-full ${fund.color}`} />
                        <span>{fund.label}</span>
                      </div>
                      <span className="font-medium">
                        ₹{amount.toFixed(0)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${fund.color} transition-all`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">How NAV allotment works</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>Client invests ₹1,000 on a given date</li>
                  <li>TEF portion = ₹350 ÷ NAV on that date = X units</li>
                  <li>TGF portion = ₹300 ÷ NAV on that date = Y units</li>
                  <li>Property portion = ₹350 (tracked as cash value)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
