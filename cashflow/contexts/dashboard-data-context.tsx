'use client';

// contexts/dashboard-data-context.tsx
// Бүх dashboard component энэ нэг context-ийг ашиглана
// → months өөрчлөгдөхөд StatsCards, Budgets, SpendingData бүгд автоматаар шинэчлэгдэнэ

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from 'react';
import { initializeApp, getApps }   from 'firebase/app';
import { getDatabase, ref, get }    from 'firebase/database';
import {
  NetWorth, Stats, Transaction,
  Budget, SpendingData, Insight, TrendData,
} from '@/components/dashboard/types';

/* ─── Firebase ───────────────────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getDatabase(app);
const DEFAULT_USER_ID = 'GANTULGA_TSERENCHIMED';

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
function categorize(desc: string, isExp: boolean): CategoryRule {
  const lower = desc.toLowerCase();
  const rules = isExp ? EXPENSE_RULES : INCOME_RULES;
  return rules.find((r) => r.keywords.some((k) => lower.includes(k.toLowerCase()))) ??
    { category: isExp ? 'Бусад зарлага' : 'Бусад орлого', icon: isExp ? 'more_horiz' : 'add_circle', color: 'bg-gray-500', keywords: [] };
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function filterLastMonths(txs: RawTx[], months: number): RawTx[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months + 1);
  cutoff.setDate(1); cutoff.setHours(0,0,0,0);
  return txs.filter((t) => new Date(t.date) >= cutoff);
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
export function buildChartData(txs: RawTx[], months: number) {
  const today  = new Date();
  const cutoff = months===1
    ? new Date(today.getFullYear(), today.getMonth(), 1)
    : new Date(today.getFullYear(), today.getMonth()-months+1, 1);

  const byDay: Record<string, number> = {};
  // Зөв daily closingBalance авахын тулд өдөр дээрх хамгийн сүүлчийн tx нь огноогоор нь тулгуурласан байх шаардлагатай.
  const sorted = [...txs]
    .filter((tx) => tx.closingBalance != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const tx of sorted) {
    if (new Date(tx.date) < cutoff) continue;
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    byDay[key] = tx.closingBalance!;
  }

  // months 1/3/6 дээр daily-г харуулна (өдрийн цэгүүд 10/20/30 milestone руу шилжихгүй).
  if (months <= 6) {
    return Object.keys(byDay).sort().map((k) => {
      const [,m,dd] = k.split('-');
      return { label:`${parseInt(m)}/${parseInt(dd)}`, value:byDay[k] };
    });
  }

  const allDays  = Object.keys(byDay).sort();
  const result: {label:string;value:number}[] = [];
  const monthSet = new Set(allDays.map((k)=>k.slice(0,7)));
  for (const ym of [...monthSet].sort()) {
    const [yr,mo] = ym.split('-').map(Number);
    for (const ms of [10,20,30]) {
      const cands = allDays.filter((k)=>{ const [ky,km,kd]=k.split('-').map(Number); return ky===yr&&km===mo&&kd<=ms; });
      if (!cands.length) continue;
      result.push({ label:`${mo}/${ms}`, value:byDay[cands[cands.length-1]] });
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

function buildStats(txs: RawTx[], months: number): Stats {
  const filtered = filterLastMonths(txs, months);
  const now=new Date(); const y=now.getFullYear(); const m=now.getMonth()+1;
  const [py,pm] = prevYM(y,m);
  const cur  = filterMonth(filtered, y, m);
  const prev = filterMonth(txs, py, pm);
  const income=cur.reduce((s,t)=>s+t.credit,0);       const prevIncome=prev.reduce((s,t)=>s+t.credit,0);
  const expenses=cur.reduce((s,t)=>s+Math.abs(t.debit),0); const prevExpenses=prev.reduce((s,t)=>s+Math.abs(t.debit),0);
  const savings=Math.max(0,income-expenses);
  const savRate=income>0?Math.round((savings/income)*1000)/10:0;
  const allSav=filtered.reduce((s,t)=>s+t.credit-Math.abs(t.debit),0);
  const prevSav=prev.reduce((s,t)=>s+t.credit-Math.abs(t.debit),0);
  return {
    income:      { total:Math.round(income),   change:Math.round(income-prevIncome),     changePercentage:pct(income,prevIncome)     },
    expenses:    { total:Math.round(expenses), change:Math.round(expenses-prevExpenses), changePercentage:pct(expenses,prevExpenses) },
    savings:     { total:Math.round(savings),  rate:savRate },
    investments: { total:Math.max(0,Math.round(allSav)), return:0, returnPercentage:pct(allSav,prevSav) },
  };
}

function buildTransactions(txs: RawTx[], months: number): Transaction[] {
  const monthTxs = filterLastMonths(txs, months)
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

function buildBudgets(txs: RawTx[], months: number): Budget[] {
  const LIMITS: Record<string,number> = { 'Хоол хүнс':500_000,'Дэлгүүр':400_000,'Тээвэр':300_000,'Интернет':100_000,'Тоон үйлчилгээ':100_000,'Гар утас':50_000,'Цахилгаан/Дулаан':200_000,'ATM авалт':300_000 };
  const COLORS: Record<string,string> = { 'Хоол хүнс':'bg-orange-500','Дэлгүүр':'bg-purple-500','Тээвэр':'bg-green-500','Интернет':'bg-cyan-500','Тоон үйлчилгээ':'bg-violet-500','Гар утас':'bg-pink-500','Цахилгаан/Дулаан':'bg-yellow-500','ATM авалт':'bg-red-500' };
  const ICONS:  Record<string,string> = { 'Хоол хүнс':'restaurant','Дэлгүүр':'shopping_bag','Тээвэр':'directions_car','Интернет':'wifi','Тоон үйлчилгээ':'cloud','Гар утас':'smartphone','Цахилгаан/Дулаан':'bolt','ATM авалт':'atm' };
  const spent: Record<string,number> = {};
  for (const t of filterLastMonths(txs,months).filter((t)=>t.debit!==0)) {
    const cat=categorize(t.description,true).category;
    spent[cat]=(spent[cat]??0)+Math.abs(t.debit);
  }
  const cats = new Set([...Object.keys(LIMITS),...Object.keys(spent)]);
  return Array.from(cats).map((cat,i)=>({ id:String(i+1),category:cat,spent:Math.round(spent[cat]??0),limit:(LIMITS[cat]??200_000)*months,color:COLORS[cat]??'bg-gray-500',icon:ICONS[cat]??'more_horiz' }));
}

function buildSpendingData(txs: RawTx[], months: number): SpendingData[] {
  const COLORS: Record<string,string> = { 'Хоол хүнс':'#f97316','Дэлгүүр':'#8b5cf6','Тээвэр':'#10b981','Интернет':'#06b6d4','Тоон үйлчилгээ':'#7c3aed','Гар утас':'#ec4899','Цахилгаан/Дулаан':'#eab308','ATM авалт':'#ef4444','Орон сууц':'#3b82f6','Үйлчилгээний хураамж':'#6b7280','Бусад зарлага':'#9ca3af' };
  const byCategory: Record<string,number> = {};
  for (const t of filterLastMonths(txs,months)) {
    if (t.debit===0) continue;
    const cat=categorize(t.description,true).category;
    byCategory[cat]=(byCategory[cat]??0)+Math.abs(t.debit);
  }
  const total=Object.values(byCategory).reduce((s,v)=>s+v,0)||1;
  return Object.entries(byCategory).sort(([,a],[,b])=>b-a).slice(0,6)
    .map(([category,amount])=>({ category,amount:Math.round(amount),percentage:Math.round((amount/total)*100),color:COLORS[category]??'#6b7280' }));
}

function buildInsights(txs: RawTx[], months: number): Insight[] {
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
  for (const t of filterLastMonths(txs,months)) { if (t.debit===0) continue; const cat=categorize(t.description,true).category; byCategory[cat]=(byCategory[cat]??0)+Math.abs(t.debit); }
  const topCat=Object.entries(byCategory).sort(([,a],[,b])=>b-a)[0];
  if (topCat) list.push({ id:'3',type:'tip',title:'Хамгийн их зарлага',message:`"${topCat[0]}" ангилалд ${topCat[1].toLocaleString()}₮ зарцуулсан.`,action:'Ангиллаар харах',icon:'insights' });
  return list;
}

function buildTrendData(txs: RawTx[], months: number): TrendData[] {
  const now=new Date(); const count=Math.min(months,12);
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({length:count},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-(count-1-i),1);
    const monthly=filterMonth(txs,d.getFullYear(),d.getMonth()+1);
    const income=Math.round(monthly.reduce((s,t)=>s+t.credit,0));
    const expenses=Math.round(monthly.reduce((s,t)=>s+Math.abs(t.debit),0));
    return { month:MONTHS[d.getMonth()],income,expenses,savings:Math.max(0,income-expenses) };
  });
}

/* ─── Context type ───────────────────────────────────────────────── */
type DashboardDataCtx = {
  loading:      boolean;
  months:       number;
  setMonths:    (m: number) => void;
  rawTxs:       RawTx[];
  chartData:    { label: string; value: number }[];
  netWorth:     NetWorth | null;
  stats:        Stats | null;
  transactions: Transaction[];
  budgets:      Budget[];
  spendingData: SpendingData[];
  insights:     Insight[];
  trendData:    TrendData[];
  totalIncome:  number;
  totalExpenses:number;
  getTransactionsByType:     (type: 'income'|'expense') => Transaction[];
  getTransactionsByCategory: (cat: string) => Transaction[];
  getBudgetProgress:         (id: string) => number;
  addTransaction:    (t: Omit<Transaction,'id'>) => void;
  updateBudgetSpent: (cat: string, amount: number) => void;
  refreshData:       () => void;
  fetchData:         () => void;
};

const DashboardDataContext = createContext<DashboardDataCtx | null>(null);

/* ─── Provider ───────────────────────────────────────────────────── */
export function DashboardDataProvider({ children, userId = DEFAULT_USER_ID }: { children: ReactNode; userId?: string }) {
  const [loading,      setLoading]      = useState(true);
  const [rawTxs,       setRawTxs]       = useState<RawTx[]>([]);
  const [months,       setMonthsState]  = useState(6);
  const [netWorth,     setNetWorth]     = useState<NetWorth | null>(null);
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets,      setBudgets]      = useState<Budget[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [insights,     setInsights]     = useState<Insight[]>([]);
  const [trendData,    setTrendData]    = useState<TrendData[]>([]);

  const recompute = useCallback((txs: RawTx[], m: number) => {
    setNetWorth(buildNetWorth(txs));
    setStats(buildStats(txs, m));
    setTransactions(buildTransactions(txs, m));
    setBudgets(buildBudgets(txs, m));
    setSpendingData(buildSpendingData(txs, m));
    setInsights(buildInsights(txs, m));
    setTrendData(buildTrendData(txs, m));
  }, []);

  // months өөрчлөгдөхөд дахин тооцоолно
  const setMonths = useCallback((m: number) => {
    setMonthsState(m);
  }, []);

  useEffect(() => {
    if (rawTxs.length > 0) recompute(rawTxs, months);
  }, [months, rawTxs, recompute]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await get(ref(db, `users/${userId}/transactions`));
      if (!snap.exists()) return;
      const txs: RawTx[] = Object.values(snap.val() as Record<string, RawTx>)
        .filter((t) => t.date && t.date !== 'Нийт дүн:');
      setRawTxs(txs);
      recompute(txs, months);
    } catch (err) {
      console.error('[DashboardDataProvider]', err);
    } finally {
      setLoading(false);
    }
  }, [userId, recompute]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: `tx-${Date.now()}` };
    setTransactions((prev) => [newTx, ...prev]);
    setStats((prev) => prev ? {
      ...prev,
      ...(transaction.type==='income'
        ? { income:   {...prev.income,   total:prev.income.total   +transaction.amount} }
        : { expenses: {...prev.expenses, total:prev.expenses.total +transaction.amount} }),
    } : null);
  }, []);

  const updateBudgetSpent = useCallback((category: string, amount: number) => {
    setBudgets((prev) => prev.map((b) => b.category===category ? {...b, spent:b.spent+amount} : b));
  }, []);

  const chartData = buildChartData(rawTxs, months);
  const totalIncome   = transactions.filter((t)=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const totalExpenses = transactions.filter((t)=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

  return (
    <DashboardDataContext.Provider value={{
      loading, months, setMonths, rawTxs, chartData,
      netWorth, stats, transactions, budgets, spendingData, insights, trendData,
      totalIncome, totalExpenses,
      getTransactionsByType:     (type) => transactions.filter((t)=>t.type===type),
      getTransactionsByCategory: (cat)  => transactions.filter((t)=>t.category===cat),
      getBudgetProgress:         (id)   => { const b=budgets.find((b)=>b.id===id); return b?Math.min(Math.round((b.spent/b.limit)*100),100):0; },
      addTransaction, updateBudgetSpent,
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