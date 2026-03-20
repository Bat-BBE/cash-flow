'use client';

import { useMemo, useState } from 'react';
import {
  computeAllStrategies,
  type LoanForSuggestion,
  type SuggestionConfig,
  type SuggestionStrategyId,
  type UserProfile,
} from '@/lib/loan-suggestions';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

function formatMonths(months: number): string {
  const m = Math.max(0, months);
  const years = Math.floor(m / 12);
  const rem = m - years * 12;
  if (years > 0) return `${years}y ${Math.round(rem)}m`;
  return `${Math.round(m)}m`;
}

const STRATEGY_TABS: {
  id: SuggestionStrategyId;
  shortLabel: string;
  hint: string;
}[] = [
  { id: 'aggressive', shortLabel: 'Хамгийн их', hint: 'Боломжийн дээд төлбөр' },
  { id: 'normal', shortLabel: 'Хэвийн', hint: 'Тэнцвэртэй' },
  { id: 'minimal', shortLabel: 'Хамгийн бага', hint: 'Урт хугацаа' },
];

interface LoanSuggestionsPanelProps {
  loans: LoanForSuggestion[];
  currency: string;
  userProfile?: UserProfile;
  suggestionConfig?: Partial<SuggestionConfig>;
}

export function LoanSuggestionsPanel({
  loans,
  currency,
  userProfile,
  suggestionConfig,
}: LoanSuggestionsPanelProps) {
  const [active, setActive] = useState<SuggestionStrategyId>('normal');

  const all = useMemo(
    () => computeAllStrategies(loans, userProfile, suggestionConfig),
    [loans, userProfile, suggestionConfig],
  );

  const result = all[active];

  return (
    <section className="bg-brand-card/60 rounded-3xl border border-white/5 p-6 md:p-7 shadow-xl shadow-black/20 backdrop-blur-lg">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-white font-bold inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            Орлогод суурилсан төлбөрийн санал
          </h2>
          {userProfile && userProfile.monthlyIncome > 0 && (
            <div className="text-xs text-slate-400 space-x-3">
              {/*
                Essentials are fixed at 40% of income (as required), even if monthlyEssentialExpenses is missing in loan.json.
              */}
              {(() => {
                const essentials = userProfile.monthlyIncome * 0.4;
                const disposableBase = Math.max(0, userProfile.monthlyIncome - essentials); // = income * 0.6
                const salaryPayCap = disposableBase * 0.9 * 0.885; // = income * 0.9 * 0.885 * 0.6
                return (
                  <>
              <span>
                Орлого:{' '}
                <strong className="text-slate-200">
                  {formatCurrency(userProfile.monthlyIncome, currency)}
                </strong>
              </span>
              <span>
                Зардал:{' '}
                <strong className="text-slate-200">
                  {formatCurrency(essentials, currency)}
                </strong>
              </span>
              <span>
                    Зээлд төлөх боломж:{' '}
                <strong className="text-emerald-400">
                  {formatCurrency(
                    salaryPayCap,
                    currency,
                  )}
                </strong>
              </span>
              <span className="block mt-2 w-full sm:w-auto sm:inline-flex gap-2 items-center">
                <span className="font-bold text-slate-200">
                  Салариас боломжтой төлбөр:
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-slate-400">Нормал</span>
                  <strong className="text-primary">{formatCurrency(all.normal.budgetCap, currency)}</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-slate-400">Боломжит</span>
                  <strong className="text-emerald-300">{formatCurrency(all.aggressive.budgetCap, currency)}</strong>
                </span>
              </span>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Тохиргоо болон орлого{' '}
          <code className="text-primary/90 bg-white/5 px-1 rounded">loan.json</code> файлын{' '}
          <code className="text-primary/90 bg-white/5 px-1 rounded">userProfile</code> /{' '}
          <code className="text-primary/90 bg-white/5 px-1 rounded">suggestionConfig</code>{' '}
          хэсгээс уншигдана.
        </p>

        <div className="flex flex-wrap gap-2">
          {STRATEGY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold border transition-all',
                active === tab.id
                  ? 'bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/10'
                  : 'bg-brand-card/50 text-slate-400 border-white/10 hover:text-white hover:border-white/20',
              )}
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
        <div>
          <h3 className="text-sm font-bold text-white">{result.label}</h3>
          <p className="text-xs text-slate-400 mt-1">{result.description}</p>

          {result.interestSavingsTotal != null && result.strategy !== 'minimal' && (
            <p
              className={cn(
                'text-xs font-bold mt-3',
                result.interestSavingsTotal >= 0 ? 'text-emerald-400' : 'text-amber-400',
              )}
            >
              PMT-ээр тооцсон хүүгийн хэмнэлт (vs хамгийн бага):{' '}
              {formatCurrency(Math.abs(result.interestSavingsTotal), currency)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-brand-card/50 rounded-lg p-3 border border-white/5">
            <p className="text-slate-500 uppercase tracking-wider font-bold mb-1">
              JSON доод төлбөр (нийт)
            </p>
            <p className="text-lg font-black text-slate-200">
              {formatCurrency(result.minimumTotalFromJson, currency)}
            </p>
          </div>
          <div className="bg-brand-card/50 rounded-lg p-3 border border-white/5">
            <p className="text-slate-500 uppercase tracking-wider font-bold mb-1">
              Төлөвлөгөөний дээд (орлогоор)
            </p>
            <p className="text-lg font-black text-primary">
              {formatCurrency(result.budgetCap, currency)}
            </p>
          </div>
          <div className="bg-brand-card/50 rounded-lg p-3 border border-white/5">
            <p className="text-slate-500 uppercase tracking-wider font-bold mb-1">
              Санал болгох нийт / сар
            </p>
            <p className="text-lg font-black text-emerald-400">
              {formatCurrency(result.totalSuggested, currency)}
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

        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {result.perLoan.map((row) => (
            <div
              key={row.loanId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-sm font-bold text-white">{row.loanName}</p>
                <p className="text-[11px] text-slate-500">
                  Доод: {formatCurrency(row.bankMinimumMonthly, currency)} · Гэрээний:{' '}
                  {formatCurrency(row.scheduledMonthly, currency)}
                  {row.overdueExtraThisMonth > 0 && (
                    <>
                      {' '}
                      + overdue: {formatCurrency(row.overdueExtraThisMonth, currency)}
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">
                  {formatCurrency(row.suggestedPayment, currency)}
                </p>
                <p className="text-[10px] text-slate-500">сарын санал</p>

                {row.interestSavings != null && row.interestSavings > 0 && (
                  <p className="text-[10px] text-emerald-300 mt-1">
                    Хүү хэмнэлт: {formatCurrency(row.interestSavings, currency)}
                  </p>
                )}

                {row.payoffMonthsSuggested != null && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Дуусах: {formatMonths(row.payoffMonthsSuggested)}{' '}
                    {row.payoffMonthsFaster != null && row.payoffMonthsFaster > 0
                      ? `(хурдан: ${formatMonths(row.payoffMonthsFaster)})`
                      : null}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
