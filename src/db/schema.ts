import {
  pgSchema,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const kreditorSchema = pgSchema("kreditor");

// Enums (inside kreditor schema)
export const applicationStatusEnum = kreditorSchema.enum("application_status", [
  "gozlemede",
  "baxilir",
  "tesdiq_edildi",
  "red_edildi",
]);

export const adminRoleEnum = kreditorSchema.enum("admin_role", ["admin", "baxici"]);

// Banks table
export const banks = kreditorSchema.table("banks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logo_url"),
  description: text("description"),
  websiteUrl: text("website_url"),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  phoneNumber: varchar("phone_number", { length: 30 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bank admins table
export const bankAdmins = kreditorSchema.table("bank_admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankId: uuid("bank_id")
    .notNull()
    .references(() => banks.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: adminRoleEnum("role").default("admin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Loan applications table
export const loanApplications = kreditorSchema.table("loan_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  finCode: varchar("fin_code", { length: 20 }).notNull(), // FIN - Fərdi İdentifikasiya Nömrəsi
  fullName: varchar("full_name", { length: 255 }),
  // Network
  ipAddress: varchar("ip_address", { length: 45 }),
  // Device / browser fingerprint
  userAgent: text("user_agent"),
  deviceType: varchar("device_type", { length: 20 }), // desktop | mobile | tablet
  browser: varchar("browser", { length: 60 }),
  os: varchar("os", { length: 60 }),
  // Geo (from IP, populated async if geo service added)
  country: varchar("country", { length: 60 }),
  city: varchar("city", { length: 60 }),
  // Request metadata
  referer: text("referer"),
  language: varchar("language", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Application <-> Bank (many-to-many with per-bank status)
export const applicationBanks = kreditorSchema.table("application_banks", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => loanApplications.id, { onDelete: "cascade" }),
  bankId: uuid("bank_id")
    .notNull()
    .references(() => banks.id, { onDelete: "cascade" }),
  status: applicationStatusEnum("status").default("gozlemede").notNull(),
  notes: text("notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type Bank = typeof banks.$inferSelect;
export type NewBank = typeof banks.$inferInsert;
export type BankAdmin = typeof bankAdmins.$inferSelect;
export type NewBankAdmin = typeof bankAdmins.$inferInsert;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type NewLoanApplication = typeof loanApplications.$inferInsert;
export type ApplicationBank = typeof applicationBanks.$inferSelect;
export type NewApplicationBank = typeof applicationBanks.$inferInsert;
