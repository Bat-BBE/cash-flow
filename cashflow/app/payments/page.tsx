'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
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
import { LoanPaydownStyleCard } from '@/components/payments/loan-paydown-style-card';
import { NewLoanFeasibilityCard } from '@/components/payments/new-loan-feasibility-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

type LoanSortKey = 'smart' | 'rate' | 'balance' | 'payment';

const LOAN_SORT_OPTIONS: { id: LoanSortKey; label: string }[] = [
  { id: 'smart', label: 'Урсгал' },
  { id: 'rate', label: 'Хүү өндөр' },
  { id: 'balance', label: 'Үлдэгдэл их' },
  { id: 'payment', label: 'Төлбөр их' },
];

function PaymentsSectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-1 flex flex-col gap-0.5 sm:mb-2">
      <div className="flex items-start gap-2.5 sm:items-center sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 sm:h-10 sm:w-10">
          <span className="material-symbols-outlined text-[20px] text-brand-primary sm:text-[22px]">{icon}</span>
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-[0.9375rem] font-black leading-snug tracking-tight text-white sm:text-lg">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[9px] leading-snug text-brand-muted sm:text-[11px]">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function LoansPage() {
  const { language } = useDashboard();
  const t = useTranslation(language);
  const { currency, loans, userProfile, suggestionConfig } = loanFile as LoansFile;
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [loanSort, setLoanSort] = useState<LoanSortKey>('smart');

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
    const copy = [...loans];
    switch (loanSort) {
      case 'rate':
        return copy.sort((a, b) => b.interestRate - a.interestRate);
      case 'balance':
        return copy.sort((a, b) => b.balance - a.balance);
      case 'payment':
        return copy.sort((a, b) => b.monthlyPayment - a.monthlyPayment);
      default:
        return copy.sort((a, b) => {
          if (a.termMonths !== b.termMonths) return a.termMonths - b.termMonths;
          if (a.interestRate !== b.interestRate) return b.interestRate - a.interestRate;
          return b.balance - a.balance;
        });
    }
  }, [loans, loanSort]);

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
    <DashboardShell className="bg-brand-bg" mainClassName="bg-brand-bg">
      <div className="mx-auto w-full max-w-[1400px] flex-1 space-y-3 px-3 pb-3 pt-1 sm:space-y-4 sm:px-4 sm:pb-4 sm:pt-2 md:space-y-5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 text-[1.125rem] font-black leading-tight tracking-tight text-white sm:text-2xl md:text-3xl">
              Нийт зээл
            </h1>
            <div className="flex shrink-0 items-center gap-1 text-[9px] text-brand-muted sm:gap-1.5 sm:text-xs">
              <span className="material-symbols-outlined text-[14px] text-brand-primary sm:text-[16px]">schedule</span>
              <span className="max-w-[11rem] text-right leading-snug sm:max-w-none">
                {loanFile.generatedAt ? `Шинэчлэгдсэн: ${formatDate(loanFile.generatedAt)}` : '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
            <div className="relative min-w-0 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/80 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:p-4 md:p-5">
              <div className="flex items-start gap-1.5 sm:gap-3 md:gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary ring-1 ring-white/10 sm:h-10 sm:w-10 sm:rounded-xl md:h-11 md:w-11 md:rounded-2xl">
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px] md:text-[22px]">account_balance</span>
                </div>
                <div className="min-w-0 flex-1 space-y-0">
                  <p className="text-[8px] font-medium leading-tight text-brand-muted sm:text-[11px] md:text-sm">
                    <span className="sm:hidden">Үлдэгдэл</span>
                    <span className="hidden sm:inline">Нийт үлдэгдэл</span>
                  </p>
                  <p className="truncate text-[11px] font-bold tracking-tight text-white tabular-nums sm:text-base md:text-lg lg:text-[1.65rem]">
                    {formatCurrency(totalBalance, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-w-0 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/80 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:p-4 md:p-5">
              <div className="flex items-start gap-1.5 sm:gap-3 md:gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-400 ring-1 ring-white/10 sm:h-10 sm:w-10 sm:rounded-xl md:h-11 md:w-11 md:rounded-2xl">
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px] md:text-[22px]">payments</span>
                </div>
                <div className="min-w-0 flex-1 space-y-0">
                  <p className="text-[8px] font-medium leading-tight text-brand-muted sm:text-[11px] md:text-sm">
                    <span className="sm:hidden">Сарын төлөх</span>
                    <span className="hidden sm:inline">Сарын суурь төлөлт</span>
                  </p>
                  <p className="truncate text-[11px] font-bold tracking-tight text-emerald-400 tabular-nums sm:text-base md:text-lg lg:text-[1.65rem]">
                    {formatCurrency(totalMonthlyPayment, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-w-0 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/80 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:p-4 md:p-5">
              <div className="flex items-start gap-1.5 sm:gap-3 md:gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/12 text-sky-300 ring-1 ring-white/10 sm:h-10 sm:w-10 sm:rounded-xl md:h-11 md:w-11 md:rounded-2xl">
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px] md:text-[22px]">savings</span>
                </div>
                <div className="min-w-0 flex-1 space-y-0">
                  <p className="text-[8px] font-medium leading-tight text-brand-muted sm:text-[11px] md:text-sm">
                    <span className="sm:hidden">Төлсөн үндсэн</span>
                    <span className="hidden sm:inline">Одоогоор төлж байгаа</span>
                  </p>
                  <p className="truncate text-[11px] font-bold tracking-tight text-sky-200 tabular-nums sm:text-base md:text-lg lg:text-[1.65rem]">
                    {formatCurrency(principalPaidThisMonth, currency)}
                  </p>
                  <p className="hidden pt-0.5 text-[9px] leading-snug text-brand-muted sm:block sm:pt-1 sm:text-[10px] md:text-xs">
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

          <div className="grid grid-cols-1 items-start gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-8">
            <section className="rounded-[1.15rem] border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/75 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-lg sm:rounded-3xl sm:p-5 md:p-6">
              <div className="mb-2.5 flex flex-col gap-2 border-b border-white/[0.06] pb-2.5 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-bold text-white sm:gap-2 sm:text-base">
                    <span className="material-symbols-outlined shrink-0 text-[17px] text-brand-primary sm:text-[20px]">account_tree</span>
                    Зээлүүд
                  </h2>
                  <span className="rounded-lg border border-white/5 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-brand-muted sm:text-xs">
                    {loans.length}
                  </span>
                </div>
                <div className="w-full sm:w-[min(100%,240px)] sm:shrink-0">
                  <Select
                    value={loanSort}
                    onValueChange={(v) => setLoanSort(v as LoanSortKey)}
                  >
                    <SelectTrigger className="h-8 w-full border-white/10 bg-brand-bg/50 text-[10px] text-white hover:bg-white/[0.06] focus:ring-2 focus:ring-brand-primary/30 sm:h-9 sm:text-xs">
                      <SelectValue placeholder="Эрэмбэ" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-brand-card text-white">
                      {LOAN_SORT_OPTIONS.map((o) => (
                        <SelectItem
                          key={o.id}
                          value={o.id}
                          className="text-xs focus:bg-white/10 focus:text-white"
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="max-h-[min(480px,65vh)] space-y-1.5 overflow-y-auto pr-0.5 custom-scrollbar sm:space-y-2.5 sm:pr-1">
                {loans.length === 0 ? (
                  <p className="text-sm text-brand-muted">{t('noLoansFound')}</p>
                ) : (
                  prioritizedLoans.map((l) => {
                    const isSelected = selectedLoanId === l.id;
                    return (
                      <button
                        type="button"
                        key={l.id}
                        onClick={() => setSelectedLoanId(l.id)}
                        className={cn(
                          'flex w-full items-start justify-between gap-2.5 rounded-xl border bg-brand-card/40 p-2.5 text-left transition-colors sm:gap-4 sm:rounded-2xl sm:p-4',
                          isSelected
                            ? 'border-brand-primary/45 bg-brand-primary/12 ring-1 ring-brand-primary/25'
                            : 'border-white/5 hover:bg-white/[0.04]',
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                          <div
                            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] sm:size-10 sm:rounded-2xl"
                            style={l.color ? { color: l.color } : undefined}
                          >
                            <span className="material-symbols-outlined text-[18px] sm:text-sm">{l.icon}</span>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-white sm:text-sm">{l.name}</p>
                            <p className="mt-0.5 truncate text-[10px] text-brand-muted sm:text-[11px]">
                              {l.lender} • Үлдэгдэл: {formatCurrency(l.balance, currency)} • Хүү:{' '}
                              {l.interestRate.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className={statusPill(l.status)}>
                            {formatDateUTC(
                              rollMonthlyStartDateIfPast(
                                l.startDate,
                                loanFile.generatedAt ?? '2000-01-01',
                              ),
                            )}
                          </div>
                          <p className="mt-1.5 text-[12px] font-black tabular-nums text-emerald-400 sm:mt-2 sm:text-sm">
                            {formatCurrency(l.monthlyPayment, currency)}/сар
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              <p className="mt-2 border-t border-white/[0.06] pt-2 text-center text-[9px] leading-relaxed text-brand-muted/90 sm:text-[10px]">
                Доор шинэ зээлийн тооцоо болон төлөх хэвийн зөвлөмж байна. Илүү зээл банкаар синк холболтыг удахгүй нэмнэ.
              </p>
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
                <div className="rounded-[1.15rem] border border-dashed border-white/12 bg-brand-card/35 p-6 text-center sm:rounded-3xl md:p-10">
                  <span className="material-symbols-outlined mb-2 text-4xl text-white/20 sm:mb-3 sm:text-5xl">
                    touch_app
                  </span>
                  <p className="text-[12px] font-medium leading-relaxed text-brand-muted sm:text-sm">
                    Зээл сонгоно уу — хүү vs зээл график, төлбөрийн түүх харагдана.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <PaymentsSectionHeader
              icon="calculate"
              title="Шинэ зээл тооцоолох"
              subtitle="Дээрх жагсаалтад байгаа зээлүүдтэй ижил загварын дүрмээр харьцуулна"
            />
            <NewLoanFeasibilityCard
              embedded
              loans={loansForSuggestions}
              currency={currency}
              userProfile={userProfile}
              language={language}
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <PaymentsSectionHeader
              icon="psychology"
              title="Төлөх хэв маяг"
              subtitle="Богино асуулга — зөвлөмжийг таны хэвэнд тааруулна"
            />
            <LoanPaydownStyleCard embedded />
          </div>
      </div>
    </DashboardShell>
  );
}
