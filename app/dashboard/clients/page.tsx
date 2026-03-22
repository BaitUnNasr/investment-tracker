import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UsersIcon, UserCheckIcon, WalletIcon, TrendingUpIcon } from "lucide-react"
import { AddClientDialog } from "@/app/dashboard/clients/_components/add-client-dialog"
import { UploadClientsBtn } from "@/app/dashboard/clients/_components/upload-clients-btn"
import { ClientsTable } from "./_components/clients-table"
import { getClientData, getStats, getBranches } from "./actions"

export default async function ClientsPage() {
  const [clientData, stats, branchList] = await Promise.all([
    getClientData(),
    getStats(),
    getBranches(),
  ])

  return (
    <>
      <SiteHeader title="Clients" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 min-w-0">

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

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        {/* Client table */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Client List</CardTitle>
            <CardDescription>
              {clientData.length === 0
                ? "No clients yet. Add or import clients to get started."
                : `${clientData.length} client${clientData.length !== 1 ? "s" : ""} registered`}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <ClientsTable data={clientData} branches={branchList} />
          </CardContent>
        </Card>

      </div>
    </>
  )
}
