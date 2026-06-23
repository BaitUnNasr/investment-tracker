import "./env"
import { db } from "./index"
import { navData } from "./schema"
import { randomUUID } from "crypto"

// Generates a realistic random walk NAV series for weekdays between start and end dates
function generateNavSeries(
  startDate: Date,
  endDate:   Date,
  startNav:  number,
  dailyDrift: number,  // average daily % change
  volatility: number,  // std dev of daily % change
): { date: Date; nav: number }[] {
  const series: { date: Date; nav: number }[] = []
  let nav = startNav
  const cursor = new Date(startDate)

  // seeded pseudo-random for reproducible data
  let seed = 42
  function rand() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }
  // Box-Muller normal distribution
  function randn() {
    const u = 1 - rand()
    const v = rand()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  while (cursor <= endDate) {
    const dow = cursor.getDay()
    if (dow !== 0 && dow !== 6) { // skip weekends
      series.push({ date: new Date(cursor), nav: parseFloat(nav.toFixed(4)) })
      nav = nav * (1 + dailyDrift / 100 + (volatility / 100) * randn())
      nav = Math.max(nav, 1) // floor at 1
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return series
}

async function seed() {
  const endDate   = new Date("2026-04-10")
  const startDate = new Date("2026-01-05")
  const now       = new Date()

  const tef = generateNavSeries(startDate, endDate, 17.5200, 0.06, 0.35)
  const tgf = generateNavSeries(startDate, endDate, 23.0500, 0.08, 0.55)

  const rows = [
    ...tef.map((r) => ({
      id:         randomUUID(),
      fundType:   "TEF" as const,
      navDate:    r.date,
      navValue:   r.nav.toFixed(4),
      uploadedAt: now,
      uploadedBy: null,
    })),
    ...tgf.map((r) => ({
      id:         randomUUID(),
      fundType:   "TGF" as const,
      navDate:    r.date,
      navValue:   r.nav.toFixed(4),
      uploadedAt: now,
      uploadedBy: null,
    })),
  ]

  console.log(`Inserting ${rows.length} NAV records (${tef.length} TEF, ${tgf.length} TGF)…`)
  await db.insert(navData).values(rows)
  console.log("✓ NAV seed complete")
  process.exit(0)
}

seed().catch((err) => {
  console.error("NAV seed failed:", err)
  process.exit(1)
})
