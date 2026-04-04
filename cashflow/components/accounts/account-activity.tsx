// components/accounts/account-activity.tsx
'use client';

import { useMemo, useState } from 'react';
import { Transaction } from './types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { DEFAULT_ACCOUNT_ID } from '@/lib/firebase';
import { isTransactionInAccountPeriod } from '@/lib/account-period';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';

interface AccountActivityProps {
  accountId: string;
  transactions: Transaction[];
  loading?: boolean;
  currency?: string;
  /** Must match AccountDetails period keys: 1W | 1M | 3M | 1Y */
  selectedPeriod?: string;
  limit?: number;
  showFilters?: boolean;
}

type FilterType = 'all' | 'income' | 'expense' | 'transfer';
type SortType = 'newest' | 'oldest' | 'highest' | 'lowest';

export function AccountActivity({ 
  accountId, 
  transactions: allTransactions,
  loading = false,
  currency = 'MNT',
  selectedPeriod = '1M',
  limit = 100,
  showFilters = true 
}: AccountActivityProps) {
  const { language } = useDashboard();
  const t = useTranslation(language);

  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [search, setSearch] = useState('');

  const transactions = useMemo(
    () =>
      allTransactions.filter(
        (t) => (t.accountId ?? DEFAULT_ACCOUNT_ID) === accountId,
      ),
    [allTransactions, accountId],
  );

  const transactionsInPeriod = useMemo(
    () =>
      transactions.filter((tx) =>
        isTransactionInAccountPeriod(tx.date, selectedPeriod),
      ),
    [transactions, selectedPeriod],
  );

  const periodIncomeTotal = useMemo(
    () =>
      transactionsInPeriod
        .filter((tx) => tx.type === 'income')
        .reduce((s, tx) => s + tx.amount, 0),
    [transactionsInPeriod],
  );

  const periodExpenseTotal = useMemo(
    () =>
      transactionsInPeriod
        .filter((tx) => tx.type === 'expense')
        .reduce((s, tx) => s + tx.amount, 0),
    [transactionsInPeriod],
  );

  // Filter and sort transactions (within selected period)
  const filteredTransactions = transactionsInPeriod
    .filter(tx => {
      if (filter !== 'all' && tx.type !== filter) return false;
      if (search) {
        return tx.name.toLowerCase().includes(search.toLowerCase()) ||
               tx.category.toLowerCase().includes(search.toLowerCase()) ||
               tx.description?.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default:
          return 0;
      }
    })
    .slice(0, limit);

  const filterLabel = (f: FilterType) => {
    switch (f) {
      case 'all':
        return t('all');
      case 'income':
        return t('income');
      case 'expense':
        return t('filterExpenseSingular');
      case 'transfer':
        return t('transfer');
      default:
        return f;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      INVESTMENT: 'text-brand-primary bg-brand-primary/10',
      TRANSFER: 'text-sky-400 bg-sky-400/10',
      SAVINGS: 'text-teal-400 bg-teal-400/10',
      SHOPPING: 'text-amber-400 bg-amber-400/10',
      INCOME: 'text-emerald-400 bg-emerald-500/12',
      ENTERTAINMENT: 'text-purple-400 bg-purple-400/10',
    };
    return colors[category] || 'text-brand-muted bg-white/5';
  };

  if (loading) {
    return (
      <div>
        <h2 className="mb-3 text-[0.8125rem] font-bold text-white sm:mb-4 sm:text-[0.9375rem] md:text-lg">{t('accountActivity')}</h2>
        <div className="overflow-hidden rounded-[1rem] border border-white/5 bg-brand-card sm:rounded-2xl">
          <div className="animate-pulse p-3 sm:p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 max-w-[12rem] rounded bg-white/5" />
                  <div className="h-3 w-20 rounded bg-white/5" />
                </div>
                <div className="h-4 w-16 rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 space-y-2.5 sm:space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[0.8125rem] font-bold leading-snug text-white sm:text-[0.9375rem] md:text-lg">{t('accountActivity')}</h2>
            {filteredTransactions.length > 0 && (
              <span className="shrink-0 text-[8px] text-white/35 sm:text-[9px] md:text-[10px] md:text-brand-muted">
                {filteredTransactions.length} {t('transactionsCountLabel')}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <div className="flex min-h-[3rem] flex-col justify-between gap-0.5 rounded-[0.65rem] border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-1.5 sm:min-h-0 sm:min-w-[200px] sm:flex-row sm:items-center sm:justify-between sm:gap-1 sm:px-3 sm:py-2.5">
              <span className="flex items-center gap-0.5 text-[8px] font-black uppercase leading-tight tracking-wider text-emerald-400/95 sm:gap-1.5 sm:text-[10px]">
                <span className="material-symbols-outlined shrink-0 text-[14px] sm:text-[16px]">trending_up</span>
                <span className="leading-tight">{t('periodSummaryIncome')}</span>
              </span>
              <span className="text-[10px] font-black tabular-nums leading-none text-emerald-300 sm:text-sm">
                +{formatCurrency(periodIncomeTotal, currency)}
              </span>
            </div>
            <div className="flex min-h-[3rem] flex-col justify-between gap-0.5 rounded-[0.65rem] border border-rose-500/25 bg-rose-500/[0.08] px-2 py-1.5 sm:min-h-0 sm:min-w-[200px] sm:flex-row sm:items-center sm:justify-between sm:gap-1 sm:px-3 sm:py-2.5">
              <span className="flex items-center gap-0.5 text-[8px] font-black uppercase leading-tight tracking-wider text-rose-400/95 sm:gap-1.5 sm:text-[10px]">
                <span className="material-symbols-outlined shrink-0 text-[14px] sm:text-[16px]">trending_down</span>
                <span className="leading-tight">{t('periodSummaryExpense')}</span>
              </span>
              <span className="text-[10px] font-black tabular-nums leading-none text-rose-300 sm:text-sm">
                −{formatCurrency(periodExpenseTotal, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-3 space-y-2 sm:mb-4">
          <div className="-mx-0.5 flex overflow-x-auto pb-0.5 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex shrink-0 rounded-[0.65rem] border border-white/5 bg-black/30 p-0.5 sm:rounded-lg">
              {(['all', 'income', 'expense', 'transfer'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'shrink-0 rounded-md px-1.5 py-1 text-[9px] font-semibold transition-all sm:px-3 sm:py-1.5 sm:text-xs',
                    filter === f
                      ? 'bg-brand-primary text-white'
                      : 'text-brand-muted hover:text-white',
                  )}
                >
                  {filterLabel(f)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="w-full rounded-lg border border-white/5 bg-brand-card px-2.5 py-1.5 text-[10px] text-white sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs"
            >
              <option value="newest">{t('sortNewestFirst')}</option>
              <option value="oldest">{t('sortOldestFirst')}</option>
              <option value="highest">{t('sortHighestAmount')}</option>
              <option value="lowest">{t('sortLowestAmount')}</option>
            </select>

            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[13px] text-brand-muted sm:left-2.5 sm:text-[14px]">
                search
              </span>
              <input
                type="search"
                placeholder={t('searchTransactionsPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/5 bg-brand-card py-1.5 pl-7 pr-2.5 text-[10px] text-white placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-primary sm:py-1.5 sm:pl-8 sm:pr-3 sm:text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions: mobile cards — desktop table */}
      <div className="overflow-hidden rounded-[1rem] border border-white/5 bg-brand-card sm:rounded-2xl">
        {filteredTransactions.length === 0 ? (
          <div className="px-4 py-10 text-center sm:py-12">
            <span className="material-symbols-outlined mb-2 block text-3xl text-brand-muted sm:text-4xl">
              receipt_long
            </span>
            <p className="text-[12px] text-brand-muted sm:text-sm">{t('noTransactionsFound')}</p>
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <ul className="divide-y divide-white/[0.06]">
                {filteredTransactions.map((tx) => (
                  <li key={tx.id}>
                    <div className="flex items-center gap-2 px-2.5 py-2 active:bg-white/[0.03] sm:gap-2.5 sm:px-3 sm:py-2.5">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] sm:h-9 sm:w-9',
                          tx.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : tx.type === 'expense'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-brand-primary/10 text-brand-primary',
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{tx.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold leading-tight text-white sm:text-[12px]">{tx.name}</p>
                        <p className="mt-0.5 truncate text-[9px] text-white/38 sm:text-[10px]">
                          {formatDate(tx.date)}
                          <span className="text-white/22"> · </span>
                          <span className={cn('inline rounded px-0.5 py-0.5 text-[8px] font-bold sm:px-1 sm:text-[9px]', getCategoryColor(tx.category))}>
                            {tx.category}
                          </span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={cn(
                            'text-[11px] font-bold tabular-nums leading-tight sm:text-[12px]',
                            tx.type === 'income'
                              ? 'text-emerald-400'
                              : tx.type === 'expense'
                                ? 'text-rose-400'
                                : 'text-brand-primary',
                          )}
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
                          {formatCurrency(Math.abs(tx.amount), currency)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-muted uppercase">
                    {t('date')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-muted uppercase">
                    {t('transaction')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-muted uppercase">
                    {t('category')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-brand-muted uppercase">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-brand-muted uppercase">
                    {t('actionsColumn')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-brand-muted whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-xl',
                            tx.type === 'income'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : tx.type === 'expense'
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-brand-primary/10 text-brand-primary',
                          )}
                        >
                          <span className="material-symbols-outlined text-xl">{tx.icon}</span>
                        </div>
                        <div>
                          <span className="font-medium text-sm text-white block">
                            {tx.name}
                          </span>
                          {tx.description && (
                            <span className="text-[10px] text-brand-muted">
                              {tx.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-bold",
                        getCategoryColor(tx.category)
                      )}>
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'px-6 py-4 text-right text-[15px] font-black tabular-nums whitespace-nowrap',
                        tx.type === 'income'
                          ? 'text-emerald-400'
                          : tx.type === 'expense'
                            ? 'text-rose-400'
                            : 'text-brand-primary',
                      )}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
                      {formatCurrency(Math.abs(tx.amount), currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-muted hover:text-white">
                        <span className="material-symbols-outlined text-sm">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}

        {filteredTransactions.length > 0 && filteredTransactions.length >= limit && (
          <div className="border-t border-white/5 p-3 text-center sm:p-4">
            <button type="button" className="text-[11px] font-bold text-brand-primary transition-colors hover:text-white sm:text-xs">
              {t('viewAllTransactions')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}