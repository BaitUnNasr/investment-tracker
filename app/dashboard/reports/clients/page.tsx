import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DownloadIcon } from "lucide-react"
import { ClientReportTable, type ClientReportRow } from "./_components/client-report-table"

const clientReport: ClientReportRow[] = [
  { code: "075-001", name: "Sarah Mohammed Saleem Kazi",    total: 13000, tef: 4550, tgf: 3900, property: 4550, installments: 26 },
  { code: "075-002", name: "Sohel Usman Patel",             total: 13000, tef: 4550, tgf: 3900, property: 4550, installments: 26 },
  { code: "075-003", name: "Liza Faizan Qureshi",           total: 10500, tef: 3675, tgf: 3150, property: 3675, installments: 21 },
  { code: "075-004", name: "Sharukh Iiyas Khan",            total: 3000,  tef: 1050, tgf: 900,  property: 1050, installments: 6  },
  { code: "075-005", name: "Saleem Kalle Khan",             total: 5000,  tef: 1750, tgf: 1500, property: 1750, installments: 5  },
  { code: "075-006", name: "Shahid Hasan Ali Shaikh",       total: 3000,  tef: 1050, tgf: 900,  property: 1050, installments: 6  },
  { code: "075-007", name: "Amir Kifayat Khan",             total: 2000,  tef: 700,  tgf: 600,  property: 700,  installments: 4  },
  { code: "075-008", name: "Mohammed Amjad M. Idris Khan",  total: 3000,  tef: 1050, tgf: 900,  property: 1050, installments: 6  },
]

const grandTotal = clientReport.reduce(
  (acc, r) => ({ total: acc.total + r.total, tef: acc.tef + r.tef, tgf: acc.tgf + r.tgf, property: acc.property + r.property }),
  { total: 0, tef: 0, tgf: 0, property: 0 },
)

export default function ClientReportsPage() {
  return (
    <>
      <SiteHeader title="Client Reports" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Client Investment Report</h2>
            <p className="text-sm text-muted-foreground">
              Fund-wise breakdown per client based on current allocation (TEF 35% · TGF 30% · Property 35%)
            </p>
          </div>
          <Button variant="outline">
            <DownloadIcon className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Corpus</CardDescription>
              <CardTitle className="text-2xl">₹{grandTotal.total.toLocaleString("en-IN")}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>TEF Allocation</CardDescription>
              <CardTitle className="text-2xl text-blue-600">₹{grandTotal.tef.toLocaleString("en-IN")}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>TGF Allocation</CardDescription>
              <CardTitle className="text-2xl text-amber-600">₹{grandTotal.tgf.toLocaleString("en-IN")}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Property Allocation</CardDescription>
              <CardTitle className="text-2xl text-emerald-600">₹{grandTotal.property.toLocaleString("en-IN")}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="p-0 gap-0">
          <CardHeader className="px-4 py-4">
            <CardTitle>Client-wise Fund Breakdown</CardTitle>
            <CardDescription>
              Investment amounts allocated to each fund per client
            </CardDescription>
          </CardHeader>
          <Separator />
          <ClientReportTable data={clientReport} />
        </Card>
      </div>
    </>
  )
}
