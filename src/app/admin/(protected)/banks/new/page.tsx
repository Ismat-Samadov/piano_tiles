"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createBankAction } from "@/lib/actions/banks";

const INPUT =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export default function NewBankPage() {
  const [state, action, pending] = useActionState(createBankAction, null);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/admin/banks"
          className="mb-2 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Banklara qayıt
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Yeni bank</h1>
      </div>

      <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Bank adı <span className="text-red-500">*</span>
            </label>
            <input name="name" required className={INPUT} placeholder="Kapital Bank" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input name="slug" required className={INPUT} placeholder="kapital-bank" />
            <p className="mt-1 text-xs text-slate-400">
              URL-də istifadə olunur: /admin/bank/<strong>slug</strong>
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Təsvir
            </label>
            <textarea
              name="description"
              rows={3}
              className={INPUT}
              placeholder="Bank haqqında qısa məlumat"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Ünvan</label>
            <input name="address" className={INPUT} placeholder="AZ1000, Bakı şəhəri, ..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">E-poçt</label>
              <input name="email" type="email" className={INPUT} placeholder="info@bank.az" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Telefon</label>
              <input name="phoneNumber" className={INPUT} placeholder="(+994 12) 000-00-00" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Veb sayt</label>
            <input name="websiteUrl" type="url" className={INPUT} placeholder="https://..." />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo URL</label>
            <input name="logoUrl" type="url" className={INPUT} placeholder="https://..." />
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {pending ? "Saxlanılır..." : "Bank əlavə et"}
            </button>
            <Link
              href="/admin/banks"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Ləğv et
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
