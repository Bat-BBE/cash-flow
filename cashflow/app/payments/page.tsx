'use client';

import { useMemo, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { LoanSuggestionsPanel } from '@/components/payments/loan-suggestions-panel';
import { LoanDetailPanel } from '@/components/payments/loan-detail-panel';
import loanFile from '@/loan.json';
import type {
  LoanForSuggestion,
  SuggestionConfig,
  UserProfile,
} from '@/lib/loan-suggestions';
import { paydownFloorTotal } from '@/lib/loan-suggestions';
import {
  formatCurrency,
  formatDate,
  formatDateUTC,
  rollMonthlyStartDateIfPast,
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import { sumPrincipalRepaidThisCalendarMonth } from '@/lib/loan-principal-this-month';

type LoanStatus = 'active' | 'overdue' | 'paid';

interface LoanOverdue {
  rangeId?: number;
  totalAmount: number;
}

interface Loan {
  id: string;
  name: string;
  lender: string;
  principal: number;
  lowestPayAmount?: number;
  interestRate: number;
  interestRange: 'yearly' | 'monthly';
  termMonths: number;
  balance: number;
  monthlyPayment: number;
  startDate: string;
  status: LoanStatus;
  icon: string;
  color?: string;
  overdues?: LoanOverdue[];
}

interface LoansFile {
  currency: string;
  generatedAt?: string;
  userProfile?: UserProfile;
  suggestionConfig?: Partial<SuggestionConfig>;
  loans: Loan[];
}

export default function LoansPage() {
  const { language } = useDashboard();
  const t = useTranslation(language);
  const { currency, loans, userProfile, suggestionConfig } = loanFile as LoansFile;
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const loansForSuggestions: LoanForSuggestion[] = loans.map((l) => ({
    id: l.id,
    name: l.name,
    balance: l.balance,
    monthlyPayment: l.monthlyPayment,
    lowestPayAmount: l.lowestPayAmount,
    interestRate: l.interestRate,
    interestRange: l.interestRange,
    termMonths: l.termMonths,
    status: l.status,
    overdues: l.overdues,
  }));

  const totalBalance = loans.reduce((sum, l) => sum + l.balance, 0);
  const totalMonthlyPayment = loansForSuggestions.reduce(
    (sum, l) => sum + paydownFloorTotal(l),
    0,
  );
  const principalPaidThisMonth = useMemo(
    () => sumPrincipalRepaidThisCalendarMonth(),
    // Recompute if loan snapshot identity changes (dev HMR)
    [loans],
  );

  const prioritizedLoans = useMemo(() => {
    return [...loans].sort((a, b) => {
      if (a.termMonths !== b.termMonths) return a.termMonths - b.termMonths;
      if (a.interestRate !== b.interestRate) return b.interestRate - a.interestRate;
      return b.balance - a.balance;
    });
  }, [loans]);

  const selectedLoan = useMemo(
    () => prioritizedLoans.find((l) => l.id === selectedLoanId) ?? null,
    [prioritizedLoans, selectedLoanId],
  );

  const statusPill = (status: LoanStatus) => {
    const base =
      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border';

      return `${base} bg-yellow-500/10 text-yellow-400 border-yellow-500/20`;
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-brand-bg">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-brand-bg custom-scrollbar flex flex-col">
        <Header />

        <div className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full space-y-8 mt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Нийт зээл</h1>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span className="material-symbols-outlined text-primary">schedule</span>
              {loanFile.generatedAt ? `Шинэчлэгдсэн огноо: ${formatDate(loanFile.generatedAt)}` : '—'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
                  <span className="material-symbols-outlined text-[22px]">account_balance</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-400">Нийт үлдэгдэл</p>
                  <p className="text-2xl font-bold tracking-tight text-white tabular-nums md:text-[1.65rem]">
                    {formatCurrency(totalBalance, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/25">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-400">Сарын суурь төлөлт</p>
                  <p className="text-2xl font-bold tracking-tight text-emerald-400 tabular-nums md:text-[1.65rem]">
                    {formatCurrency(totalMonthlyPayment, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-300 ring-1 ring-sky-400/20">
                  <span className="material-symbols-outlined text-[22px]">savings</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-400">Одоогоор төлж байгаа</p>
                  <p className="text-2xl font-bold tracking-tight text-sky-200 tabular-nums md:text-[1.65rem]">
                    {formatCurrency(principalPaidThisMonth, currency)}
                  </p>
                  <p className="pt-1 text-xs text-slate-500 leading-snug">
                    {t('paymentsPrincipalThisMonthHint')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <LoanSuggestionsPanel
            loans={loansForSuggestions}
            currency={currency}
            userProfile={userProfile}
            suggestionConfig={suggestionConfig}
            referenceDateISO={loanFile.generatedAt}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <section className="bg-brand-card/60 rounded-3xl border border-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_tree</span>
                  Зээлүүд
                </h2>
                <span className="text-xs text-slate-500">{loans.length}</span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[min(520px,70vh)] pr-1">
                {loans.length === 0 ? (
                  <p className="text-slate-400 text-sm">{t('noLoansFound')}</p>
                ) : (
                  prioritizedLoans.map((l) => {
                    const isSelected = selectedLoanId === l.id;
                    return (
                      <button
                        type="button"
                        key={l.id}
                        onClick={() => setSelectedLoanId(l.id)}
                        className={cn(
                          'w-full text-left flex items-start justify-between gap-4 bg-brand-card/50 rounded-2xl border p-4 transition-colors',
                          isSelected
                            ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/30'
                            : 'border-white/5 hover:bg-white/5',
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0"
                            style={l.color ? { color: l.color } : undefined}
                          >
                            <span className="material-symbols-outlined text-sm">{l.icon}</span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{l.name}</p>
                            <p className="text-[11px] text-slate-500 truncate mt-1">
                              {l.lender} • Үлдэгдэл: {formatCurrency(l.balance, currency)} • Хүү:{' '}
                              {l.interestRate.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={statusPill(l.status)}>
                            {formatDateUTC(
                              rollMonthlyStartDateIfPast(
                                l.startDate,
                                loanFile.generatedAt ?? '2000-01-01',
                              ),
                            )}
                          </div>
                          <p className="mt-2 text-sm font-black text-emerald-400 tabular-nums">
                            {formatCurrency(l.monthlyPayment, currency)}/сар
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            <section className="min-w-0">
              {selectedLoan ? (
                <LoanDetailPanel
                  loanId={selectedLoan.id}
                  currency={currency}
                  name={selectedLoan.name}
                  lender={selectedLoan.lender}
                  status={selectedLoan.status}
                  monthlyPayment={selectedLoan.monthlyPayment}
                  balance={selectedLoan.balance}
                  interestRate={selectedLoan.interestRate}
                  onClose={() => setSelectedLoanId(null)}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-brand-card/30 p-8 md:p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">
                    touch_app
                  </span>
                  <p className="text-slate-400 text-sm font-medium">
                    Зээл сонгоно уу — хүү vs зээл график, төлбөрийн түүх харагдана.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
