import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { banks, bankAdmins } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const azerbaijaniBanks = [
  {
    name: "ABB ASC",
    slug: "abb",
    address: "AZ1005, Bakı şəhəri, Nizami küçəsi, 67",
    phoneNumber: "(+994 12) 493-00-91",
    email: "ibar@ibar.az",
    websiteUrl: "https://ibar.az",
    description: "Azərbaycan Beynəlxalq Bankı",
  },
  {
    name: "AccessBank QSC",
    slug: "accessbank",
    address: "AZ1065, Bakı şəhəri, Tbilisi prospekti, 3",
    phoneNumber: "(+994 12) 490-80-10",
    email: "info@accessbank.az",
    websiteUrl: "https://accessbank.az",
    description: "Azərbaycanın aparıcı mikromaliyyə bankı",
  },
  {
    name: "AFB Bank ASC",
    slug: "afb-bank",
    address: "AZ1073, Bakı şəhəri, İ.Qutqaşınlı küçəsi, 112",
    phoneNumber: "(+994 12) 565-65-56",
    email: "info@afb.az",
    websiteUrl: "https://afb.az",
    description: "AFB Bank ASC",
  },
  {
    name: "Azər Türk Bank ASC",
    slug: "azer-turk-bank",
    address: "AZ1078, Bakı şəhəri, C.Məmmədquluzadə küçəsi, 85; 192/193",
    phoneNumber: "(+994 12) 404-14-54",
    email: "atb@azerturkbank.az",
    websiteUrl: "https://azerturkbank.az",
    description: "Azər Türk Bank ASC",
  },
  {
    name: "Azərbaycan Sənaye Bankı ASC",
    slug: "senaye-bank",
    address: "AZ1005, Bakı şəhəri, Zərifə Əliyeva küçəsi, 3",
    phoneNumber: "(+994 12) 493-14-16",
    email: "info@asb.az",
    websiteUrl: "https://asb.az",
    description: "Azərbaycan Sənaye Bankı ASC",
  },
  {
    name: "Bank Avrasiya ASC",
    slug: "bank-avrasiya",
    address: "AZ1000, Bakı şəhəri, Nizami küçəsi, 112B",
    phoneNumber: "(+994 12) 598-85-85",
    email: "info@bankavrasiya.az",
    websiteUrl: "https://bankavrasiya.az",
    description: "Bank Avrasiya ASC",
  },
  {
    name: "Bank BTB ASC",
    slug: "bank-btb",
    address: "AZ1025, Bakı şəhəri, Xətai rayonu, Yusif Səfərov küçəsi, 27",
    phoneNumber: "(+994 12) 499-79-95",
    email: null,
    websiteUrl: "https://btb.az",
    description: "Bank BTB ASC",
  },
  {
    name: "Bank Melli İran Bakı filialı",
    slug: "bank-melli-iran",
    address: "AZ1025, Bakı şəhəri, Nobel prospekti, 23",
    phoneNumber: "(+994 12) 598-90-05",
    email: "bank@bmibaku.az",
    websiteUrl: "https://bmibaku.az",
    description: "Bank Melli İran Bakı filialı",
  },
  {
    name: "Bank of Baku ASC",
    slug: "bank-of-baku",
    address: "AZ1069, Bakı şəhəri, Atatürk prospekti, 42",
    phoneNumber: "(+994 12) 447-00-55",
    email: "office@bankofbaku.com",
    websiteUrl: "https://bankofbaku.com",
    description: "Bank of Baku ASC",
  },
  {
    name: "Bank Respublika ASC",
    slug: "bank-respublika",
    address: "AZ1000, Bakı şəhəri, Xəqani küçəsi, 21",
    phoneNumber: "(+994 12) 598-08-00",
    email: "info@bankrespublika.az",
    websiteUrl: "https://bankrespublika.az",
    description: "Bank Respublika ASC",
  },
  {
    name: "Bank VTB (Azərbaycan) ASC",
    slug: "bank-vtb",
    address: "AZ1008, Bakı şəhəri, Nəsimi rayonu, Xətai prospekti 38",
    phoneNumber: "(+994 12) 492-00-80",
    email: "info@vtb.az",
    websiteUrl: "https://vtb.az",
    description: "Bank VTB (Azərbaycan) ASC",
  },
  {
    name: "Expressbank ASC",
    slug: "expressbank",
    address: "AZ1130, Bakı şəhəri, Yusif Vəzir Çəmənzəminli küçəsi, 134C",
    phoneNumber: "(+994 12) 561-22-88",
    email: "info@expressbank.az",
    websiteUrl: "https://expressbank.az",
    description: "Expressbank ASC",
  },
  {
    name: "Xalq Bank ASC",
    slug: "xalq-bank",
    address: "AZ1065, Bakı şəhəri, İnşaatçılar prospekti, 22L, 494-cü məhəllə",
    phoneNumber: "(+994 12) 404-43-43",
    email: "mail@xalqbank.az",
    websiteUrl: "https://xalqbank.az",
    description: "Azərbaycan Xalq Bankı",
  },
  {
    name: "Kapital Bank ASC",
    slug: "kapital-bank",
    address: "AZ1014, Bakı şəhəri, Füzuli küçəsi, 71",
    phoneNumber: "(+994 12) 598-12-95",
    email: "office@kapitalbank.az",
    websiteUrl: "https://kapitalbank.az",
    description: "Azərbaycanın ən böyük xüsusi bankı",
  },
  {
    name: "PAŞA Bank ASC",
    slug: "pasa-bank",
    address: "AZ1005, Bakı şəhəri, Yusif Məmmədəliyev küçəsi, 15",
    phoneNumber: "(+994 12) 505-50-00",
    email: "office@pashabank.az",
    websiteUrl: "https://pashabank.az",
    description: "PAŞA Holdinqin maliyyə quruluşu",
  },
  {
    name: "Premium Bank ASC",
    slug: "premium-bank",
    address: "AZ1110, Bakı şəhəri, Həsən Əliyev küçəsi, 131A",
    phoneNumber: "(+994 12) 931",
    email: "info@banksilkway.az",
    websiteUrl: "https://premiumbank.az",
    description: "Premium Bank ASC",
  },
  {
    name: "Rabitəbank ASC",
    slug: "rabitabank",
    address: "AZ1014, Bakı şəhəri, Nəsimi rayonu, Füzuli küçəsi, 71",
    phoneNumber: "(+994 12) 598-44-88",
    email: "rb@rabitabank.com",
    websiteUrl: "https://rabitabank.com",
    description: "Rabitəbank ASC",
  },
  {
    name: "TuranBank ASC",
    slug: "turanbank",
    address: "AZ1073, Bakı şəhəri, İsmayılbəy Qutqaşınlı küçəsi, 85",
    phoneNumber: "(+994 12) 510-79-11",
    email: "office@turanbank.az",
    websiteUrl: "https://turanbank.az",
    description: "TuranBank ASC",
  },
  {
    name: "Unibank KB ASC",
    slug: "unibank",
    address: "AZ1022, Bakı şəhəri, Rəşid Behbudov küçəsi, 57",
    phoneNumber: "(+994 12) 498-22-44",
    email: "bank@unibank.az",
    websiteUrl: "https://unibank.az",
    description: "Universal Kredit Bankı",
  },
  {
    name: "Yapı Kredi Bank Azərbaycan QSC",
    slug: "yapi-kredi-bank",
    address: "AZ1014, Bakı şəhəri, Nəsimi rayonu, Cəlil Məmmədquluzadə küçəsi, 73G",
    phoneNumber: "(+994 12) 497-77-95",
    email: "info@yapikredi.com.az",
    websiteUrl: "https://yapikredi.com.az",
    description: "Yapı Kredi Bank Azərbaycan QSC",
  },
  {
    name: "Yelo Bank ASC",
    slug: "yelo-bank",
    address: "AZ1010, Bakı şəhəri, Puşkin küçəsi, 30",
    phoneNumber: "(+994 12) 981",
    email: "bank@yelo.az",
    websiteUrl: "https://yelo.az",
    description: "Yelo Bank ASC",
  },
  {
    name: "Ziraat Bank Azərbaycan ASC",
    slug: "ziraat-bank",
    address: "AZ1065, Bakı şəhəri, Həsən bəy Zərdabi küçəsi, 191",
    phoneNumber: "(+994 12) 505-56-15",
    email: "info@ziraatbank.az",
    websiteUrl: "https://ziraatbank.az",
    description: "Ziraat Bank Azərbaycan ASC",
  },
];

const DEFAULT_ADMIN_PASSWORD = "Bank@1234";

async function seed() {
  console.log(`Seeding ${azerbaijaniBanks.length} banks...`);
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  for (const bankData of azerbaijaniBanks) {
    // Upsert bank
    await db
      .insert(banks)
      .values(bankData)
      .onConflictDoUpdate({
        target: banks.slug,
        set: {
          name: bankData.name,
          address: bankData.address,
          phoneNumber: bankData.phoneNumber,
          email: bankData.email ?? null,
          websiteUrl: bankData.websiteUrl,
          description: bankData.description,
          updatedAt: new Date(),
        },
      });

    // Get bank id
    const [bank] = await db
      .select({ id: banks.id })
      .from(banks)
      .where(eq(banks.slug, bankData.slug))
      .limit(1);

    if (!bank) continue;

    // Create default admin (skip if already exists)
    const adminEmail = `admin@${bankData.slug}.kreditor.az`;
    await db
      .insert(bankAdmins)
      .values({
        bankId: bank.id,
        name: `${bankData.name} Admin`,
        email: adminEmail,
        passwordHash,
        role: "admin",
      })
      .onConflictDoNothing({ target: bankAdmins.email });

    console.log(`  ✓ ${bankData.name}`);
  }

  console.log("\nDone. Default admin password: Bank@1234 — change after first login.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
