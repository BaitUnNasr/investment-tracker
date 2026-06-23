import { SiteHeader } from "@/components/site-header"
import { UploadNavBtn } from "@/app/dashboard/funds/nav/_components/upload-nav-btn"
import { NavTable } from "@/app/dashboard/funds/nav/_components/nav-table"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getNavRows } from "./actions"

export default async function NavDataPage() {
  const [tefNav, tgfNav] = await Promise.all([
    getNavRows("TEF"),
    getNavRows("TGF"),
  ])

  const latestTef = tefNav[0]
  const latestTgf = tgfNav[0]

  return (
    <>
      <SiteHeader title="NAV Data" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Fund NAV Data</h2>
            <p className="text-sm text-muted-foreground">
              Upload and view daily NAV for Tata Ethical Fund and Tata Gold Fund
            </p>
          </div>
          <UploadNavBtn />
        </div>

        {/* Latest NAV summary cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Tata Ethical Fund (TEF)</CardDescription>
                <Badge variant="outline">35% allocation</Badge>
              </div>
              {latestTef ? (
                <>
                  <CardTitle className="text-3xl font-mono">
                    ₹{latestTef.nav.toFixed(4)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    As of {latestTef.date} &nbsp;|&nbsp;
                    <span className={latestTef.change >= 0 ? "text-emerald-600" : "text-red-500"}>
                      {latestTef.change >= 0 ? "▲" : "▼"} {Math.abs(latestTef.change).toFixed(4)}
                    </span>
                  </p>
                </>
              ) : (
                <CardTitle className="text-sm text-muted-foreground">No data uploaded yet</CardTitle>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Tata Gold Fund (TGF)</CardDescription>
                <Badge variant="outline">30% allocation</Badge>
              </div>
              {latestTgf ? (
                <>
                  <CardTitle className="text-3xl font-mono">
                    ₹{latestTgf.nav.toFixed(4)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    As of {latestTgf.date} &nbsp;|&nbsp;
                    <span className={latestTgf.change >= 0 ? "text-emerald-600" : "text-red-500"}>
                      {latestTgf.change >= 0 ? "▲" : "▼"} {Math.abs(latestTgf.change).toFixed(4)}
                    </span>
                  </p>
                </>
              ) : (
                <CardTitle className="text-sm text-muted-foreground">No data uploaded yet</CardTitle>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* NAV history tabs */}
        <Card className="p-0 gap-0">
          <CardHeader className="px-4 py-4">
            <CardTitle>NAV History</CardTitle>
            <CardDescription>
              Daily NAV values used to calculate client unit allotments
            </CardDescription>
          </CardHeader>
          <Separator />
          <Tabs defaultValue="tef">
            <div className="px-4 pt-4">
              <TabsList>
                <TabsTrigger value="tef">Tata Ethical Fund (TEF)</TabsTrigger>
                <TabsTrigger value="tgf">Tata Gold Fund (TGF)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="tef" className="mt-0">
              <NavTable data={tefNav} />
            </TabsContent>
            <TabsContent value="tgf" className="mt-0">
              <NavTable data={tgfNav} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </>
  )
}
