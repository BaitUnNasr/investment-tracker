import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UploadTransactionsBtn } from "@/components/upload-transactions-btn"
import { TransactionsTable, type TransactionRow } from "./_components/transactions-table"

const transactions: TransactionRow[] = [
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-001", client: "Sarah M. Kazi",      amount: 500,  direction: "credit", installment: 26 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-003", client: "Liza F. Qureshi",    amount: 500,  direction: "credit", installment: 21 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-005", client: "Saleem K. Khan",     amount: 1000, direction: "credit", installment: 5  },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-007", client: "Amir K. Khan",       amount: 500,  direction: "credit", installment: 4  },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-002", client: "Sohel U. Patel",     amount: 500,  direction: "credit", installment: 26 },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-004", client: "Sharukh I. Khan",    amount: 500,  direction: "credit", installment: 6  },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-006", client: "Shahid H. Shaikh",   amount: 500,  direction: "credit", installment: 6  },
  { date: "26/01/2026", transId: "1101939", type: "TRF", rcVc: "4496", account: "075-008", client: "M. Amjad M.I. Khan", amount: 500,  direction: "credit", installment: 6  },
  { date: "19/01/2026", transId: "1099804", type: "TRF", rcVc: "4452", account: "075-001", client: "Sarah M. Kazi",      amount: 500,  direction: "credit", installment: 25 },
  { date: "19/01/2026", transId: "1099804", type: "TRF", rcVc: "4452", account: "075-003", client: "Liza F. Qureshi",    amount: 500,  direction: "credit", installment: 20 },
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

        <Card className="p-0 gap-0">
          <CardHeader className="px-4 py-4">
            <CardTitle>Transaction Ledger</CardTitle>
          </CardHeader>
          <Separator />
          <TransactionsTable data={transactions} />
        </Card>
      </div>
    </>
  )
}
