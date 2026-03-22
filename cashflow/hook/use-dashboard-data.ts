'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import {
  NetWorth, Stats, Transaction,
  Budget, SpendingData, Insight, TrendData,
} from '@/components/dashboard/types';

const DEFAULT_USER_ID    = 'GANTULGA_TSERENCHIMED';
const DEFAULT_ACCOUNT_ID = '5466262686';

/* ─── Types ──────────────────────────────────────────────────────── */
type RawTx = {
  date:           string;
  branch:         number | null;
  openingBalance: number | null;
  debit:          number;
  credit:         number;
  closingBalance: number | null;
  description:    string;
  counterAccount: string | null;
};

type CategoryRule = { keywords: string[]; category: string; icon: string; color: string };

/* ─── Category mapping ───────────────────────────────────────────── */
const EXPENSE_RULES: CategoryRule[] = [
  { keywords: ['цахилгаан','дулаан','убцтс','убдс'],                    category: 'Цахилгаан/Дулаан',     icon: 'bolt',           color: 'bg-yellow-500' },
  { keywords: ['хоол','ресторан','zun jaw','emar','sebasansar','food'],  category: 'Хоол хүнс',            icon: 'restaurant',     color: 'bg-orange-500' },
  { keywords: ['атм','atm','бэлэн мөнгө'],                              category: 'ATM авалт',            icon: 'atm',            color: 'bg-red-500'    },
  { keywords: ['starlink','интернет','internet','скай'],                 category: 'Интернет',             icon: 'wifi',           color: 'bg-cyan-500'   },
  { keywords: ['openai','chatgpt','microsoft','google','81742'],         category: 'Тоон үйлчилгээ',       icon: 'cloud',          color: 'bg-violet-500' },
  { keywords: ['тээвэр','убс','bus','taxi'],                             category: 'Тээвэр',               icon: 'directions_car', color: 'bg-green-500'  },
  { keywords: ['qpay','socialpay','худалдан авалт','makhnii','trf='],    category: 'Дэлгүүр',              icon: 'shopping_bag',   color: 'bg-purple-500' },
  { keywords: ['хураамж','commission','fee','үйлчилгээний'],             category: 'Үйлчилгээний хураамж', icon: 'receipt',        color: 'bg-gray-500'   },
  { keywords: ['утас','мобиком','мобайл','unitel'],                      category: 'Гар утас',             icon: 'smartphone',     color: 'bg-pink-500'   },
  { keywords: ['түрээс','орон сууц','lease'],                            category: 'Орон сууц',            icon: 'home',           color: 'bg-blue-500'   },
];

const INCOME_RULES: CategoryRule[] = [
  { keywords: ['цалин','salary','компани'],                                           category: 'Цалин',               icon: 'payments',        color: 'bg-emerald-500' },
  { keywords: ['номин','нарантуяа','ээж','аав','цэрэнчимэд','илгээв','eb -','EB -'], category: 'Гэр бүлийн дэмжлэг', icon: 'family_restroom', color: 'bg-blue-500'    },
  { keywords: ['ногдол','dividend','invest','хөрөнгө'],                              category: 'Хөрөнгө оруулалт',   icon: 'show_chart',      color: 'bg-violet-500'  },
  { keywords: ['буцаалт','refund','return'],                                          category: 'Буцаалт',             icon: 'undo',            color: 'bg-yellow-500'  },
];

function categorize(desc: string, isExpense: boolean): CategoryRule {
  const lower = desc.toLowerCase();
  const rules = isExpense ? EXPENSE_RULES : INCOME_RULES;
  return rules.find((r) => r.keywords.some((k) => lower.includes(k.toLowerCase()))) ?? {
    category: isExpense ? 'Бусад зарлага' : 'Бусад орлого',
    icon:     isExpense ? 'more_horiz'    : 'add_circle',
    color:    'bg-gray-500', keywords: [],
  };
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function filterMonth(txs: RawTx[], year: number, month: number) {
  return txs.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

/** Сүүлийн N сарын гүйлгээг шүүнэ */
function filterLastMonths(txs: RawTx[], months: number): RawTx[] {
  const now    = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  return txs.filter((t) => new Date(t.date) >= cutoff);
}

function prevYM(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

function pct(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

function avatarFromDesc(desc: string): string {
  const words = desc.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return desc.slice(0, 3).toUpperCase() || 'TX';
}

/* ─── Chart data builder (NetWorthCard-тай хуваалцана) ──────────── */
export function buildChartData(txs: RawTx[], months: number) {
  const today  = new Date();
  const cutoff = months === 1
    ? new Date(today.getFullYear(), today.getMonth(), 1)
    : new Date(today.getFullYear(), today.getMonth() - months + 1, 1);

  const sorted = [...txs]
    .filter((tx) => tx.closingBalance != null && new Date(tx.date) >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Өдрөөр сүүлийн closingBalance авна
  const byDay: Record<string, number> = {};
  for (const tx of sorted) {
    const d   = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    byDay[key] = tx.closingBalance!;
  }

  // months 1/3/6 дээр daily горимоор харуулна.
  if (months <= 6) {
    return Object.keys(byDay).sort().map((key) => {
      const [, m, dd] = key.split('-');
      return { label: `${parseInt(m)}/${parseInt(dd)}`, value: byDay[key] };
    });
  }

  // Сар бүрийн 10, 20, 30-ны ойрын өдрийн үлдэгдэл
  const allDays  = Object.keys(byDay).sort();
  const result: { label: string; value: number }[] = [];
  const monthSet = new Set(allDays.map((k) => k.slice(0, 7)));

  for (const ym of [...monthSet].sort()) {
    const [yr, mo] = ym.split('-').map(Number);
    for (const milestone of [10, 20, 30]) {
      const cands = allDays.filter((k) => {
        const [ky, km, kd] = k.split('-').map(Number);
        return ky === yr && km === mo && kd <= milestone;
      });
      if (!cands.length) continue;
      result.push({ label: `${mo}/${milestone}`, value: byDay[cands[cands.length - 1]] });
    }
  }
  return result;
}

/* ─── Derived data builders ──────────────────────────────────────── */
function buildNetWorth(txs: RawTx[]): NetWorth {
  const sorted = [...txs]
    .filter((t) => t.closingBalance != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const byMonth: Record<string, number> = {};
  for (const t of sorted) {
    const d   = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = t.closingBalance!;
  }

  const history = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, value]) => ({ date: key + '-01', value }));

  const latest  = sorted[sorted.length - 1]?.closingBalance ?? 0;
  const prevVal = history[history.length - 2]?.value ?? latest;

  return {
    total:            Math.round(latest),
    change:           Math.round(latest - prevVal),
    changePercentage: pct(latest, prevVal),
    history,
  };
}

function buildStats(txs: RawTx[], months: number): Stats {
  // months-д тохирох гүйлгээг шүүнэ
  const filtered     = filterLastMonths(txs, months);
  const now          = new Date();
  const y            = now.getFullYear();
  const m            = now.getMonth() + 1;
  const [py, pm]     = prevYM(y, m);
  const cur          = filterMonth(filtered, y, m);
  const prev         = filterMonth(txs, py, pm);

  const income       = cur.reduce((s, t) => s + t.credit, 0);
  const prevIncome   = prev.reduce((s, t) => s + t.credit, 0);
  const expenses     = cur.reduce((s, t) => s + Math.abs(t.debit), 0);
  const prevExpenses = prev.reduce((s, t) => s + Math.abs(t.debit), 0);
  const savings      = Math.max(0, income - expenses);
  const savRate      = income > 0 ? Math.round((savings / income) * 1000) / 10 : 0;

  const allSavings  = filtered.reduce((s, t) => s + t.credit - Math.abs(t.debit), 0);
  const prevSavings = prev.reduce((s, t) => s + t.credit - Math.abs(t.debit), 0);

  return {
    income:      { total: Math.round(income),   change: Math.round(income - prevIncome),     changePercentage: pct(income, prevIncome)     },
    expenses:    { total: Math.round(expenses), change: Math.round(expenses - prevExpenses), changePercentage: pct(expenses, prevExpenses) },
    savings:     { total: Math.round(savings),  rate: savRate },
    investments: { total: Math.max(0, Math.round(allSavings)), return: 0, returnPercentage: pct(allSavings, prevSavings) },
  };
}

function buildTransactions(txs: RawTx[], months: number): Transaction[] {
  const monthTxs = filterLastMonths(txs, months)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Нэг RawTx дээр debit/credit хоёулаа байж болох тул (transfer) хоёулыг нь тус тусад нь мөрөөр харуулна.
  const rows: Transaction[] = [];
  for (let i = 0; i < monthTxs.length; i++) {
    const t = monthTxs[i];
    const base = t.date.split(' ')[0];
    const desc = t.description || '';

    const hasDebit  = Math.abs(t.debit)  > 0;
    const hasCredit = Math.abs(t.credit) > 0;

    if (hasDebit) {
      const cat = categorize(desc, true);
      rows.push({
        id: `tx-${i}-d`,
        name: desc || 'Зарлага',
        date: base,
        amount: Math.abs(t.debit),
        type: 'expense',
        category: cat.category,
        account: 'Залуусын харилцах',
        avatar: avatarFromDesc(desc),
        status: 'completed' as const,
      });
    }

    if (hasCredit) {
      const cat = categorize(desc, false);
      rows.push({
        id: `tx-${i}-c`,
        name: desc || 'Орлого',
        date: base,
        amount: Math.abs(t.credit),
        type: 'income',
        category: cat.category,
        account: 'Залуусын харилцах',
        avatar: avatarFromDesc(desc),
        status: 'completed' as const,
      });
    }
  }

  return rows.slice(0, 20);
}

function buildBudgets(txs: RawTx[], months: number): Budget[] {
  const cur = filterLastMonths(txs, months).filter((t) => t.debit !== 0);

  const LIMITS: Record<string, number> = {
    'Хоол хүнс': 500_000, 'Дэлгүүр': 400_000, 'Тээвэр': 300_000,
    'Интернет': 100_000, 'Тоон үйлчилгээ': 100_000, 'Гар утас': 50_000,
    'Цахилгаан/Дулаан': 200_000, 'ATM авалт': 300_000,
  };
  const COLORS: Record<string, string> = {
    'Хоол хүнс': 'bg-orange-500', 'Дэлгүүр': 'bg-purple-500', 'Тээвэр': 'bg-green-500',
    'Интернет': 'bg-cyan-500', 'Тоон үйлчилгээ': 'bg-violet-500', 'Гар утас': 'bg-pink-500',
    'Цахилгаан/Дулаан': 'bg-yellow-500', 'ATM авалт': 'bg-red-500',
  };
  const ICONS: Record<string, string> = {
    'Хоол хүнс': 'restaurant', 'Дэлгүүр': 'shopping_bag', 'Тээвэр': 'directions_car',
    'Интернет': 'wifi', 'Тоон үйлчилгээ': 'cloud', 'Гар утас': 'smartphone',
    'Цахилгаан/Дулаан': 'bolt', 'ATM авалт': 'atm',
  };

  const spent: Record<string, number> = {};
  for (const t of cur) {
    const cat = categorize(t.description, true).category;
    spent[cat] = (spent[cat] ?? 0) + Math.abs(t.debit);
  }

  const cats = new Set([...Object.keys(LIMITS), ...Object.keys(spent)]);
  return Array.from(cats).map((cat, i) => ({
    id: String(i + 1), category: cat,
    spent:    Math.round(spent[cat] ?? 0),
    limit:    (LIMITS[cat] ?? 200_000) * months,  // months-д пропорционал
    color:    COLORS[cat] ?? 'bg-gray-500',
    icon:     ICONS[cat]  ?? 'more_horiz',
  }));
}

function buildSpendingData(txs: RawTx[], months: number): SpendingData[] {
  const COLORS: Record<string, string> = {
    'Хоол хүнс': '#f97316', 'Дэлгүүр': '#8b5cf6', 'Тээвэр': '#10b981',
    'Интернет': '#06b6d4', 'Тоон үйлчилгээ': '#7c3aed', 'Гар утас': '#ec4899',
    'Цахилгаан/Дулаан': '#eab308', 'ATM авалт': '#ef4444',
    'Орон сууц': '#3b82f6', 'Үйлчилгээний хураамж': '#6b7280', 'Бусад зарлага': '#9ca3af',
  };

  const byCategory: Record<string, number> = {};
  for (const t of filterLastMonths(txs, months)) {
    if (t.debit === 0) continue;
    const cat = categorize(t.description, true).category;
    byCategory[cat] = (byCategory[cat] ?? 0) + Math.abs(t.debit);
  }

  const total = Object.values(byCategory).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a).slice(0, 6)
    .map(([category, amount]) => ({
      category,
      amount:     Math.round(amount),
      percentage: Math.round((amount / total) * 100),
      color:      COLORS[category] ?? '#6b7280',
    }));
}

function buildInsights(txs: RawTx[], months: number): Insight[] {
  const now      = new Date();
  const y        = now.getFullYear();
  const m        = now.getMonth() + 1;
  const [py, pm] = prevYM(y, m);
  const cur      = filterMonth(txs, y, m);
  const prev     = filterMonth(txs, py, pm);

  const income   = cur.reduce((s, t) => s + t.credit, 0);
  const expenses = cur.reduce((s, t) => s + Math.abs(t.debit), 0);
  const prevExp  = prev.reduce((s, t) => s + Math.abs(t.debit), 0);
  const savRate  = income > 0 ? (income - expenses) / income : 0;
  const expChg   = pct(expenses, prevExp);
  const insights: Insight[] = [];

  if (expChg > 10) {
    insights.push({ id: '1', type: 'warning', title: 'Зарлага өсжээ',
      message: `Энэ сарын зарлага өмнөх сараас ${expChg}%-иар өсчээ. Төсвөө шалгана уу.`,
      action: 'Дэлгэрэнгүй', icon: 'warning' });
  }

  insights.push(savRate > 0.2
    ? { id: '2', type: 'success', title: 'Хадгаламж сайн байна',
        message: `Энэ сард орлогынхоо ${Math.round(savRate * 100)}%-ийг хадгалж байна.`,
        action: 'Явцыг харах', icon: 'savings' }
    : { id: '2', type: 'tip', title: 'Хадгаламжаа нэмэгдүүлэх боломж',
        message: `Одоогийн хадгаламжийн хувь ${Math.round(savRate * 100)}%. 20%-аас дээш байлгахыг зорих нь зүйтэй.`,
        action: 'Дэлгэрэнгүй', icon: 'lightbulb' });

  const byCategory: Record<string, number> = {};
  for (const t of filterLastMonths(txs, months)) {
    if (t.debit === 0) continue;
    const cat = categorize(t.description, true).category;
    byCategory[cat] = (byCategory[cat] ?? 0) + Math.abs(t.debit);
  }
  const topCat = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];
  if (topCat) {
    insights.push({ id: '3', type: 'tip', title: 'Хамгийн их зарлага',
      message: `"${topCat[0]}" ангилалд ${topCat[1].toLocaleString()}₮ зарцуулсан байна.`,
      action: 'Ангиллаар харах', icon: 'insights' });
  }
  return insights;
}

function buildTrendData(txs: RawTx[], months: number): TrendData[] {
  const now    = new Date();
  const count  = Math.min(months, 12);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: count }, (_, i) => {
    const d        = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const monthly  = filterMonth(txs, d.getFullYear(), d.getMonth() + 1);
    const income   = Math.round(monthly.reduce((s, t) => s + t.credit, 0));
    const expenses = Math.round(monthly.reduce((s, t) => s + Math.abs(t.debit), 0));
    return { month: MONTHS[d.getMonth()], income, expenses, savings: Math.max(0, income - expenses) };
  });
}

/* ─── Main hook ──────────────────────────────────────────────────── */
export function useDashboardData(
  userId    = DEFAULT_USER_ID,
  accountId = DEFAULT_ACCOUNT_ID,
) {
  const [loading,      setLoading]      = useState(true);
  const [allTxs,       setAllTxs]       = useState<RawTx[]>([]);
  // ✅ Нэг shared months state — NetWorthCard болон бүх card хуваалцана
  const [months,       setMonths]       = useState<number>(6);
  const [netWorth,     setNetWorth]     = useState<NetWorth | null>(null);
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets,      setBudgets]      = useState<Budget[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [insights,     setInsights]     = useState<Insight[]>([]);
  const [trendData,    setTrendData]    = useState<TrendData[]>([]);

  const processAndSet = useCallback((txs: RawTx[], m: number) => {
    setNetWorth(buildNetWorth(txs));
    setStats(buildStats(txs, m));
    setTransactions(buildTransactions(txs, m));
    setBudgets(buildBudgets(txs, m));
    setSpendingData(buildSpendingData(txs, m));
    setInsights(buildInsights(txs, m));
    setTrendData(buildTrendData(txs, m));
  }, []);

  // ── Fetch (нэг удаа) ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await get(ref(db, `users/${userId}/transactions`));
      if (!snap.exists()) return;
      const txs: RawTx[] = Object.values(snap.val() as Record<string, RawTx>)
        .filter((t) => t.date && t.date !== 'Нийт дүн:');
      setAllTxs(txs);
      processAndSet(txs, months);
    } catch (err) {
      console.error('[useDashboardData]', err);
    } finally {
      setLoading(false);
    }
  }, [userId, processAndSet]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ✅ months өөрчлөгдөхөд бүх derived data дахин тооцогдоно
  useEffect(() => {
    if (allTxs.length > 0) {
      processAndSet(allTxs, months);
    }
  }, [months, allTxs, processAndSet]);

  // ✅ months setter — NetWorthCard-аас дуудагдана
  const handleSetMonths = useCallback((m: number) => {
    setMonths(m);
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: `tx-${Date.now()}` };
    setTransactions((prev) => [newTx, ...prev]);
    if (stats) {
      setStats({
        ...stats,
        ...(transaction.type === 'income'
          ? { income:   { ...stats.income,   total: stats.income.total   + transaction.amount } }
          : { expenses: { ...stats.expenses, total: stats.expenses.total + transaction.amount } }),
      });
    }
  };

  const updateBudgetSpent = (category: string, amount: number) =>
    setBudgets((prev) => prev.map((b) => b.category === category ? { ...b, spent: b.spent + amount } : b));

  return {
    // Data
    netWorth, stats, transactions, budgets,
    spendingData, insights, trendData, loading,
    // ✅ months болон setter-ийг export хийнэ
    months,
    setMonths: handleSetMonths,
    // Chart data for NetWorthCard
    chartData: buildChartData(allTxs, months),
    rawTxs:    allTxs,
    // Computed
    totalIncome:               transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    totalExpenses:             transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    getTransactionsByType:     (type: 'income' | 'expense') => transactions.filter((t) => t.type === type),
    getTransactionsByCategory: (cat: string) => transactions.filter((t) => t.category === cat),
    getBudgetProgress:         (id: string) => { const b = budgets.find((b) => b.id === id); return b ? Math.min(Math.round((b.spent / b.limit) * 100), 100) : 0; },
    addTransaction,
    updateBudgetSpent,
    refreshData: fetchData,
    fetchData,
  };
}