import { db } from "./index";
import {
  banks,
  bankAdmins,
  loanApplications,
  applicationBanks,
} from "./schema";
import { eq, count, desc, and, sql } from "drizzle-orm";

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
