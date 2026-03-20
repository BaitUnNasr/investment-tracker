import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { investmentAccounts, investmentTransactions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

interface TransactionRow {
  date: string      // DD/MM/YYYY
  transId: string
  type: string
  rcVcNo: string
  accountNo: string
  narration: string
  debit: number
  credit: number
  dc: string
}

function parseDDMMYYYY(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/")
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
}

function extractInstallmentNumber(narration: string): number | null {
  const match = narration.match(/\((\d+)(?:st|nd|rd|th)/i)
  return match ? parseInt(match[1], 10) : null
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { rows: TransactionRow[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { rows } = body
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 })
  }

  // Build a map of accountNumber → account id
  const allAccounts = await db
    .select({ id: investmentAccounts.id, accountNumber: investmentAccounts.accountNumber })
    .from(investmentAccounts)

  const accountMap = new Map(allAccounts.map((a) => [a.accountNumber, a.id]))

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    const accountId = accountMap.get(row.accountNo)
    if (!accountId) {
      skipped++
      errors.push(`Account not found: ${row.accountNo} (date: ${row.date})`)
      continue
    }

    let transactionDate: Date
    try {
      transactionDate = parseDDMMYYYY(row.date)
    } catch {
      skipped++
      errors.push(`Invalid date: ${row.date}`)
      continue
    }

    const direction = row.dc.toLowerCase().startsWith("c") ? "credit" : "debit"
    const amount = direction === "credit" ? row.credit : row.debit
    const installmentNumber = extractInstallmentNumber(row.narration)

    try {
      await db.insert(investmentTransactions).values({
        id: crypto.randomUUID(),
        accountId,
        transactionDate,
        transId: row.transId || null,
        transType: row.type || null,
        rcVcNo: row.rcVcNo || null,
        amount: amount.toString(),
        direction,
        narration: row.narration || null,
        installmentNumber,
        createdAt: new Date(),
      })
      inserted++
    } catch (err) {
      skipped++
      errors.push(
        `Failed to insert row (${row.date} / ${row.accountNo}): ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  return NextResponse.json({ inserted, skipped, errors })
}
