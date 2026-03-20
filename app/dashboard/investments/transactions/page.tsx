import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { UploadTransactionsBtn } from "@/components/upload-transactions-btn"

const transactions = [
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-001", client: "Sarah M. Kazi", amount: 500, direction: "credit", installment: 26 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-003", client: "Liza F. Qureshi", amount: 500, direction: "credit", installment: 21 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-005", client: "Saleem K. Khan", amount: 1000, direction: "credit", installment: 5 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-007", client: "Amir K. Khan", amount: 500, direction: "credit", installment: 4 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-002", client: "Sohel U. Patel", amount: 500, direction: "credit", installment: 26 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-004", client: "Sharukh I. Khan", amount: 500, direction: "credit", installment: 6 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-006", client: "Shahid H. Shaikh", amount: 500, direction: "credit", installment: 6 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-008", client: "M. Amjad M.I. Khan", amount: 500, direction: "credit", installment: 6 },
  { date: "19/01/2026", transId: "1099804", type: "TRF", rcVc: "4452", account: "075-001", client: "Sarah M. Kazi", amount: 500, direction: "credit", installment: 25 },
  { date: "19/01/2026", transId: "1099804", type: "TRF", rcVc: "4452", account: "075-003", client: "Liza F. Qureshi", amount: 500, direction: "credit", installment: 20 },
]

export default function TransactionsPage() {
  return (
    <>
      <SiteHeader title="Transactions" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Investment Transactions</h2>
            <p className="text-sm text-muted-foreground">
              All credit and debit entries across investment accounts
            </p>
          </div>
          <UploadTransactionsBtn />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search by account, client..." className="pl-8" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trans ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Installment #</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead>Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn, i) => (
                  <TableRow key={i}>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell className="font-mono text-sm">{txn.transId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{txn.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">{txn.account}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{txn.client}</TableCell>
                    <TableCell>{txn.installment}</TableCell>
                    <TableCell className="text-right font-medium">
                      {txn.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={txn.direction === "credit" ? "default" : "destructive"}
                        className={txn.direction === "credit" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        {txn.direction}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
