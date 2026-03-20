'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, get, set, remove, update } from 'firebase/database';
import { db, BASE_PATH } from '@/lib/firebase';
import { Budget, BudgetSummary, TransferData } from '@/components/budgets/types';

/* ─── Raw Firebase budget type ───────────────────────────────────── */
type RawBudget = {
  id:        string;
  category:  string;
  icon:      string;
  spent:     number;
  limit:     number;
  remaining: number;
  status:    Budget['status'];
  color:     string;
  period:    string;
  paidDate?: string;
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function calcStatus(spent: number, limit: number): Budget['status'] {
  const p = limit > 0 ? (spent / limit) * 100 : 0;
  if (p >= 100) return 'alert';
  if (p >= 85)  return 'warning';
  if (p >= 50)  return 'healthy';
  return 'safe';
}

function calcSummary(budgets: Budget[]): BudgetSummary {
  const totalBudgeted  = budgets.reduce((s, b) => s + b.limit,      0);
  const totalSpent     = budgets.reduce((s, b) => s + b.spent,      0);
  const totalRemaining = budgets.reduce((s, b) => s + b.remaining,  0);
  return {
    totalBudgeted,
    totalSpent,
    totalRemaining,
    percentageUsed: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
    categories: budgets.length,
  };
}

/* ─── Hook ───────────────────────────────────────────────────────── */
export function useBudgetData() {
  const [budgets,        setBudgets]        = useState<Budget[]>([]);
  const [summary,        setSummary]        = useState<BudgetSummary | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  /* ── Fetch from Firebase ── */
  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await get(ref(db, `${BASE_PATH}/budgets`));
      if (!snap.exists()) { setLoading(false); return; }

      const raw: Record<string, RawBudget> = snap.val();
      const list: Budget[] = Object.values(raw)
        .filter((b) => !selectedPeriod || b.period === selectedPeriod)
        .map((b) => ({
          id:        b.id,
          category:  b.category,
          icon:      b.icon,
          spent:     b.spent,
          limit:     b.limit,
          remaining: b.remaining,
          status:    b.status,
          color:     b.color,
          paidDate:  b.paidDate,
        }));

      setBudgets(list);
      setSummary(calcSummary(list));
    } catch (err) {
      console.error('[useBudgetData]', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  /* ── Filtered list ── */
  const filteredBudgets = budgets.filter((b) => {
    if (searchQuery && !b.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  /* ── Transfer money ── */
  const transferMoney = async (data: TransferData) => {
    const updated = budgets.map((b) => {
      if (b.id === data.fromBudgetId) {
        const spent = Math.max(0, b.spent - data.amount);
        return { ...b, spent, remaining: b.limit - spent, status: calcStatus(spent, b.limit) };
      }
      if (b.id === data.toBudgetId) {
        const spent = b.spent + data.amount;
        return { ...b, spent, remaining: b.limit - spent, status: calcStatus(spent, b.limit) };
      }
      return b;
    });
    setBudgets(updated);
    setSummary(calcSummary(updated));

    // Firebase-д шинэчлэнэ
    const fromB = updated.find((b) => b.id === data.fromBudgetId);
    const toB   = updated.find((b) => b.id === data.toBudgetId);
    if (fromB) await update(ref(db, `${BASE_PATH}/budgets/budget_${fromB.category}`), { spent: fromB.spent, remaining: fromB.remaining, status: fromB.status });
    if (toB)   await update(ref(db, `${BASE_PATH}/budgets/budget_${toB.category}`),   { spent: toB.spent,   remaining: toB.remaining,   status: toB.status   });
  };

  /* ── Add budget ── */
  const addBudget = async (budget: Omit<Budget, 'id' | 'remaining' | 'status'>) => {
    const newBudget: Budget = {
      ...budget,
      id:        `budget_${budget.category}_${Date.now()}`,
      remaining: budget.limit - budget.spent,
      status:    calcStatus(budget.spent, budget.limit),
    };
    await set(ref(db, `${BASE_PATH}/budgets/${newBudget.id}`), { ...newBudget, period: selectedPeriod });
    setBudgets((prev) => [...prev, newBudget]);
    setSummary(calcSummary([...budgets, newBudget]));
  };

  /* ── Delete budget ── */
  const deleteBudget = async (id: string) => {
    await remove(ref(db, `${BASE_PATH}/budgets/${id}`));
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    setSummary(calcSummary(updated));
  };

  /* ── Update budget ── */
  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map((b) => {
      if (b.id !== id) return b;
      const merged = { ...b, ...updates };
      return { ...merged, remaining: merged.limit - merged.spent, status: calcStatus(merged.spent, merged.limit) };
    });
    setBudgets(updated);
    setSummary(calcSummary(updated));
    const changed = updated.find((b) => b.id === id);
    if (changed) await update(ref(db, `${BASE_PATH}/budgets/${id}`), changed);
  };

  return {
    budgets: filteredBudgets,
    allBudgets: budgets,
    summary,
    loading,
    selectedPeriod,
    setSelectedPeriod,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    transferMoney,
    addBudget,
    deleteBudget,
    updateBudget,
    refreshBudgets: fetchBudgets,
  };
}