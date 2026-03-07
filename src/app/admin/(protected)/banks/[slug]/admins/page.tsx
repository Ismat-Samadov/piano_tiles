import Link from "next/link";
import { notFound } from "next/navigation";
import { getBankBySlug, getBankAdmins } from "@/db/queries";
import { CreateAdminForm } from "./CreateAdminForm";
import { DeleteAdminButton } from "./DeleteAdminButton";
import { ExportTab } from "./ExportTab";

export default async function BankAdminsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams]);
  const activeTab = tab === "export" ? "export" : "admins";

  const bank = await getBankBySlug(slug);
  if (!bank) notFound();

  const admins = activeTab === "admins" ? await getBankAdmins(bank.id) : [];

  const tabClass = (t: string) =>
    `px-4 py-2.5 text-sm font-medium border-b-2 transition ${
      activeTab === t
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href={`/admin/banks/${slug}`}
          className="mb-2 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {bank.name}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{bank.name}</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-200">
        <Link href={`/admin/banks/${slug}/admins`} className={tabClass("admins")}>
          Admin hesabları
        </Link>
        <Link href={`/admin/banks/${slug}/admins?tab=export`} className={tabClass("export")}>
          Məlumat ixracı
        </Link>
      </div>

      {activeTab === "admins" && (
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Admins list */}
          <div className="flex-1 rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Mövcud adminlər ({admins.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {admins.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-400">
                  Hələ admin əlavə edilməyib
                </p>
              )}
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{admin.name}</div>
                    <div className="text-xs text-slate-400">{admin.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        admin.role === "admin"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {admin.role === "admin" ? "Admin" : "Baxıcı"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        admin.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {admin.isActive ? "Aktiv" : "Deaktiv"}
                    </span>
                    <DeleteAdminButton adminId={admin.id} slug={slug} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create admin form + login URL */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Yeni admin yarat</h2>
              <CreateAdminForm bankId={bank.id} />
            </div>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700">Bank admin giriş URL</p>
              <code className="mt-1 block break-all text-xs text-blue-600">
                /admin/bank/{slug}/login
              </code>
            </div>
          </div>
        </div>
      )}

      {activeTab === "export" && (
        <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-900">XLSX ixracı</h2>
            <p className="mt-1 text-xs text-slate-500">
              Müraciətləri filtrləyib Excel formatında yükləyin
            </p>
          </div>
          <ExportTab slug={slug} />
        </div>
      )}
    </div>
  );
}
