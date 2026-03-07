"use client";

import { useActionState } from "react";
import { updateBankSettingsAction } from "@/lib/actions/banks";
import type { Bank } from "@/db/schema";

const INPUT =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function BankSettingsForm({ bank }: { bank: Bank }) {
  const [state, action, pending] = useActionState(updateBankSettingsAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Bank adı</label>
        <input
          value={bank.name}
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
          placeholder="Bank haqqında qısa məlumat"
          className={INPUT}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Ünvan</label>
        <input
          name="address"
          defaultValue={bank.address ?? ""}
          placeholder="AZ1000, Bakı şəhəri, ..."
          className={INPUT}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">E-poçt</label>
          <input
            name="email"
            type="email"
            defaultValue={bank.email ?? ""}
            placeholder="info@bank.az"
            className={INPUT}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Telefon</label>
          <input
            name="phoneNumber"
            defaultValue={bank.phoneNumber ?? ""}
            placeholder="(+994 12) 000-00-00"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Veb sayt</label>
        <input
          name="websiteUrl"
          type="url"
          defaultValue={bank.websiteUrl ?? ""}
          placeholder="https://..."
          className={INPUT}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo URL</label>
        <input
          name="logoUrl"
          type="url"
          defaultValue={bank.logoUrl ?? ""}
          placeholder="https://..."
          className={INPUT}
        />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Saxlanılır..." : "Yadda saxla"}
      </button>
    </form>
  );
}
