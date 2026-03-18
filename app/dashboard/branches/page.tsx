import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { PlusIcon, PencilIcon } from "lucide-react"

// Placeholder data — replace with DB query
const branches = [
  {
    id: "1",
    code: "075",
    name: "Branch 075",
    city: "Mumbai",
    phone: "-",
    clients: 8,
    totalCorpus: 49500,
    isActive: true,
  },
]

export default function BranchesPage() {
  return (
    <>
      <SiteHeader title="Branches" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">All Branches</h2>
            <p className="text-sm text-muted-foreground">
              Manage BUN branches and their details
            </p>
          </div>
          <Button>
            <PlusIcon className="mr-2 size-4" />
            Add Branch
          </Button>
        </div>

        <div className="grid gap-4 @xl/main:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Branches</CardDescription>
              <CardTitle className="text-3xl">{branches.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Active branches</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Clients</CardDescription>
              <CardTitle className="text-3xl">
                {branches.reduce((s, b) => s + b.clients, 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Across all branches</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Corpus</CardDescription>
              <CardTitle className="text-3xl">
                ₹{branches.reduce((s, b) => s + b.totalCorpus, 0).toLocaleString("en-IN")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Combined investment</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Branch List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">Total Corpus</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-mono font-medium">{branch.code}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell>{branch.phone}</TableCell>
                    <TableCell className="text-right">{branch.clients}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{branch.totalCorpus.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? "Active" : "Inactive"}
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
