'use client';

// contexts/dashboard-data-context.tsx
// Бүх dashboard component энэ нэг context-ийг ашиглана
// → timeRange өөрчлөгдөхөд StatsCards, Budgets, SpendingData бүгд автоматаар шинэчлэгдэнэ

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from 'react';
import { ref, get, push, set, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb } from '@/lib/firebase';
import { getFirebaseStorage, storagePathForUpload } from '@/lib/firebase-storage';
import {
  NetWorth, Stats, Transaction,
  Budget, SpendingData, Insight, TrendData,
} from '@/components/dashboard/types';
import {
  type TimeRange,
  filterTxsByRange,
  getCutoffDate,
  budgetLimitMultiplier,
} from '@/lib/dashboard-time-range';
import { parseBankStatementToRawTxs } from '@/lib/bank-statement-parse';

export type { TimeRange } from '@/lib/dashboard-time-range';

const DEFAULT_USER_ID = 'GANTULGA_TSERENCHIMED';
const PRIVACY_MASK_KEY = 'cashflow-privacy-mask';

/* ─── Raw tx type ────────────────────────────────────────────────── */
export type RawTx = {
  date: string; branch: number | null; openingBalance: number | null;
  debit: number; credit: number; closingBalance: number | null;
  description: string; counterAccount: string | null;
};

/* ─── Category mapping ───────────────────────────────────────────── */
type CategoryRule = { keywords: string[]; category: string; icon: string; color: string };
const EXPENSE_RULES: CategoryRule[] = [
  { keywords: ['цахилгаан','дулаан','убцтс','убдс'],                   category: 'Цахилгаан/Дулаан',     icon: 'bolt',           color: 'bg-yellow-500' },
  { keywords: ['хоол','ресторан','zun jaw','emar','sebasansar','food'], category: 'Хоол хүнс',            icon: 'restaurant',     color: 'bg-orange-500' },
  { keywords: ['атм','atm','бэлэн мөнгө'],                             category: 'ATM авалт',            icon: 'atm',            color: 'bg-red-500'    },
  { keywords: ['starlink','интернет','internet','скай'],                category: 'Интернет',             icon: 'wifi',           color: 'bg-cyan-500'   },
  { keywords: ['openai','chatgpt','microsoft','google','81742'],        category: 'Тоон үйлчилгээ',       icon: 'cloud',          color: 'bg-violet-500' },
  { keywords: ['тээвэр','убс','bus','taxi'],                            category: 'Тээвэр',               icon: 'directions_car', color: 'bg-green-500'  },
  { keywords: ['qpay','socialpay','худалдан авалт','makhnii','trf='],   category: 'Дэлгүүр',              icon: 'shopping_bag',   color: 'bg-purple-500' },
  { keywords: ['хураамж','commission','fee','үйлчилгээний'],            category: 'Үйлчилгээний хураамж', icon: 'receipt',        color: 'bg-gray-500'   },
  { keywords: ['утас','мобиком','мобайл','unitel'],                     category: 'Гар утас',             icon: 'smartphone',     color: 'bg-pink-500'   },
  { keywords: ['түрээс','орон сууц','lease'],                           category: 'Орон сууц',            icon: 'home',           color: 'bg-blue-500'   },
];
const INCOME_RULES: CategoryRule[] = [
  { keywords: ['цалин','salary','компани'],                                           category: 'Цалин',               icon: 'payments',        color: 'bg-emerald-500' },
  { keywords: ['номин','нарантуяа','ээж','аав','цэрэнчимэд','илгээв','eb -','EB -'], category: 'Гэр бүлийн дэмжлэг', icon: 'family_restroom', color: 'bg-blue-500'    },
  { keywords: ['ногдол','dividend','invest','хөрөнгө'],                              category: 'Хөрөнгө оруулалт',   icon: 'show_chart',      color: 'bg-violet-500'  },
  { keywords: ['буцаалт','refund','return'],                                          category: 'Буцаалт',             icon: 'undo',            color: 'bg-yellow-500'  },
];
export function categorize(desc: string, isExp: boolean): CategoryRule {
  const lower = desc.toLowerCase();
  const rules = isExp ? EXPENSE_RULES : INCOME_RULES;
  return rules.find((r) => r.keywords.some((k) => lower.includes(k.toLowerCase()))) ??
    { category: isExp ? 'Бусад зарлага' : 'Бусад орлого', icon: isExp ? 'more_horiz' : 'add_circle', color: 'bg-gray-500', keywords: [] };
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function filterPrevPeriodForStats(txs: RawTx[], range: TimeRange): RawTx[] {
  const start = getCutoffDate(range);
  if (range === '7d') {
    const prevEnd = new Date(start);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 7);
    return txs.filter((t) => {
      const d = new Date(t.date);
      return d >= prevStart && d < prevEnd;
    });
  }
  if (range === '1m') {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const prevMonthStart = new Date(y, m - 1, 1);
    const prevMonthEnd = new Date(y, m, 0, 23, 59, 59, 999);
    return txs.filter((t) => {
      const d = new Date(t.date);
      return d >= prevMonthStart && d <= prevMonthEnd;
    });
  }
  const curStart = getCutoffDate('1q');
  const prevQStart = new Date(curStart);
  prevQStart.setMonth(prevQStart.getMonth() - 3);
  const prevQEnd = new Date(curStart);
  prevQEnd.setMilliseconds(-1);
  return txs.filter((t) => {
    const d = new Date(t.date);
    return d >= prevQStart && d <= prevQEnd;
  });
}
function filterMonth(txs: RawTx[], y: number, m: number) {
  return txs.filter((t) => { const d = new Date(t.date); return d.getFullYear()===y && d.getMonth()+1===m; });
}
function prevYM(y: number, m: number): [number, number] { return m===1?[y-1,12]:[y,m-1]; }
function pct(cur: number, prev: number) { return prev===0?0:Math.round(((cur-prev)/prev)*1000)/10; }
function avatarFromDesc(desc: string) {
  const w = desc.trim().split(/\s+/);
  return w.length>=2?(w[0][0]+w[1][0]).toUpperCase():desc.slice(0,3).toUpperCase()||'TX';
}

/* ─── Chart data (exported for NetWorthCard) ─────────────────────── */
export function buildChartData(txs: RawTx[], range: TimeRange) {
  const cutoff = getCutoffDate(range);

  const byDay: Record<string, number> = {};
  const sorted = [...txs]
    .filter((tx) => tx.closingBalance != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const tx of sorted) {
    if (new Date(tx.date) < cutoff) continue;
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    byDay[key] = tx.closingBalance!;
  }

  if (range === '7d' || range === '1m') {
    return Object.keys(byDay).sort().map((k) => {
      const [, m, dd] = k.split('-');
      return { label: `${parseInt(m, 10)}/${parseInt(dd, 10)}`, value: byDay[k] };
    });
  }

  const allDays = Object.keys(byDay).sort();
  const result: { label: string; value: number }[] = [];
  const monthSet = new Set(allDays.map((k) => k.slice(0, 7)));
  for (const ym of [...monthSet].sort()) {
    const [yr, mo] = ym.split('-').map(Number);
    for (const ms of [10, 20, 30]) {
      const cands = allDays.filter((k) => {
        const [ky, km, kd] = k.split('-').map(Number);
        return ky === yr && km === mo && kd <= ms;
      });
      if (!cands.length) continue;
      result.push({ label: `${mo}/${ms}`, value: byDay[cands[cands.length - 1]] });
    }
  }
  return result;
}

/* ─── Builders ───────────────────────────────────────────────────── */
function buildNetWorth(txs: RawTx[]): NetWorth {
  const sorted = [...txs].filter((t)=>t.closingBalance!=null)
    .sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
  const byMonth: Record<string,number> = {};
  for (const t of sorted) {
    const d = new Date(t.date);
    byMonth[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`] = t.closingBalance!;
  }
  const history = Object.entries(byMonth).sort(([a],[b])=>a.localeCompare(b)).slice(-12)
    .map(([k,v])=>({ date:k+'-01', value:v }));
  const latest  = sorted[sorted.length-1]?.closingBalance??0;
  const prevVal = history[history.length-2]?.value??latest;
  return { total:Math.round(latest), change:Math.round(latest-prevVal), changePercentage:pct(latest,prevVal), history };
}

function buildStats(txs: RawTx[], range: TimeRange): Stats {
  const filtered = filterTxsByRange(txs, range);
  const prevSlice = filterPrevPeriodForStats(txs, range);
  const income = filtered.reduce((s, t) => s + t.credit, 0);
  const expenses = filtered.reduce((s, t) => s + Math.abs(t.debit), 0);
  const prevIncome = prevSlice.reduce((s, t) => s + t.credit, 0);
  const prevExpenses = prevSlice.reduce((s, t) => s + Math.abs(t.debit), 0);
  const savings = Math.max(0, income - expenses);
  const savRate = income > 0 ? Math.round((savings / income) * 1000) / 10 : 0;
  const allSav = filtered.reduce((s, t) => s + t.credit - Math.abs(t.debit), 0);
  const prevSav = prevSlice.reduce((s, t) => s + t.credit - Math.abs(t.debit), 0);
  return {
    income:      { total: Math.round(income),   change: Math.round(income - prevIncome),     changePercentage: pct(income, prevIncome)     },
    expenses:    { total: Math.round(expenses), change: Math.round(expenses - prevExpenses), changePercentage: pct(expenses, prevExpenses) },
    savings:     { total: Math.round(savings),  rate: savRate },
    investments: { total: Math.max(0, Math.round(allSav)), return: 0, returnPercentage: pct(allSav, prevSav) },
  };
}

function buildTransactions(txs: RawTx[], range: TimeRange): Transaction[] {
  const monthTxs = filterTxsByRange(txs, range)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // debit/credit хоёулаа байж болох (transfer) үед хоёулыг нь тус тусад нь мөрөөр харуулна.
  const rows: Transaction[] = [];
  for (let i = 0; i < monthTxs.length; i++) {
    const t = monthTxs[i];
    const base = t.date.split(' ')[0];
    const desc = t.description || '';

    const hasDebit  = Math.abs(t.debit) > 0;
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

function buildBudgets(txs: RawTx[], range: TimeRange): Budget[] {
  const LIMITS: Record<string,number> = { 'Хоол хүнс':500_000,'Дэлгүүр':400_000,'Тээвэр':300_000,'Интернет':100_000,'Тоон үйлчилгээ':100_000,'Гар утас':50_000,'Цахилгаан/Дулаан':200_000,'ATM авалт':300_000 };
  const COLORS: Record<string,string> = { 'Хоол хүнс':'bg-orange-500','Дэлгүүр':'bg-purple-500','Тээвэр':'bg-green-500','Интернет':'bg-cyan-500','Тоон үйлчилгээ':'bg-violet-500','Гар утас':'bg-pink-500','Цахилгаан/Дулаан':'bg-yellow-500','ATM авалт':'bg-red-500' };
  const ICONS:  Record<string,string> = { 'Хоол хүнс':'restaurant','Дэлгүүр':'shopping_bag','Тээвэр':'directions_car','Интернет':'wifi','Тоон үйлчилгээ':'cloud','Гар утас':'smartphone','Цахилгаан/Дулаан':'bolt','ATM авалт':'atm' };
  const mult = budgetLimitMultiplier(range);
  const spent: Record<string,number> = {};
  for (const t of filterTxsByRange(txs, range).filter((t)=>t.debit!==0)) {
    const cat=categorize(t.description,true).category;
    spent[cat]=(spent[cat]??0)+Math.abs(t.debit);
  }
  const cats = new Set([...Object.keys(LIMITS),...Object.keys(spent)]);
  return Array.from(cats).map((cat,i)=>({ id:String(i+1),category:cat,spent:Math.round(spent[cat]??0),limit:Math.round((LIMITS[cat]??200_000)*mult),color:COLORS[cat]??'bg-gray-500',icon:ICONS[cat]??'more_horiz' }));
}

/** Өдөр тутмын орлого / зарлага (нүүр дээрх давхар график) */
function buildIncomeExpenseChartData(txs: RawTx[], range: TimeRange): { label: string; income: number; expense: number }[] {
  const cutoff = getCutoffDate(range);

  const byDay: Record<string, { income: number; expense: number }> = {};
  for (const t of txs) {
    if (new Date(t.date) < cutoff) continue;
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!byDay[key]) byDay[key] = { income: 0, expense: 0 };
    byDay[key].income += t.credit ?? 0;
    byDay[key].expense += Math.abs(t.debit ?? 0);
  }
  return Object.keys(byDay)
    .sort()
    .map((k) => {
      const [, m, dd] = k.split('-');
      return {
        label: `${parseInt(m, 10)}/${parseInt(dd, 10)}`,
        income: Math.round(byDay[k].income),
        expense: Math.round(byDay[k].expense),
      };
    });
}

function buildIncomeBreakdownData(txs: RawTx[], range: TimeRange): SpendingData[] {
  const COLORS: Record<string, string> = {
    Цалин: '#34d399',
    'Гэр бүлийн дэмжлэг': '#2dd4bf',
    'Хөрөнгө оруулалт': '#a78bfa',
    Буцаалт: '#fbbf24',
    'Бусад орлого': '#6ee7b7',
  };
  const byCategory: Record<string, number> = {};
  for (const t of filterTxsByRange(txs, range)) {
    if (!t.credit || t.credit === 0) continue;
    const cat = categorize(t.description, false).category;
    byCategory[cat] = (byCategory[cat] ?? 0) + t.credit;
  }
  const total = Object.values(byCategory).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: Math.round((amount / total) * 100),
      color: COLORS[category] ?? '#6ee7b7',
    }));
}

function buildSpendingData(txs: RawTx[], range: TimeRange): SpendingData[] {
  const COLORS: Record<string,string> = { 'Хоол хүнс':'#f97316','Дэлгүүр':'#8b5cf6','Тээвэр':'#10b981','Интернет':'#06b6d4','Тоон үйлчилгээ':'#7c3aed','Гар утас':'#ec4899','Цахилгаан/Дулаан':'#eab308','ATM авалт':'#ef4444','Орон сууц':'#3b82f6','Үйлчилгээний хураамж':'#6b7280','Бусад зарлага':'#9ca3af' };
  const byCategory: Record<string,number> = {};
  for (const t of filterTxsByRange(txs, range)) {
    if (t.debit===0) continue;
    const cat=categorize(t.description,true).category;
    byCategory[cat]=(byCategory[cat]??0)+Math.abs(t.debit);
  }
  const total=Object.values(byCategory).reduce((s,v)=>s+v,0)||1;
  return Object.entries(byCategory).sort(([,a],[,b])=>b-a).slice(0,6)
    .map(([category,amount])=>({ category,amount:Math.round(amount),percentage:Math.round((amount/total)*100),color:COLORS[category]??'#6b7280' }));
}

function buildInsights(txs: RawTx[], range: TimeRange): Insight[] {
  const now=new Date(); const y=now.getFullYear(); const m=now.getMonth()+1;
  const [py,pm]=prevYM(y,m);
  const cur=filterMonth(txs,y,m); const prev=filterMonth(txs,py,pm);
  const income=cur.reduce((s,t)=>s+t.credit,0);
  const expenses=cur.reduce((s,t)=>s+Math.abs(t.debit),0);
  const prevExp=prev.reduce((s,t)=>s+Math.abs(t.debit),0);
  const savRate=income>0?(income-expenses)/income:0;
  const expChg=pct(expenses,prevExp);
  const list: Insight[] = [];
  if (expChg>10) list.push({ id:'1',type:'warning',title:'Зарлага өсжээ',message:`Энэ сарын зарлага өмнөх сараас ${expChg}%-иар өсчээ.`,action:'Дэлгэрэнгүй',icon:'warning' });
  list.push(savRate>0.2
    ?{ id:'2',type:'success',title:'Хадгаламж сайн байна',message:`Энэ сард орлогынхоо ${Math.round(savRate*100)}%-ийг хадгалж байна.`,action:'Явцыг харах',icon:'savings' }
    :{ id:'2',type:'tip',title:'Хадгаламжаа нэмэгдүүлэх боломж',message:`Хадгаламжийн хувь ${Math.round(savRate*100)}%. 20%-аас дээш байлгахыг зорих нь зүйтэй.`,action:'Дэлгэрэнгүй',icon:'lightbulb' });
  const byCategory: Record<string,number> = {};
  for (const t of filterTxsByRange(txs, range)) { if (t.debit===0) continue; const cat=categorize(t.description,true).category; byCategory[cat]=(byCategory[cat]??0)+Math.abs(t.debit); }
  const topCat=Object.entries(byCategory).sort(([,a],[,b])=>b-a)[0];
  if (topCat) list.push({ id:'3',type:'tip',title:'Хамгийн их зарлага',message:`"${topCat[0]}" ангилалд ${topCat[1].toLocaleString()}₮ зарцуулсан.`,action:'Ангиллаар харах',icon:'insights' });
  return list;
}

function buildTrendData(txs: RawTx[], range: TimeRange): TrendData[] {
  const now = new Date();
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (range === '7d') {
    const out: TrendData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const ds = d.getTime();
      const de = ds + 86400000;
      const dayTxs = txs.filter((t) => {
        const tdt = new Date(t.date).getTime();
        return tdt >= ds && tdt < de;
      });
      const income = Math.round(dayTxs.reduce((s, t) => s + t.credit, 0));
      const expenses = Math.round(dayTxs.reduce((s, t) => s + Math.abs(t.debit), 0));
      out.push({
        month: `${d.getMonth() + 1}/${d.getDate()}`,
        income,
        expenses,
        savings: Math.max(0, income - expenses),
      });
    }
    return out;
  }

  if (range === '1m') {
    const y = now.getFullYear();
    const m = now.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const out: TrendData[] = [];
    for (let day = 1; day <= lastDay; day += 7) {
      const endDay = Math.min(day + 6, lastDay);
      let income = 0;
      let expenses = 0;
      for (let dd = day; dd <= endDay; dd++) {
        const dayTxs = txs.filter((t) => {
          const dt = new Date(t.date);
          return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === dd;
        });
        income += dayTxs.reduce((s, t) => s + t.credit, 0);
        expenses += dayTxs.reduce((s, t) => s + Math.abs(t.debit), 0);
      }
      const inc = Math.round(income);
      const exp = Math.round(expenses);
      out.push({
        month: `${day}–${endDay}`,
        income: inc,
        expenses: exp,
        savings: Math.max(0, inc - exp),
      });
    }
    return out;
  }

  const qStart = getCutoffDate('1q');
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(qStart.getFullYear(), qStart.getMonth() + i, 1);
    const monthly = filterMonth(txs, d.getFullYear(), d.getMonth() + 1);
    const income = Math.round(monthly.reduce((s, t) => s + t.credit, 0));
    const expenses = Math.round(monthly.reduce((s, t) => s + Math.abs(t.debit), 0));
    return { month: MONTHS[d.getMonth()], income, expenses, savings: Math.max(0, income - expenses) };
  });
}

/* ─── Context type ───────────────────────────────────────────────── */
type DashboardDataCtx = {
  loading:      boolean;
  timeRange:    TimeRange;
  setTimeRange: (r: TimeRange) => void;
  rawTxs:       RawTx[];
  chartData:    { label: string; value: number }[];
  /** Сонгосон хугацааны өдөр тутмын орлого + зарлага */
  incomeExpenseChartData: { label: string; income: number; expense: number }[];
  /** Орлогын ангиллаар задрал (донат) */
  incomeBreakdownData: SpendingData[];
  netWorth:     NetWorth | null;
  stats:        Stats | null;
  transactions: Transaction[];
  budgets:      Budget[];
  spendingData: SpendingData[];
  insights:     Insight[];
  trendData:    TrendData[];
  /** Сонгосон сарын хүрээний нийт (бүх raw гүйлгээнээс) */
  totalIncome:  number;
  totalExpenses:number;
  getTransactionsByType:     (type: 'income'|'expense') => Transaction[];
  getTransactionsByCategory: (cat: string) => Transaction[];
  getBudgetProgress:         (id: string) => number;
  /** Нүдний товч — бүх мөнгөн дүнг нуух / харуулах */
  privacyMasked:    boolean;
  togglePrivacyMask: () => void;
  /** Firebase руу хадгалж, жагсаалтыг шинэчилнэ */
  addTransaction:    (t: Omit<Transaction, 'id'> & { description?: string }) => Promise<void>;
  updateBudgetSpent: (cat: string, amount: number) => void;
  /** Сарын лимит (MNT) — үр дүн нь сонгосон сарын тоогоор үржигдэнэ */
  setBudgetLimit:    (category: string, monthlyLimit: number) => void;
  /** Баримт файл — Storage руу */
  uploadTransactionFile: (file: File) => Promise<{ imported: number; warnings: string[] }>;
  refreshData:       () => void;
  fetchData:         () => void;
};

const DashboardDataContext = createContext<DashboardDataCtx | null>(null);

/* ─── Provider ───────────────────────────────────────────────────── */
export function DashboardDataProvider({ children, userId = DEFAULT_USER_ID }: { children: ReactNode; userId?: string }) {
  const [loading,      setLoading]      = useState(true);
  const [rawTxs,       setRawTxs]       = useState<RawTx[]>([]);
  const [timeRange,    setTimeRangeState] = useState<TimeRange>('1m');
  const [privacyMasked, setPrivacyMasked] = useState(false);
  const [netWorth,     setNetWorth]     = useState<NetWorth | null>(null);
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets,      setBudgets]      = useState<Budget[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [insights,     setInsights]     = useState<Insight[]>([]);
  const [trendData,    setTrendData]    = useState<TrendData[]>([]);

  const recompute = useCallback((txs: RawTx[], r: TimeRange) => {
    setNetWorth(buildNetWorth(txs));
    setStats(buildStats(txs, r));
    setTransactions(buildTransactions(txs, r));
    setBudgets(buildBudgets(txs, r));
    setSpendingData(buildSpendingData(txs, r));
    setInsights(buildInsights(txs, r));
    setTrendData(buildTrendData(txs, r));
  }, []);

  const setTimeRange = useCallback((r: TimeRange) => {
    setTimeRangeState(r);
  }, []);

  useEffect(() => {
    recompute(rawTxs, timeRange);
  }, [timeRange, rawTxs, recompute]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await get(ref(getFirebaseDb(), `users/${userId}/transactions`));
      if (!snap.exists()) {
        setRawTxs([]);
        return;
      }
      const txs: RawTx[] = Object.values(snap.val() as Record<string, RawTx>)
        .filter((t) => t.date && t.date !== 'Нийт дүн:');
      setRawTxs(txs);
    } catch (err) {
      console.error('[DashboardDataProvider]', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(PRIVACY_MASK_KEY) === '1') {
        setPrivacyMasked(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const togglePrivacyMask = useCallback(() => {
    setPrivacyMasked((m) => {
      const n = !m;
      try {
        localStorage.setItem(PRIVACY_MASK_KEY, n ? '1' : '0');
      } catch {
        /* ignore */
      }
      return n;
    });
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'> & { description?: string }) => {
    const name =
      (transaction.name && transaction.name.trim()) ||
      [transaction.description, transaction.category].filter(Boolean).join(' · ') ||
      transaction.category;
    const db = getFirebaseDb();
    const debit = transaction.type === 'expense' ? transaction.amount : 0;
    const credit = transaction.type === 'income' ? transaction.amount : 0;
    const dateStr = transaction.date.includes('T') || transaction.date.includes(' ')
      ? transaction.date
      : `${transaction.date} 12:00:00`;
    const raw: RawTx = {
      date: dateStr,
      branch: null,
      openingBalance: null,
      debit,
      credit,
      closingBalance: null,
      description: name,
      counterAccount: null,
    };
    const newRef = push(ref(db, `users/${userId}/transactions`));
    await set(newRef, raw);
    await fetchData();
  }, [userId, fetchData]);

  const uploadTransactionFile = useCallback(async (file: File) => {
    const { rows, warnings, error } = await parseBankStatementToRawTxs(file);
    if (error || rows.length === 0) {
      throw new Error(error ?? 'Хуулгаас гүйлгээ уншиж чадсангүй.');
    }

    const db = getFirebaseDb();
    const base = `users/${userId}/transactions`;
    const txRef = ref(db, base);
    const updates: Record<string, RawTx> = {};
    for (const raw of rows) {
      const nr = push(txRef);
      if (nr.key) updates[`${base}/${nr.key}`] = raw;
    }
    await update(ref(db), updates);

    try {
      const storage = getFirebaseStorage();
      const path = storagePathForUpload(userId, file.name);
      const sr = storageRef(storage, path);
      await uploadBytes(sr, file, { contentType: file.type || 'application/octet-stream' });
      const url = await getDownloadURL(sr);
      const metaRef = push(ref(db, `users/${userId}/imports`));
      await set(metaRef, {
        fileName: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
        storagePath: path,
        downloadURL: url,
        status: 'imported',
        importedCount: rows.length,
      });
    } catch {
      /* Storage алдаатай ч гүйлгээ аль хэдийн RTDB-д орсон */
    }

    await fetchData();
    return { imported: rows.length, warnings };
  }, [userId, fetchData]);

  const updateBudgetSpent = useCallback((category: string, amount: number) => {
    setBudgets((prev) => prev.map((b) => b.category===category ? {...b, spent:b.spent+amount} : b));
  }, []);

  const setBudgetLimit = useCallback((category: string, monthlyLimit: number) => {
    const total = monthlyLimit * budgetLimitMultiplier(timeRange);
    setBudgets((prev) => prev.map((b) =>
      b.category === category ? { ...b, limit: total } : b));
  }, [timeRange]);

  const chartData = buildChartData(rawTxs, timeRange);
  const incomeExpenseChartData = buildIncomeExpenseChartData(rawTxs, timeRange);
  const incomeBreakdownData = buildIncomeBreakdownData(rawTxs, timeRange);
  const filteredForPeriod = filterTxsByRange(rawTxs, timeRange);
  const totalIncome   = Math.round(filteredForPeriod.reduce((s, t) => s + (t.credit ?? 0), 0));
  const totalExpenses = Math.round(filteredForPeriod.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0));

  return (
    <DashboardDataContext.Provider value={{
      loading, timeRange, setTimeRange, rawTxs, chartData, incomeExpenseChartData, incomeBreakdownData,
      netWorth, stats, transactions, budgets, spendingData, insights, trendData,
      totalIncome, totalExpenses,
      privacyMasked, togglePrivacyMask,
      getTransactionsByType:     (type) => transactions.filter((t)=>t.type===type),
      getTransactionsByCategory: (cat)  => transactions.filter((t)=>t.category===cat),
      getBudgetProgress:         (id)   => { const b=budgets.find((b)=>b.id===id); return b?Math.min(Math.round((b.spent/b.limit)*100),100):0; },
      addTransaction, updateBudgetSpent, setBudgetLimit, uploadTransactionFile,
      refreshData: fetchData, fetchData,
    }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────── */
export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error('useDashboardData must be used within <DashboardDataProvider>');
  return ctx;
}

export function useDashboardDataOptional() {
  return useContext(DashboardDataContext);
}