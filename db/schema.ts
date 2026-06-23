import {
  pgTable,
  pgEnum,
  varchar,
  boolean,
  timestamp,
  text,
  index,
  decimal,
  date,
  integer,
} from "drizzle-orm/pg-core"

// ─── Enums ─────────────────────────────────────────────────────────────────

export const schemeTypeEnum = pgEnum("scheme_type", ["RTD", "DSTD", "LTD"])
export const accountStatusEnum = pgEnum("account_status", ["active", "matured", "closed"])
export const transactionDirectionEnum = pgEnum("transaction_direction", ["credit", "debit"])
export const fundAllocationTypeEnum = pgEnum("fund_allocation_type", ["TEF", "TGF", "PROPERTY"])
export const navFundTypeEnum = pgEnum("nav_fund_type", ["TEF", "TGF"])
export const clientFundTypeEnum = pgEnum("client_fund_type", ["TEF", "TGF"])

// ─── Auth Tables (Better-auth) ─────────────────────────────────────────────

export const user = pgTable("user", {
  id:            varchar("id", { length: 36 }).primaryKey(),
  name:          varchar("name", { length: 255 }).notNull(),
  email:         varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image:         varchar("image", { length: 255 }),
  createdAt:     timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt:     timestamp("updatedAt", { mode: "date" }).notNull(),
})

export const session = pgTable(
  "session",
  {
    id:        varchar("id", { length: 36 }).primaryKey(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    token:     varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
    ipAddress: varchar("ipAddress", { length: 255 }),
    userAgent: varchar("userAgent", { length: 255 }),
    userId:    varchar("userId", { length: 36 })
                 .notNull()
                 .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_userId_idx").on(t.userId)],
)

export const account = pgTable(
  "account",
  {
    id:                    varchar("id", { length: 36 }).primaryKey(),
    accountId:             varchar("accountId", { length: 255 }).notNull(),
    providerId:            varchar("providerId", { length: 255 }).notNull(),
    userId:                varchar("userId", { length: 36 })
                             .notNull()
                             .references(() => user.id, { onDelete: "cascade" }),
    accessToken:           text("accessToken"),
    refreshToken:          text("refreshToken"),
    idToken:               text("idToken"),
    accessTokenExpiresAt:  timestamp("accessTokenExpiresAt", { mode: "date" }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "date" }),
    scope:                 varchar("scope", { length: 255 }),
    password:              varchar("password", { length: 255 }),
    createdAt:             timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt:             timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (t) => [index("account_userId_idx").on(t.userId)],
)

export const verification = pgTable(
  "verification",
  {
    id:         varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value:      varchar("value", { length: 255 }).notNull(),
    expiresAt:  timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt:  timestamp("createdAt", { mode: "date" }),
    updatedAt:  timestamp("updatedAt", { mode: "date" }),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
)

// ─── BUN Investment System Tables ─────────────────────────────────────────

export const branches = pgTable("branches", {
  id:        varchar("id", { length: 36 }).primaryKey(),
  code:      varchar("code", { length: 20 }).notNull().unique(),
  name:      varchar("name", { length: 255 }).notNull(),
  address:   text("address"),
  city:      varchar("city", { length: 100 }),
  phone:     varchar("phone", { length: 20 }),
  isActive:  boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
})

export const clients = pgTable(
  "clients",
  {
    id:          varchar("id", { length: 36 }).primaryKey(),
    clientCode:  varchar("client_code", { length: 20 }).notNull().unique(),
    branchId:    varchar("branch_id", { length: 36 })
                   .notNull()
                   .references(() => branches.id),
    firstName:   varchar("first_name", { length: 100 }).notNull(),
    lastName:    varchar("last_name", { length: 100 }).notNull(),
    email:       varchar("email", { length: 255 }),
    phone:       varchar("phone", { length: 20 }),
    address:     text("address"),
    isActive:    boolean("is_active").default(true),
    createdAt:   timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt:   timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (t) => [index("clients_branch_idx").on(t.branchId)],
)

// Scheme types: RTD = Recurring Term Deposit, DSTD = Direct Small Term Deposit, LTD = Lumpsum Term Deposit
export const investmentAccounts = pgTable(
  "investment_accounts",
  {
    id:            varchar("id", { length: 36 }).primaryKey(),
    accountNumber: varchar("account_number", { length: 30 }).notNull().unique(),
    clientId:      varchar("client_id", { length: 36 })
                     .notNull()
                     .references(() => clients.id),
    schemeType:    schemeTypeEnum("scheme_type").notNull(),
    weeklyAmount:  decimal("weekly_amount", { precision: 12, scale: 2 }).notNull(),
    startDate:     date("start_date", { mode: "date" }).notNull(),
    maturityDate:  date("maturity_date", { mode: "date" }),
    status:        accountStatusEnum("status").default("active"),
    createdAt:     timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt:     timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (t) => [index("inv_accounts_client_idx").on(t.clientId)],
)

export const investmentTransactions = pgTable(
  "investment_transactions",
  {
    id:                  varchar("id", { length: 36 }).primaryKey(),
    accountId:           varchar("account_id", { length: 36 })
                           .notNull()
                           .references(() => investmentAccounts.id),
    transactionDate:     date("transaction_date", { mode: "date" }).notNull(),
    transId:             varchar("trans_id", { length: 20 }),
    transType:           varchar("trans_type", { length: 10 }), // TRF, CR, DR
    rcVcNo:              varchar("rc_vc_no", { length: 20 }),
    amount:              decimal("amount", { precision: 12, scale: 2 }).notNull(),
    direction:           transactionDirectionEnum("direction").notNull(),
    narration:           text("narration"),
    installmentNumber:   integer("installment_number"),
    createdAt:           timestamp("created_at", { mode: "date" }).notNull(),
  },
  (t) => [
    index("inv_txn_account_idx").on(t.accountId),
    index("inv_txn_date_idx").on(t.transactionDate),
  ],
)

// Dynamic fund allocation percentages: TEF (Tata Ethical Fund), TGF (Tata Gold Fund), PROPERTY
export const fundAllocationSettings = pgTable("fund_allocation_settings", {
  id:         varchar("id", { length: 36 }).primaryKey(),
  fundType:   fundAllocationTypeEnum("fund_type").notNull().unique(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  updatedAt:  timestamp("updated_at", { mode: "date" }).notNull(),
  updatedBy:  varchar("updated_by", { length: 36 }).references(() => user.id),
})

// NAV data uploaded by admin for TEF and TGF (used to allot NAV units to clients)
export const navData = pgTable(
  "nav_data",
  {
    id:         varchar("id", { length: 36 }).primaryKey(),
    fundType:   navFundTypeEnum("fund_type").notNull(),
    navDate:    date("nav_date", { mode: "date" }).notNull(),
    navValue:   decimal("nav_value", { precision: 12, scale: 4 }).notNull(),
    uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull(),
    uploadedBy: varchar("uploaded_by", { length: 36 }).references(() => user.id),
  },
  (t) => [
    index("nav_fund_date_idx").on(t.fundType, t.navDate),
  ],
)

// NAV units allotted to each client per transaction per fund
// units = (investment_amount * fund_percentage / 100) / nav_value
export const clientFundUnits = pgTable(
  "client_fund_units",
  {
    id:               varchar("id", { length: 36 }).primaryKey(),
    transactionId:    varchar("transaction_id", { length: 36 })
                        .notNull()
                        .references(() => investmentTransactions.id),
    clientId:         varchar("client_id", { length: 36 })
                        .notNull()
                        .references(() => clients.id),
    fundType:         clientFundTypeEnum("fund_type").notNull(),
    navDate:          date("nav_date", { mode: "date" }).notNull(),
    navValue:         decimal("nav_value", { precision: 12, scale: 4 }).notNull(),
    investmentAmount: decimal("investment_amount", { precision: 12, scale: 2 }).notNull(),
    units:            decimal("units", { precision: 18, scale: 6 }).notNull(),
    createdAt:        timestamp("created_at", { mode: "date" }).notNull(),
  },
  (t) => [
    index("cfu_client_idx").on(t.clientId),
    index("cfu_transaction_idx").on(t.transactionId),
  ],
)
