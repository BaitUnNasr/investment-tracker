import { Suspense } from "react"
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
import { PencilIcon, UsersIcon, UserCheckIcon, WalletIcon, TrendingUpIcon } from "lucide-react"
import { db } from "@/db"
import { clients, branches, investmentAccounts, investmentTransactions } from "@/db/schema"
import { eq, like, or, count, sum } from "drizzle-orm"
import { AddClientDialog } from "@/components/add-client-dialog"
import { UploadClientsBtn } from "@/components/upload-clients-btn"
import { ClientsSearchInput } from "@/components/clients-search-input"

const schemeColors: Record<string, "default" | "secondary" | "outline"> = {
  RTD: "default", DSTD: "secondary", LTD: "outline",
}

async function getStats() {
  const [totalRow] = await db.select({ total: count(clients.id) }).from(clients)
  const [activeRow] = await db.select({ active: count(clients.id) }).from(clients).where(eq(clients.isActive, true))

  const [investedRow] = await db
    .select({ total: sum(investmentTransactions.amount) })
    .from(investmentTransactions)
    .where(eq(investmentTransactions.direction, "credit"))

  const [weeklyRow] = await db
    .select({ total: sum(investmentAccounts.weeklyAmount) })
    .from(investmentAccounts)
    .where(eq(investmentAccounts.status, "active"))

  return {
    total:         totalRow?.total  ?? 0,
    active:        activeRow?.active ?? 0,
    totalInvested: parseFloat(investedRow?.total ?? "0"),
    weeklyCollection: parseFloat(weeklyRow?.total ?? "0"),
  }
}

async function getClients(search?: string) {
  const rows = await db
    .select({
      id:          clients.id,
      clientCode:  clients.clientCode,
      firstName:   clients.firstName,
      lastName:    clients.lastName,
      email:       clients.email,
      phone:       clients.phone,
      isActive:    clients.isActive,
      branchCode:  branches.code,
      branchName:  branches.name,
    })
    .from(clients)
    .leftJoin(branches, eq(branches.id, clients.branchId))
    .where(
      search
        ? or(
            like(clients.clientCode, `%${search}%`),
            like(clients.firstName,  `%${search}%`),
            like(clients.lastName,   `%${search}%`),
            like(branches.code,      `%${search}%`),
          )
        : undefined
    )

  // Get primary active account per client
  const accounts = await db
    .select({
      clientId:     investmentAccounts.clientId,
      schemeType:   investmentAccounts.schemeType,
      weeklyAmount: investmentAccounts.weeklyAmount,
    })
    .from(investmentAccounts)
    .where(eq(investmentAccounts.status, "active"))

  const accountMap = new Map(accounts.map((a) => [a.clientId, a]))

  // Total invested per client
  const invested = await db
    .select({
      clientId:      investmentAccounts.clientId,
      totalInvested: sum(investmentTransactions.amount),
    })
    .from(investmentTransactions)
    .innerJoin(investmentAccounts, eq(investmentAccounts.id, investmentTransactions.accountId))
    .where(eq(investmentTransactions.direction, "credit"))
    .groupBy(investmentAccounts.clientId)

  const investedMap = new Map(invested.map((r) => [r.clientId, parseFloat(r.totalInvested ?? "0")]))

  return rows.map((c) => ({
    ...c,
    account:       accountMap.get(c.id) ?? null,
    totalInvested: investedMap.get(c.id) ?? 0,
  }))
}

async function getBranches() {
  return db.select({ id: branches.id, code: branches.code, name: branches.name }).from(branches).where(eq(branches.isActive, true))
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const [stats, clientData, branchList] = await Promise.all([
    getStats(),
    getClients(q),
    getBranches(),
  ])

  return (
    <>
      <SiteHeader title="Clients" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">All Clients</h2>
            <p className="text-sm text-muted-foreground">
              Manage investor accounts across all branches
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UploadClientsBtn />
            <AddClientDialog branches={branchList} />
          </div>
        </div>

        {/* Stats — always 4 columns */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Clients</CardDescription>
                <UsersIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Active Clients</CardDescription>
                <UserCheckIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{stats.active}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Currently investing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Invested</CardDescription>
                <WalletIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">
                ₹{stats.totalInvested.toLocaleString("en-IN")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Cumulative corpus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Weekly Collection</CardDescription>
                <TrendingUpIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">
                ₹{stats.weeklyCollection.toLocaleString("en-IN")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Per week (active)</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <Suspense>
            <ClientsSearchInput />
          </Suspense>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Client List</CardTitle>
            <CardDescription>
              {clientData.length === 0
                ? q ? `No clients match "${q}"` : "No clients yet. Add or import clients to get started."
                : `${clientData.length} client${clientData.length !== 1 ? "s" : ""}${q ? ` matching "${q}"` : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UsersIcon className="mb-3 size-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">{q ? "No results found" : "No clients found"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {q ? "Try a different search term." : `Use "Add Client" or "Import CSV" to get started.`}
                </p>
              </div>
            ) : (
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
                    <TableHead className="w-[52px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-mono text-sm font-medium">{client.clientCode}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {client.firstName} {client.lastName}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{client.branchCode ?? "—"}</TableCell>
                      <TableCell>
                        {client.account
                          ? <Badge variant={schemeColors[client.account.schemeType]}>{client.account.schemeType}</Badge>
                          : <span className="text-xs text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {client.account
                          ? parseFloat(client.account.weeklyAmount).toLocaleString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{client.totalInvested.toLocaleString("en-IN")}
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
            )}
          </CardContent>
        </Card>

      </div>
    </>
  )
}
