import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { navData } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

interface NavRow {
  date: string      // DD/MM/YYYY
  navValue: number
}

interface NavUploadPayload {
  fundType: "TEF" | "TGF"
  rows: NavRow[]
}

function parseDDMMYYYY(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/")
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
}

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0]
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: NavUploadPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { fundType, rows } = body
  if (!fundType || !["TEF", "TGF"].includes(fundType)) {
    return NextResponse.json({ error: "Invalid fund type. Must be TEF or TGF." }, { status: 400 })
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 })
  }

  // Fetch existing NAV dates for this fund to detect duplicates
  const existing = await db
    .select({ navDate: navData.navDate })
    .from(navData)
    .where(eq(navData.fundType, fundType))

  const existingDates = new Set(existing.map((r) => toDateKey(r.navDate)))

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    let navDate: Date
    try {
      navDate = parseDDMMYYYY(row.date)
    } catch {
      skipped++
      errors.push(`Invalid date: ${row.date}`)
      continue
    }

    if (existingDates.has(toDateKey(navDate))) {
      skipped++
      continue
    }

    try {
      await db.insert(navData).values({
        id: crypto.randomUUID(),
        fundType,
        navDate,
        navValue: row.navValue.toFixed(4),
        uploadedAt: new Date(),
        uploadedBy: session.user.id,
      })
      existingDates.add(toDateKey(navDate))
      inserted++
    } catch (err) {
      skipped++
      errors.push(
        `Failed to insert ${fundType} NAV for ${row.date}: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  return NextResponse.json({ inserted, skipped, errors })
}
