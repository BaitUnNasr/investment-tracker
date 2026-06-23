"use server"

import { db } from "@/db"
import { navData } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import type { NavRow } from "./_components/nav-table"

function toDisplayDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d)
  const dd   = String(date.getUTCDate()).padStart(2, "0")
  const mm   = String(date.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = date.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export async function getNavRows(fundType: "TEF" | "TGF"): Promise<NavRow[]> {
  const rows = await db
    .select({
      navDate:  navData.navDate,
      navValue: navData.navValue,
    })
    .from(navData)
    .where(eq(navData.fundType, fundType))
    .orderBy(desc(navData.navDate))

  return rows.map((r, i, arr) => {
    const nav     = parseFloat(r.navValue)
    const prevNav = arr[i + 1] ? parseFloat(arr[i + 1].navValue) : nav
    return {
      date:   toDisplayDate(r.navDate),
      nav,
      change: parseFloat((nav - prevNav).toFixed(4)),
    }
  })
}
