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
    <div className="bg-card-surface rounded-2xl border border-white/5 flex-1 flex flex-col shadow-2xl">
      <div className="p-5 border-b border-white/5">
        <h4 className="font-bold flex items-center gap-2 text-emerald-400">
          <span className="material-symbols-outlined text-emerald-400">payments</span>
          Орлого
        </h4>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[380px] scrollbar-hide">
        {upcomingIncomes.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">
              account_balance
            </span>
            <p className="text-sm text-slate-500">No expected income</p>
          </div>
        ) : (
          upcomingIncomes.map((income) => {
            const statusConfig =
              INCOME_STATUS_CONFIG[income.status] ?? INCOME_STATUS_CONFIG.estimated;
            
            return (
              <div
                key={income.id}
                className="group rounded-xl border border-emerald-500/15 bg-navy-dark/60 p-4 transition-all hover:bg-emerald-500/[0.04]"
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