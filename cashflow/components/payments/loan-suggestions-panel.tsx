'use client';

import { useMemo, useState } from 'react';
import {
  computeStrategy,
  type LoanForSuggestion,
  type SuggestionConfig,
  type SuggestionStrategyId,
  type UserProfile,
} from '@/lib/loan-suggestions';
import { addMonthsUTC, formatCurrency, parseDateInputUTC } from '@/lib/utils';
import { cn } from '@/lib/utils';

/** Mongolian: "1 жил 3 сар" from total months */
function formatDurationMn(totalMonths: number): string {
  const m = Math.max(0, Math.round(totalMonths));
  const years = Math.floor(m / 12);
  const months = m % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} жил`);
  if (months > 0) parts.push(`${months} сар`);
  if (parts.length === 0) return '0 сар';
  return parts.join(' ');
}

function formatApproxPayoffMonthsMn(months: number | null | undefined): string {
  if (months == null || !Number.isFinite(months)) return '—';
  return formatDurationMn(months);
}

/** Mongolian calendar line — UTC fields only (matches server + client; no locale-ICU drift). */
function formatDateMnUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y} оны ${m} сарын ${d}`;
}

const STRATEGY_TABS: {
  id: SuggestionStrategyId;
  shortLabel: string;
  hint: string;
}[] = [
  { id: 'aggressive', shortLabel: 'Хүүгээр чухалчлах', hint: 'Их хүүтэй зээлүүдийг чухалчлах' },
  {
    id: 'normal',
    shortLabel: 'Хугацаанд суурилсан',
    hint: 'Хамгийн богино хугацаа үлдсэн зээлээс эхлэн илүү төлнө',
  },
  {
    id: 'minimal',
    shortLabel: 'Бүх зээлийг ижил үзэх',
    hint: 'Бүх зээлийн төлөлтийг ижил хувиар өсгөх',
  },
];

/** Bump vs sum of loan.json `monthlyPayment` (current). Clamped to max salary cap. */
const PAYMENT_METHODS = [
  { id: 'normal', label: 'Одоогийн', hint: 'Одоогийн сарын төлбөр (loan.json)', bump: 0 },
  { id: 'little-extreme', label: '+2%', hint: 'Одоогийн төлбөрөөс 2%-иар илүү', bump: 0.02 },
  { id: 'extreme', label: '+4%', hint: 'Одоогийн төлбөрөөс 4%-иар илүү', bump: 0.04 },
] as const;

type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

interface LoanSuggestionsPanelProps {
  loans: LoanForSuggestion[];
  currency: string;
  userProfile?: UserProfile;
  suggestionConfig?: Partial<SuggestionConfig>;
  /**
   * Reference date (ISO string) used to convert payoff months -> an estimated end date.
   * Passing this avoids server/client "today" mismatches.
   */
  referenceDateISO?: string;
}

export function LoanSuggestionsPanel({
  loans,
  currency,
  userProfile,
  suggestionConfig,
  referenceDateISO,
}: LoanSuggestionsPanelProps) {
  const [active, setActive] = useState<SuggestionStrategyId>('normal');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('normal');
  const paymentBump = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.bump ?? 0,
    [paymentMethod],
  );
  const paymentMethodIndex = useMemo(
    () => Math.max(0, PAYMENT_METHODS.findIndex((m) => m.id === paymentMethod)),
    [paymentMethod],
  );

  const referenceDate = useMemo(() => {
    if (!referenceDateISO) return null;
    const d = parseDateInputUTC(referenceDateISO);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [referenceDateISO]);

  const currentMonthlyPayment = useMemo(
    () => loans.reduce((s, l) => s + l.monthlyPayment, 0),
    [loans],
  );

  const maxPayableFromSalary = useMemo(() => {
    const income = userProfile?.monthlyIncome ?? 0;
    // max amount that can be used to pay loans:
    // income * 0.9 * 0.885 * 0.6
    return income * 0.9 * 0.885 * 0.6;
  }, [userProfile?.monthlyIncome]);

  /** Never exceed “salary to pay loans”; baseline is min(current JSON total, that cap). */
  const targetBudgetFromSlider = useMemo(() => {
    const salaryCap = maxPayableFromSalary;
    if (salaryCap <= 0) return 0;
    const cur = currentMonthlyPayment;
    const base = Math.min(cur, salaryCap);
    const raw = base * (1 + paymentBump);
    return Math.min(salaryCap, Math.max(0, Math.round(raw)));
  }, [currentMonthlyPayment, maxPayableFromSalary, paymentBump]);

  const budgetOverride =
    userProfile && userProfile.monthlyIncome > 0 ? targetBudgetFromSlider : undefined;

  const all = useMemo(() => {
    return {
      minimal: computeStrategy(loans, userProfile, suggestionConfig, 'minimal', budgetOverride),
      normal: computeStrategy(loans, userProfile, suggestionConfig, 'normal', budgetOverride),
      aggressive: computeStrategy(
        loans,
        userProfile,
        suggestionConfig,
        'aggressive',
        budgetOverride,
      ),
    };
  }, [loans, userProfile, suggestionConfig, budgetOverride]);

  const result = all[active];
  const showPriorityUI = result.strategy !== 'minimal';
  const extraVsBasePayment = result.totalSuggested - result.minimumTotalFromJson;

  return (
    <section className="bg-brand-card/60 rounded-3xl border border-white/5 p-6 md:p-7 shadow-xl shadow-black/20 backdrop-blur-lg">
      <div className="flex flex-col gap-4 mb-4">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {STRATEGY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn('px-3 py-3 rounded-2xl text-xs font-bold border transition-all w-full', (() => {
                if (active !== tab.id) {
                  return 'bg-brand-card/50 text-slate-400 border-white/10 hover:text-white hover:border-white/20';
                }
                return [
                  'bg-gradient-to-r from-brand-primary/25 to-brand-primary/10',
                  'text-white',
                  'border-primary/40',
                  'ring-1 ring-primary/20',
                  'shadow-lg',
                  'shadow-[0_12px_30px_-10px_rgba(112,96,240,0.45)]',
                ].join(' ');
              })())}
            >
              <span className="block">{tab.shortLabel}</span>
              <span className="block text-[10px] font-medium opacity-80 mt-0.5">
                {tab.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      

      <div className="rounded-2xl border border-white/5 bg-brand-card/60 p-4 space-y-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 md:text-right">
          Төлбөрийн горим
        </p>
        {/* One row: extra vs base + payment bump (Одоогийн / +2% / +4%) */}
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-white/10 bg-brand-card/50 p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
              Сарын суурь төлөх дүнтэй харьцуулбал 
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-black tabular-nums sm:text-2xl',
                extraVsBasePayment > 0
                  ? 'text-emerald-400'
                  : extraVsBasePayment < 0
                    ? 'text-amber-400'
                    : 'text-slate-300',
              )}
            >
              {extraVsBasePayment > 0 ? '+' : ''}
              {formatCurrency(extraVsBasePayment, currency)}
            </p>
          </div>

          {userProfile && userProfile.monthlyIncome > 0 && (
            <div className="flex w-full shrink-0 flex-col md:w-[min(100%,440px)] md:self-stretch">
              {/* Outer shell matches left card height; control + pill live in a fixed-height inner track */}
              <div className="flex h-full min-h-0 flex-col justify-center rounded-2xl border border-white/10 bg-brand-card/40 p-1.5 sm:p-2">
                <div className="relative w-full">
                  <div
                    className="pointer-events-none absolute top-1.5 bottom-1.5 w-1/3 rounded-xl border border-primary/40 bg-primary/20 shadow-lg shadow-primary/20 transition-transform duration-200 sm:top-2 sm:bottom-2"
                    style={{ transform: `translateX(${paymentMethodIndex * 100}%)` }}
                  />
                  <div className="relative grid h-14 grid-cols-3 gap-1 sm:h-[3.75rem] sm:gap-1.5">
                    {PAYMENT_METHODS.map((method) => {
                      const isActive = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn(
                            'z-10 flex h-full min-h-0 w-full items-center justify-center whitespace-nowrap rounded-xl px-1 text-sm font-black tracking-tight transition-colors sm:px-3 sm:text-base',
                            isActive ? 'text-primary' : 'text-slate-400 hover:text-white',
                          )}
                        >
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {result.warnings.length > 0 && (
          <div className="space-y-2">
            {result.warnings.map((w, i) => (
              <p
                key={i}
                className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
              >
                {w}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Зээлийн санал
            </p>
          </div>

          <div className="space-y-3 max-h-[min(420px,55vh)] overflow-y-auto pr-1 custom-scrollbar">
            {result.perLoan.map((row, idx) => (
              <div
                key={row.loanId}
                className={cn(
                  'rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-4 shadow-sm transition-colors',
                  showPriorityUI && idx === 0 &&
                    'border-emerald-400/35 bg-emerald-500/[0.07] ring-1 ring-emerald-400/15',
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {showPriorityUI && idx === 0 && (
                        <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                          Чухал
                        </span>
                      )}
                      <h3 className="text-sm font-bold leading-snug text-white">{row.loanName}</h3>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Суурь төлөлт: {formatCurrency(row.scheduledMonthly, currency)}
                      {row.overdueExtraThisMonth > 0 && (
                        <>
                          <span className="mx-1.5 text-slate-700">·</span>
                          Нэмэгдэл: {formatCurrency(row.overdueExtraThisMonth, currency)}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-lg font-black tabular-nums text-emerald-400 sm:text-xl">
                      {formatCurrency(row.suggestedPayment, currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                  {row.payoffMonthsFaster != null && row.payoffMonthsFaster > 0 && (
                    <p className="text-xs leading-relaxed text-sky-100/95">
                      <span className="font-bold text-sky-300">Хугацаа: </span>
                      Одоогийн суурь төлөвлөгөөтой харьцуулахад{' '}
                      <span className="font-black text-white">
                        {formatDurationMn(row.payoffMonthsFaster)}ын өмнө
                      </span>{' '}
                      зээл бүрэн төлөгдөнө.
                    </p>
                  )}
                  {row.payoffMonthsFaster != null &&
                    row.payoffMonthsFaster === 0 &&
                    row.payoffMonthsSuggested != null &&
                    row.payoffMonthsMinimal != null && (
                      <p className="text-[11px] text-slate-500">
                        Суурь болон саналын дуусах хугацаа ойролцоогоор ижил (
                        {formatApproxPayoffMonthsMn(row.payoffMonthsSuggested)}).
                      </p>
                    )}

                  {row.interestSavings != null && (
                    <p
                      className={cn(
                        'text-[11px]',
                        row.interestSavings > 0
                          ? 'text-emerald-300/95'
                          : row.interestSavings < 0
                            ? 'text-amber-300/90'
                            : 'text-slate-500',
                      )}
                    >
                      <span className="font-semibold text-slate-400">Хүүд төлөх хэмнэлт: </span>
                      {formatCurrency(row.interestSavings, currency)}
                    </p>
                  )}

                  {(row.payoffMonthsMinimal != null || row.payoffMonthsSuggested != null) && (
                    <div className="flex flex-col gap-0.5 text-[11px] text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-0.5">
                      {row.payoffMonthsMinimal != null && (
                        <span>
                          Суурь төлөвлөгөө: ~{formatApproxPayoffMonthsMn(row.payoffMonthsMinimal)}
                        </span>
                      )}
                      {row.payoffMonthsSuggested != null && (
                        <span>
                          Шинэ төлөвлөгөө: ~{formatApproxPayoffMonthsMn(row.payoffMonthsSuggested)}
                        </span>
                      )}
                      {referenceDate && row.payoffMonthsSuggested != null && (
                        <span className="text-slate-400">
                          Тойм огноо:{' '}
                          {formatDateMnUTC(
                            addMonthsUTC(referenceDate, row.payoffMonthsSuggested),
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
