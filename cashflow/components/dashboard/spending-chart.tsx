'use client';

import { useState } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
// import { useDashboardData } from '@/hook/use-dashboard-data';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';

export function SpendingChart() {
  const { spendingData, loading } = useDashboardData();
  const { language } = useDashboard();
  const t = useTranslation(language);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/5 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-8 w-8 bg-white/5 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded w-20 mb-1"></div>
                  <div className="h-2 bg-white/5 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = spendingData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white">{t('spendingBreakdownTitle')}</h3>
        <span className="text-xs text-brand-muted">
          {formatCurrency(totalSpent, 'MNT')} {t('totalSpentSuffix')}
        </span>
      </div>

      <div className="space-y-4">
        {spendingData.map((item) => {
          const isSelected = selectedCategory === item.category;
          const percentage = (item.amount / totalSpent) * 100;

          return (
            <div
              key={item.category}
              className={cn(
                "group cursor-pointer transition-all",
                isSelected && "scale-105"
              )}
              onMouseEnter={() => setSelectedCategory(item.category)}
              onMouseLeave={() => setSelectedCategory(null)}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-xs font-medium text-brand-muted group-hover:text-white
                 transition-colors">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-white">
                  {formatCurrency(item.amount, 'MNT')}
                </span>
                <span className="text-[10px] text-brand-muted">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {spendingData.map((item, index) => {
                const percentage = (item.amount / totalSpent) * 100;
                const startAngle = spendingData
                  .slice(0, index)
                  .reduce((sum, i) => sum + (i.amount / totalSpent) * 360, 0);
                const endAngle = startAngle + (percentage / 100) * 360;

                const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

                const largeArcFlag = percentage > 50 ? 1 : 0;

                return (
                  <path
                    key={item.category}
                    d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                    fill={item.color}
                    opacity={selectedCategory ? (selectedCategory === item.category ? 1 : 0.3) : 0.8}
                    className="transition-opacity cursor-pointer"
                    onMouseEnter={() => setSelectedCategory(item.category)}
                    onMouseLeave={() => setSelectedCategory(null)}
                  />
                );
              })}
              <circle cx="50" cy="50" r="0" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}