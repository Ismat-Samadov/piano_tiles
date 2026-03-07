import { getAllApplicationsWithBanks } from "@/db/queries";
import { StatusBadge } from "@/components/admin/StatusBadge";

function maskFin(fin: string) {
  return fin.slice(0, 2) + "•••" + fin.slice(-1);
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile")
    return (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Mobile">
        <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
      </svg>
    );
  if (type === "tablet")
    return (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Tablet">
        <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M12 18h.01" />
      </svg>
    );
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Desktop">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export default async function ApplicationsPage() {
  const applications = await getAllApplicationsWithBanks(100);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bütün müraciətlər</h1>
        <p className="mt-1 text-sm text-slate-500">{applications.length} müraciət</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Telefon / FİN</th>
                <th className="px-4 py-3">Cihaz</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Banklar</th>
                <th className="px-4 py-3">Tarix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{app.phoneNumber}</div>
                    <div className="font-mono text-xs text-slate-400">{maskFin(app.finCode)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <DeviceIcon type={app.deviceType} />
                      <div>
                        <div className="text-xs">{app.browser ?? "–"}</div>
                        <div className="text-[10px] text-slate-400">{app.os ?? "–"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {app.ipAddress ?? "–"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {app.banks.map((b, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-xs text-slate-600">{b.bankName}</span>
                          <StatusBadge status={b.status as "gozlemede" | "baxilir" | "tesdiq_edildi" | "red_edildi"} />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(app.createdAt).toLocaleDateString("az-AZ", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">
            Hələ heç bir müraciət yoxdur
          </p>
        )}
      </div>
    </div>
  );
}
