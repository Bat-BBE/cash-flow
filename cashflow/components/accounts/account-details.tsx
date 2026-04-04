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
      <div className="flex h-full min-h-[40vh] items-center justify-center rounded-[1.15rem] border border-white/[0.06] bg-white/[0.015] px-4 sm:rounded-2xl">
        <div className="flex max-w-[18rem] flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] sm:h-16 sm:w-16">
            <span className="material-symbols-outlined text-2xl text-white/25 sm:text-3xl">account_balance</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/50 sm:text-[13px]">{t('selectAccountToViewDetails')}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-white/28 sm:text-[11px]">Дансны жагсаалаас сонгоно уу</p>
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm sm:rounded-2xl">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}
      >
        <div className="space-y-3 p-3 sm:space-y-6 sm:p-5 md:p-7">

          {/* ── Account header (desktop: бүтэн гарчиг; mobile: sticky header-тай давхцуулахгүй) ── */}
          <div className="relative overflow-hidden rounded-[1rem] border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-black/25 p-3.5 sm:rounded-2xl sm:p-5">
            {/* top accent — банкны карт маягийн зураас */}
            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-[1rem] sm:rounded-t-2xl',
                isLoan ? 'bg-gradient-to-r from-rose-500/80 via-rose-400/50 to-transparent' : 'bg-gradient-to-r from-violet-500/90 via-indigo-400/60 to-cyan-400/40',
              )}
            />
            <div
              className="pointer-events-none absolute -top-8 right-0 h-32 w-48 rounded-full opacity-25 blur-3xl"
              style={{ background: isLoan ? 'radial-gradient(circle, #f43f5e, transparent 70%)' : 'radial-gradient(circle, #6366f1, transparent 70%)' }}
            />

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="hidden min-w-0 lg:block">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[18px] font-black leading-tight tracking-tight text-white sm:text-[20px]">
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

              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end lg:contents">
                <div className="flex min-w-0 items-center gap-2 lg:hidden">
                  {isLoan && (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-rose-500/25 bg-rose-500/[0.1] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-rose-400">
                      зээл
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onAddTransaction}
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-brand-primary/35 bg-brand-primary/[0.12] px-2.5 py-1.5 text-[10px] font-bold text-brand-primary transition-all active:scale-[0.98] hover:bg-brand-primary/[0.18] sm:gap-1 sm:rounded-xl sm:px-3.5 sm:py-2 sm:text-[12px]"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[14px]">add</span>
                  Нэмэх
                </button>
              </div>
            </div>

            {/* Balance + period selector — only for non-loan */}
            {!isLoan && (
              <div className="relative z-10 mt-3 space-y-3 border-t border-white/[0.06] pt-3 sm:mt-5 sm:space-y-4 sm:pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35 sm:text-[9px] lg:text-[10px]">
                      {t('availableBalance')}
                    </p>
                    <p className="mt-0.5 truncate text-[1.4rem] font-black leading-none tracking-tight text-white tabular-nums min-[380px]:text-[1.5rem] sm:mt-1 sm:text-[1.65rem] lg:text-[36px]">
                      {formatCurrency(account.balance, account.currency || 'MNT')}
                    </p>
                    <p className="mt-0.5 text-[9px] text-white/30 sm:mt-1 sm:text-[10px] lg:text-[11px]">{t('updatedJustNow')}</p>
                  </div>

                  <div className="-mx-0.5 flex w-full justify-end sm:mx-0 sm:w-auto sm:shrink-0">
                    <div className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-white/[0.08] bg-black/30 p-0.5 scrollbar-none sm:rounded-xl sm:p-1 [&::-webkit-scrollbar]:hidden">
                      {ACCOUNT_PERIOD_IDS.map(period => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => onPeriodChange(period)}
                          className={cn(
                            'shrink-0 rounded-full px-2 py-1 text-[9px] font-bold transition-all duration-200 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-[10px] lg:text-[12px]',
                            selectedPeriod === period
                              ? 'bg-white/12 text-white shadow-sm'
                              : 'text-white/40 hover:text-white/70',
                          )}
                        >
                          {t(periodTranslationKey(period))}
                        </button>
                      ))}
                    </div>
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
          <div className="overflow-hidden rounded-[1rem] border border-white/[0.07] bg-black/20 p-1.5 sm:rounded-2xl sm:p-2">
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