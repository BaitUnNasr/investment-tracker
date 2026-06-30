"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RecentTransaction } from "@/app/dashboard/actions"

export function RecentTransactions({ transactions }: { transactions: RecentTransaction[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest weekly investment credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          transactions.map((txn, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">{txn.client}</p>
                <p className="text-xs text-muted-foreground">{txn.account} · {txn.date}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline" className="text-xs">{txn.type}</Badge>
                <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  +₹{txn.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
