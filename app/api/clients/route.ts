import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { clients, investmentAccounts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

function parseDateInput(dateStr: string): Date {
  // Accepts either YYYY-MM-DD (from date input) or DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr)
  const [day, month, year] = dateStr.split("/")
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: {
    clientCode: string; firstName: string; lastName: string; branchId: string
    email?: string; phone?: string; address?: string
    accountNumber: string; schemeType: "RTD" | "DSTD" | "LTD"
    weeklyAmount: number; startDate: string
  }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }) }

  const { clientCode, firstName, lastName, branchId, email, phone, address,
          accountNumber, schemeType, weeklyAmount, startDate } = body

  if (!clientCode?.trim()) return NextResponse.json({ error: "Client code is required" }, { status: 400 })
  if (!firstName?.trim())  return NextResponse.json({ error: "First name is required" }, { status: 400 })
  if (!lastName?.trim())   return NextResponse.json({ error: "Last name is required" }, { status: 400 })
  if (!branchId)           return NextResponse.json({ error: "Branch is required" }, { status: 400 })

  // Check duplicate client code
  const existing = await db.select({ id: clients.id }).from(clients).where(eq(clients.clientCode, clientCode.trim()))
  if (existing.length > 0) return NextResponse.json({ error: `Client code "${clientCode}" already exists` }, { status: 409 })

  // Check duplicate account number (only if provided)
  if (accountNumber?.trim()) {
    const existingAcc = await db.select({ id: investmentAccounts.id }).from(investmentAccounts).where(eq(investmentAccounts.accountNumber, accountNumber.trim()))
    if (existingAcc.length > 0) return NextResponse.json({ error: `Account number "${accountNumber}" already exists` }, { status: 409 })
  }

  const now = new Date()
  const clientId = crypto.randomUUID()

  await db.insert(clients).values({
    id:          clientId,
    clientCode:  clientCode.trim(),
    branchId,
    firstName:   firstName.trim(),
    lastName:    lastName.trim(),
    email:       email?.trim() || null,
    phone:       phone?.trim() || null,
    address:     address?.trim() || null,
    isActive:    true,
    createdAt:   now,
    updatedAt:   now,
  })

  // Only create investment account if account number is provided
  if (accountNumber?.trim() && schemeType && weeklyAmount && startDate) {
    await db.insert(investmentAccounts).values({
      id:            crypto.randomUUID(),
      accountNumber: accountNumber.trim(),
      clientId,
      schemeType,
      weeklyAmount:  weeklyAmount.toString(),
      startDate:     parseDateInput(startDate),
      status:        "active",
      createdAt:     now,
      updatedAt:     now,
    })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
