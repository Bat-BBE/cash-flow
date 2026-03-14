// components/analytics/analytics-chart.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Transaction } from './type';

interface ChartBarProps {
  month: string;
  income: number;
  expense: number;
  savings: number;
  maxValue: number;
  isActive?: boolean;
}

function ChartBar({ month, income, expense, savings, maxValue, isActive }: ChartBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const maxHeight = 200;
  const incomeHeight = (income / maxValue) * maxHeight;
  const expenseHeight = (expense / maxValue) * maxHeight;
  const savingsHeight = (Math.abs(savings) / maxValue) * maxHeight;

  return (
    <div 
      className="flex-1 flex flex-col items-center group relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white text-[#151b2b] p-3 rounded-xl text-xs font-bold whitespace-nowrap shadow-2xl z-20">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase text-slate-500 font-black border-b border-slate-200 pb-1">
              {month} Analysis
            </span>
            <div className="flex justify-between gap-6">
              <span>Income:</span>
              <span className="text-success font-black">${income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span>Expense:</span>
              <span className="text-primary font-black">${expense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-6 pt-1 border-t border-slate-200">
              <span>Savings:</span>
              <span className={savings >= 0 ? 'text-success' : 'text-red-400'}>
                ${savings.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
        </div>
      )}

      <div className="w-full flex items-end justify-center gap-1 h-[200px]">
        <div 
          className="w-5 bg-success/30 rounded-t-lg transition-all group-hover:bg-success/50 cursor-pointer"
          style={{ height: `${incomeHeight}px` }}
        />
        <div 
          className="w-5 bg-primary/30 rounded-t-lg transition-all group-hover:bg-primary/50 cursor-pointer"
          style={{ height: `${expenseHeight}px` }}
        />
        <div 
          className={cn(
            "w-5 rounded-t-lg transition-all cursor-pointer",
            savings >= 0 
              ? 'bg-emerald-500/30 group-hover:bg-emerald-500/50' 
              : 'bg-red-500/30 group-hover:bg-red-500/50'
          )}
          style={{ height: `${savingsHeight}px` }}
        />
      </div>
      
      <span className={cn(
        "text-[10px] font-bold mt-3",
        isActive ? 'text-white' : 'text-white/60'
      )}>
        {month}
      </span>

      {isActive && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <span className="size-1.5 rounded-full bg-success"></span>
          <span className="size-1.5 rounded-full bg-primary"></span>
          <span className="size-1.5 rounded-full bg-emerald-500"></span>
        </div>
      )}
    </div>
  );
}

interface AnalyticsChartProps {
  data: Transaction[];
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: number;
  maxValue: number;
  activeMonth?: string;
}

export function AnalyticsChart({
  data,
  totalIncome,
  totalExpense,
  totalSavings,
  savingsRate,
  maxValue,
  activeMonth = 'Jun'
}: AnalyticsChartProps) {
  return (
    <div className="bg-[#2b3550] border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <div className="size-3.5 rounded-full bg-success ring-4 ring-success/20"></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Income
              </p>
              <span className="text-sm font-black text-white">
                ${(totalIncome / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-3.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Expenses
              </p>
              <span className="text-sm font-black text-white">
                ${(totalExpense / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Savings
              </p>
              <span className="text-sm font-black text-white">
                ${(totalSavings / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
            Avg. Savings Rate
          </p>
          <p className="text-3xl font-black text-success tracking-tight">
            {savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="w-full relative flex items-end justify-between gap-2 px-2 min-h-[100px]">
        {data.map((item) => (
          <ChartBar
            key={item.id}
            month={item.month}
            income={item.income}
            expense={item.expense}
            savings={item.savings}
            maxValue={maxValue}
            isActive={item.month === activeMonth}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-sm bg-success/50"></div>
          <span className="text-[10px] text-slate-400">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-sm bg-primary/50"></div>
          <span className="text-[10px] text-slate-400">Expenses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-sm bg-emerald-500/50"></div>
          <span className="text-[10px] text-slate-400">Net Savings</span>
        </div>
      </div>
    </div>
  );
}