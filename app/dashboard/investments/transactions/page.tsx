import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UploadTransactionsBtn } from "@/components/upload-transactions-btn"
import { TransactionsTable } from "./_components/transactions-table"
import { getTransactionRows } from "@/app/dashboard/investments/actions"

export default async function TransactionsPage() {
  const transactions = await getTransactionRows()

  return (
    <>
      <SiteHeader title="Transactions" />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 min-w-0">
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
            <CardTitle>Transaction Ledger ({transactions.length})</CardTitle>
          </CardHeader>
          <Separator />
          <TransactionsTable data={transactions} />
        </Card>
      </div>
    </>
  )
}
