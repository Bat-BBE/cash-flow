'use client';

import { Transaction, CATEGORY_COLORS } from './types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TransactionDetailsPanelProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionDetailsPanel({
  transaction,
  open,
  onClose,
  onDelete,
  onEdit,
}: TransactionDetailsPanelProps) {
  if (!transaction) return null;

  const getAmountColor = (type: string) => {
    if (type === 'income') return 'text-emerald-400';
    if (type === 'expense') return 'text-white';
    return 'text-blue-400';
  };

  const getAmountPrefix = (type: string) => {
    if (type === 'income') return '+';
    if (type === 'expense') return '-';
    return '';
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-96 bg-[#1e2533] border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col",
        open ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-lg font-bold text-white">Transaction Details</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Icon & Amount */}
        <div className="flex flex-col items-center text-center space-y-2 py-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-2",
            transaction.type === 'income' ? 'bg-emerald-500/10' :
            transaction.type === 'expense' ? 'bg-orange-500/10' : 'bg-blue-500/10'
          )}>
            <span className={cn(
              "material-symbols-outlined text-4xl",
              transaction.type === 'income' ? 'text-emerald-400' :
              transaction.type === 'expense' ? 'text-orange-400' : 'text-blue-400'
            )}>
              {transaction.type === 'income' ? 'trending_up' :
               transaction.type === 'expense' ? 'trending_down' : 'swap_horiz'}
            </span>
          </div>
          <h4 className={cn(
            "text-2xl font-bold",
            getAmountColor(transaction.type)
          )}>
            {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount, 'USD')}
          </h4>
          <p className="text-slate-400 text-sm">{transaction.description}</p>
          {transaction.merchant && (
            <p className="text-xs text-slate-500">{transaction.merchant}</p>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-4 bg-black/20 rounded-xl p-4">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-xs text-slate-500 uppercase">Status</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-bold",
                transaction.status === 'completed' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                transaction.status === 'pending' && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                transaction.status === 'failed' && 'bg-red-500/10 text-red-400 border-red-500/20',
              )}
            >
              {transaction.status || 'Completed'}
            </Badge>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-xs text-slate-500 uppercase">Date</span>
            <span className="text-sm text-slate-200">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-xs text-slate-500 uppercase">Category</span>
            <span className={cn(
              "px-2 py-1 rounded text-[10px] font-bold uppercase",
              CATEGORY_COLORS[transaction.category] || 'bg-slate-500/10 text-slate-400'
            )}>
              {transaction.category}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-xs text-slate-500 uppercase">Account</span>
            <span className="text-sm text-slate-200">{transaction.account}</span>
          </div>

          {transaction.location && (
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-xs text-slate-500 uppercase">Location</span>
              <span className="text-sm text-slate-200">{transaction.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/5 bg-black/10 flex gap-3">
        <Button
          variant="ghost"
          onClick={() => onDelete(transaction.id)}
          className="flex-1 py-2.5 bg-white/5 text-red-400 border border-white/10 text-sm font-bold hover:bg-red-500/10 hover:text-red-300"
        >
          Delete
        </Button>
        <Button
          onClick={() => onEdit(transaction)}
          className="flex-1 py-2.5 bg-primary text-white text-sm font-bold hover:brightness-110"
        >
          Edit
        </Button>
      </div>
    </div>
  );
}