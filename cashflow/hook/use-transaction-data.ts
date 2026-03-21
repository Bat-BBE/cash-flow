'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db, BASE_PATH, DEFAULT_ACCOUNT_ID } from '@/lib/firebase';
import { accountLabelForId } from '@/lib/account-labels';
import { Transaction, TransactionFilter } from '@/components/transactions/types';

/* ─── Raw Firebase tx ─────────────────────────────────────────────── */
type RawTx = {
  date:           string;
  debit:          number;
  credit:         number;
  closingBalance: number | null;
  description:    string;
  category:       string;
  merchant:       string | null;
  counterAccount: string | null;
  accountId:      string;
  type:           'income' | 'expense';
};

/* ─── Constants ───────────────────────────────────────────────────── */
export const ACCOUNTS   = ['Залуусын харилцах', 'Бэлэн мөнгөний хэтэвч', 'Хадгаламжийн данс', 'Кредит карт'];
export const CATEGORIES = [
  'Дэлгүүр','Хоол хүнс','Тоон үйлчилгээ','ATM авалт','Интернет',
  'Цахилгаан/Дулаан','Гар утас','Цалин','Гэр бүлийн дэмжлэг',
  'Үйлчилгээний хураамж','Шилжүүлэг','Эрүүл мэнд','Боловсрол','Бусад орлого',
];

/* ─── Hook ───────────────────────────────────────────────────────── */
export function useTransactionData() {
  const [allTxs,      setAllTxs]      = useState<Transaction[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState<Transaction | null>(null);
  const [showAddModal,     setShowAddModal]     = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // Filters
  const [dateRange,          setDateRange]          = useState('month');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAccounts,   setSelectedAccounts]   = useState<string[]>([]);
  const [searchQuery,        setSearchQuery]        = useState('');

  /* ── Fetch ── */
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await get(ref(db, `${BASE_PATH}/transactions`));
      if (!snap.exists()) { setLoading(false); return; }

      const raw: Record<string, RawTx> = snap.val();
      const list: Transaction[] = Object.entries(raw)
        .filter(([, t]) => t.date && t.date !== 'Нийт дүн:')
        .map(([id, t]) => ({
          id,
          date:        t.date.split(' ')[0],
          category:    t.category || (t.debit !== 0 ? 'Бусад зарлага' : 'Бусад орлого'),
          account:     accountLabelForId(t.accountId ?? DEFAULT_ACCOUNT_ID),
          description: t.description || '—',
          amount:      Math.abs(t.debit !== 0 ? t.debit : t.credit),
          type:        t.type ?? (t.debit !== 0 ? 'expense' : 'income'),
          status:      'completed' as const,
          merchant:    t.merchant ?? undefined,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAllTxs(list);
    } catch (err) {
      console.error('[useTransactionData]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  /* ── Apply filters ── */
  const filteredTransactions = (() => {
    let list = [...allTxs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.merchant?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) list = list.filter((t) => selectedCategories.includes(t.category));
    if (selectedAccounts.length > 0)   list = list.filter((t) => selectedAccounts.includes(t.account));

    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateRange === 'today') {
      list = list.filter((t) => new Date(t.date) >= today);
    } else if (dateRange === 'week') {
      const cut = new Date(today); cut.setDate(cut.getDate() - 7);
      list = list.filter((t) => new Date(t.date) >= cut);
    } else if (dateRange === 'month') {
      const cut = new Date(today); cut.setMonth(cut.getMonth() - 1);
      list = list.filter((t) => new Date(t.date) >= cut);
    }

    return list;
  })();

  /* ── Local add ── */
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: `tx-${Date.now()}` };
    setAllTxs((prev) => [newTx, ...prev]);
    setShowAddModal(false);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) =>
    setAllTxs((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));

  const deleteTransaction = (id: string) => {
    setAllTxs((prev) => prev.filter((t) => t.id !== id));
    setSelected(null);
    setShowDetailsPanel(false);
  };

  const totalIncome   = filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return {
    transactions:        filteredTransactions,
    allTransactions:     allTxs,
    selectedTransaction: selected,
    setSelectedTransaction: setSelected,
    loading,
    showAddModal,     setShowAddModal,
    showDetailsPanel, setShowDetailsPanel,
    dateRange,          setDateRange,
    selectedCategories, setSelectedCategories,
    selectedAccounts,   setSelectedAccounts,
    searchQuery,        setSearchQuery,
    clearFilters: () => { setDateRange('month'); setSelectedCategories([]); setSelectedAccounts([]); setSearchQuery(''); },
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    accounts:   ACCOUNTS,
    categories: CATEGORIES,
  };
}