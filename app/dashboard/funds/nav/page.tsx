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

// Placeholder NAV data — replace with DB query
const tefNav = [
  { date: "07/02/2026", nav: 18.4521, change: +0.12 },
  { date: "06/02/2026", nav: 18.3401, change: -0.08 },
  { date: "05/02/2026", nav: 18.4205, change: +0.21 },
  { date: "04/02/2026", nav: 18.2100, change: +0.15 },
  { date: "03/02/2026", nav: 18.0600, change: -0.05 },
]

const tgfNav = [
  { date: "07/02/2026", nav: 24.7830, change: +0.34 },
  { date: "06/02/2026", nav: 24.4430, change: +0.18 },
  { date: "05/02/2026", nav: 24.2630, change: -0.11 },
  { date: "04/02/2026", nav: 24.3730, change: +0.42 },
  { date: "03/02/2026", nav: 23.9530, change: +0.09 },
]

export default function NavDataPage() {
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
              <CardTitle className="text-3xl font-mono">
                ₹{tefNav[0].nav.toFixed(4)}
              </CardTitle>
            </CardHeader>
            <p className="px-6 pb-4 text-sm text-muted-foreground">
              As of {tefNav[0].date} &nbsp;|&nbsp;
              <span className={tefNav[0].change >= 0 ? "text-emerald-600" : "text-red-500"}>
                {tefNav[0].change >= 0 ? "▲" : "▼"} {Math.abs(tefNav[0].change).toFixed(2)}
              </span>
            </p>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Tata Gold Fund (TGF)</CardDescription>
                <Badge variant="outline">30% allocation</Badge>
              </div>
              <CardTitle className="text-3xl font-mono">
                ₹{tgfNav[0].nav.toFixed(4)}
              </CardTitle>
            </CardHeader>
            <p className="px-6 pb-4 text-sm text-muted-foreground">
              As of {tgfNav[0].date} &nbsp;|&nbsp;
              <span className={tgfNav[0].change >= 0 ? "text-emerald-600" : "text-red-500"}>
                {tgfNav[0].change >= 0 ? "▲" : "▼"} {Math.abs(tgfNav[0].change).toFixed(2)}
              </span>
            </p>
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
