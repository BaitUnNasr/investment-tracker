import "./env"
import { db } from "./index"
import { branches, clients, investmentAccounts, investmentTransactions } from "./schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

// ── helpers ────────────────────────────────────────────────────────────────

function toDate(ddmmyyyy: string): Date {
  const [dd, mm, yyyy] = ddmmyyyy.split("/")
  return new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`)
}

/** Every Sunday on or after startDate, up to `count` Sundays */
function weeklySundays(startDate: Date, count: number): Date[] {
  const dates: Date[] = []
  const cur = new Date(startDate)
  // advance to first Sunday on or after startDate
  while (cur.getDay() !== 0) cur.setDate(cur.getDate() + 1)
  while (dates.length < count) {
    dates.push(new Date(cur))
    cur.setDate(cur.getDate() + 7)
  }
  return dates
}

// ── branch ─────────────────────────────────────────────────────────────────

const BRANCH = { code: "075", name: "Main Branch" }

// ── clients ────────────────────────────────────────────────────────────────

const CLIENT_DEFS = [
  { code: "CLT-001", firstName: "Sarah",          lastName: "Kazi",      email: "sarah.kazi@example.com",    phone: "9876543201" },
  { code: "CLT-002", firstName: "Sohel",          lastName: "Patel",     email: "sohel.patel@example.com",   phone: "9876543202" },
  { code: "CLT-003", firstName: "Liza",           lastName: "Qureshi",   email: "liza.qureshi@example.com",  phone: "9876543203" },
  { code: "CLT-004", firstName: "Sharukh",        lastName: "Khan",      email: "sharukh.khan@example.com",  phone: "9876543204" },
  { code: "CLT-005", firstName: "Saleem",         lastName: "Khan",      email: "saleem.khan@example.com",   phone: "9876543205" },
  { code: "CLT-006", firstName: "Shahid",         lastName: "Shaikh",    email: "shahid.shaikh@example.com", phone: "9876543206" },
  { code: "CLT-007", firstName: "Amir",           lastName: "Khan",      email: "amir.khan@example.com",     phone: "9876543207" },
  { code: "CLT-008", firstName: "Mohammed Amjad", lastName: "Khan",      email: "amjad.khan@example.com",    phone: "9876543208" },
]

// ── accounts + transactions ────────────────────────────────────────────────

const ACCOUNT_DEFS = [
  { accountNumber: "075-001", clientIdx: 0, scheme: "RTD" as const, weeklyAmount: 500,  startDate: "21/07/2025", installments: 26 },
  { accountNumber: "075-002", clientIdx: 1, scheme: "RTD" as const, weeklyAmount: 500,  startDate: "01/09/2025", installments: 26 },
  { accountNumber: "075-003", clientIdx: 2, scheme: "RTD" as const, weeklyAmount: 500,  startDate: "13/10/2025", installments: 21 },
  { accountNumber: "075-004", clientIdx: 3, scheme: "RTD" as const, weeklyAmount: 500,  startDate: "22/12/2025", installments: 6  },
  { accountNumber: "075-005", clientIdx: 4, scheme: "RTD" as const, weeklyAmount: 1000, startDate: "22/12/2025", installments: 5  },
  { accountNumber: "075-006", clientIdx: 5, scheme: "RTD" as const, weeklyAmount: 500,  startDate: "22/12/2025", installments: 6  },
  { accountNumber: "075-007", clientIdx: 6, scheme: "RTD" as const, weeklyAmount: 500,  startDate: "29/12/2025", installments: 4  },
  { accountNumber: "075-008", clientIdx: 7, scheme: "RTD" as const, weeklyAmount: 500,  startDate: "22/12/2025", installments: 6  },
]

// trans-id batches that group multiple accounts collected on the same date
const BATCH_TRANS_IDS = [
  { transId: "1099804", rcVcNo: "4452", date: "19/01/2026" },
  { transId: "1101939", rcVcNo: "4496", date: "26/01/2026" },
  { transId: "1104012", rcVcNo: "4541", date: "02/02/2026" },
  { transId: "1106188", rcVcNo: "4588", date: "09/02/2026" },
  { transId: "1108301", rcVcNo: "4632", date: "16/02/2026" },
  { transId: "1110455", rcVcNo: "4677", date: "23/02/2026" },
  { transId: "1112598", rcVcNo: "4720", date: "02/03/2026" },
  { transId: "1114742", rcVcNo: "4765", date: "09/03/2026" },
  { transId: "1116889", rcVcNo: "4810", date: "16/03/2026" },
  { transId: "1119033", rcVcNo: "4855", date: "23/03/2026" },
]

// ── seed ───────────────────────────────────────────────────────────────────

async function seed() {
  const now = new Date()

  // 1. Branch
  let [existingBranch] = await db.select().from(branches).where(eq(branches.code, BRANCH.code))
  let branchId: string
  if (existingBranch) {
    branchId = existingBranch.id
    console.log(`✓ Branch ${BRANCH.code} already exists`)
  } else {
    branchId = randomUUID()
    await db.insert(branches).values({ id: branchId, code: BRANCH.code, name: BRANCH.name, isActive: true, createdAt: now, updatedAt: now })
    console.log(`✓ Created branch ${BRANCH.code}`)
  }

  // 2. Clients
  const clientIds: string[] = []
  for (const def of CLIENT_DEFS) {
    const [existing] = await db.select().from(clients).where(eq(clients.clientCode, def.code))
    if (existing) {
      clientIds.push(existing.id)
      console.log(`  skip client ${def.code} (exists)`)
    } else {
      const id = randomUUID()
      await db.insert(clients).values({ id, clientCode: def.code, branchId, firstName: def.firstName, lastName: def.lastName, email: def.email, phone: def.phone, isActive: true, createdAt: now, updatedAt: now })
      clientIds.push(id)
      console.log(`  + client ${def.code} — ${def.firstName} ${def.lastName}`)
    }
  }

  // 3. Accounts + transactions
  for (const acc of ACCOUNT_DEFS) {
    const [existingAcc] = await db.select().from(investmentAccounts).where(eq(investmentAccounts.accountNumber, acc.accountNumber))
    let accountId: string

    if (existingAcc) {
      accountId = existingAcc.id
      console.log(`  skip account ${acc.accountNumber} (exists)`)
    } else {
      accountId = randomUUID()
      const startDate = toDate(acc.startDate)
      await db.insert(investmentAccounts).values({
        id:            accountId,
        accountNumber: acc.accountNumber,
        clientId:      clientIds[acc.clientIdx],
        schemeType:    acc.scheme,
        weeklyAmount:  acc.weeklyAmount.toString(),
        startDate,
        status:        "active",
        createdAt:     now,
        updatedAt:     now,
      })
      console.log(`  + account ${acc.accountNumber}`)
    }

    // Check if transactions already exist for this account
    const [existingTxn] = await db.select().from(investmentTransactions).where(eq(investmentTransactions.accountId, accountId))
    if (existingTxn) {
      console.log(`    skip transactions for ${acc.accountNumber} (exist)`)
      continue
    }

    // Generate weekly Sunday transactions from startDate for `installments` weeks
    const sundays = weeklySundays(toDate(acc.startDate), acc.installments)

    const txnValues = sundays.map((txnDate, idx) => {
      const dateStr = `${String(txnDate.getDate()).padStart(2,"0")}/${String(txnDate.getMonth()+1).padStart(2,"0")}/${txnDate.getFullYear()}`
      // match a batch transId if the date aligns, else generate a unique one
      const batch = BATCH_TRANS_IDS.find((b) => b.date === dateStr)
      return {
        id:                randomUUID(),
        accountId,
        transactionDate:   txnDate,
        transId:           batch?.transId ?? String(1090000 + idx * 2000 + acc.clientIdx),
        transType:         "TRF",
        rcVcNo:            batch?.rcVcNo ?? String(4000 + idx * 40 + acc.clientIdx),
        amount:            acc.weeklyAmount.toString(),
        direction:         "credit" as const,
        narration:         `Weekly installment #${idx + 1}`,
        installmentNumber: idx + 1,
        createdAt:         now,
      }
    })

    await db.insert(investmentTransactions).values(txnValues)
    console.log(`    + ${txnValues.length} transactions for ${acc.accountNumber}`)
  }

  console.log("\n✓ Investment seed complete")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
