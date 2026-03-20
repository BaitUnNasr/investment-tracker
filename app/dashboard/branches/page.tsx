import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BuildingIcon, UsersIcon, WalletIcon } from "lucide-react"
import { AddBranchDialog } from "@/app/dashboard/branches/_components/add-branch-dialog"
import { BranchesTable } from "@/app/dashboard/branches/_components/branches-table"
import { getBranchData } from "./actions"

export default async function BranchesPage() {
  const branchData = await getBranchData()

  const totalClients = branchData.reduce((s, b) => s + b.clients, 0)
  const totalCorpus = branchData.reduce((s, b) => s + b.totalCorpus, 0)
  const activeBranches = branchData.filter((b) => b.isActive).length

  return (
    <>
      <SiteHeader title="Branches" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 min-w-0">

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

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Branch List</CardTitle>
            <CardDescription>
              {branchData.length === 0
                ? "No branches yet. Add your first branch to get started."
                : `${branchData.length} branch${branchData.length !== 1 ? "es" : ""} registered`}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <BranchesTable data={branchData} />
          </CardContent>
        </Card>

      </div>
    </>
  )
}
