// components/accounts/account-activity.tsx
'use client';

import { useState, useEffect } from 'react';
import { Transaction } from './types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAccountData } from '@/hook/use-account-data';

interface AccountActivityProps {
  accountId: string;
  limit?: number;
  showFilters?: boolean;
}

type FilterType = 'all' | 'income' | 'expense' | 'transfer';
type SortType = 'newest' | 'oldest' | 'highest' | 'lowest';

export function AccountActivity({ 
  accountId, 
  limit = 10,
  showFilters = true 
}: AccountActivityProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      // Mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          name: 'Interest Payment',
          date: '2024-02-12',
          amount: 152400,
          type: 'income',
          icon: 'trending_up',
          category: 'INVESTMENT',
          description: 'Monthly interest accrued',
          accountId
        },
        {
          id: '2',
          name: 'Transfer from Checking',
          date: '2024-02-10',
          amount: 1000000,
          type: 'income',
          icon: 'sync_alt',
          category: 'TRANSFER',
          description: 'Automatic savings transfer',
          accountId
        },
        {
          id: '3',
          name: 'Wealth Settlement',
          date: '2024-02-08',
          amount: 2500000,
          type: 'expense',
          icon: 'account_balance_wallet',
          category: 'SAVINGS',
          description: 'Quarterly investment',
          accountId
        },
        {
          id: '4',
          name: 'Groceries',
          date: '2024-02-07',
          amount: 245000,
          type: 'expense',
          icon: 'shopping_cart',
          category: 'SHOPPING',
          description: 'Weekly groceries',
          accountId
        },
        {
          id: '5',
          name: 'Salary Deposit',
          date: '2024-02-05',
          amount: 5200000,
          type: 'income',
          icon: 'payments',
          category: 'INCOME',
          description: 'Monthly salary',
          accountId
        }
      ];

      setTransactions(mockTransactions);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [accountId]);

  // Filter and sort transactions
  const filteredTransactions = transactions
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'INVESTMENT': 'text-brand-primary bg-brand-primary/10',
      'TRANSFER': 'text-blue-400 bg-blue-400/10',
      'SAVINGS': 'text-emerald-400 bg-emerald-400/10',
      'SHOPPING': 'text-amber-400 bg-amber-400/10',
      'INCOME': 'text-success bg-success/10',
      'ENTERTAINMENT': 'text-purple-400 bg-purple-400/10'
    };
    return colors[category] || 'text-brand-muted bg-white/5';
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Account Activity</h2>
        <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="animate-pulse">
            <div className="border-b border-white/5 bg-white/5 p-4">
              <div className="h-4 bg-white/5 rounded w-24"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 bg-white/5 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/5 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-white/5 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Account Activity</h2>
        {filteredTransactions.length > 0 && (
          <span className="text-[10px] text-brand-muted">
            {filteredTransactions.length} transactions
          </span>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex bg-brand-card p-1 rounded-lg border border-white/5">
            {(['all', 'income', 'expense', 'transfer'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium capitalize transition-all rounded-md",
                  filter === f
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-muted hover:text-white'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="bg-brand-card border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>

            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-xs text-brand-muted">
                search
              </span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-brand-card border border-white/5 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-brand-muted mb-2">
              receipt_long
            </span>
            <p className="text-sm text-brand-muted">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-muted uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-muted uppercase">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-brand-muted uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-brand-muted uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-brand-muted uppercase">
                    Actions
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
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center",
                          tx.type === 'income' 
                            ? 'bg-success/10 text-success'
                            : tx.type === 'expense'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-brand-primary/10 text-brand-primary'
                        )}>
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
                    <td className={cn(
                      'px-6 py-4 text-right font-bold whitespace-nowrap',
                      tx.type === 'income' ? 'text-success' : 
                      tx.type === 'expense' ? 'text-red-400' : 'text-brand-primary'
                    )}>
                      {tx.type === 'income' ? '+' : 
                       tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(Math.abs(tx.amount), 'MNT')}
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
        )}

        {/* View All Link */}
        {filteredTransactions.length > 0 && filteredTransactions.length >= limit && (
          <div className="p-4 text-center border-t border-white/5">
            <button className="text-xs font-bold text-brand-primary hover:text-white transition-colors">
              View all transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}