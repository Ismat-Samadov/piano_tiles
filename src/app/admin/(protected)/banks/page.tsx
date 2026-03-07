import Link from "next/link";
import { getAllBanks } from "@/db/queries";
import { toggleBankActiveAction } from "@/lib/actions/banks";

export default async function BanksPage() {
  const allBanks = await getAllBanks();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banklar</h1>
          <p className="mt-1 text-sm text-slate-500">{allBanks.length} bank qeydiyyatda</p>
        </div>
        <Link
          href="/admin/banks/new"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Yeni bank
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Bank</th>
              <th className="px-4 py-3">Ünvan / Əlaqə</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Əlavə tarixi</th>
              <th className="px-4 py-3">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {allBanks.map((bank) => (
              <tr key={bank.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {bank.logoUrl ? (
                      <img src={bank.logoUrl} alt={bank.name} className="h-8 w-8 rounded-lg object-contain" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                        {bank.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900">{bank.name}</div>
                      <div className="text-xs text-slate-400">{bank.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-500 max-w-[240px] space-y-0.5">
                    {bank.address && <div className="truncate">{bank.address}</div>}
                    {bank.email && <div className="text-slate-400">{bank.email}</div>}
                    {bank.phoneNumber && <div className="text-slate-400">{bank.phoneNumber}</div>}
                    {bank.websiteUrl && (
                      <a
                        href={bank.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline truncate block"
                      >
                        {bank.websiteUrl.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <form
                    action={async () => {
                      "use server";
                      await toggleBankActiveAction(bank.id, bank.isActive);
                    }}
                  >
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:opacity-75 ${
                        bank.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {bank.isActive ? "Aktiv" : "Deaktiv"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(bank.createdAt).toLocaleDateString("az-AZ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/banks/${bank.slug}`}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Redaktə
                    </Link>
                    <Link
                      href={`/admin/banks/${bank.slug}/admins`}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Adminlər
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allBanks.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">Bank tapılmadı</p>
        )}
      </div>
    </div>
  );
}
