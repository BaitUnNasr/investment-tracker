import { SiteHeader } from "@/components/site-header"
import {
  Card,
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
import { Separator } from "@/components/ui/separator"
import { DownloadIcon } from "lucide-react"

const branchReport = [
  {
    code: "075",
    name: "Branch 075",
    city: "Mumbai",
    clients: 8,
    activeAccounts: 8,
    totalInvested: 49500,
    weeklyCollection: 6500,
    tef: 17325,
    tgf: 14850,
    property: 17325,
  },
]

const theadCls = "text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3"

export default function BranchReportsPage() {
  return (
    <>
      <SiteHeader title="Branch Reports" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Branch Investment Report</h2>
            <p className="text-sm text-muted-foreground">
              Consolidated investment summary per branch
            </p>
          </div>
          <Button variant="outline">
            <DownloadIcon className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <Card className="p-0 gap-0">
          <CardHeader className="px-4 py-4">
            <CardTitle>Branch Summary</CardTitle>
            <CardDescription>Total corpus and fund allocation per branch</CardDescription>
          </CardHeader>
          <Separator />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                  <TableHead className={theadCls}>Code</TableHead>
                  <TableHead className={theadCls}>Branch</TableHead>
                  <TableHead className={theadCls}>City</TableHead>
                  <TableHead className={`${theadCls} text-right`}>Clients</TableHead>
                  <TableHead className={`${theadCls} text-right`}>Accounts</TableHead>
                  <TableHead className={`${theadCls} text-right`}>Weekly (₹)</TableHead>
                  <TableHead className={`${theadCls} text-right`}>Total Corpus</TableHead>
                  <TableHead className={`${theadCls} text-right text-blue-600`}>TEF</TableHead>
                  <TableHead className={`${theadCls} text-right text-amber-600`}>TGF</TableHead>
                  <TableHead className={`${theadCls} text-right text-emerald-600`}>Property</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchReport.map((branch) => (
                  <TableRow key={branch.code} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-medium">{branch.code}</TableCell>
                    <TableCell className="text-sm">{branch.name}</TableCell>
                    <TableCell className="text-sm">{branch.city}</TableCell>
                    <TableCell className="text-right tabular-nums">{branch.clients}</TableCell>
                    <TableCell className="text-right tabular-nums">{branch.activeAccounts}</TableCell>
                    <TableCell className="text-right tabular-nums">₹{branch.weeklyCollection.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">₹{branch.totalInvested.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right text-blue-600 tabular-nums">₹{branch.tef.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right text-amber-600 tabular-nums">₹{branch.tgf.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right text-emerald-600 tabular-nums">₹{branch.property.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  )
}
