// components/dashboard/stats-cards.tsx
'use client';

import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { useDashboardData } from '@/hook/use-dashboard-data';
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
      <div className="bg-brand-card rounded-2xl p-6 border border-white/5">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-white/5 rounded w-24"></div>
            <div className="h-8 w-8 bg-white/5 rounded-xl"></div>
          </div>
          <div className="h-8 bg-white/5 rounded w-32 mb-2"></div>
          <div className="h-3 bg-white/5 rounded w-20"></div>
        </div>
      </div>
    );
  }

  const isPositive = changePercentage ? changePercentage > 0 : null;

  return (
    <div className="bg-brand-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-brand-muted uppercase tracking-wider group-hover:text-white transition-colors">
          {title}
        </p>
        <span className={cn("material-symbols-outlined p-2 rounded-xl", color)}>
          {icon}
        </span>
      </div>
      
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      
      {change && (
        <div className="flex items-center gap-2 flex-wrap">
          {changePercentage !== undefined && (
            <span className={cn(
              "text-xs font-bold flex items-center gap-0.5",
              isPositive ? 'text-emerald-400' : 'text-orange-400'
            )}>
              <span className="material-symbols-outlined text-sm">
                {isPositive ? 'trending_up' : 'trending_down'}
              </span>
              {changePercentage > 0 ? '+' : ''}{changePercentage}%
            </span>
          )}
          <span className="text-xs text-brand-muted">{change}</span>
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
      value: stats ? formatCurrency(stats.income.total, 'MNT') : '₮0',
      change: t('vsLastMonthCompare'),
      changePercentage: stats?.income.changePercentage,
      icon: 'trending_up',
      color: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      title: t('statTotalExpenses'),
      value: stats ? formatCurrency(stats.expenses.total, 'MNT') : '₮0',
      change: t('vsLastMonthCompare'),
      changePercentage: stats?.expenses.changePercentage,
      icon: 'trending_down',
      color: 'bg-orange-500/10 text-orange-400'
    },
    {
      title: t('statSavings'),
      value: stats ? formatCurrency(stats.savings.total, 'MNT') : '₮0',
      change: `${stats?.savings.rate ? formatPercentage(stats.savings.rate) : '0%'} ${t('savingsRateSuffix')}`,
      icon: 'savings',
      color: 'bg-blue-500/10 text-blue-400'
    },
    {
      title: t('statInvestments'),
      value: stats ? formatCurrency(stats.investments.total, 'MNT') : '₮0',
      change: `${stats?.investments.returnPercentage ? formatPercentage(stats.investments.returnPercentage) : '0%'} ${t('investmentReturnSuffix')}`,
      changePercentage: stats?.investments.returnPercentage,
      icon: 'show_chart',
      color: 'bg-purple-500/10 text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} loading={loading} />
      ))}
    </div>
  );
}