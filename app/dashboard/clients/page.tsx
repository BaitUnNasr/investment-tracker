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
import { Input } from "@/components/ui/input"
import { PlusIcon, PencilIcon, SearchIcon } from "lucide-react"

// Placeholder data — replace with DB query
const clients = [
  { id: "1", code: "075-001", name: "Sarah Mohammed Saleem Kazi", branch: "075", phone: "-", weeklyAmt: 500, scheme: "RTD", totalInvested: 13000, isActive: true },
  { id: "2", code: "075-002", name: "Sohel Usman Patel", branch: "075", phone: "-", weeklyAmt: 500, scheme: "RTD", totalInvested: 13000, isActive: true },
  { id: "3", code: "075-003", name: "Liza Faizan Qureshi", branch: "075", phone: "-", weeklyAmt: 500, scheme: "RTD", totalInvested: 10500, isActive: true },
  { id: "4", code: "075-004", name: "Sharukh Iiyas Khan", branch: "075", phone: "-", weeklyAmt: 500, scheme: "RTD", totalInvested: 3000, isActive: true },
  { id: "5", code: "075-005", name: "Saleem Kalle Khan", branch: "075", phone: "-", weeklyAmt: 1000, scheme: "RTD", totalInvested: 5000, isActive: true },
  { id: "6", code: "075-006", name: "Shahid Hasan Ali Shaikh", branch: "075", phone: "-", weeklyAmt: 500, scheme: "RTD", totalInvested: 3000, isActive: true },
  { id: "7", code: "075-007", name: "Amir Kifayat Khan", branch: "075", phone: "-", weeklyAmt: 500, scheme: "RTD", totalInvested: 2000, isActive: true },
  { id: "8", code: "075-008", name: "Mohammed Amjad Mohammed Idris Khan", branch: "075", phone: "-", weeklyAmt: 500, scheme: "RTD", totalInvested: 3000, isActive: true },
]

const schemeColors: Record<string, "default" | "secondary" | "outline"> = {
  RTD: "default",
  DSTD: "secondary",
  LTD: "outline",
}

export default function ClientsPage() {
  return (
    <>
      <SiteHeader title="Clients" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">All Clients</h2>
            <p className="text-sm text-muted-foreground">
              Manage investor accounts across all branches
            </p>
          </div>
          <Button>
            <PlusIcon className="mr-2 size-4" />
            Add Client
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-8" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client List ({clients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Scheme</TableHead>
                  <TableHead className="text-right">Weekly (₹)</TableHead>
                  <TableHead className="text-right">Total Invested (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {client.code}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">{client.name}</TableCell>
                    <TableCell>{client.branch}</TableCell>
                    <TableCell>
                      <Badge variant={schemeColors[client.scheme]}>
                        {client.scheme}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {client.weeklyAmt.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {client.totalInvested.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <PencilIcon className="size-4" />
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
