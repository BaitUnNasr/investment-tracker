"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { FundAllocation } from "@/app/dashboard/actions"

type FundDatum = { month: string; TEF: number; TGF: number; Property: number }

type TooltipItem = { name?: string; value?: number; color?: string }

// Custom tooltip: lists each fund and highlights its amount in that fund's color.
function FundTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              {item.name}
            </span>
            <span className="font-semibold tabular-nums" style={{ color: item.color }}>
              ₹{(item.value ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FundAllocationChart({
  data,
  allocation,
}: {
  data: FundDatum[]
  allocation: FundAllocation
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Allocation Growth</CardTitle>
        <CardDescription>
          Corpus distribution across TEF ({allocation.tef}%), TGF ({allocation.tgf}%), and Property ({allocation.property}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No fund data yet.
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTEF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTGF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
            <YAxis className="text-xs" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<FundTooltip />}
            />
            <Legend />
            <Area type="monotone" dataKey="TEF" name="Tata Ethical Fund" stroke="var(--chart-1)" fill="url(#colorTEF)" strokeWidth={2} />
            <Area type="monotone" dataKey="TGF" name="Tata Gold Fund" stroke="var(--chart-2)" fill="url(#colorTGF)" strokeWidth={2} />
            <Area type="monotone" dataKey="Property" name="Property" stroke="var(--chart-3)" fill="url(#colorProp)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
