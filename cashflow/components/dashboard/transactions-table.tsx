'use client';

import { useState } from 'react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useDashboardData } from '@/hook/use-dashboard-data';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';

export function TransactionsTable() {
  const { transactions, loading } = useDashboardData();
  const { language } = useDashboard();
  const t = useTranslation(language);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-brand-muted bg-white/5';
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-white/5 rounded w-32 mb-4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="h-10 w-10 bg-white/5 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-16"></div>
                </div>
                <div className="h-4 bg-white/5 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">{t('recentTransactions')}</h3>
          
          <div className="flex bg-brand-bg p-1 rounded-lg">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium capitalize rounded-md transition-all",
                  filter === type
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-muted hover:text-white'
                )}
              >
                {type === 'all' ? t('all') : type === 'income' ? t('income') : t('expensesFilter')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-brand-muted mb-2">
                receipt_long
              </span>
              <p className="text-sm text-brand-muted">{t('noTransactionsFound')}</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  tx.type === 'income' 
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-orange-500/10 text-orange-400'
                )}>
                  <span className="material-symbols-outlined text-lg">
                    {tx.type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-white truncate">
                      {tx.name}
                    </p>
                    {tx.status && (
                      <span className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold",
                        getStatusColor(tx.status)
                      )}>
                        {tx.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted">
                    {tx.category} • {tx.account}
                  </p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {tx.type === 'income' ? '+ ' : '- ' }{formatCurrency(tx.amount, 'MNT')}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {formatDate(tx.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredTransactions.length > 0 && (
          <button className="w-full mt-4 py-2 text-xs font-bold text-brand-primary hover:text-white transition-colors">
            {t('viewAllTransactions')}
          </button>
        )}
      </div>
    </div>
  );
}