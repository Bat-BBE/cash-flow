// components/analytics/analytics-stats.tsx
'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: string;
  color: string;
}

function StatCard({ label, value, change, icon, color }: StatCardProps) {
  return (
    <div className="bg-[#2b3550] border border-white/5 rounded-2xl p-6 shadow-2xl hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest group-hover:text-white transition-colors">
          {label}
        </p>
        <span className={cn("material-symbols-outlined", color)}>{icon}</span>
      </div>
      <p className={cn("text-3xl font-black tracking-tight", color)}>{value}</p>
      {change && (
        <div className="flex items-center gap-1 mt-2">
          <span className={cn(
            "text-xs font-bold",
            parseFloat(change) > 0 ? 'text-success' : 'text-red-400'
          )}>
            {parseFloat(change) > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-[10px] text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
}

interface AnalyticsStatsProps {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: number;
  incomeChange?: number;
  expenseChange?: number;
}

export function AnalyticsStats({
  totalIncome,
  totalExpense,
  totalSavings,
  savingsRate,
  incomeChange = 0,
  expenseChange = 0
}: AnalyticsStatsProps) {
  const stats = [
    {
      label: "Total Income",
      value: `$${(totalIncome / 1000).toFixed(1)}K`,
      change: incomeChange.toFixed(1),
      icon: "trending_up",
      color: "text-success"
    },
    {
      label: "Total Expenses",
      value: `$${(totalExpense / 1000).toFixed(1)}K`,
      change: expenseChange.toFixed(1),
      icon: "trending_down",
      color: "text-primary"
    },
    {
      label: "Net Savings",
      value: `$${(totalSavings / 1000).toFixed(1)}K`,
      change: savingsRate.toFixed(1),
      icon: "savings",
      color: "text-emerald-400"
    },
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: "pie_chart",
      color: "text-amber-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}