'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db, BASE_PATH } from '@/lib/firebase';
import { Transaction, Insight } from '@/components/analytics/type';

/* ─── Raw Firebase types ─────────────────────────────────────────── */
type RawMonthly = {
  month:          string;
  year:           number;
  monthKey:       string;
  income:         number;
  expense:        number;
  savings:        number;
  closingBalance: number;
};

type RawInsight = {
  id:      string;
  type:    string;
  title:   string;
  time:    string;
  message: string;
  icon?:   string;
  action?: string;
  metric?: { label: string; value: string; trend: 'up' | 'down' };
};

/* ─── Period → months ────────────────────────────────────────────── */
function getMonthKeys(period: string): string[] {
  const now   = new Date();
  const keys: string[] = [];

  if (period === '1M') {
    const k = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return [k];
  }
  const count = period === '3M' ? 3 : period === '6M' ? 6 : period === 'YTD' ? now.getMonth() + 1 : 12;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

/* ─── Hook ───────────────────────────────────────────────────────── */
export function useAnalyticsData(period: string) {
  const [data,     setData]     = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading,  setLoading]  = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Analytics monthly pre-computed
      const [analyticsSnap, insightsSnap] = await Promise.all([
        get(ref(db, `${BASE_PATH}/analytics/monthly`)),
        get(ref(db, `${BASE_PATH}/insights`)),
      ]);

      if (analyticsSnap.exists()) {
        const rawMonthly: Record<string, RawMonthly> = analyticsSnap.val();
        const keys   = getMonthKeys(period);
        const result: Transaction[] = keys
          .map((k) => rawMonthly[k])
          .filter(Boolean)
          .map((m, i) => ({
            id:      `month-${i}`,
            month:   m.month,
            income:  m.income,
            expense: m.expense,
            savings: m.savings,
          }));
        setData(result);
      }

      if (insightsSnap.exists()) {
        const rawInsights: Record<string, RawInsight> = insightsSnap.val();
        setInsights(
          Object.values(rawInsights).map((ins) => ({
            id:      ins.id,
            type:    ins.type as Insight['type'],
            title:   ins.title,
            time:    ins.time,
            message: ins.message,
            action:  ins.action,
            metric:  ins.metric ? { ...ins.metric, trend: ins.metric.trend as 'up' | 'down' } : undefined,
          }))
        );
      }
    } catch (err) {
      console.error('[useAnalyticsData]', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Derived totals ── */
  const totalIncome   = data.reduce((s, d) => s + d.income,  0);
  const totalExpense  = data.reduce((s, d) => s + d.expense, 0);
  const totalSavings  = data.reduce((s, d) => s + d.savings, 0);
  const savingsRate   = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const maxValue      = Math.max(...data.flatMap((d) => [d.income, d.expense, Math.abs(d.savings)]), 1);
  const portfolioVelocity = (totalSavings / (totalExpense || 1)) * 0.5 + 0.8;
  const incomeChange  = data.length >= 2 ? ((data[data.length - 1].income / data[0].income  - 1) * 100) : 0;
  const expenseChange = data.length >= 2 ? ((data[data.length - 1].expense / data[0].expense - 1) * 100) : 0;

  return {
    data,
    insights,
    loading,
    totals: {
      totalIncome,
      totalExpense,
      totalSavings,
      savingsRate,
      maxValue,
      portfolioVelocity,
      incomeChange,
      expenseChange,
      monthsCount: data.length,
    },
  };
}