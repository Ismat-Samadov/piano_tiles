"use client";

import { useState } from "react";

const STATUSES = [
  { value: "gozlemede", label: "Gözlənilir" },
  { value: "baxilir", label: "Baxılır" },
  { value: "tesdiq_edildi", label: "Təsdiq edildi" },
  { value: "red_edildi", label: "Rədd edildi" },
];

const INPUT =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function ExportTab({ slug }: { slug: string }) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleStatus(value: string) {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleExport() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ slug });
      if (selectedStatuses.length > 0) {
        params.set("status", selectedStatuses.join(","));
      } else {
        params.set("status", "all");
      }
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/export?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Xəta baş verdi");
        return;
      }

      // Trigger download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? `${slug}-export.xlsx`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Status filtri
          <span className="ml-1.5 text-xs font-normal text-slate-400">
            (seçilməzsə bütün statuslar daxil edilir)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const active = selectedStatuses.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleStatus(s.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {active && <span className="mr-1">✓</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Başlanğıc tarixi</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Son tarix</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="font-medium">İxrac olunacaq:</span>{" "}
        {selectedStatuses.length === 0
          ? "Bütün statuslar"
          : selectedStatuses
              .map((s) => STATUSES.find((st) => st.value === s)?.label)
              .join(", ")}
        {dateFrom && ` · ${dateFrom}-dən`}
        {dateTo && ` ${dateTo}-ə qədər`}
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Hazırlanır...
          </>
        ) : (
          <>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            XLSX olaraq yüklə
          </>
        )}
      </button>
    </div>
  );
}
