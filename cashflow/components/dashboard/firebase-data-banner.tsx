'use client';

import { useDashboardDataOptional } from '@/contexts/dashboard-data-context';

export function FirebaseDataBanner() {
  const ctx = useDashboardDataOptional();
  if (!ctx?.dataError) return null;

  return (
    <div
      role="alert"
      className="mx-3 mt-2 shrink-0 rounded-xl border border-rose-500/35 bg-rose-500/[0.12] px-3 py-2.5 text-[12px] leading-snug text-rose-100 sm:mx-4 md:mx-8"
    >
      <p className="font-semibold text-rose-50">Firebase: өгөгдөл уншихад алдаа</p>
      <p className="mt-1 break-words text-rose-200/90">{ctx.dataError}</p>
      <button
        type="button"
        onClick={() => void ctx.fetchData()}
        className="mt-2 text-[11px] font-bold text-amber-300/95 underline-offset-2 hover:text-amber-200 hover:underline"
      >
        Дахин ачаалах
      </button>
    </div>
  );
}
