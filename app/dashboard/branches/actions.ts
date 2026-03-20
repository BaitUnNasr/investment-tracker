"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import {
  branches,
  clients,
  investmentAccounts,
  investmentTransactions,
} from "@/db/schema"
import { eq, count, sum } from "drizzle-orm"
import { auth } from "@/lib/auth"

type ActionResult = { success: true } | { error: string }

export async function getBranchData() {
  // Branch list with client count
  const branchRows = await db
    .select({
      id: branches.id,
      code: branches.code,
      name: branches.name,
      city: branches.city,
      phone: branches.phone,
      address: branches.address,
      isActive: branches.isActive,
      clients: count(clients.id),
    })
    .from(branches)
    .leftJoin(clients, eq(clients.branchId, branches.id))
    .groupBy(branches.id)

  // Total corpus per branch (sum of all credit transactions)
  const corpusRows = await db
    .select({
      branchId: clients.branchId,
      totalCorpus: sum(investmentTransactions.amount),
    })
    .from(investmentTransactions)
    .innerJoin(
      investmentAccounts,
      eq(investmentAccounts.id, investmentTransactions.accountId)
    )
    .innerJoin(clients, eq(clients.id, investmentAccounts.clientId))
    .where(eq(investmentTransactions.direction, "credit"))
    .groupBy(clients.branchId)

  const corpusMap = new Map(
    corpusRows.map((r) => [r.branchId, parseFloat(r.totalCorpus ?? "0")])
  )

  return branchRows.map((b) => ({
    ...b,
    clients: b.clients ?? 0,
    totalCorpus: corpusMap.get(b.id) ?? 0,
  }))
}

export async function createBranch(data: {
  code: string
  name: string
  city?: string
  phone?: string
  address?: string
}): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Unauthorized" }

  const duplicate = await db
    .select({ id: branches.id })
    .from(branches)
    .where(eq(branches.code, data.code))
    .limit(1)

  if (duplicate.length > 0) {
    return { error: `Branch code "${data.code}" already exists` }
  }

  await db.insert(branches).values({
    id: crypto.randomUUID(),
    code: data.code,
    name: data.name,
    city: data.city || null,
    phone: data.phone || null,
    address: data.address || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath("/dashboard/branches")
  return { success: true }
}

export async function updateBranch(
  id: string,
  data: {
    code: string
    name: string
    city?: string
    phone?: string
    address?: string
    isActive: boolean
  }
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Unauthorized" }

  const existing = await db
    .select({ id: branches.id })
    .from(branches)
    .where(eq(branches.id, id))
    .limit(1)

  if (existing.length === 0) return { error: "Branch not found" }

  const codeConflict = await db
    .select({ id: branches.id })
    .from(branches)
    .where(eq(branches.code, data.code))
    .limit(1)

  if (codeConflict.length > 0 && codeConflict[0].id !== id) {
    return { error: `Branch code "${data.code}" is already in use` }
  }

  await db
    .update(branches)
    .set({
      code: data.code,
      name: data.name,
      city: data.city || null,
      phone: data.phone || null,
      address: data.address || null,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(branches.id, id))

  revalidatePath("/dashboard/branches")
  return { success: true }
}

export async function deleteBranch(id: string): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Unauthorized" }

  const existing = await db
    .select({ id: branches.id })
    .from(branches)
    .where(eq(branches.id, id))
    .limit(1)

  if (existing.length === 0) return { error: "Branch not found" }

  const [clientCount] = await db
    .select({ count: count(clients.id) })
    .from(clients)
    .where(eq(clients.branchId, id))

  if ((clientCount?.count ?? 0) > 0) {
    return { error: `Cannot delete: this branch has ${clientCount.count} client${clientCount.count !== 1 ? "s" : ""}. Reassign or remove them first.` }
  }

  await db.delete(branches).where(eq(branches.id, id))

  revalidatePath("/dashboard/branches")
  return { success: true }
}
