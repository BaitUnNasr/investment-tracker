"use server"

import { db } from "@/db"
import {
  clients,
  branches,
  investmentAccounts,
  investmentTransactions,
  fundAllocationSettings,
} from "@/db/schema"
import { eq, count, sum, desc, sql } from "drizzle-orm"

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function toDisplayDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d)
  const dd   = String(date.getUTCDate()).padStart(2, "0")
  const mm   = String(date.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = date.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}

// ─── Section-card stats ──────────────────────────────────────────────────────

export type DashboardStats = {
  totalCorpus:      number
  corpusGrowthPct:  number
  activeClients:    number
  branches:         number
  weeklyCollection: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [corpusRow] = await db
    .select({ total: sum(investmentTransactions.amount) })
    .from(investmentTransactions)
    .where(eq(investmentTransactions.direction, "credit"))

  const [clientsRow] = await db
    .select({ active: count(clients.id) })
    .from(clients)
    .where(eq(clients.isActive, true))

  const [branchesRow] = await db
    .select({ active: count(branches.id) })
    .from(branches)
    .where(eq(branches.isActive, true))

  const [weeklyRow] = await db
    .select({ total: sum(investmentAccounts.weeklyAmount) })
    .from(investmentAccounts)
    .where(eq(investmentAccounts.status, "active"))

  // Month-over-month corpus growth: last month's collection as a % of the
  // cumulative corpus that existed before it.
  const monthly = await getMonthlyTotals()
  let corpusGrowthPct = 0
  if (monthly.length >= 1) {
    const last  = monthly[monthly.length - 1].total
    const prior = monthly.slice(0, -1).reduce((a, m) => a + m.total, 0)
    corpusGrowthPct = prior > 0 ? (last / prior) * 100 : 0
  }

  return {
    totalCorpus:      parseFloat(corpusRow?.total ?? "0"),
    corpusGrowthPct:  Math.round(corpusGrowthPct * 10) / 10,
    activeClients:    clientsRow?.active ?? 0,
    branches:         branchesRow?.active ?? 0,
    weeklyCollection: parseFloat(weeklyRow?.total ?? "0"),
  }
}

// ─── Fund allocation growth (area chart) ─────────────────────────────────────

type MonthTotal = { key: string; total: number }

async function getMonthlyTotals(): Promise<MonthTotal[]> {
  const monthExpr = sql<string>`to_char(${investmentTransactions.transactionDate}, 'YYYY-MM')`
  const rows = await db
    .select({ key: monthExpr, total: sum(investmentTransactions.amount) })
    .from(investmentTransactions)
    .where(eq(investmentTransactions.direction, "credit"))
    .groupBy(monthExpr)
    .orderBy(monthExpr)

  return rows.map((r) => ({ key: r.key, total: parseFloat(r.total ?? "0") }))
}

export type FundAllocation = { tef: number; tgf: number; property: number }

export type FundAllocationSeries = {
  data: { month: string; TEF: number; TGF: number; Property: number }[]
  allocation: FundAllocation
}

export async function getFundAllocationSeries(): Promise<FundAllocationSeries> {
  // Pull configured allocation %, falling back to sensible defaults.
  const settings = await db
    .select({ fundType: fundAllocationSettings.fundType, percentage: fundAllocationSettings.percentage })
    .from(fundAllocationSettings)

  const pctMap = new Map(settings.map((s) => [s.fundType, parseFloat(s.percentage)]))
  const allocation: FundAllocation = {
    tef:      pctMap.get("TEF") ?? 35,
    tgf:      pctMap.get("TGF") ?? 30,
    property: pctMap.get("PROPERTY") ?? 35,
  }

  const monthly = await getMonthlyTotals()

  let cumulative = 0
  const data = monthly.map((m) => {
    cumulative += m.total
    return {
      month:    MONTH_LABELS[parseInt(m.key.slice(5, 7), 10) - 1] ?? m.key,
      TEF:      Math.round((cumulative * allocation.tef) / 100),
      TGF:      Math.round((cumulative * allocation.tgf) / 100),
      Property: Math.round((cumulative * allocation.property) / 100),
    }
  })

  return { data, allocation }
}

// ─── Recent transactions ─────────────────────────────────────────────────────

export type RecentTransaction = {
  date:    string
  client:  string
  account: string
  amount:  number
  type:    string
}

export async function getRecentTransactions(limit = 6): Promise<RecentTransaction[]> {
  const rows = await db
    .select({
      transactionDate: investmentTransactions.transactionDate,
      transType:       investmentTransactions.transType,
      amount:          investmentTransactions.amount,
      accountNumber:   investmentAccounts.accountNumber,
      firstName:       clients.firstName,
      lastName:        clients.lastName,
    })
    .from(investmentTransactions)
    .innerJoin(investmentAccounts, eq(investmentAccounts.id, investmentTransactions.accountId))
    .innerJoin(clients, eq(clients.id, investmentAccounts.clientId))
    .where(eq(investmentTransactions.direction, "credit"))
    .orderBy(desc(investmentTransactions.transactionDate), investmentAccounts.accountNumber)
    .limit(limit)

  return rows.map((r) => ({
    date:    toDisplayDate(r.transactionDate),
    client:  `${r.firstName} ${r.lastName}`,
    account: r.accountNumber,
    amount:  parseFloat(r.amount),
    type:    r.transType || "TRF",
  }))
}
