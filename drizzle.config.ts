import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST ?? "localhost",
    database: process.env.DB_NAME ?? "bun_investment_tracker_db",
    user: process.env.DB_USER ?? "root",
    // omit password when blank — MySQL treats missing password as no password
    ...(process.env.DB_PASSWORD ? { password: process.env.DB_PASSWORD } : {}),
  },
})
