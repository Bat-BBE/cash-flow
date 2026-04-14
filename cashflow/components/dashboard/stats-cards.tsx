'use client';

import { cn, formatCurrency } from '@/lib/utils';
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
      <div className="flex-1 rounded-[0.85rem] border border-white/5 bg-brand-card p-2.5 sm:rounded-2xl sm:p-5">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 bg-white/5 rounded w-20" />
            <div className="h-7 w-7 bg-white/5 rounded-lg" />
          </div>
          <div className="h-7 bg-white/5 rounded w-28 mb-2" />
          <div className="h-3 bg-white/5 rounded w-16" />
        </div>
      </div>
    );
  }

  const isPositive = changePercentage != null ? changePercentage > 0 : null;

  return (
    <div className="group min-w-0 flex-1 rounded-[0.85rem] border border-white/5 bg-brand-card p-2.5 transition-all hover:border-white/10 sm:rounded-2xl sm:p-5">
      <div className="mb-1.5 flex items-center justify-between sm:mb-3">
        <p className="truncate pr-1.5 text-[9px] font-bold uppercase tracking-wider text-brand-muted transition-colors group-hover:text-white sm:text-xs">
          {title}
        </p>
        <span className={cn('material-symbols-outlined shrink-0 rounded-md p-1 text-sm sm:p-2 sm:text-lg', color)}>
          {icon}
        </span>
      </div>

      <p className="mb-0.5 truncate text-sm font-black tabular-nums text-white sm:mb-1 sm:text-xl">{value}</p>

      {change && (
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
          {changePercentage !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 text-[9px] font-bold sm:text-xs",
              isPositive ? 'text-emerald-400' : 'text-orange-400'
            )}>
              <span className="material-symbols-outlined text-xs">
                {isPositive ? 'trending_up' : 'trending_down'}
              </span>
              {changePercentage > 0 ? '+' : ''}{changePercentage}%
            </span>
          )}
          <span className="text-[9px] text-brand-muted sm:text-xs">{change}</span>
        </div>
      )}
    </div>
  );
}

const MASK = '••••••••';

export function StatsCards() {
  const { stats, loading, privacyMasked } = useDashboardData();
  const { language } = useDashboard();
  const t = useTranslation(language);

  const cards = [
    {
      title: t('statTotalIncome'),
      value: stats ? (privacyMasked ? MASK : formatCurrency(stats.income.total, 'MNT')) : '0 ₮',
      change: t('vsLastMonthCompare'),
      changePercentage: stats && !privacyMasked ? stats.income.changePercentage : undefined,
      icon: 'trending_up',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: t('statTotalExpenses'),
      value: stats ? (privacyMasked ? MASK : formatCurrency(stats.expenses.total, 'MNT')) : '0 ₮',
      change: t('vsLastMonthCompare'),
      changePercentage: stats && !privacyMasked ? stats.expenses.changePercentage : undefined,
      icon: 'trending_down',
      color: 'bg-orange-500/10 text-orange-400',
    },
  ];

  return (
    <div className="flex w-full gap-2 sm:gap-3">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} loading={loading} />
      ))}
    </div>
  );
}