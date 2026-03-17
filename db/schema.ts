import {
  mysqlTable,
  varchar,
  boolean,
  datetime,
  text,
  index,
} from "drizzle-orm/mysql-core"

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
