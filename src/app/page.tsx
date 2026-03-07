"use client";

import { useState } from "react";
import InstallPWA from "@/components/InstallPWA";
import { validatePhone, validateFin, formatPhone } from "@/lib/phone";

type Step = "form" | "banks" | "success";
type Bank = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

const BANK_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-cyan-500",
];

function getBankInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("form");
  const [phone, setPhone] = useState("");
  const [finCode, setFinCode] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const selectedBankNames = banks
    .filter((b) => selectedBanks.includes(b.id))
    .map((b) => b.name);

  const handleFormNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      return setError(
        "Telefon nömrəsi düzgün deyil. 50, 51, 55, 60, 70, 77, 99 və ya 10 ilə başlayan 9 rəqəmli nömrə daxil edin."
      );
    }
    if (!validateFin(finCode)) {
      return setError("FİN kod düzgün deyil. 7 simvol (hərf və rəqəm) daxil edin.");
    }
    setError(null);
    setBanksLoading(true);
    try {
      const res = await fetch("/api/banks");
      if (!res.ok) throw new Error();
      setBanks(await res.json());
      setStep("banks");
    } catch {
      setError("Banklar yüklənərkən xəta baş verdi");
    } finally {
      setBanksLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedBanks.length === 0) return setError("Ən azı bir bank seçin");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          finCode: finCode.toUpperCase(),
          bankIds: selectedBanks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      setApplicationId(data.applicationId);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const toggleBank = (id: string) =>
    setSelectedBanks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );

  const resetForm = () => {
    setStep("form");
    setPhone("");
    setFinCode("");
    setSelectedBanks([]);
    setApplicationId(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-[15px] font-semibold text-slate-900">
              Kreditor.az
            </span>
          </div>
          <InstallPWA />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10">
        {/* Hero — only on step 1 */}
        {step === "form" && (
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Azərbaycanın kredit platforması
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Bütün banklara{" "}
              <span className="text-blue-600">bir müraciət</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base text-slate-500">
              Hər bankın saytına ayrıca girməyin. Bir dəfə doldurun —
              seçdiyiniz banklara eyni anda göndərilsin.
            </p>
            <div className="mt-8 flex justify-center gap-10">
              {[
                { value: "8+", label: "Bank" },
                { value: "3", label: "Dəqiqə" },
                { value: "0₼", label: "Xərc" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step indicator */}
        {step !== "success" && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {(["form", "banks"] as const).map((s, i) => {
              const labels = ["Məlumatlar", "Bank seçimi"];
              const isActive = step === s;
              const isDone = step === "banks" && s === "form";
              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`h-px w-8 ${isDone || step === "banks" ? "bg-blue-400" : "bg-slate-200"}`}
                    />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                        isDone
                          ? "bg-blue-600 text-white"
                          : isActive
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isDone ? (
                        <svg
                          width="10"
                          height="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-xs ${isActive ? "font-medium text-slate-800" : isDone ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {labels[i]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Card */}
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
            {/* ── STEP 1: Contact Info ── */}
            {step === "form" && (
              <form onSubmit={handleFormNext} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Əlaqə məlumatları
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Şəxsi məlumatlarınızı daxil edin
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Mobil nömrə
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 select-none">
                      +994
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setError(null);
                        setPhone(e.target.value.replace(/[^\d\s-]/g, ""));
                      }}
                      placeholder="50 000 00 00"
                      className="flex-1 bg-white px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-300"
                      required
                    />
                  </div>
                  {/* Live hint */}
                  {phone.replace(/\D/g, "").length > 0 && (
                    <p className={`mt-1 text-xs ${validatePhone(phone) ? "text-emerald-600" : "text-slate-400"}`}>
                      {validatePhone(phone)
                        ? `✓ ${formatPhone(validatePhone(phone)!)}`
                        : "50, 51, 55, 60, 70, 77, 99 və ya 10 ilə başlayan 9 rəqəm"}
                    </p>
                  )}
                </div>

                {/* FIN */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    FİN kod
                  </label>
                  <input
                    type="text"
                    value={finCode}
                    onChange={(e) => {
                      setError(null);
                      setFinCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7)
                      );
                    }}
                    placeholder="XXXXXXX"
                    maxLength={7}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm uppercase tracking-[0.2em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Şəxsiyyət vəsiqəsinin FİN (PIN) kodu — 7 simvol
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={banksLoading}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
                >
                  {banksLoading ? (
                    <>
                      <Spinner /> Yüklənir...
                    </>
                  ) : (
                    <>
                      Bankları göstər
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 2: Bank Selection ── */}
            {step === "banks" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Bank seçin
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {selectedBanks.length === 0
                        ? "Müraciət etmək istədiyiniz bankları seçin"
                        : `${selectedBanks.length} bank seçildi`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setStep("form");
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Geri
                  </button>
                </div>

                {banks.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    Bank tapılmadı
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {banks.map((bank, i) => {
                      const isSelected = selectedBanks.includes(bank.id);
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => {
                            toggleBank(bank.id);
                            setError(null);
                          }}
                          className={`relative flex flex-col items-center gap-2.5 rounded-xl border-2 px-3 py-4 text-center transition-all duration-150 ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                              <svg
                                width="9"
                                height="9"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          {bank.logoUrl ? (
                            <img
                              src={bank.logoUrl}
                              alt={bank.name}
                              className="h-10 w-10 rounded-lg object-contain"
                            />
                          ) : (
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white ${
                                BANK_COLORS[i % BANK_COLORS.length]
                              }`}
                            >
                              {getBankInitials(bank.name)}
                            </div>
                          )}
                          <span className="text-xs font-medium leading-tight text-slate-700">
                            {bank.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedBanks.length === 0}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Spinner /> Göndərilir...
                    </>
                  ) : selectedBanks.length === 0 ? (
                    "Bank seçin"
                  ) : (
                    `${selectedBanks.length} banka müraciət et`
                  )}
                </button>
              </div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-5 py-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    width="30"
                    height="30"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Müraciət göndərildi!
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Müraciətiniz{" "}
                    <span className="font-medium text-slate-700">
                      {selectedBankNames.join(", ")}
                    </span>{" "}
                    banklarına göndərildi. Nümayəndələr sizinlə əlaqə
                    saxlayacaq.
                  </p>
                </div>

                {applicationId && (
                  <div className="w-full rounded-xl bg-slate-50 px-4 py-3 text-left">
                    <p className="text-xs text-slate-400">Müraciət nömrəsi</p>
                    <p className="mt-0.5 break-all font-mono text-xs font-medium text-slate-600">
                      {applicationId}
                    </p>
                  </div>
                )}

                <div className="w-full rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-left">
                  <p className="text-xs font-medium text-amber-700">
                    Növbəti addım
                  </p>
                  <p className="mt-0.5 text-xs text-amber-600">
                    Bank nümayəndəsi sizi qeyd etdiyiniz nömrəyə zəng edəcək.
                    Zəngi cavablandırın.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Yeni müraciət
                </button>
              </div>
            )}
          </div>

          {step !== "success" && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Məlumatlarınız şifrələnərək qorunur. FİN kodunuz banklara
              birbaşa göndərilmir.
            </p>
          )}
        </div>

        {/* Features — only step 1 */}
        {step === "form" && (
          <div className="mx-auto mt-16 max-w-3xl">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Niyə Kreditor.az?
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: (
                    <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "Sürətli proses",
                  desc: "3 dəqiqə ərzində bütün banklara müraciət göndərin",
                },
                {
                  icon: (
                    <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  ),
                  title: "Təhlükəsiz",
                  desc: "Məlumatlarınız şifrələnərək qorunur",
                },
                {
                  icon: (
                    <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  ),
                  title: "Daha çox bank",
                  desc: "Ən əlverişli kredit şərtlərini müqayisə edin",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl bg-white p-5 ring-1 ring-slate-100"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    {f.icon}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {f.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <span className="text-xs font-bold text-white">K</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Kreditor.az
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            © {new Date().getFullYear()} Kreditor.az. Bütün hüquqlar qorunur.
          </p>
        </div>
      </footer>
    </div>
  );
}
