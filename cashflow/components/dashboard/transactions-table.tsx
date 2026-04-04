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
      <div className="overflow-hidden rounded-[1.15rem] border border-white/5 bg-brand-card sm:rounded-2xl">
        <div className="p-3.5 sm:p-6">
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
    <div className="overflow-hidden rounded-[1.15rem] border border-white/5 bg-brand-card sm:rounded-2xl">
      <div className="p-3.5 sm:p-6">

        {/* ── Header ── */}
        <div className="mb-3 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="min-w-0 shrink text-[0.8125rem] font-semibold leading-snug tracking-tight text-white sm:text-lg sm:font-bold">
            {t('recentTransactions')}
          </h3>

          <div className="flex w-full justify-end sm:w-auto">
            <div className="inline-flex w-fit shrink-0 rounded-lg bg-brand-bg p-0.5 sm:p-1">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => { setFilter(type); setExpanded(false); }}
                className={cn(
                  'rounded-md px-2 py-1 text-[9px] font-medium transition-all sm:px-3 sm:py-1.5 sm:text-xs',
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
                className="group flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-white/5 sm:gap-4 sm:p-3"
              >
                {/* Icon */}
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] sm:h-10 sm:w-10 sm:rounded-xl",
                  tx.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-orange-500/10 text-orange-400'
                )}>
                  <span className="material-symbols-outlined text-[15px] sm:text-lg">
                    {tx.type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="truncate text-[11px] font-medium leading-tight text-white sm:text-sm">
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
                  <p className="truncate text-[9px] leading-tight text-brand-muted sm:text-xs">
                    {tx.category}
                    <span className="hidden sm:inline"> • {tx.account}</span>
                  </p>
                </div>

                {/* Amount + date */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-[11px] font-bold leading-tight tabular-nums sm:text-sm",
                    tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, 'MNT')}
                  </p>
                  <p className="mt-0.5 text-[9px] leading-tight text-brand-muted sm:text-xs">
                    {formatDate(tx.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Show more / collapse ── */}
        {hasMore && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="mt-2 flex w-full items-center justify-center gap-1 py-2 text-[10px] font-bold text-brand-primary transition-colors hover:text-white sm:mt-4 sm:text-xs"
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