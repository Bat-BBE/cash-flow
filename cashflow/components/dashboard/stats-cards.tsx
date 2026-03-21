'use client';

import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changePercentage?: number;
  icon: string;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, change, changePercentage, icon, color, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-brand-card rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/5">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="h-3 sm:h-4 bg-white/5 rounded w-16 sm:w-24" />
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-white/5 rounded-lg sm:rounded-xl" />
          </div>
          <div className="h-6 sm:h-8 bg-white/5 rounded w-24 sm:w-32 mb-1.5 sm:mb-2" />
          <div className="h-2.5 sm:h-3 bg-white/5 rounded w-16 sm:w-20" />
        </div>
      </div>
    );
  }

  const isPositive = changePercentage ? changePercentage > 0 : null;

  return (
    <div className="bg-brand-card rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-2.5 sm:mb-4">
        <p className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider group-hover:text-white transition-colors leading-tight">
          {title}
        </p>
        <span className={cn("material-symbols-outlined p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-base sm:text-xl", color)}>
          {icon}
        </span>
      </div>

      <p className="text-lg sm:text-2xl font-black text-white mb-1 truncate">{value}</p>

      {change && (
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {changePercentage !== undefined && (
            <span className={cn(
              "text-[10px] sm:text-xs font-bold flex items-center gap-0.5",
              isPositive ? 'text-emerald-400' : 'text-orange-400'
            )}>
              <span className="material-symbols-outlined text-xs sm:text-sm">
                {isPositive ? 'trending_up' : 'trending_down'}
              </span>
              {changePercentage > 0 ? '+' : ''}{changePercentage}%
            </span>
          )}
          <span className="text-[10px] sm:text-xs text-brand-muted leading-tight">{change}</span>
        </div>
      )}
    </div>
  );
}

export function StatsCards() {
  const { stats, loading } = useDashboardData();
  const { language } = useDashboard();
  const t = useTranslation(language);

  const cards = [
    {
      title: t('statTotalIncome'),
      value: stats ? formatCurrency(stats.income.total, 'MNT') : '0 ₮',
      change: t('vsLastMonthCompare'),
      changePercentage: stats?.income.changePercentage,
      icon: 'trending_up',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: t('statTotalExpenses'),
      value: stats ? formatCurrency(stats.expenses.total, 'MNT') : '0 ₮',
      change: t('vsLastMonthCompare'),
      changePercentage: stats?.expenses.changePercentage,
      icon: 'trending_down',
      color: 'bg-orange-500/10 text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-3xl">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} loading={loading} />
      ))}
    </div>
  );
}