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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PencilIcon, BuildingIcon, UsersIcon, WalletIcon } from "lucide-react"
import { db } from "@/db"
import {
  branches,
  clients,
  investmentAccounts,
  investmentTransactions,
} from "@/db/schema"
import { eq, count, sum } from "drizzle-orm"
import { AddBranchDialog } from "@/components/add-branch-dialog"

async function getBranchData() {
  // Branch list with client count
  const branchRows = await db
    .select({
      id:       branches.id,
      code:     branches.code,
      name:     branches.name,
      city:     branches.city,
      phone:    branches.phone,
      address:  branches.address,
      isActive: branches.isActive,
      clients:  count(clients.id),
    })
    .from(branches)
    .leftJoin(clients, eq(clients.branchId, branches.id))
    .groupBy(branches.id)

  // Total corpus per branch (sum of all credit transactions)
  const corpusRows = await db
    .select({
      branchId:    clients.branchId,
      totalCorpus: sum(investmentTransactions.amount),
    })
    .from(investmentTransactions)
    .innerJoin(
      investmentAccounts,
      eq(investmentAccounts.id, investmentTransactions.accountId)
    )
    .innerJoin(clients, eq(clients.id, investmentAccounts.clientId))
    .where(eq(investmentTransactions.direction, "credit"))
    .groupBy(clients.branchId)

  const corpusMap = new Map(
    corpusRows.map((r) => [r.branchId, parseFloat(r.totalCorpus ?? "0")])
  )

  return branchRows.map((b) => ({
    ...b,
    clients:     b.clients ?? 0,
    totalCorpus: corpusMap.get(b.id) ?? 0,
  }))
}

export default async function BranchesPage() {
  const branchData = await getBranchData()

  const totalClients = branchData.reduce((s, b) => s + b.clients, 0)
  const totalCorpus  = branchData.reduce((s, b) => s + b.totalCorpus, 0)
  const activeBranches = branchData.filter((b) => b.isActive).length

  return (
    <>
      <SiteHeader title="Branches" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">All Branches</h2>
            <p className="text-sm text-muted-foreground">
              Manage BUN branches and their details
            </p>
          </div>
          <AddBranchDialog />
        </div>

        {/* Stats — always 3 columns */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Branches</CardDescription>
                <BuildingIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{activeBranches}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Active branches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Clients</CardDescription>
                <UsersIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{totalClients}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Across all branches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Corpus</CardDescription>
                <WalletIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">
                ₹{totalCorpus.toLocaleString("en-IN")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Combined investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch table */}
        <Card>
          <CardHeader>
            <CardTitle>Branch List</CardTitle>
            <CardDescription>
              {branchData.length === 0
                ? "No branches yet. Add your first branch to get started."
                : `${branchData.length} branch${branchData.length !== 1 ? "es" : ""} registered`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {branchData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BuildingIcon className="mb-3 size-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">No branches found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click &ldquo;Add Branch&rdquo; to create your first branch.
                </p>
              </div>
            ) : (
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
                    <TableHead className="w-[52px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchData.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-mono font-medium">{branch.code}</TableCell>
                      <TableCell>{branch.name}</TableCell>
                      <TableCell>{branch.city ?? "—"}</TableCell>
                      <TableCell>{branch.phone ?? "—"}</TableCell>
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
            )}
          </CardContent>
        </Card>

      </div>
    </>
  )
}
