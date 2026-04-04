// components/scheduled/liquidity-chart.tsx
'use client';

import { useState } from 'react';
import { LiquidityProjection, MonthlySummary } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LiquidityChartProps {
  projections: LiquidityProjection[];
  summary: MonthlySummary | null;
}

export function LiquidityChart({ projections, summary }: LiquidityChartProps) {
  const [hoveredDay, setHoveredDay] = useState<LiquidityProjection | null>(null);

  if (!summary) return null;

  const maxBalance = Math.max(
    ...projections.map(p => Math.max(p.projectedBalance, p.currentBalance))
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/75 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-lg sm:p-8">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">30-Day Liquidity Projection</h3>
          <p className="text-sm text-slate-400 mt-1">
            Daily balance forecast including all scheduled transactions.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="size-3 rounded-full bg-secondary shadow-[0_0_12px_rgba(45,212,191,0.5)]"></div>
            <span className="text-xs font-semibold text-slate-400">Projected Balance</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-3 rounded-full bg-primary/60 shadow-[0_0_12px_rgba(109,91,255,0.3)]"></div>
            <span className="text-xs font-semibold text-slate-400">Current Balance</span>
          </div>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="h-72 flex items-end justify-between gap-1.5 sm:gap-3 px-2 relative">
        {projections.slice(0, 30).map((proj, index) => {
          const projectedHeight = (proj.projectedBalance / maxBalance) * 100;
          const currentHeight = (proj.currentBalance / maxBalance) * 100;
          const isPayday = proj.dayOfMonth === 5 || proj.dayOfMonth === 16;
          const isSignificant = proj.dayOfMonth === 5 || proj.dayOfMonth === 12 || proj.dayOfMonth === 16;

          return (
            <div
              key={proj.date}
              className="flex flex-col items-center flex-1 group"
              onMouseEnter={() => setHoveredDay(proj)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className="relative w-full">
                {/* Current balance bar */}
                <div 
                  className={cn(
                    "w-full bg-primary/10 hover:bg-primary/20 rounded-t-lg transition-all relative",
                    isSignificant && "bg-primary/20"
                  )}
                  style={{ height: `${currentHeight}%` }}
                >
                  <div 
                    className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg transition-all group-hover:bg-primary/60"
                    style={{ height: `${(proj.currentBalance / maxBalance) * 100}%` }}
                  />
                </div>

                {/* Projected balance indicator */}
                <div 
                  className={cn(
                    "absolute -top-1 left-0 right-0 h-1 rounded-full transition-all",
                    isPayday 
                      ? 'bg-secondary shadow-[0_0_10px_rgba(45,212,191,0.5)]' 
                      : 'bg-secondary/30'
                  )}
                  style={{ top: `${100 - projectedHeight}%` }}
                />

                {/* Tooltip */}
                {hoveredDay?.date === proj.date && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1e2533] border border-white/10 rounded-lg p-2 text-xs whitespace-nowrap z-10">
                    <p className="text-slate-400 mb-1">
                      {new Date(proj.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-secondary font-bold">
                      Projected: {formatCurrency(proj.projectedBalance, 'USD')}
                    </p>
                    <p className="text-primary font-bold">
                      Current: {formatCurrency(proj.currentBalance, 'USD')}
                    </p>
                  </div>
                )}
              </div>

              {/* Date label */}
              <span className={cn(
                "text-[9px] mt-3 font-bold transition-colors",
                isSignificant ? 'text-secondary' : 'text-slate-600 group-hover:text-slate-400'
              )}>
                {index === 0 ? 'Oct 01' : proj.dayOfMonth.toString().padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="mt-12 grid grid-cols-2 gap-6 rounded-2xl border border-white/5 bg-brand-bg/50 p-6 sm:grid-cols-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Starting Balance
          </p>
          <p className="text-2xl font-black text-slate-200">
            {formatCurrency(summary.startingBalance, 'USD')}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Est. End Balance
          </p>
          <p className="text-2xl font-black text-secondary">
            {formatCurrency(summary.endingBalance, 'USD')}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Total Scheduled Out
          </p>
          <p className="text-2xl font-black text-red-400">
            -{formatCurrency(summary.totalOutgoing, 'USD')}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Net Liquidity Change
          </p>
          <p className="text-2xl font-black text-primary">
            {summary.netChange > 0 ? '+' : ''}{formatCurrency(summary.netChange, 'USD')}
          </p>
        </div>
      </div>
    </div>
  );
}