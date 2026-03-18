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

const data = [
  { month: "Aug", TEF: 2625, TGF: 2250, Property: 2625 },
  { month: "Sep", TEF: 5250, TGF: 4500, Property: 5250 },
  { month: "Oct", TEF: 8750, TGF: 7500, Property: 8750 },
  { month: "Nov", TEF: 12250, TGF: 10500, Property: 12250 },
  { month: "Dec", TEF: 16625, TGF: 14250, Property: 16625 },
  { month: "Jan", TEF: 22400, TGF: 19200, Property: 22400 },
]

export function FundAllocationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Allocation Growth</CardTitle>
        <CardDescription>
          Corpus distribution across TEF (35%), TGF (30%), and Property (35%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTEF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTGF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend />
            <Area type="monotone" dataKey="TEF" name="Tata Ethical Fund" stroke="hsl(var(--primary))" fill="url(#colorTEF)" strokeWidth={2} />
            <Area type="monotone" dataKey="TGF" name="Tata Gold Fund" stroke="#f59e0b" fill="url(#colorTGF)" strokeWidth={2} />
            <Area type="monotone" dataKey="Property" name="Property" stroke="#10b981" fill="url(#colorProp)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
