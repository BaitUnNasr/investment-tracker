"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import {
  clients,
  branches,
  investmentAccounts,
  investmentTransactions,
} from "@/db/schema"
import { eq, count, sum } from "drizzle-orm"
import { auth } from "@/lib/auth"

type ActionResult = { success: true } | { error: string }

export async function getClientData() {
  const rows = await db
    .select({
      id:         clients.id,
      clientCode: clients.clientCode,
      firstName:  clients.firstName,
      lastName:   clients.lastName,
      email:      clients.email,
      phone:      clients.phone,
      isActive:   clients.isActive,
      branchId:   clients.branchId,
      branchCode: branches.code,
      branchName: branches.name,
    })
    .from(clients)
    .leftJoin(branches, eq(branches.id, clients.branchId))

  const accounts = await db
    .select({
      clientId:     investmentAccounts.clientId,
      schemeType:   investmentAccounts.schemeType,
      weeklyAmount: investmentAccounts.weeklyAmount,
    })
    .from(investmentAccounts)
    .where(eq(investmentAccounts.status, "active"))

  const accountMap = new Map(accounts.map((a) => [a.clientId, a]))

  const invested = await db
    .select({
      clientId:      investmentAccounts.clientId,
      totalInvested: sum(investmentTransactions.amount),
    })
    .from(investmentTransactions)
    .innerJoin(investmentAccounts, eq(investmentAccounts.id, investmentTransactions.accountId))
    .where(eq(investmentTransactions.direction, "credit"))
    .groupBy(investmentAccounts.clientId)

  const investedMap = new Map(invested.map((r) => [r.clientId, parseFloat(r.totalInvested ?? "0")]))

  return rows.map((c) => ({
    ...c,
    account:       accountMap.get(c.id) ?? null,
    totalInvested: investedMap.get(c.id) ?? 0,
  }))
}

export async function getStats() {
  const [totalRow] = await db.select({ total: count(clients.id) }).from(clients)
  const [activeRow] = await db.select({ active: count(clients.id) }).from(clients).where(eq(clients.isActive, true))

  const [investedRow] = await db
    .select({ total: sum(investmentTransactions.amount) })
    .from(investmentTransactions)
    .where(eq(investmentTransactions.direction, "credit"))

  const [weeklyRow] = await db
    .select({ total: sum(investmentAccounts.weeklyAmount) })
    .from(investmentAccounts)
    .where(eq(investmentAccounts.status, "active"))

  return {
    total:            totalRow?.total ?? 0,
    active:           activeRow?.active ?? 0,
    totalInvested:    parseFloat(investedRow?.total ?? "0"),
    weeklyCollection: parseFloat(weeklyRow?.total ?? "0"),
  }
}

export async function getBranches() {
  return db
    .select({ id: branches.id, code: branches.code, name: branches.name })
    .from(branches)
    .where(eq(branches.isActive, true))
}

function parseDateInput(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr)
  const [day, month, year] = dateStr.split("/")
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
}

export async function createClient(data: {
  clientCode:    string
  firstName:     string
  lastName:      string
  branchId:      string
  email?:        string
  phone?:        string
  address?:      string
  accountNumber?: string
  schemeType?:   "RTD" | "DSTD" | "LTD"
  weeklyAmount?: number
  startDate?:    string
}): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Unauthorized" }

  const duplicate = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.clientCode, data.clientCode.trim()))
    .limit(1)

  if (duplicate.length > 0) {
    return { error: `Client code "${data.clientCode}" already exists` }
  }

  if (data.accountNumber?.trim()) {
    const accDuplicate = await db
      .select({ id: investmentAccounts.id })
      .from(investmentAccounts)
      .where(eq(investmentAccounts.accountNumber, data.accountNumber.trim()))
      .limit(1)

    if (accDuplicate.length > 0) {
      return { error: `Account number "${data.accountNumber}" already exists` }
    }
  }

  const now      = new Date()
  const clientId = crypto.randomUUID()

  await db.insert(clients).values({
    id:         clientId,
    clientCode: data.clientCode.trim(),
    branchId:   data.branchId,
    firstName:  data.firstName.trim(),
    lastName:   data.lastName.trim(),
    email:      data.email?.trim() || null,
    phone:      data.phone?.trim() || null,
    address:    data.address?.trim() || null,
    isActive:   true,
    createdAt:  now,
    updatedAt:  now,
  })

  if (data.accountNumber?.trim() && data.schemeType && data.weeklyAmount && data.startDate) {
    await db.insert(investmentAccounts).values({
      id:            crypto.randomUUID(),
      accountNumber: data.accountNumber.trim(),
      clientId,
      schemeType:    data.schemeType,
      weeklyAmount:  data.weeklyAmount.toString(),
      startDate:     parseDateInput(data.startDate),
      status:        "active",
      createdAt:     now,
      updatedAt:     now,
    })
  }

  revalidatePath("/dashboard/clients")
  return { success: true }
}

export async function updateClient(
  id: string,
  data: {
    clientCode: string
    firstName:  string
    lastName:   string
    email?:     string
    phone?:     string
    address?:   string
    branchId:   string
    isActive:   boolean
  }
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Unauthorized" }

  const existing = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1)

  if (existing.length === 0) return { error: "Client not found" }

  const codeConflict = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.clientCode, data.clientCode))
    .limit(1)

  if (codeConflict.length > 0 && codeConflict[0].id !== id) {
    return { error: `Client code "${data.clientCode}" is already in use` }
  }

  await db
    .update(clients)
    .set({
      clientCode: data.clientCode,
      firstName:  data.firstName,
      lastName:   data.lastName,
      email:      data.email || null,
      phone:      data.phone || null,
      address:    data.address || null,
      branchId:   data.branchId,
      isActive:   data.isActive,
      updatedAt:  new Date(),
    })
    .where(eq(clients.id, id))

  revalidatePath("/dashboard/clients")
  return { success: true }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Unauthorized" }

  const existing = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1)

  if (existing.length === 0) return { error: "Client not found" }

  const [accountCount] = await db
    .select({ count: count(investmentAccounts.id) })
    .from(investmentAccounts)
    .where(eq(investmentAccounts.clientId, id))

  if ((accountCount?.count ?? 0) > 0) {
    return {
      error: `Cannot delete: this client has ${accountCount.count} investment account${accountCount.count !== 1 ? "s" : ""}. Close or remove them first.`,
    }
  }

  await db.delete(clients).where(eq(clients.id, id))

  revalidatePath("/dashboard/clients")
  return { success: true }
}
