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
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-[1.15rem] border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/75 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-lg sm:rounded-3xl sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-black tracking-tight text-white sm:text-xl md:text-2xl">{name}</h2>
            <p className="mt-1 text-[13px] text-brand-muted sm:text-sm">{lender}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-brand-muted sm:mt-3 sm:gap-2 sm:text-[11px]">
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
              className="shrink-0 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:px-3 sm:py-2 sm:text-xs"
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
