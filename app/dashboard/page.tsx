import { SiteHeader } from "@/components/site-header"
import { SectionCards } from "@/app/dashboard/_components/section-cards"
import { FundAllocationChart } from "@/app/dashboard/_components/fund-allocation-chart"
import { RecentTransactions } from "@/app/dashboard/_components/recent-transactions"
import {
  getDashboardStats,
  getFundAllocationSeries,
  getRecentTransactions,
} from "@/app/dashboard/actions"

export default async function DashboardPage() {
  const [stats, fundSeries, recent] = await Promise.all([
    getDashboardStats(),
    getFundAllocationSeries(),
    getRecentTransactions(),
  ])

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards stats={stats} />
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-3">
              <div className="@3xl/main:col-span-2">
                <FundAllocationChart data={fundSeries.data} allocation={fundSeries.allocation} />
              </div>
              <div>
                <RecentTransactions transactions={recent} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
