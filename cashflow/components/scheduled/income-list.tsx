// components/scheduled/income-list.tsx
'use client';

import { useMemo } from 'react';
import { ScheduledIncome, INCOME_STATUS_CONFIG } from './types';
import { isDashboardScheduledId } from '@/lib/dashboard-tx-to-scheduled';
import { formatCurrency, isDateKeyTodayOrFuture } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface IncomeListProps {
  incomes: ScheduledIncome[];
  /** Same as bills / calendar (e.g. loan.json `currency`). */
  currency?: string;
}

export function IncomeList({ incomes, currency = 'MNT' }: IncomeListProps) {
  const upcomingIncomes = useMemo(
    () => incomes.filter((i) => isDateKeyTodayOrFuture(i.date)),
    [incomes],
  );

  return (
    <div className="flex flex-1 flex-col rounded-[1.15rem] border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/75 shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:rounded-2xl">
      <div className="border-b border-white/5 p-4 sm:p-5">
        <h4 className="flex items-center gap-2 text-[13px] font-bold text-emerald-400 sm:text-base">
          <span className="material-symbols-outlined text-[20px] sm:text-[22px]">payments</span>
          Орлого
        </h4>
        <p className="mt-0.5 text-[10px] text-brand-muted sm:text-[11px]">Ирэх орлого</p>
      </div>

      <div className="scrollbar-hide max-h-[min(360px,45vh)] space-y-2.5 overflow-y-auto p-3 sm:max-h-[380px] sm:space-y-3 sm:p-4">
        {upcomingIncomes.length === 0 ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined mb-2 text-4xl text-white/15">
              account_balance
            </span>
            <p className="text-[12px] text-brand-muted sm:text-sm">Ирэх орлого алга</p>
          </div>
        ) : (
          upcomingIncomes.map((income) => {
            const statusConfig =
              INCOME_STATUS_CONFIG[income.status] ?? INCOME_STATUS_CONFIG.estimated;
            
            return (
              <div
                key={income.id}
                className="group rounded-xl border border-emerald-500/15 bg-brand-bg/40 p-3 transition-all hover:bg-emerald-500/[0.06] sm:p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
                      <span className="material-symbols-outlined">{income.icon}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-200">{income.name}</p>
                        {isDashboardScheduledId(income.id) && (
                          <span className="shrink-0 rounded-full border border-sky-500/30 bg-sky-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase text-sky-200">
                            Данс
                          </span>
                        )}
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold",
                          statusConfig.bg,
                          statusConfig.color,
                          statusConfig.border
                        )}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(income.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-sm tabular-nums tracking-tight text-emerald-400">
                      +{formatCurrency(income.amount, currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}