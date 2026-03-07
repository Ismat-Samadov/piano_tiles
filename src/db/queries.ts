import { db } from "./index";
import {
  banks,
  bankAdmins,
  loanApplications,
  applicationBanks,
} from "./schema";
import { eq, count, desc, and, sql, gte, lte, inArray } from "drizzle-orm";

export async function getDashboardStats() {
  const [[totalApps], [activeBanks], [pendingApps], [approvedApps]] =
    await Promise.all([
      db.select({ count: count() }).from(loanApplications),
      db.select({ count: count() }).from(banks).where(eq(banks.isActive, true)),
      db
        .select({ count: count() })
        .from(applicationBanks)
        .where(eq(applicationBanks.status, "gozlemede")),
      db
        .select({ count: count() })
        .from(applicationBanks)
        .where(eq(applicationBanks.status, "tesdiq_edildi")),
    ]);

  return {
    totalApplications: Number(totalApps.count),
    activeBanks: Number(activeBanks.count),
    pendingApplications: Number(pendingApps.count),
    approvedApplications: Number(approvedApps.count),
  };
}

export async function getRecentApplications(limit = 10) {
  return db
    .select({
      id: loanApplications.id,
      phoneNumber: loanApplications.phoneNumber,
      finCode: loanApplications.finCode,
      createdAt: loanApplications.createdAt,
    })
    .from(loanApplications)
    .orderBy(desc(loanApplications.createdAt))
    .limit(limit);
}

export async function getAllApplicationsWithBanks(limit = 100) {
  const apps = await db
    .select({
      id: loanApplications.id,
      phoneNumber: loanApplications.phoneNumber,
      finCode: loanApplications.finCode,
      ipAddress: loanApplications.ipAddress,
      userAgent: loanApplications.userAgent,
      deviceType: loanApplications.deviceType,
      browser: loanApplications.browser,
      os: loanApplications.os,
      language: loanApplications.language,
      createdAt: loanApplications.createdAt,
    })
    .from(loanApplications)
    .orderBy(desc(loanApplications.createdAt))
    .limit(limit);

  if (!apps.length) return [];

  const appIds = apps.map((a) => a.id);
  const bankEntries = await db
    .select({
      applicationId: applicationBanks.applicationId,
      status: applicationBanks.status,
      bankName: banks.name,
    })
    .from(applicationBanks)
    .innerJoin(banks, eq(applicationBanks.bankId, banks.id))
    .where(
      sql`${applicationBanks.applicationId} = ANY(ARRAY[${sql.join(
        appIds.map((id) => sql`${id}::uuid`),
        sql`, `
      )}])`
    );

  return apps.map((app) => ({
    ...app,
    banks: bankEntries.filter((b) => b.applicationId === app.id),
  }));
}

export async function getAllBanks() {
  return db
    .select({
      id: banks.id,
      name: banks.name,
      slug: banks.slug,
      logoUrl: banks.logoUrl,
      address: banks.address,
      email: banks.email,
      phoneNumber: banks.phoneNumber,
      websiteUrl: banks.websiteUrl,
      isActive: banks.isActive,
      createdAt: banks.createdAt,
    })
    .from(banks)
    .orderBy(banks.name);
}

export async function getBankBySlug(slug: string) {
  const [bank] = await db
    .select()
    .from(banks)
    .where(eq(banks.slug, slug))
    .limit(1);
  return bank ?? null;
}

export async function getBankAdmins(bankId: string) {
  return db
    .select({
      id: bankAdmins.id,
      name: bankAdmins.name,
      email: bankAdmins.email,
      role: bankAdmins.role,
      isActive: bankAdmins.isActive,
      createdAt: bankAdmins.createdAt,
    })
    .from(bankAdmins)
    .where(eq(bankAdmins.bankId, bankId))
    .orderBy(desc(bankAdmins.createdAt));
}

export async function getBankDashboardStats(bankId: string) {
  const [[total], [pending], [reviewing], [approved], [rejected]] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(applicationBanks)
        .where(eq(applicationBanks.bankId, bankId)),
      db
        .select({ count: count() })
        .from(applicationBanks)
        .where(
          and(
            eq(applicationBanks.bankId, bankId),
            eq(applicationBanks.status, "gozlemede")
          )
        ),
      db
        .select({ count: count() })
        .from(applicationBanks)
        .where(
          and(
            eq(applicationBanks.bankId, bankId),
            eq(applicationBanks.status, "baxilir")
          )
        ),
      db
        .select({ count: count() })
        .from(applicationBanks)
        .where(
          and(
            eq(applicationBanks.bankId, bankId),
            eq(applicationBanks.status, "tesdiq_edildi")
          )
        ),
      db
        .select({ count: count() })
        .from(applicationBanks)
        .where(
          and(
            eq(applicationBanks.bankId, bankId),
            eq(applicationBanks.status, "red_edildi")
          )
        ),
    ]);

  return {
    total: Number(total.count),
    pending: Number(pending.count),
    reviewing: Number(reviewing.count),
    approved: Number(approved.count),
    rejected: Number(rejected.count),
  };
}

export async function getBankAnalytics(bankId: string) {
  const [deviceRows, browserRows, langRows, dailyRows] = await Promise.all([
    // Device breakdown
    db
      .select({
        deviceType: loanApplications.deviceType,
        count: count(),
      })
      .from(applicationBanks)
      .innerJoin(loanApplications, eq(applicationBanks.applicationId, loanApplications.id))
      .where(eq(applicationBanks.bankId, bankId))
      .groupBy(loanApplications.deviceType),

    // Browser breakdown (top 6)
    db
      .select({
        browser: loanApplications.browser,
        count: count(),
      })
      .from(applicationBanks)
      .innerJoin(loanApplications, eq(applicationBanks.applicationId, loanApplications.id))
      .where(eq(applicationBanks.bankId, bankId))
      .groupBy(loanApplications.browser)
      .orderBy(desc(count()))
      .limit(6),

    // Language breakdown
    db
      .select({
        language: loanApplications.language,
        count: count(),
      })
      .from(applicationBanks)
      .innerJoin(loanApplications, eq(applicationBanks.applicationId, loanApplications.id))
      .where(eq(applicationBanks.bankId, bankId))
      .groupBy(loanApplications.language)
      .orderBy(desc(count())),

    // Daily applications for last 30 days
    db
      .select({
        date: sql<string>`DATE(${applicationBanks.createdAt})`,
        count: count(),
      })
      .from(applicationBanks)
      .where(
        and(
          eq(applicationBanks.bankId, bankId),
          gte(applicationBanks.createdAt, sql`NOW() - INTERVAL '30 days'`)
        )
      )
      .groupBy(sql`DATE(${applicationBanks.createdAt})`)
      .orderBy(sql`DATE(${applicationBanks.createdAt})`),
  ]);

  return {
    devices: deviceRows.map((r) => ({ deviceType: r.deviceType ?? "desktop", count: Number(r.count) })),
    browsers: browserRows.map((r) => ({ browser: r.browser ?? "Unknown", count: Number(r.count) })),
    languages: langRows.map((r) => ({ language: r.language ?? "–", count: Number(r.count) })),
    daily: dailyRows.map((r) => ({ date: r.date, count: Number(r.count) })),
  };
}

export async function getPlatformAnalytics() {
  const [deviceRows, dailyRows, bankRows] = await Promise.all([
    // Device breakdown across all applications
    db
      .select({
        deviceType: loanApplications.deviceType,
        count: count(),
      })
      .from(loanApplications)
      .groupBy(loanApplications.deviceType),

    // Daily new applications for last 30 days
    db
      .select({
        date: sql<string>`DATE(${loanApplications.createdAt})`,
        count: count(),
      })
      .from(loanApplications)
      .where(gte(loanApplications.createdAt, sql`NOW() - INTERVAL '30 days'`))
      .groupBy(sql`DATE(${loanApplications.createdAt})`)
      .orderBy(sql`DATE(${loanApplications.createdAt})`),

    // Per-bank: total, approved, rejected
    db
      .select({
        bankId: banks.id,
        bankName: banks.name,
        total: count(),
        approved: sql<number>`COUNT(*) FILTER (WHERE ${applicationBanks.status} = 'tesdiq_edildi')`,
        rejected: sql<number>`COUNT(*) FILTER (WHERE ${applicationBanks.status} = 'red_edildi')`,
        pending: sql<number>`COUNT(*) FILTER (WHERE ${applicationBanks.status} = 'gozlemede')`,
      })
      .from(applicationBanks)
      .innerJoin(banks, eq(applicationBanks.bankId, banks.id))
      .groupBy(banks.id, banks.name)
      .orderBy(desc(count())),
  ]);

  return {
    devices: deviceRows.map((r) => ({ deviceType: r.deviceType ?? "desktop", count: Number(r.count) })),
    daily: dailyRows.map((r) => ({ date: r.date, count: Number(r.count) })),
    banks: bankRows.map((r) => ({
      bankId: r.bankId,
      bankName: r.bankName,
      total: Number(r.total),
      approved: Number(r.approved),
      rejected: Number(r.rejected),
      pending: Number(r.pending),
    })),
  };
}

export type ExportStatus = "gozlemede" | "baxilir" | "tesdiq_edildi" | "red_edildi";

export async function getApplicationsForExport(
  bankId: string,
  filters: {
    statuses?: ExportStatus[];
    dateFrom?: Date;
    dateTo?: Date;
  } = {}
) {
  const conditions = [eq(applicationBanks.bankId, bankId)];

  if (filters.statuses && filters.statuses.length > 0) {
    conditions.push(inArray(applicationBanks.status, filters.statuses));
  }
  if (filters.dateFrom) {
    conditions.push(gte(loanApplications.createdAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    // include the full end day
    const endOfDay = new Date(filters.dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    conditions.push(lte(loanApplications.createdAt, endOfDay));
  }

  return db
    .select({
      id: loanApplications.id,
      phoneNumber: loanApplications.phoneNumber,
      finCode: loanApplications.finCode,
      ipAddress: loanApplications.ipAddress,
      deviceType: loanApplications.deviceType,
      browser: loanApplications.browser,
      os: loanApplications.os,
      language: loanApplications.language,
      referer: loanApplications.referer,
      status: applicationBanks.status,
      notes: applicationBanks.notes,
      reviewedAt: applicationBanks.reviewedAt,
      appliedAt: loanApplications.createdAt,
    })
    .from(applicationBanks)
    .innerJoin(loanApplications, eq(applicationBanks.applicationId, loanApplications.id))
    .where(and(...conditions))
    .orderBy(desc(loanApplications.createdAt));
}

export async function getBankApplications(bankId: string, limit = 100) {
  return db
    .select({
      id: applicationBanks.id,
      status: applicationBanks.status,
      notes: applicationBanks.notes,
      createdAt: applicationBanks.createdAt,
      reviewedAt: applicationBanks.reviewedAt,
      applicationId: loanApplications.id,
      phoneNumber: loanApplications.phoneNumber,
      appliedAt: loanApplications.createdAt,
    })
    .from(applicationBanks)
    .innerJoin(
      loanApplications,
      eq(applicationBanks.applicationId, loanApplications.id)
    )
    .where(eq(applicationBanks.bankId, bankId))
    .orderBy(desc(applicationBanks.createdAt))
    .limit(limit);
}
