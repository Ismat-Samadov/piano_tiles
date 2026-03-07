/**
 * Demo seed — creates X-Bank and populates it with sample loan applications.
 * Run: npm run db:seed:demo
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { banks, bankAdmins, loanApplications, applicationBanks } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const XBANK = {
  name: "X-Bank ASC",
  slug: "x-bank",
  address: "AZ1000, Bakı şəhəri, İstiqlaliyyət küçəsi, 1",
  phoneNumber: "(+994 12) 000-00-00",
  email: "info@xbank.az",
  websiteUrl: "https://xbank.az",
  description: "X-Bank — demo bank for platform testing",
};

const ADMIN_EMAIL = "admin@x-bank.kreditor.az";
const ADMIN_PASSWORD = "Demo@1234";

const SAMPLE_APPLICATIONS = [
  {
    phoneNumber: "+994501234567",
    finCode: "AA1B2C3",
    ipAddress: "185.23.14.77",
    deviceType: "mobile" as const,
    browser: "Chrome 124.0",
    os: "Android 14",
    language: "az",
    status: "gozlemede" as const,
  },
  {
    phoneNumber: "+994552345678",
    finCode: "BB2C3D4",
    ipAddress: "77.91.200.5",
    deviceType: "desktop" as const,
    browser: "Firefox 125.0",
    os: "Windows 10/11",
    language: "az",
    status: "baxilir" as const,
    notes: "Müştəri sənədlərini göndərdi, yoxlanılır.",
  },
  {
    phoneNumber: "+994703456789",
    finCode: "CC3D4E5",
    ipAddress: "91.102.13.44",
    deviceType: "desktop" as const,
    browser: "Edge 124.0",
    os: "Windows 10/11",
    language: "ru",
    status: "tesdiq_edildi" as const,
    notes: "Kredit təsdiq edildi. Limit: 10.000 AZN.",
  },
  {
    phoneNumber: "+994604567890",
    finCode: "DD4E5F6",
    ipAddress: "5.191.55.120",
    deviceType: "tablet" as const,
    browser: "Safari 17.4",
    os: "iPadOS 17.4",
    language: "az",
    status: "red_edildi" as const,
    notes: "Kredit tarixi kifayət etmir.",
  },
  {
    phoneNumber: "+994775678901",
    finCode: "EE5F6G7",
    ipAddress: "185.23.14.99",
    deviceType: "mobile" as const,
    browser: "Chrome 123.0",
    os: "iOS 17.4",
    language: "az",
    status: "gozlemede" as const,
  },
  {
    phoneNumber: "+994506789012",
    finCode: "FF6G7H8",
    ipAddress: "212.34.100.8",
    deviceType: "desktop" as const,
    browser: "Chrome 124.0",
    os: "macOS 14.4",
    language: "en",
    status: "baxilir" as const,
    notes: "Əlavə sənəd tələb olunur.",
  },
  {
    phoneNumber: "+994557890123",
    finCode: "GG7H8I9",
    ipAddress: "95.85.22.11",
    deviceType: "mobile" as const,
    browser: "Chrome 124.0",
    os: "Android 13",
    language: "az",
    status: "tesdiq_edildi" as const,
    notes: "Kredit 15.000 AZN, 36 ay müddəti ilə təsdiq edildi.",
  },
  {
    phoneNumber: "+994998901234",
    finCode: "HH8I9J0",
    ipAddress: "77.91.100.22",
    deviceType: "desktop" as const,
    browser: "Firefox 124.0",
    os: "Linux",
    language: "az",
    status: "gozlemede" as const,
  },
];

async function seedDemo() {
  console.log("Seeding X-Bank demo data...\n");

  // 1. Upsert X-Bank
  await db
    .insert(banks)
    .values(XBANK)
    .onConflictDoUpdate({
      target: banks.slug,
      set: {
        name: XBANK.name,
        address: XBANK.address,
        phoneNumber: XBANK.phoneNumber,
        email: XBANK.email,
        websiteUrl: XBANK.websiteUrl,
        description: XBANK.description,
        updatedAt: new Date(),
      },
    });

  const [bank] = await db
    .select({ id: banks.id })
    .from(banks)
    .where(eq(banks.slug, XBANK.slug))
    .limit(1);

  if (!bank) throw new Error("Failed to create X-Bank");
  console.log(`  Bank created: ${XBANK.name} (id: ${bank.id})`);

  // 2. Create demo bank admin
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db
    .insert(bankAdmins)
    .values({
      bankId: bank.id,
      name: "X-Bank Demo Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    })
    .onConflictDoNothing({ target: bankAdmins.email });
  console.log(`  Admin created: ${ADMIN_EMAIL}`);

  // 3. Seed sample loan applications
  const now = new Date();
  let appCount = 0;

  for (let i = 0; i < SAMPLE_APPLICATIONS.length; i++) {
    const sample = SAMPLE_APPLICATIONS[i];

    // Spread created_at over the last 30 days
    const createdAt = new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000);

    const [app] = await db
      .insert(loanApplications)
      .values({
        phoneNumber: sample.phoneNumber,
        finCode: sample.finCode,
        ipAddress: sample.ipAddress,
        deviceType: sample.deviceType,
        browser: sample.browser,
        os: sample.os,
        language: sample.language,
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: loanApplications.id });

    const reviewedAt =
      sample.status !== "gozlemede" ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) : null;

    await db.insert(applicationBanks).values({
      applicationId: app.id,
      bankId: bank.id,
      status: sample.status,
      notes: sample.notes ?? null,
      reviewedAt,
      createdAt,
      updatedAt: createdAt,
    });

    console.log(`  Application ${i + 1}: ${sample.phoneNumber} → ${sample.status}`);
    appCount++;
  }

  console.log(`\nDone. Seeded ${appCount} applications for X-Bank.`);
  console.log("\nDemo credentials:");
  console.log(`  Super Admin  : admin@kreditor.az  /  Admin@1234`);
  console.log(`  X-Bank Admin : ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}`);
  console.log("\nDemo URLs:");
  console.log("  Super Admin  : http://localhost:3000/admin/login");
  console.log("  X-Bank Admin : http://localhost:3000/admin/bank/x-bank/login");

  process.exit(0);
}

seedDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
