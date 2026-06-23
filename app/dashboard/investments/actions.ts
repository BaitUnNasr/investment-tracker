"use server"

import { db } from "@/db"
import { clients, investmentAccounts, investmentTransactions } from "@/db/schema"
import { eq, sum, count, desc } from "drizzle-orm"
import type { AccountRow } from "./accounts/_components/accounts-table"
import type { TransactionRow } from "./transactions/_components/transactions-table"

function toDisplayDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d)
  const dd   = String(date.getUTCDate()).padStart(2, "0")
  const mm   = String(date.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = date.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}

// ─── Accounts ──────────────────────────────────────────────────────────────

export async function getAccountRows(): Promise<AccountRow[]> {
  const accs = await db
    .select({
      id:            investmentAccounts.id,
      accountNumber: investmentAccounts.accountNumber,
      firstName:     clients.firstName,
      lastName:      clients.lastName,
      schemeType:    investmentAccounts.schemeType,
      weeklyAmount:  investmentAccounts.weeklyAmount,
      startDate:     investmentAccounts.startDate,
      status:        investmentAccounts.status,
    })
    .from(investmentAccounts)
    .innerJoin(clients, eq(clients.id, investmentAccounts.clientId))
    .orderBy(investmentAccounts.accountNumber)

  // Fetch installment counts and totals in one query each
  const installmentCounts = await db
    .select({
      accountId: investmentTransactions.accountId,
      count:     count(investmentTransactions.id),
    })
    .from(investmentTransactions)
    .where(eq(investmentTransactions.direction, "credit"))
    .groupBy(investmentTransactions.accountId)

  const totals = await db
    .select({
      accountId:     investmentTransactions.accountId,
      totalInvested: sum(investmentTransactions.amount),
    })
    .from(investmentTransactions)
    .where(eq(investmentTransactions.direction, "credit"))
    .groupBy(investmentTransactions.accountId)

  const countMap = new Map(installmentCounts.map((r) => [r.accountId, r.count]))
  const totalMap = new Map(totals.map((r) => [r.accountId, parseFloat(r.totalInvested ?? "0")]))

  return accs.map((a) => ({
    id:            a.id,
    accountNo:     a.accountNumber,
    client:        `${a.firstName} ${a.lastName}`,
    scheme:        a.schemeType,
    weeklyAmt:     parseFloat(a.weeklyAmount),
    startDate:     toDisplayDate(a.startDate),
    installments:  countMap.get(a.id) ?? 0,
    totalInvested: totalMap.get(a.id) ?? 0,
    status:        a.status ?? "active",
  }))
}

// ─── Transactions ──────────────────────────────────────────────────────────

export async function getTransactionRows(): Promise<TransactionRow[]> {
  const rows = await db
    .select({
      id:                investmentTransactions.id,
      transactionDate:   investmentTransactions.transactionDate,
      transId:           investmentTransactions.transId,
      transType:         investmentTransactions.transType,
      rcVcNo:            investmentTransactions.rcVcNo,
      amount:            investmentTransactions.amount,
      direction:         investmentTransactions.direction,
      installmentNumber: investmentTransactions.installmentNumber,
      accountNumber:     investmentAccounts.accountNumber,
      firstName:         clients.firstName,
      lastName:          clients.lastName,
    })
    .from(investmentTransactions)
    .innerJoin(investmentAccounts, eq(investmentAccounts.id, investmentTransactions.accountId))
    .innerJoin(clients, eq(clients.id, investmentAccounts.clientId))
    .orderBy(desc(investmentTransactions.transactionDate), investmentTransactions.accountId)

  return rows.map((r) => ({
    date:        toDisplayDate(r.transactionDate),
    transId:     r.transId ?? "",
    type:        r.transType ?? "",
    rcVc:        r.rcVcNo ?? "",
    account:     r.accountNumber,
    client:      `${r.firstName} ${r.lastName}`,
    amount:      parseFloat(r.amount),
    direction:   r.direction,
    installment: r.installmentNumber ?? 0,
  }))
}
