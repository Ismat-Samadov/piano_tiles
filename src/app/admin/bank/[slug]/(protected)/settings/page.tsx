import { notFound } from "next/navigation";
import { getBankBySlug } from "@/db/queries";
import { BankSettingsForm } from "./BankSettingsForm";

export default async function BankSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bank = await getBankBySlug(slug);
  if (!bank) notFound();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Parametrlər</h1>
        <p className="mt-1 text-sm text-slate-500">Bank məlumatlarını yeniləyin</p>
      </div>

      <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <BankSettingsForm bank={bank} />
      </div>
    </div>
  );
}
