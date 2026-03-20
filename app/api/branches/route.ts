import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { branches } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { code: string; name: string; city?: string; phone?: string; address?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { code, name, city, phone, address } = body

  if (!code?.trim()) return NextResponse.json({ error: "Branch code is required" }, { status: 400 })
  if (!name?.trim()) return NextResponse.json({ error: "Branch name is required" }, { status: 400 })

  // Check for duplicate code
  const existing = await db
    .select({ id: branches.id })
    .from(branches)
    .where(eq(branches.code, code.trim()))

  if (existing.length > 0) {
    return NextResponse.json({ error: `Branch code "${code}" already exists` }, { status: 409 })
  }

  const now = new Date()
  await db.insert(branches).values({
    id:        crypto.randomUUID(),
    code:      code.trim(),
    name:      name.trim(),
    city:      city?.trim() || null,
    phone:     phone?.trim() || null,
    address:   address?.trim() || null,
    isActive:  true,
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
