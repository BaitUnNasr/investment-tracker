import {
  mysqlTable,
  varchar,
  boolean,
  datetime,
  text,
  index,
  decimal,
  date,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core"

// ─── Auth Tables (Better-auth) ─────────────────────────────────────────────

export const user = mysqlTable("user", {
  id:            varchar("id", { length: 36 }).primaryKey(),
  name:          varchar("name", { length: 255 }).notNull(),
  email:         varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image:         varchar("image", { length: 255 }),
  createdAt:     datetime("createdAt").notNull(),
  updatedAt:     datetime("updatedAt").notNull(),
})

export const session = mysqlTable(
  "session",
  {
    id:        varchar("id", { length: 36 }).primaryKey(),
    expiresAt: datetime("expiresAt").notNull(),
    token:     varchar("token", { length: 255 }).notNull().unique(),
    createdAt: datetime("createdAt").notNull(),
    updatedAt: datetime("updatedAt").notNull(),
    ipAddress: varchar("ipAddress", { length: 255 }),
    userAgent: varchar("userAgent", { length: 255 }),
    userId:    varchar("userId", { length: 36 })
                 .notNull()
                 .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_userId_idx").on(t.userId)],
)

export const account = mysqlTable(
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
    accessTokenExpiresAt:  datetime("accessTokenExpiresAt"),
    refreshTokenExpiresAt: datetime("refreshTokenExpiresAt"),
    scope:                 varchar("scope", { length: 255 }),
    password:              varchar("password", { length: 255 }),
    createdAt:             datetime("createdAt").notNull(),
    updatedAt:             datetime("updatedAt").notNull(),
  },
  (t) => [index("account_userId_idx").on(t.userId)],
)

export const verification = mysqlTable(
  "verification",
  {
    id:         varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value:      varchar("value", { length: 255 }).notNull(),
    expiresAt:  datetime("expiresAt").notNull(),
    createdAt:  datetime("createdAt"),
    updatedAt:  datetime("updatedAt"),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
)

// ─── BUN Investment System Tables ─────────────────────────────────────────

export const branches = mysqlTable("branches", {
  id:        varchar("id", { length: 36 }).primaryKey(),
  code:      varchar("code", { length: 20 }).notNull().unique(),
  name:      varchar("name", { length: 255 }).notNull(),
  address:   text("address"),
  city:      varchar("city", { length: 100 }),
  phone:     varchar("phone", { length: 20 }),
  isActive:  boolean("is_active").default(true),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
})

export const clients = mysqlTable(
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
    createdAt:   datetime("created_at").notNull(),
    updatedAt:   datetime("updated_at").notNull(),
  },
  (t) => [index("clients_branch_idx").on(t.branchId)],
)

// Scheme types: RTD = Recurring Term Deposit, DSTD = Direct Small Term Deposit, LTD = Lumpsum Term Deposit
export const investmentAccounts = mysqlTable(
  "investment_accounts",
  {
    id:            varchar("id", { length: 36 }).primaryKey(),
    accountNumber: varchar("account_number", { length: 30 }).notNull().unique(),
    clientId:      varchar("client_id", { length: 36 })
                     .notNull()
                     .references(() => clients.id),
    schemeType:    mysqlEnum("scheme_type", ["RTD", "DSTD", "LTD"]).notNull(),
    weeklyAmount:  decimal("weekly_amount", { precision: 12, scale: 2 }).notNull(),
    startDate:     date("start_date").notNull(),
    maturityDate:  date("maturity_date"),
    status:        mysqlEnum("status", ["active", "matured", "closed"]).default("active"),
    createdAt:     datetime("created_at").notNull(),
    updatedAt:     datetime("updated_at").notNull(),
  },
  (t) => [index("inv_accounts_client_idx").on(t.clientId)],
)

export const investmentTransactions = mysqlTable(
  "investment_transactions",
  {
    id:                  varchar("id", { length: 36 }).primaryKey(),
    accountId:           varchar("account_id", { length: 36 })
                           .notNull()
                           .references(() => investmentAccounts.id),
    transactionDate:     date("transaction_date").notNull(),
    transId:             varchar("trans_id", { length: 20 }),
    transType:           varchar("trans_type", { length: 10 }), // TRF, CR, DR
    rcVcNo:              varchar("rc_vc_no", { length: 20 }),
    amount:              decimal("amount", { precision: 12, scale: 2 }).notNull(),
    direction:           mysqlEnum("direction", ["credit", "debit"]).notNull(),
    narration:           text("narration"),
    installmentNumber:   int("installment_number"),
    createdAt:           datetime("created_at").notNull(),
  },
  (t) => [
    index("inv_txn_account_idx").on(t.accountId),
    index("inv_txn_date_idx").on(t.transactionDate),
  ],
)

// Dynamic fund allocation percentages: TEF (Tata Ethical Fund), TGF (Tata Gold Fund), PROPERTY
export const fundAllocationSettings = mysqlTable("fund_allocation_settings", {
  id:         varchar("id", { length: 36 }).primaryKey(),
  fundType:   mysqlEnum("fund_type", ["TEF", "TGF", "PROPERTY"]).notNull().unique(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  updatedAt:  datetime("updated_at").notNull(),
  updatedBy:  varchar("updated_by", { length: 36 }).references(() => user.id),
})

// NAV data uploaded by admin for TEF and TGF (used to allot NAV units to clients)
export const navData = mysqlTable(
  "nav_data",
  {
    id:         varchar("id", { length: 36 }).primaryKey(),
    fundType:   mysqlEnum("fund_type", ["TEF", "TGF"]).notNull(),
    navDate:    date("nav_date").notNull(),
    navValue:   decimal("nav_value", { precision: 12, scale: 4 }).notNull(),
    uploadedAt: datetime("uploaded_at").notNull(),
    uploadedBy: varchar("uploaded_by", { length: 36 }).references(() => user.id),
  },
  (t) => [
    index("nav_fund_date_idx").on(t.fundType, t.navDate),
  ],
)

// NAV units allotted to each client per transaction per fund
// units = (investment_amount * fund_percentage / 100) / nav_value
export const clientFundUnits = mysqlTable(
  "client_fund_units",
  {
    id:               varchar("id", { length: 36 }).primaryKey(),
    transactionId:    varchar("transaction_id", { length: 36 })
                        .notNull()
                        .references(() => investmentTransactions.id),
    clientId:         varchar("client_id", { length: 36 })
                        .notNull()
                        .references(() => clients.id),
    fundType:         mysqlEnum("fund_type", ["TEF", "TGF"]).notNull(),
    navDate:          date("nav_date").notNull(),
    navValue:         decimal("nav_value", { precision: 12, scale: 4 }).notNull(),
    investmentAmount: decimal("investment_amount", { precision: 12, scale: 2 }).notNull(),
    units:            decimal("units", { precision: 18, scale: 6 }).notNull(),
    createdAt:        datetime("created_at").notNull(),
  },
  (t) => [
    index("cfu_client_idx").on(t.clientId),
    index("cfu_transaction_idx").on(t.transactionId),
  ],
)
