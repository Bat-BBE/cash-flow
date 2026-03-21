// components/transactions/transaction-stats.tsx
'use client';

import { cn, formatCurrency } from '@/lib/utils';

interface TransactionStatsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function TransactionStats({ totalIncome, totalExpenses, balance }: TransactionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-[#2b3550] border border-slate-700/50 p-5 rounded-xl">
        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Total Income</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-emerald-400">
            {formatCurrency(totalIncome, 'USD')}
          </h3>
          <span className="text-xs text-slate-500">this period</span>
        </div>
      </div>
      
      <div className="bg-[#2b3550] border border-slate-700/50 p-5 rounded-xl">
        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Total Expenses</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-white">
            {formatCurrency(totalExpenses, 'USD')}
          </h3>
          <span className="text-xs text-slate-500">this period</span>
        </div>
      </div>
      
      <div className="bg-[#2b3550] border border-slate-700/50 p-5 rounded-xl">
        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Balance</p>
        <div className="flex items-baseline gap-2">
          <h3 className={cn(
            "text-2xl font-bold",
            balance >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {formatCurrency(balance, 'USD')}
          </h3>
          <span className="text-xs text-slate-500">net</span>
        </div>
      </div>
    </div>
  );
}