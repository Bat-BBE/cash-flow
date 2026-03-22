'use client';

import { useState } from 'react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';

const PREVIEW_COUNT = 5;
const EXPANDED_COUNT = 25;

const STATUS_LABELS: Record<string, string> = {
  completed: 'Дууссан',
  pending:   'Хүлээгдэж буй',
  failed:    'Амжилтгүй',
};

export function TransactionsTable() {
  const { transactions, loading } = useDashboardData();
  const { language } = useDashboard();
  const t = useTranslation(language);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [expanded, setExpanded] = useState(false);

  const filteredTransactions = transactions.filter(tx =>
    filter === 'all' ? true : tx.type === filter
  );

  const visibleTransactions = expanded
    ? filteredTransactions.slice(0, EXPANDED_COUNT)
    : filteredTransactions.slice(0, PREVIEW_COUNT);

  const hasMore = filteredTransactions.length > PREVIEW_COUNT;

  const visibleTransactions = expanded
    ? filteredTransactions.slice(0, EXPANDED_COUNT)
    : filteredTransactions.slice(0, PREVIEW_COUNT);

  const hasMore = filteredTransactions.length > PREVIEW_COUNT;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'pending':   return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':    return 'text-red-400 bg-red-400/10';
      default:          return 'text-brand-muted bg-white/5';
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-5 bg-white/5 rounded w-28 mb-4" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-white/5 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 bg-white/5 rounded w-32 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-20" />
                </div>
                <div className="text-right shrink-0">
                  <div className="h-3.5 bg-white/5 rounded w-16 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 sm:p-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h3 className="text-sm sm:text-lg font-bold text-white shrink-0">
            {t('recentTransactions')}
          </h3>

          <div className="flex bg-brand-bg p-0.5 sm:p-1 rounded-lg">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setFilter(type); setExpanded(false); }}
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all",
                  filter === type
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-muted hover:text-white'
                )}
              >
                {type === 'all'
                  ? t('all')
                  : type === 'income'
                    ? t('income')
                    : t('expensesFilter')}
              </button>
            ))}
          </div>
        </div>

        {/* ── List ── */}
        <div className="space-y-0.5">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-brand-muted mb-2 block">
                receipt_long
              </span>
              <p className="text-sm text-brand-muted">{t('noTransactionsFound')}</p>
            </div>
          ) : (
            visibleTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                {/* Icon */}
                <div className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0",
                  tx.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-orange-500/10 text-orange-400'
                )}>
                  <span className="material-symbols-outlined text-base sm:text-lg">
                    {tx.type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-medium text-xs sm:text-sm text-white truncate leading-tight">
                      {tx.name}
                    </p>
                    {tx.status && (
                      <span className={cn(
                        "hidden sm:inline-block text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold shrink-0",
                        getStatusColor(tx.status)
                      )}>
                        {STATUS_LABELS[tx.status] ?? tx.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-brand-muted truncate leading-tight">
                    {tx.category}
                    <span className="hidden sm:inline"> • {tx.account}</span>
                  </p>
                </div>

                {/* Amount + date */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-xs sm:text-sm font-bold leading-tight",
                    tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, 'MNT')}
                  </p>
                  <p className="text-[10px] sm:text-xs text-brand-muted mt-0.5 leading-tight">
                    {formatDate(tx.date)}
                  </p>
                  <p className="text-xs text-brand-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Show more / collapse ── */}
        {hasMore && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="w-full mt-3 sm:mt-4 py-2 text-xs font-bold text-brand-primary hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">
              {expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
            {expanded
              ? 'Хаах'
              : `${t('viewAllTransactions')} (${Math.min(filteredTransactions.length, EXPANDED_COUNT)})`}
          </button>
        )}

      </div>
    </div>
  );
}