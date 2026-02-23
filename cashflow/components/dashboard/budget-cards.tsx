// components/dashboard/budget-cards.tsx
'use client';

import { cn, formatCurrency, calculatePercentage } from '@/lib/utils';
import { useDashboardData } from '@/hook/use-dashboard-data';

export function BudgetCards() {
  const { budgets, loading } = useDashboardData();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/5 rounded w-24 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-white/5 rounded w-20"></div>
                <div className="h-4 bg-white/5 rounded w-16"></div>
              </div>
              <div className="h-2 bg-white/5 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Monthly Budgets</h3>
        <button className="text-xs font-bold text-brand-primary hover:text-white transition-colors">
          Adjust Budgets
        </button>
      </div>

      <div className="space-y-5">
        {budgets.map((budget) => {
          const percentage = calculatePercentage(budget.spent, budget.limit);
          const progressColor = getProgressColor(percentage);
          const isOverBudget = percentage > 100;

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "material-symbols-outlined text-sm p-1 rounded-lg",
                    budget.color.replace('bg-', 'bg-/10 text-')
                  )}>
                    {budget.icon}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {budget.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(budget.spent, 'MNT')}
                  </span>
                  <span className="text-xs text-brand-muted mx-1">/</span>
                  <span className="text-xs text-brand-muted">
                    {formatCurrency(budget.limit, 'MNT')}
                  </span>
                </div>
              </div>

              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                    isOverBudget ? 'bg-red-500' : progressColor
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-brand-muted">
                  {percentage}% used
                </span>
                {isOverBudget && (
                  <span className="text-[10px] text-red-400 font-bold">
                    Over budget!
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-brand-muted">Total Budget</span>
          <span className="text-sm font-bold text-white">
            {formatCurrency(budgets.reduce((sum, b) => sum + b.limit, 0), 'MNT')}
          </span>
        </div>
      </div>
    </div>
  );
}