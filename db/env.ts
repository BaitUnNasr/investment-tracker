// Loads .env.local for scripts/tools that run outside Next.js (drizzle-kit, seeds).
// Imported for its side effect; must be evaluated before db/index.ts builds the pool.
import { config } from "dotenv"

config({ path: ".env.local" })
