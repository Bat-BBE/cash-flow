'use client';

import { LoanPmtChart } from '@/components/accounts/loan-pmt-chart';
import { LoanPaidHistory } from '@/components/accounts/loan-paid-history';
import { formatCurrency } from '@/lib/utils';

type LoanStatus = 'active' | 'overdue' | 'paid';

type Props = {
  loanId: string;
  currency: string;
  name: string;
  lender: string;
  status: LoanStatus;
  monthlyPayment: number;
  balance: number;
  interestRate: number;
  onClose?: () => void;
};

function statusPill(status: LoanStatus) {
  const base =
    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border';
  switch (status) {
    case 'active':
      return `${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`;
    case 'overdue':
      return `${base} bg-yellow-500/10 text-yellow-400 border-yellow-500/20`;
    case 'paid':
      return `${base} bg-blue-500/10 text-blue-400 border-blue-500/20`;
    default:
      return `${base} bg-white/5 text-brand-muted border-white/10`;
  }
}

export function LoanDetailPanel({
  loanId,
  currency,
  name,
  lender,
  status,
  monthlyPayment,
  balance,
  interestRate,
  onClose,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-brand-card/50 p-5 md:p-6 shadow-xl backdrop-blur-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{name}</h2>
            <p className="text-sm text-slate-400 mt-1">{lender}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className={statusPill(status)}>{status}</span>
              <span>·</span>
              <span className="tabular-nums">PMT {formatCurrency(monthlyPayment, currency)}/сар</span>
              <span>·</span>
              <span>Хүү {interestRate.toFixed(2)}%</span>
              <span>·</span>
              <span className="tabular-nums">Үлдэгдэл {formatCurrency(balance, currency)}</span>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Хаах
            </button>
          )}
        </div>
      </div>

      <LoanPmtChart loanId={loanId} currency={currency} />
      <LoanPaidHistory loanId={loanId} currency={currency} />
    </div>
  );
}
