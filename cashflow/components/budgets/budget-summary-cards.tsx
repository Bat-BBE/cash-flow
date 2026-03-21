// components/budgets/budget-summary-cards.tsx
'use client';

import { BudgetSummary } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  trend?: {
    value: number;
    positive?: boolean;
  };
  suffix?: string;
  color?: string;
}

function SummaryCard({ title, value, icon, trend, suffix, color = 'primary' }: SummaryCardProps) {
  return (
    <div className="bg-[#2b3550] border border-slate-700/50 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-primary/50 transition-all">
      {/* Background icon */}
      <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all">
        <span className="material-symbols-outlined text-6xl">{icon}</span>
      </div>
      
      <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
        {title}
      </p>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {formatCurrency(value, 'USD')}
          {suffix && <span className="text-sm ml-1 text-slate-400">{suffix}</span>}
        </h3>
        
        {trend && (
          <span className={cn(
            "text-xs font-bold px-1.5 py-0.5 rounded",
            trend.positive 
              ? 'text-emerald-400 bg-emerald-400/10' 
              : 'text-orange-400 bg-orange-400/10'
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>

      {/* Progress indicator for total spent */}
      {title === 'Total Spent' && (
        <div className="mt-4">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-400">Usage</span>
            <span className="text-white font-bold">{((value / 4200) * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(value / 4200) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface BudgetSummaryCardsProps {
  summary: BudgetSummary | null;
  loading?: boolean;
}

export function BudgetSummaryCards({ summary, loading }: BudgetSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#2b3550] border border-slate-700/50 p-6 rounded-xl">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-700/50 rounded w-24 mb-4"></div>
              <div className="h-8 bg-slate-700/50 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      title: 'Total Budgeted',
      value: summary.totalBudgeted,
      icon: 'payments',
      trend: { value: 5.2, positive: true }
    },
    {
      title: 'Total Spent',
      value: summary.totalSpent,
      icon: 'shopping_bag',
      suffix: `${summary.percentageUsed.toFixed(0)}% used`
    },
    {
      title: 'Remaining',
      value: summary.totalRemaining,
      icon: 'savings',
      suffix: 'Available'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
      {cards.map((card, index) => (
        <SummaryCard key={index} {...card} />
      ))}
    </div>
  );
}