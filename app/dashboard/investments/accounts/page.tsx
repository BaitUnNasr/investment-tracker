import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
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
import { PlusIcon, EyeIcon } from "lucide-react"

const accounts = [
  { id: "1", accountNo: "075-001", client: "Sarah Mohammed Saleem Kazi", scheme: "RTD", weeklyAmt: 500, startDate: "21/07/2025", installments: 26, totalInvested: 13000, status: "active" },
  { id: "2", accountNo: "075-002", client: "Sohel Usman Patel", scheme: "RTD", weeklyAmt: 500, startDate: "01/09/2025", installments: 26, totalInvested: 13000, status: "active" },
  { id: "3", accountNo: "075-003", client: "Liza Faizan Qureshi", scheme: "RTD", weeklyAmt: 500, startDate: "13/10/2025", installments: 21, totalInvested: 10500, status: "active" },
  { id: "4", accountNo: "075-004", client: "Sharukh Iiyas Khan", scheme: "RTD", weeklyAmt: 500, startDate: "22/12/2025", installments: 6, totalInvested: 3000, status: "active" },
  { id: "5", accountNo: "075-005", client: "Saleem Kalle Khan", scheme: "RTD", weeklyAmt: 1000, startDate: "22/12/2025", installments: 5, totalInvested: 5000, status: "active" },
  { id: "6", accountNo: "075-006", client: "Shahid Hasan Ali Shaikh", scheme: "RTD", weeklyAmt: 500, startDate: "22/12/2025", installments: 6, totalInvested: 3000, status: "active" },
  { id: "7", accountNo: "075-007", client: "Amir Kifayat Khan", scheme: "RTD", weeklyAmt: 500, startDate: "29/12/2025", installments: 4, totalInvested: 2000, status: "active" },
  { id: "8", accountNo: "075-008", client: "Mohammed Amjad M. Idris Khan", scheme: "RTD", weeklyAmt: 500, startDate: "22/12/2025", installments: 6, totalInvested: 3000, status: "active" },
]

export default function InvestmentAccountsPage() {
  return (
    <>
      <SiteHeader title="Investment Accounts" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Investment Accounts</h2>
            <p className="text-sm text-muted-foreground">
              All client investment accounts across schemes
            </p>
          </div>
          <Button>
            <PlusIcon className="mr-2 size-4" />
            New Account
          </Button>
        </div>

        <div className="grid gap-4 @xl/main:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                RTD Accounts
              </CardTitle>
              <p className="text-2xl font-bold">
                {accounts.filter((a) => a.scheme === "RTD").length}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Recurring Term Deposit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                DSTD Accounts
              </CardTitle>
              <p className="text-2xl font-bold">0</p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Direct Small Term Deposit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                LTD Accounts
              </CardTitle>
              <p className="text-2xl font-bold">0</p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Lumpsum Term Deposit</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Accounts ({accounts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account No.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Scheme</TableHead>
                  <TableHead className="text-right">Weekly (₹)</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Installments</TableHead>
                  <TableHead className="text-right">Total Invested (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {acc.accountNo}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{acc.client}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{acc.scheme}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{acc.weeklyAmt.toLocaleString("en-IN")}</TableCell>
                    <TableCell>{acc.startDate}</TableCell>
                    <TableCell className="text-right">{acc.installments}</TableCell>
                    <TableCell className="text-right font-medium">
                      {acc.totalInvested.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={acc.status === "active" ? "default" : "secondary"}>
                        {acc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <EyeIcon className="size-4" />
                      </Button>
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
