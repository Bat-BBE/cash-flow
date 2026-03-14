'use client';

import { useState } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDashboardData } from '@/hook/use-dashboard-data';

export function TrendChart() {
  const { trendData, loading } = useDashboardData();
  const [selectedMetric, setSelectedMetric] = useState<'income' | 'expenses' | 'savings'>('savings');

  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/5 rounded w-32 mb-4"></div>
          <div className="h-40 bg-white/5 rounded mb-4"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-white/5 rounded flex-1"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...trendData.map(d => Math.max(d.income, d.expenses, d.savings))
  );

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'income': return 'text-emerald-400';
      case 'expenses': return 'text-red-400';
      case 'savings': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  const getMetricBarColor = (metric: string) => {
    switch (metric) {
      case 'income': return 'bg-emerald-500';
      case 'expenses': return 'bg-red-500';
      case 'savings': return 'bg-blue-500';
      default: return 'bg-brand-primary';
    }
  };

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white">6-Month Trend</h3>
        
        <div className="flex bg-brand-bg p-1 rounded-lg">
          {(['income', 'expenses', 'savings'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize rounded-md transition-all",
                selectedMetric === metric
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:text-white'
              )}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      <div className="h-40 flex items-end justify-between gap-2 mb-6">
        {trendData.map((data, index) => {
          const value = data[selectedMetric];
          const height = (value / maxValue) * 100;
          
          return (
            <div key={data.month} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80",
                    getMetricBarColor(selectedMetric)
                  )}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-white text-[#151b2b] px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">
                    {formatCurrency(value, 'MNT')}
                  </div>
                </div>
              </div>
              
              <span className="text-[10px] text-brand-muted mt-2 group-hover:text-white transition-colors">
                {data.month}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-brand-muted">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[10px] text-brand-muted">Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] text-brand-muted">Savings</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-brand-muted">Avg.</span>
          <span className={cn(
            "text-xs font-bold",
            getMetricColor(selectedMetric)
          )}>
            {formatCurrency(
              trendData.reduce((sum, d) => sum + d[selectedMetric], 0) / trendData.length,
              'MNT'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}