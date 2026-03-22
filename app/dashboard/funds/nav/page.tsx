import { SiteHeader } from "@/components/site-header"
import { UploadNavBtn } from "@/app/dashboard/funds/nav/_components/upload-nav-btn"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Placeholder NAV data — replace with DB query
// Source: Historic_NAV_since_inception_to_7-Feb-2026 files
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

function NavTable({ data }: { data: typeof tefNav }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">NAV (₹)</TableHead>
          <TableHead className="text-right">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            <TableCell>{row.date}</TableCell>
            <TableCell className="text-right font-mono font-medium">
              {row.nav.toFixed(4)}
            </TableCell>
            <TableCell className="text-right">
              <span className={row.change >= 0 ? "text-emerald-600" : "text-red-500"}>
                {row.change >= 0 ? "+" : ""}
                {row.change.toFixed(2)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

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
        <div className="grid gap-4 @xl/main:grid-cols-2">
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As of {tefNav[0].date} &nbsp;|&nbsp;
                <span className={tefNav[0].change >= 0 ? "text-emerald-600" : "text-red-500"}>
                  {tefNav[0].change >= 0 ? "▲" : "▼"} {Math.abs(tefNav[0].change).toFixed(2)}
                </span>
              </p>
            </CardContent>
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
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As of {tgfNav[0].date} &nbsp;|&nbsp;
                <span className={tgfNav[0].change >= 0 ? "text-emerald-600" : "text-red-500"}>
                  {tgfNav[0].change >= 0 ? "▲" : "▼"} {Math.abs(tgfNav[0].change).toFixed(2)}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* NAV history tabs */}
        <Card>
          <CardHeader>
            <CardTitle>NAV History</CardTitle>
            <CardDescription>
              Daily NAV values used to calculate client unit allotments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tef">
              <TabsList className="mb-4">
                <TabsTrigger value="tef">Tata Ethical Fund (TEF)</TabsTrigger>
                <TabsTrigger value="tgf">Tata Gold Fund (TGF)</TabsTrigger>
              </TabsList>
              <TabsContent value="tef">
                <NavTable data={tefNav} />
              </TabsContent>
              <TabsContent value="tgf">
                <NavTable data={tgfNav} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
