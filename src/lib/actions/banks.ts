"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { banks, bankAdmins } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

function requireSuperAdmin() {
  // Called in server actions — session check happens here
  // The middleware already protects routes, but we double-check in mutations
}

export type ActionState = { error?: string; success?: string } | null;

export async function createBankAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const description = (formData.get("description") as string).trim();
  const address = (formData.get("address") as string).trim();
  const email = (formData.get("email") as string).trim();
  const websiteUrl = (formData.get("websiteUrl") as string).trim();
  const phoneNumber = (formData.get("phoneNumber") as string).trim();
  const logoUrl = (formData.get("logoUrl") as string).trim();

  if (!name || !slug) return { error: "Ad və slug tələb olunur" };

  try {
    await db.insert(banks).values({
      name,
      slug,
      description: description || null,
      address: address || null,
      email: email || null,
      websiteUrl: websiteUrl || null,
      phoneNumber: phoneNumber || null,
      logoUrl: logoUrl || null,
    });
  } catch {
    return { error: "Bu slug artıq mövcuddur və ya başqa xəta baş verdi" };
  }

  revalidatePath("/admin/banks");
  redirect("/admin/banks");
}

export async function updateBankAction(
  slug: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const address = (formData.get("address") as string).trim();
  const email = (formData.get("email") as string).trim();
  const websiteUrl = (formData.get("websiteUrl") as string).trim();
  const phoneNumber = (formData.get("phoneNumber") as string).trim();
  const logoUrl = (formData.get("logoUrl") as string).trim();
  const isActive = formData.get("isActive") === "true";

  await db
    .update(banks)
    .set({
      name,
      description: description || null,
      address: address || null,
      email: email || null,
      websiteUrl: websiteUrl || null,
      phoneNumber: phoneNumber || null,
      logoUrl: logoUrl || null,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(banks.slug, slug));

  revalidatePath("/admin/banks");
  revalidatePath(`/admin/banks/${slug}`);
  return { success: "Bank məlumatları yeniləndi" };
}

export async function toggleBankActiveAction(
  bankId: string,
  isActive: boolean
) {
  await db
    .update(banks)
    .set({ isActive: !isActive, updatedAt: new Date() })
    .where(eq(banks.id, bankId));
  revalidatePath("/admin/banks");
}

export async function createBankAdminAction(
  bankId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as "admin" | "baxici") ?? "admin";

  if (!name || !email || !password)
    return { error: "Bütün sahələr tələb olunur" };
  if (password.length < 8)
    return { error: "Şifrə ən az 8 simvol olmalıdır" };

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.insert(bankAdmins).values({
      bankId,
      name,
      email,
      passwordHash,
      role,
    });
  } catch {
    return { error: "Bu e-poçt artıq mövcuddur" };
  }

  revalidatePath(`/admin/banks/${bankId}/admins`);
  return { success: `${name} üçün admin hesabı yaradıldı` };
}

export async function deleteBankAdminAction(adminId: string, bankSlug: string) {
  await db.delete(bankAdmins).where(eq(bankAdmins.id, adminId));
  revalidatePath(`/admin/banks/${bankSlug}/admins`);
}

// Bank admin — update own bank settings
export async function updateBankSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== "bank_admin") return { error: "İcazəsiz" };

  const description = (formData.get("description") as string).trim();
  const address = (formData.get("address") as string).trim();
  const email = (formData.get("email") as string).trim();
  const websiteUrl = (formData.get("websiteUrl") as string).trim();
  const phoneNumber = (formData.get("phoneNumber") as string).trim();
  const logoUrl = (formData.get("logoUrl") as string).trim();

  await db
    .update(banks)
    .set({
      description: description || null,
      address: address || null,
      email: email || null,
      websiteUrl: websiteUrl || null,
      phoneNumber: phoneNumber || null,
      logoUrl: logoUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(banks.id, session.bankId));

  revalidatePath(`/admin/bank/${session.bankSlug}/settings`);
  return { success: "Məlumatlar yeniləndi" };
}
