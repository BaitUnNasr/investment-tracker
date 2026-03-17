import "dotenv/config"
import { db } from "./index"
import { user, account } from "./schema"
import { hashPassword } from "better-auth/crypto"
import { randomUUID } from "crypto"

async function seed() {
  const email = "sayedisa96@gmail.com"
  const password = "Demo@123"
  const name = "Sayed Isa"

  // Check if user already exists
  const existing = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  })

  if (existing) {
    console.log("User already exists, skipping seed.")
    process.exit(0)
  }

  const userId = randomUUID()
  const now = new Date()
  const hashedPassword = await hashPassword(password)

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  })

  console.log(`✓ Seeded user: ${email}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
