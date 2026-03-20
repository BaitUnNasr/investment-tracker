import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { branches, clients, investmentAccounts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

interface ClientRow {
  clientCode: string
  firstName: string
  lastName: string
  branchCode: string
  email: string
  phone: string
  schemeType: string
  weeklyAmount: number | null
  accountNumber: string
  startDate: string   // DD/MM/YYYY
}

function parseDDMMYYYY(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/")
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { rows: ClientRow[] }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }) }

  const { rows } = body
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: "No rows provided" }, { status: 400 })

  // Build branch code → id map
  const allBranches = await db.select({ id: branches.id, code: branches.code }).from(branches)
  const branchMap = new Map(allBranches.map((b) => [b.code, b.id]))

  // Fetch existing client codes and account numbers to detect duplicates
  const existingClients  = await db.select({ clientCode: clients.clientCode }).from(clients)
  const existingAccounts = await db.select({ accountNumber: investmentAccounts.accountNumber }).from(investmentAccounts)
  const existingCodes    = new Set(existingClients.map((c) => c.clientCode))
  const existingAccNums  = new Set(existingAccounts.map((a) => a.accountNumber))

  let inserted = 0
  let skipped  = 0
  const errors: string[] = []
  const now = new Date()

  for (const row of rows) {
    const branchId = branchMap.get(row.branchCode)
    if (!branchId) {
      skipped++
      errors.push(`Row ${row.clientCode}: branch "${row.branchCode}" not found`)
      continue
    }

    if (existingCodes.has(row.clientCode)) {
      skipped++
      errors.push(`Row ${row.clientCode}: client code already exists`)
      continue
    }

    if (existingAccNums.has(row.accountNumber)) {
      skipped++
      errors.push(`Row ${row.clientCode}: account number "${row.accountNumber}" already exists`)
      continue
    }

    let startDate: Date
    try { startDate = parseDDMMYYYY(row.startDate) }
    catch {
      skipped++
      errors.push(`Row ${row.clientCode}: invalid start date "${row.startDate}"`)
      continue
    }

    try {
      const clientId = crypto.randomUUID()
      await db.insert(clients).values({
        id:         clientId,
        clientCode: row.clientCode,
        branchId,
        firstName:  row.firstName,
        lastName:   row.lastName,
        email:      row.email || null,
        phone:      row.phone || null,
        isActive:   true,
        createdAt:  now,
        updatedAt:  now,
      })

      if (row.accountNumber) {
        await db.insert(investmentAccounts).values({
          id:            crypto.randomUUID(),
          accountNumber: row.accountNumber,
          clientId,
          schemeType:    (row.schemeType || "RTD") as "RTD" | "DSTD" | "LTD",
          weeklyAmount:  (row.weeklyAmount ?? 0).toString(),
          startDate,
          status:        "active",
          createdAt:     now,
          updatedAt:     now,
        })
      }

      existingCodes.add(row.clientCode)
      existingAccNums.add(row.accountNumber)
      inserted++
    } catch (err) {
      skipped++
      errors.push(`Row ${row.clientCode}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ inserted, skipped, errors })
}
