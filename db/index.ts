import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

const pool = mysql.createPool({
  host:     process.env.DB_HOST     ?? "localhost",
  database: process.env.DB_NAME     ?? "bun_investment_tracker_db",
  user:     process.env.DB_USER     ?? "root",
  password: process.env.DB_PASSWORD ?? "",
})

export const db = drizzle(pool, { schema, mode: "default" })
