import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"

// Placeholder: NAV unit allotments per client per fund
// units = invested_amount / nav_value_on_transaction_date
// These would be computed from the database in production
const fundReport = [
  {
    client: "Sarah M. Kazi",
    code: "075-001",
    tefInvested: 4550,
    tefUnits: 246.83,
    tefCurrentValue: 4548.00,
    tgfInvested: 3900,
    tgfUnits: 157.36,
    tgfCurrentValue: 3901.40,
    propertyValue: 4550,
  },
  {
    client: "Sohel U. Patel",
    code: "075-002",
    tefInvested: 4550,
    tefUnits: 246.83,
    tefCurrentValue: 4548.00,
    tgfInvested: 3900,
    tgfUnits: 157.36,
    tgfCurrentValue: 3901.40,
    propertyValue: 4550,
  },
  {
    client: "Liza F. Qureshi",
    code: "075-003",
    tefInvested: 3675,
    tefUnits: 199.36,
    tefCurrentValue: 3673.60,
    tgfInvested: 3150,
    tgfUnits: 127.13,
    tgfCurrentValue: 3151.60,
    propertyValue: 3675,
  },
  {
    client: "Sharukh I. Khan",
    code: "075-004",
    tefInvested: 1050,
    tefUnits: 56.96,
    tefCurrentValue: 1049.60,
    tgfInvested: 900,
    tgfUnits: 36.32,
    tgfCurrentValue: 900.46,
    propertyValue: 1050,
  },
  {
    client: "Saleem K. Khan",
    code: "075-005",
    tefInvested: 1750,
    tefUnits: 94.93,
    tefCurrentValue: 1749.34,
    tgfInvested: 1500,
    tgfUnits: 60.53,
    tgfCurrentValue: 1500.77,
    propertyValue: 1750,
  },
]

export default function FundReportsPage() {
  return (
    <>
      <SiteHeader title="Fund Reports" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Fund Unit Allotment Report</h2>
            <p className="text-sm text-muted-foreground">
              NAV units allotted to each client and current market value
            </p>
          </div>
          <Button variant="outline">
            <DownloadIcon className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <div className="grid gap-4 @xl/main:grid-cols-2">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">
                Tata Ethical Fund (TEF)
              </CardTitle>
              <CardDescription>Latest NAV: ₹18.4521 · Allocation: 35%</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Invested (₹)</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Current Value (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fundReport.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell className="text-sm">{row.client}</TableCell>
                      <TableCell className="text-right">{row.tefInvested.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right font-mono">{row.tefUnits.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-medium">{row.tefCurrentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="text-amber-700 dark:text-amber-400">
                Tata Gold Fund (TGF)
              </CardTitle>
              <CardDescription>Latest NAV: ₹24.7830 · Allocation: 30%</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Invested (₹)</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Current Value (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fundReport.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell className="text-sm">{row.client}</TableCell>
                      <TableCell className="text-right">{row.tgfInvested.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right font-mono">{row.tgfUnits.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-medium">{row.tgfCurrentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">
              Property Allocation
            </CardTitle>
            <CardDescription>
              Tracked as cash value · Allocation: 35%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Allocated Value (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fundReport.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell>{row.client}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      ₹{row.propertyValue.toLocaleString("en-IN")}
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
