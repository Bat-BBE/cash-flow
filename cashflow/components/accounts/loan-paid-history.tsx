'use client';

import { useMemo } from 'react';
import { buildLoanPaidHistory, getLoanJsonById } from '@/lib/loan-paid-history';
import { formatCurrency } from '@/lib/utils';

type Props = {
  loanId: string;
  currency: string;
};

export function LoanPaidHistory({ loanId, currency }: Props) {
  const rows = useMemo(() => {
    const loan = getLoanJsonById(loanId);
    if (!loan) return [];
    return buildLoanPaidHistory(loan);
  }, [loanId]);

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Түүх</h2>
        <div className="rounded-2xl border border-white/10 bg-brand-card/30 p-6">
          <p className="text-sm text-brand-muted">
            Одоогоор төлөгдсөн төлбөрийн түүх алга (эхлэх огноо эсвэл ирээдүйд байна).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Түүх</h2>

      <div className="rounded-2xl border border-white/10 bg-brand-card/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 sm:px-5">
          <h3 className="text-sm font-bold text-white">Төлбөрийн жагсаалт</h3>
          <p className="text-[11px] text-brand-muted mt-0.5">
            Огноо болон төлсөн дүн (хамгийн сүүлийн эхэнд).
          </p>
        </div>
        <ul className="divide-y divide-white/5 max-h-[min(420px,50vh)] overflow-y-auto custom-scrollbar">
          {rows.map((row, i) => (
            <li
              key={`${row.dateKey}-${i}`}
              className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 hover:bg-white/[0.03]"
            >
              <div>
                <p className="text-sm font-medium text-white">{row.dateLabel}</p>
                <p className="text-[10px] text-brand-muted tabular-nums">{row.dateKey}</p>
              </div>
              <p className="text-sm font-bold text-emerald-400/95 tabular-nums shrink-0">
                {formatCurrency(row.amount, currency)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
