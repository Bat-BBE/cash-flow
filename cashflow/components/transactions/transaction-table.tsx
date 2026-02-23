// components/transactions/transaction-table.tsx
'use client';

import { Transaction, CATEGORY_COLORS } from './types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
  loading?: boolean;
}

export function TransactionTable({ 
  transactions, 
  onSelectTransaction,
  loading 
}: TransactionTableProps) {
  
  const getAmountColor = (type: string, amount: number) => {
    if (type === 'income') return 'text-emerald-400';
    if (type === 'expense') return 'text-white';
    return 'text-blue-400';
  };

  const getAmountPrefix = (type: string) => {
    if (type === 'income') return '+';
    if (type === 'expense') return '-';
    return '';
  };

  if (loading) {
    return (
      <div className="border border-white/5 rounded-xl overflow-hidden bg-[#2b3550]">
        <div className="animate-pulse">
          <div className="bg-white/5 p-4">
            <div className="h-4 bg-white/10 rounded w-32"></div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white/10 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-24"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-[#2b3550] shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Account</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                <p>No transactions found</p>
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    CATEGORY_COLORS[tx.category] || 'bg-slate-500/10 text-slate-400'
                  )}>
                    {tx.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">{tx.account}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{tx.description}</span>
                    {tx.merchant && (
                      <span className="text-xs text-slate-500">{tx.merchant}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "font-bold",
                      getAmountColor(tx.type, tx.amount)
                    )}>
                      {getAmountPrefix(tx.type)}{formatCurrency(tx.amount, 'USD')}
                    </span>
                    {tx.status && tx.status !== 'completed' && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[8px] mt-1",
                          tx.status === 'pending' && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                          tx.status === 'failed' && 'bg-red-500/10 text-red-400 border-red-500/20',
                        )}
                      >
                        {tx.status}
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}