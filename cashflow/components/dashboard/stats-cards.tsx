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
      <div className="bg-brand-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/5 flex-1">
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
    <div className="bg-brand-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/5 hover:border-white/10 transition-all group flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <p className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider group-hover:text-white transition-colors leading-tight truncate pr-2">
          {title}
        </p>
        <span className={cn("material-symbols-outlined p-1.5 sm:p-2 rounded-lg text-base sm:text-lg shrink-0", color)}>
          {icon}
        </span>
      </div>

      <p className="text-base sm:text-xl font-black text-white mb-1 truncate">{value}</p>

      {change && (
        <div className="flex items-center gap-1 flex-wrap">
          {changePercentage !== undefined && (
            <span className={cn(
              "text-[10px] sm:text-xs font-bold flex items-center gap-0.5",
              isPositive ? 'text-emerald-400' : 'text-orange-400'
            )}>
              <span className="material-symbols-outlined text-xs">
                {isPositive ? 'trending_up' : 'trending_down'}
              </span>
              {changePercentage > 0 ? '+' : ''}{changePercentage}%
            </span>
          )}
          <span className="text-[10px] sm:text-xs text-brand-muted">{change}</span>
        </div>
      )}
    </div>
  );
}

export function StatsCards() {
  const { stats, loading, months, rawTxs } = useDashboardData();
  const { language } = useDashboard();
  const t = useTranslation(language);

  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const filtered = rawTxs.filter(tx => new Date(tx.date) >= cutoff);
  const totalIncome   = Math.round(filtered.reduce((s, t) => s + t.credit, 0));
  const totalExpenses = Math.round(filtered.reduce((s, t) => s + Math.abs(t.debit), 0));

  const prevCutoff = new Date(now.getFullYear(), now.getMonth() - months * 2 + 1, 1);
  const prevPeriod = rawTxs.filter(tx => {
    const d = new Date(tx.date);
    return d >= prevCutoff && d < cutoff;
  });
  const prevIncome   = Math.round(prevPeriod.reduce((s, t) => s + t.credit, 0));
  const prevExpenses = Math.round(prevPeriod.reduce((s, t) => s + Math.abs(t.debit), 0));

  const pct = (cur: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 1000) / 10;

  const cards = [
    {
      title: t('statTotalIncome'),
      value: stats ? formatCurrency(totalIncome, 'MNT') : '0 ₮',
      change: t('vsLastMonthCompare'),
      changePercentage: pct(totalIncome, prevIncome),
      icon: 'trending_up',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: t('statTotalExpenses'),
      value: stats ? formatCurrency(totalExpenses, 'MNT') : '0 ₮',
      change: t('vsLastMonthCompare'),
      changePercentage: pct(totalExpenses, prevExpenses),
      icon: 'trending_down',
      color: 'bg-orange-500/10 text-orange-400',
    },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 w-full">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} loading={loading} />
      ))}
    </div>
  );
}