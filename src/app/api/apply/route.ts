import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { loanApplications, applicationBanks } from "@/db/schema";
import { z } from "zod";
import { and, count, gte, eq } from "drizzle-orm";
import { validatePhone, validateFin, normalizePhone } from "@/lib/phone";
import { parseUA } from "@/lib/ua";

// ── Input schema (raw shape — we validate phone/FIN manually) ──────────────
const schema = z.object({
  phoneNumber: z.string().min(1).max(30),
  finCode: z.string().min(1).max(10),
  bankIds: z.array(z.string().uuid()).min(1).max(22),
});

// ── Spam limits ────────────────────────────────────────────────────────────
const LIMITS = {
  perPhonePerDay: 3,   // same phone → max 3 submissions per 24h
  perIpPerHour: 10,    // same IP   → max 10 submissions per hour
};

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

async function countRecentByPhone(phone: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(loanApplications)
    .where(
      and(
        eq(loanApplications.phoneNumber, phone),
        gte(loanApplications.createdAt, since)
      )
    );
  return Number(row.count);
}

async function countRecentByIp(ip: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(loanApplications)
    .where(
      and(
        eq(loanApplications.ipAddress, ip),
        gte(loanApplications.createdAt, since)
      )
    );
  return Number(row.count);
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yanlış sorğu formatı" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Məlumatlar düzgün deyil. Zəhmət olmasa yoxlayın." },
      { status: 400 }
    );
  }

  const { phoneNumber: rawPhone, finCode: rawFin, bankIds } = parsed.data;

  // 2. Validate phone number (Azerbaijan rules)
  const phone9 = validatePhone(rawPhone);
  if (!phone9) {
    return NextResponse.json(
      {
        error:
          "Telefon nömrəsi düzgün deyil. Azərbaycan nömrəsi daxil edin (50, 51, 55, 60, 70, 77, 99, 10 ilə başlayan).",
      },
      { status: 422 }
    );
  }

  // 3. Validate FIN code
  const finCode = validateFin(rawFin);
  if (!finCode) {
    return NextResponse.json(
      { error: "FİN kod düzgün deyil. 7 simvol (hərf və ya rəqəm) daxil edin." },
      { status: 422 }
    );
  }

  // 4. Normalize phone for storage
  const phoneNumber = normalizePhone(rawPhone)!; // safe — validated above

  // 5. Collect request metadata
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? null;
  const referer = req.headers.get("referer") ?? null;
  const language = req.headers.get("accept-language")?.split(",")[0].trim() ?? null;
  const { deviceType, browser, os } = parseUA(userAgent ?? "");

  // 6. Spam check — per-phone daily limit
  const phoneCount = await countRecentByPhone(phoneNumber, hoursAgo(24));
  if (phoneCount >= LIMITS.perPhonePerDay) {
    return NextResponse.json(
      {
        error:
          "Bu nömrədən son 24 saat ərzində çox sayda müraciət göndərilmişdir. Zəhmət olmasa sabah yenidən cəhd edin.",
      },
      { status: 429 }
    );
  }

  // 7. Spam check — per-IP hourly limit
  if (ip !== "unknown") {
    const ipCount = await countRecentByIp(ip, hoursAgo(1));
    if (ipCount >= LIMITS.perIpPerHour) {
      return NextResponse.json(
        {
          error:
            "Çox sayda sorğu göndərildi. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
        },
        { status: 429 }
      );
    }
  }

  // 8. Insert application with full metadata
  const [application] = await db
    .insert(loanApplications)
    .values({
      phoneNumber,
      finCode,
      ipAddress: ip === "unknown" ? null : ip,
      userAgent,
      deviceType,
      browser,
      os,
      referer,
      language,
    })
    .returning({ id: loanApplications.id });

  await db.insert(applicationBanks).values(
    bankIds.map((bankId) => ({ applicationId: application.id, bankId }))
  );

  return NextResponse.json(
    { success: true, applicationId: application.id },
    { status: 201 }
  );
}
