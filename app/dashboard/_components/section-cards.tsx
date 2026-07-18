"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  TrendingUpIcon,
  BuildingIcon,
  UsersIcon,
  CoinsIcon,
  type LucideIcon,
} from "lucide-react"
import type { DashboardStats } from "@/app/dashboard/actions"

type Metric = {
  label: string
  value: string
  icon: LucideIcon
  /* Tailwind classes for the icon chip — semantic accent per KPI */
  accent: string
  badge: { icon: LucideIcon; text: string }
  footerTitle: string
  footerTitleIcon?: LucideIcon
  footerNote: string
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export function SectionCards({ stats }: { stats: DashboardStats }) {
  const corpusBadge =
    stats.corpusGrowthPct > 0 ? `+${stats.corpusGrowthPct}%` : `${stats.corpusGrowthPct}%`

  const metrics: Metric[] = [
    {
      label: "Total Corpus",
      value: inr(stats.totalCorpus),
      icon: TrendingUpIcon,
      accent: "bg-primary/10 text-primary",
      badge: { icon: TrendingUpIcon, text: corpusBadge },
      footerTitle: "Growing steadily",
      footerTitleIcon: TrendingUpIcon,
      footerNote: "Total invested across all clients",
    },
    {
      label: "Active Clients",
      value: String(stats.activeClients),
      icon: UsersIcon,
      accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      badge: { icon: UsersIcon, text: "Active" },
      footerTitle: "Across all branches",
      footerNote: "Total enrolled investors",
    },
    {
      label: "Branches",
      value: String(stats.branches),
      icon: BuildingIcon,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      badge: { icon: BuildingIcon, text: "Active" },
      footerTitle: "Operational branches",
      footerNote: "Active BUN branches",
    },
    {
      label: "Weekly Collection",
      value: inr(stats.weeklyCollection),
      icon: CoinsIcon,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      badge: { icon: CoinsIcon, text: "Per week" },
      footerTitle: "Regular ECS collections",
      footerNote: "Across all active accounts",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {metrics.map((m) => {
        const Icon = m.icon
        const BadgeIcon = m.badge.icon
        const FooterIcon = m.footerTitleIcon
        return (
          <Card
            key={m.label}
            className="@container/card transition-shadow duration-200 hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${m.accent}`}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <CardDescription>{m.label}</CardDescription>
              </div>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {m.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <BadgeIcon />
                  {m.badge.text}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {m.footerTitle}
                {FooterIcon && <FooterIcon className="size-4" />}
              </div>
              <div className="text-muted-foreground">{m.footerNote}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
