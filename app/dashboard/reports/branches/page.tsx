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

        <Card>
          <CardHeader>
            <CardTitle>Branch Summary</CardTitle>
            <CardDescription>Total corpus and fund allocation per branch</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">Accounts</TableHead>
                  <TableHead className="text-right">Weekly (₹)</TableHead>
                  <TableHead className="text-right">Total Corpus</TableHead>
                  <TableHead className="text-right text-blue-600">TEF</TableHead>
                  <TableHead className="text-right text-amber-600">TGF</TableHead>
                  <TableHead className="text-right text-emerald-600">Property</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchReport.map((branch) => (
                  <TableRow key={branch.code}>
                    <TableCell className="font-mono font-medium">{branch.code}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell className="text-right">{branch.clients}</TableCell>
                    <TableCell className="text-right">{branch.activeAccounts}</TableCell>
                    <TableCell className="text-right">
                      ₹{branch.weeklyCollection.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{branch.totalInvested.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      ₹{branch.tef.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right text-amber-600">
                      ₹{branch.tgf.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      ₹{branch.property.toLocaleString("en-IN")}
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
