'use client';

import { useMemo } from 'react';
import { Account, Transaction } from './types';
import { cn, formatCurrency } from '@/lib/utils';
import { AccountActivity } from './account-activity';
import { LoanPaidHistory } from './loan-paid-history';
import { LoanPmtChart } from './loan-pmt-chart';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation, type TranslationKey } from '@/lib/translations';
import { ACCOUNT_PERIOD_IDS, isTransactionInAccountPeriod } from '@/lib/account-period';
import { DEFAULT_ACCOUNT_ID } from '@/lib/firebase';

function periodTranslationKey(period: string): TranslationKey {
  switch (period) {
    case '1W': return 'periodRange1W';
    case '1M': return 'periodRange1M';
    case '3M': return 'periodRange3M';
    case '1Y': return 'periodRange1Y';
    default:   return 'periodRange1M';
  }
}

interface AccountDetailsProps {
  account: Account | null;
  transactions: Transaction[];
  transactionsLoading?: boolean;
  onTransfer: () => void;
  onAddTransaction: () => void;
  onPeriodChange: (period: string) => void;
  selectedPeriod?: string;
}

export function AccountDetails({
  account,
  transactions,
  transactionsLoading = false,
  onTransfer,
  onAddTransaction,
  onPeriodChange,
  selectedPeriod = '1M',
}: AccountDetailsProps) {
  const { language } = useDashboard();
  const t = useTranslation(language);

  /* ── Empty state ── */
  if (!account) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <span className="material-symbols-outlined text-3xl text-white/25">account_balance</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white/45">{t('selectAccountToViewDetails')}</p>
            <p className="mt-0.5 text-[11px] text-white/25">Зүүн талаас данс сонгоно уу</p>
          </div>
        </div>
      </div>
    );
  }

  const isLoan = account.type === 'LOAN';

  const { periodIncomeTotal, periodExpenseTotal } = useMemo(() => {
    const forAccount = transactions.filter(
      tx => (tx.accountId ?? DEFAULT_ACCOUNT_ID) === account.id,
    );
    const inPeriod = forAccount.filter(tx =>
      isTransactionInAccountPeriod(tx.date, selectedPeriod),
    );
    const income = inPeriod
      .filter(tx => tx.type === 'income')
      .reduce((s, tx) => s + tx.amount, 0);
    const expense = inPeriod
      .filter(tx => tx.type === 'expense')
      .reduce((s, tx) => s + tx.amount, 0);
    return { periodIncomeTotal: income, periodExpenseTotal: expense };
  }, [transactions, account.id, selectedPeriod]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm">
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}
      >
        <div className="space-y-6 p-5 md:p-7">

          {/* ── Account header ── */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-black/20 p-5">
            {/* ambient glow */}
            <div
              className="pointer-events-none absolute -top-8 right-0 h-32 w-48 rounded-full opacity-20 blur-3xl"
              style={{ background: isLoan ? 'radial-gradient(circle, #f43f5e, transparent 70%)' : 'radial-gradient(circle, #6366f1, transparent 70%)' }}
            />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* name + institution */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[20px] font-black leading-none tracking-tight text-white">
                    {account.name}
                  </h1>
                  {isLoan && (
                    <span className="inline-flex items-center rounded-full border border-rose-500/25 bg-rose-500/[0.1] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-rose-400">
                      зээл
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] text-white/45">
                  {account.institution || t('financialInstitution')}
                  {account.accountNumber && (
                    <> · <span className="text-white/60">•••• {account.accountNumber}</span></>
                  )}
                </p>
              </div>

              {/* action buttons */}
              <div className="flex shrink-0 gap-2">
                {/* <button
                  type="button"
                  onClick={onTransfer}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[12px] font-bold text-white/55 transition-all hover:border-white/15 hover:text-white/80"
                >
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                  Шилжүүлэх
                </button> */}
                <button
                  type="button"
                  onClick={onAddTransaction}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-primary/30 bg-brand-primary/[0.1] px-3.5 py-2 text-[12px] font-bold text-brand-primary transition-all hover:bg-brand-primary/[0.16] hover:border-brand-primary/50"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Нэмэх
                </button>
              </div>
            </div>

            {/* Balance + period selector — only for non-loan */}
            {!isLoan && (
              <div className="relative z-10 mt-5 space-y-4 border-t border-white/[0.05] pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                      {t('availableBalance')}
                    </p>
                    <p className="mt-1.5 text-[36px] font-black leading-none tracking-tight text-white">
                      {formatCurrency(account.balance, account.currency || 'MNT')}
                    </p>
                    <p className="mt-1 text-[11px] text-white/30">{t('updatedJustNow')}</p>
                  </div>

                  <div className="flex gap-0.5 rounded-xl border border-white/[0.07] bg-black/25 p-1">
                    {ACCOUNT_PERIOD_IDS.map(period => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => onPeriodChange(period)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all duration-200',
                          selectedPeriod === period
                            ? 'bg-white/10 text-white'
                            : 'text-white/40 hover:text-white/65',
                        )}
                      >
                        {t(periodTranslationKey(period))}
                      </button>
                    ))}
                  </div>
                </div>

                {/* <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.09] px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400/95">
                      <span className="material-symbols-outlined text-[17px]">trending_up</span>
                      {t('periodSummaryIncome')}
                    </span>
                    <span className="text-[15px] font-black tabular-nums text-emerald-300">
                      +{formatCurrency(periodIncomeTotal, account.currency || 'MNT')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.09] px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-400/95">
                      <span className="material-symbols-outlined text-[17px]">trending_down</span>
                      {t('periodSummaryExpense')}
                    </span>
                    <span className="text-[15px] font-black tabular-nums text-rose-300">
                      −{formatCurrency(periodExpenseTotal, account.currency || 'MNT')}
                    </span>
                  </div>
                </div> */}
              </div>
            )}
          </div>

          {/* ── Loan chart ── */}
          {isLoan && (
            <LoanPmtChart loanId={account.id} currency={account.currency || 'MNT'} />
          )}

          {/* ── Activity / history ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-black/15 overflow-hidden p-2">
            {isLoan ? (
              <LoanPaidHistory loanId={account.id} currency={account.currency || 'MNT'} />
            ) : (
              <AccountActivity
                accountId={account.id}
                transactions={transactions}
                loading={transactionsLoading}
                currency={account.currency || 'MNT'}
                selectedPeriod={selectedPeriod}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}