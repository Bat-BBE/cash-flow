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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const selectTriggerClass =
    'h-9 w-full border-white/10 bg-brand-bg/55 text-left text-[11px] text-white hover:bg-white/[0.06] focus:ring-2 focus:ring-brand-primary/30 sm:h-10 sm:text-xs';

  return (
    <section className="rounded-[1.15rem] border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/75 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-lg sm:rounded-3xl sm:p-6 md:p-7">
      <div className="mb-3 grid grid-cols-1 gap-2 sm:mb-4 sm:grid-cols-2 sm:gap-3">
        <div className="min-w-0 space-y-1">
          <label className="block text-[9px] font-bold uppercase tracking-wide text-brand-muted sm:text-[10px]">
            Төлөх дараалал
          </label>
          <Select
            value={active}
            onValueChange={(v) => setActive(v as SuggestionStrategyId)}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-brand-card text-white">
              {STRATEGY_TABS.map((tab) => (
                <SelectItem
                  key={tab.id}
                  value={tab.id}
                  title={tab.hint}
                  className="text-xs focus:bg-white/10 focus:text-white"
                >
                  {tab.shortLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[9px] leading-snug text-brand-muted/90 sm:text-[10px]">
            {STRATEGY_TABS.find((t) => t.id === active)?.hint}
          </p>
        </div>

        {userProfile && userProfile.monthlyIncome > 0 ? (
          <div className="min-w-0 space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wide text-brand-muted sm:text-[10px]">
              Сарын төлбөрийн түвшин
            </label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethodId)}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-brand-card text-white">
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem
                    key={method.id}
                    value={method.id}
                    title={method.hint}
                    className="text-xs focus:bg-white/10 focus:text-white"
                  >
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[9px] leading-snug text-brand-muted/90 sm:text-[10px]">
              {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.hint}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-[1rem] border border-white/5 bg-brand-bg/40 p-3 sm:space-y-4 sm:rounded-2xl sm:p-4">
        <p className="mb-0 text-[10px] font-bold uppercase tracking-wider text-brand-muted sm:mb-1 sm:text-xs md:text-right">
          Төлбөрийн горим
        </p>
        <div className="flex flex-col gap-2.5 md:flex-row md:items-stretch md:gap-3">
          <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-white/5 bg-brand-card/50 p-3 sm:p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted sm:text-[10px] md:text-xs">
              Сарын суурь төлөх дүнтэй харьцуулбал 
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-black tabular-nums sm:text-2xl',
                extraVsBasePayment > 0
                  ? 'text-emerald-400'
                  : extraVsBasePayment < 0
                    ? 'text-amber-400'
                    : 'text-white/80',
              )}
            >
              {extraVsBasePayment > 0 ? '+' : ''}
              {formatCurrency(extraVsBasePayment, currency)}
            </p>
          </div>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted sm:text-xs">
              Зээлийн санал
            </p>
          </div>

          <div className="custom-scrollbar max-h-[min(380px,50vh)] space-y-2 overflow-y-auto pr-1 sm:max-h-[min(420px,55vh)] sm:space-y-3">
            {result.perLoan.map((row, idx) => (
              <div
                key={row.loanId}
                className={cn(
                  'rounded-xl border border-white/5 bg-gradient-to-b from-brand-card/80 to-brand-card/50 p-3 shadow-sm transition-colors sm:rounded-2xl sm:p-4',
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
                    <p className="text-[10px] leading-relaxed text-brand-muted sm:text-[11px]">
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
                            : 'text-brand-muted',
                      )}
                    >
                      <span className="font-semibold text-white/45">Хүүд төлөх хэмнэлт: </span>
                      {formatCurrency(row.interestSavings, currency)}
                    </p>
                  )}

                  {(row.payoffMonthsMinimal != null || row.payoffMonthsSuggested != null) && (
                    <div className="flex flex-col gap-0.5 text-[10px] text-brand-muted sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-0.5 sm:text-[11px]">
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
                        <span className="text-white/50">
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
