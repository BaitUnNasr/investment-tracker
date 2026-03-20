"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const transactions = [
  { date: "26/01/2026", client: "Sarah M. Kazi", account: "075-001", amount: 500, type: "ECS" },
  { date: "26/01/2026", client: "Sohel U. Patel", account: "075-002", amount: 500, type: "ECS" },
  { date: "26/01/2026", client: "Liza F. Qureshi", account: "075-003", amount: 500, type: "ECS" },
  { date: "26/01/2026", client: "Saleem K. Khan", account: "075-005", amount: 1000, type: "ECS" },
  { date: "26/01/2026", client: "Sharukh I. Khan", account: "075-004", amount: 500, type: "ECS" },
  { date: "26/01/2026", client: "Shahid H. Shaikh", account: "075-006", amount: 500, type: "ECS" },
]

export function RecentTransactions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest weekly investment credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((txn, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium leading-tight">{txn.client}</p>
              <p className="text-xs text-muted-foreground">{txn.account} · {txn.date}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline" className="text-xs">{txn.type}</Badge>
              <span className="font-semibold text-emerald-600">+₹{txn.amount}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
