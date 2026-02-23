// components/scheduled/income-list.tsx
'use client';

import { ScheduledIncome, INCOME_STATUS_CONFIG } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface IncomeListProps {
  incomes: ScheduledIncome[];
}

export function IncomeList({ incomes }: IncomeListProps) {
  return (
    <div className="bg-card-surface rounded-2xl border border-white/5 flex-1 flex flex-col shadow-2xl">
      <div className="p-5 border-b border-white/5">
        <h4 className="font-bold flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined">payments</span>
          Expected Income
        </h4>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[380px] scrollbar-hide">
        {incomes.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">
              account_balance
            </span>
            <p className="text-sm text-slate-500">No expected income</p>
          </div>
        ) : (
          incomes.map((income) => {
            const statusConfig = INCOME_STATUS_CONFIG[income.status];
            
            return (
              <div
                key={income.id}
                className="group p-4 bg-navy-dark/60 rounded-xl hover:bg-navy-dark/80 border border-white/5 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                      <span className="material-symbols-outlined">{income.icon}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-200">{income.name}</p>
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
                    <p className="font-black text-sm text-secondary">
                      +{formatCurrency(income.amount, 'USD')}
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