"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateBankAction } from "@/lib/actions/banks";
import type { Bank } from "@/db/schema";

const INPUT =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function EditBankForm({ bank }: { bank: Bank }) {
  const boundAction = updateBankAction.bind(null, bank.slug);
  const [state, action, pending] = useActionState(boundAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Bank adı <span className="text-red-500">*</span>
        </label>
        <input name="name" required defaultValue={bank.name} className={INPUT} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug</label>
        <input
          value={bank.slug}
          readOnly
          className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm text-slate-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Təsvir</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={bank.description ?? ""}
          className={INPUT}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Ünvan</label>
        <input name="address" defaultValue={bank.address ?? ""} className={INPUT} placeholder="AZ1000, Bakı şəhəri, ..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">E-poçt</label>
          <input name="email" type="email" defaultValue={bank.email ?? ""} className={INPUT} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Telefon</label>
          <input name="phoneNumber" defaultValue={bank.phoneNumber ?? ""} className={INPUT} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Veb sayt</label>
        <input name="websiteUrl" type="url" defaultValue={bank.websiteUrl ?? ""} className={INPUT} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo URL</label>
        <input name="logoUrl" type="url" defaultValue={bank.logoUrl ?? ""} className={INPUT} />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Status</span>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="radio" name="isActive" value="true" defaultChecked={bank.isActive} />
            Aktiv
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="radio" name="isActive" value="false" defaultChecked={!bank.isActive} />
            Deaktiv
          </label>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Saxlanılır..." : "Yadda saxla"}
        </button>
        <Link
          href="/admin/banks"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Geri
        </Link>
      </div>
    </form>
  );
}
