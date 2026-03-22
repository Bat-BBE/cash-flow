'use client';

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ExpenseSwipeDeck } from '@/components/analytics/expense-swipe-deck';
import {
  aggregateExpenseStructure,
  aggregateFlexibleStructure,
  aggregateIncomeStructure,
  INITIAL_ANALYSIS_TRANSACTIONS,
  MOCK_EXPENSE_IDS_ORDER,
  type AnalysisTransaction,
  type ExpenseClassification,
  type FlexibleClassification,
  type IncomeClassification,
} from '@/lib/analytics/analysis-flow-model';

const TAB_CONFIG = [
  {
    id: 'income' as const,
    title: 'Орлогын ангилал',
    hint: 'Тогтмол / хувьсах',
  },
  {
    id: 'expense' as const,
    title: 'Зардлын ангилал',
    hint: 'Тогтмол / тогтмол биш',
  },
  {
    id: 'flexible' as const,
    title: 'Уян хатан зардал',
    hint: 'Танаж болох эсэх',
  },
];

const INCOME_COLORS = ['#38bdf8', '#a78bfa'] as const;
const EXPENSE_COLORS = ['#fb923c', '#f97316'] as const;
const FLEX_COLORS = ['#2dd4bf', '#e879f9'] as const;

function MiniDonut({
  data,
  colors,
  emptyLabel,
}: {
  data: { name: string; value: number }[];
  colors: readonly [string, string];
  emptyLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = data.filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-[100px] items-center justify-center text-xs text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-[100px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={44}
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={entry.name} fill={colors[i % 2]} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{
              background: '#121826',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value) =>
              formatCurrency(typeof value === 'number' ? value : Number(value), 'MNT')
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function HorizontalBarLegend({
  rows,
  colors,
}: {
  rows: { name: string; value: number }[];
  colors: readonly [string, string];
}) {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.name} className="flex items-center gap-2 text-[11px]">
          <span
            className="size-2 shrink-0 rounded-sm"
            style={{ backgroundColor: colors[i % 2] }}
          />
          <span className="flex-1 truncate text-slate-400">{r.name}</span>
          <span className="shrink-0 font-mono tabular-nums text-slate-200">
            {formatCurrency(r.value, 'MNT')}
          </span>
          <span className="w-10 shrink-0 text-right text-slate-500">
            {((r.value / total) * 100).toFixed(0)}%
          </span>
        </div>
      ))}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="flex h-full w-full">
          {rows.map((r, i) => (
            <div
              key={r.name}
              className="h-full transition-all"
              style={{
                width: `${(r.value / total) * 100}%`,
                backgroundColor: colors[i % 2],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type TransactionClassificationSectionProps = {
  transactions: AnalysisTransaction[];
  setTransactions: Dispatch<SetStateAction<AnalysisTransaction[]>>;
};

export function TransactionClassificationSection({
  transactions: rows,
  setTransactions,
}: TransactionClassificationSectionProps) {
  const [expenseQueue, setExpenseQueue] = useState<string[]>(() => [
    ...MOCK_EXPENSE_IDS_ORDER,
  ]);
  const [activeTab, setActiveTab] =
    useState<(typeof TAB_CONFIG)[number]['id']>('income');

  const incomeAgg = useMemo(() => aggregateIncomeStructure(rows), [rows]);
  const expenseAgg = useMemo(() => aggregateExpenseStructure(rows), [rows]);
  const flexibleAgg = useMemo(() => aggregateFlexibleStructure(rows), [rows]);

  const updateIncome = useCallback((id: string, v: IncomeClassification) => {
    setTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, income: v } : r))
    );
  }, [setTransactions]);

  const updateExpense = useCallback((id: string, v: ExpenseClassification) => {
    setTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, expense: v } : r))
    );
  }, [setTransactions]);

  const classifyExpenseFromSwipe = useCallback(
    (id: string, v: ExpenseClassification) => {
      updateExpense(id, v);
      setExpenseQueue((q) => (q[0] === id ? q.slice(1) : q.filter((x) => x !== id)));
    },
    [updateExpense]
  );

  const resetExpenseDeck = useCallback(() => {
    setExpenseQueue([...MOCK_EXPENSE_IDS_ORDER]);
    setTransactions((prev) =>
      prev.map((r) => {
        if (r.tab !== 'expense') return r;
        const init = INITIAL_ANALYSIS_TRANSACTIONS.find((x) => x.id === r.id);
        return init ? { ...r, expense: init.expense } : r;
      })
    );
  }, [setTransactions]);

  const updateFlexible = useCallback((id: string, v: FlexibleClassification) => {
    setTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, flexible: v } : r))
    );
  }, [setTransactions]);

  const visibleRows = useMemo(
    () => rows.filter((r) => r.tab === activeTab),
    [rows, activeTab]
  );

  return (
    <section className="mt-8 space-y-5 border-t border-white/[0.06] pt-8">
      <div>
        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          Гүйлгээ ангилах
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
          Орлого, зардлаа энгийн ангиллаар ялгаж, зарцуулалтын хэв маягаа ойлгоорой.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.08] bg-[#151b28]/80 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
        role="tablist"
        aria-label="Ангиллын төрөл"
      >
        {TAB_CONFIG.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'min-h-[44px] flex-1 rounded-xl px-3 py-2 text-left transition-all sm:min-w-[160px]',
              activeTab === t.id
                ? 'bg-gradient-to-r from-brand-primary/85 to-fuchsia-600/70 text-white shadow-[0_0_24px_rgba(112,96,240,0.25)]'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
            )}
          >
            <span className="block text-xs font-black uppercase tracking-wide">
              {t.title}
            </span>
            <span
              className={cn(
                'mt-0.5 block text-[10px] font-medium',
                activeTab === t.id ? 'text-white/85' : 'text-slate-500'
              )}
            >
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      {/* Active classification card */}
      <div
        className="rounded-2xl border border-white/[0.08] bg-[#1a2130]/90 p-4 shadow-[0_0_40px_rgba(0,0,0,0.25)] sm:p-5"
        role="tabpanel"
      >
        {activeTab === 'expense' ? (
          <ExpenseSwipeDeck
            queue={expenseQueue}
            expenseRows={rows.filter((r) => r.tab === 'expense')}
            allRowsForSummary={rows}
            onClassify={classifyExpenseFromSwipe}
            onRestartDeck={resetExpenseDeck}
          />
        ) : (
        <ul className="divide-y divide-white/[0.06]">
          {visibleRows.map((tx) => (
            <li
              key={tx.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-100">{tx.label}</p>
                <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-sky-200/90">
                  {formatCurrency(tx.amount, 'MNT')}
                </p>
              </div>

              {activeTab === 'income' && (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => updateIncome(tx.id, 'fixed')}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-bold transition-all',
                      tx.income === 'fixed'
                        ? 'border-sky-400/60 bg-sky-500/25 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-slate-200'
                    )}
                  >
                    Тогтмол орлого
                  </button>
                  <button
                    type="button"
                    onClick={() => updateIncome(tx.id, 'variable')}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-bold transition-all',
                      tx.income === 'variable'
                        ? 'border-violet-400/60 bg-violet-500/25 text-violet-100 shadow-[0_0_16px_rgba(167,139,250,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-slate-200'
                    )}
                  >
                    Хувьсах орлого
                  </button>
                </div>
              )}

              {activeTab === 'flexible' && (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => updateFlexible(tx.id, 'cuttable')}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-bold transition-all',
                      tx.flexible === 'cuttable'
                        ? 'border-teal-400/55 bg-teal-500/20 text-teal-100 shadow-[0_0_16px_rgba(45,212,191,0.18)]'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-slate-200'
                    )}
                  >
                    Танаж болох
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFlexible(tx.id, 'not_cuttable')}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-bold transition-all',
                      tx.flexible === 'not_cuttable'
                        ? 'border-fuchsia-400/55 bg-fuchsia-500/18 text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.15)]'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-slate-200'
                    )}
                  >
                    Танаж болохгүй
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        )}
      </div>

      {/* Mini summaries */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Орлогын бүтэц
          </p>
          <p className="mt-1 text-xs text-slate-400">Тогтмол vs хувьсах</p>
          <MiniDonut
            data={incomeAgg}
            colors={INCOME_COLORS}
            emptyLabel="Өгөгдөл алга"
          />
          <HorizontalBarLegend rows={incomeAgg} colors={INCOME_COLORS} />
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Зардлын бүтэц
          </p>
          <p className="mt-1 text-xs text-slate-400">Тогтмол vs тогтмол биш</p>
          <MiniDonut
            data={expenseAgg}
            colors={EXPENSE_COLORS}
            emptyLabel="Өгөгдөл алга"
          />
          <HorizontalBarLegend rows={expenseAgg} colors={EXPENSE_COLORS} />
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Уян хатан зардал
          </p>
          <p className="mt-1 text-xs text-slate-400">Танаж болох vs болохгүй</p>
          <MiniDonut
            data={flexibleAgg}
            colors={FLEX_COLORS}
            emptyLabel="Өгөгдөл алга"
          />
          <HorizontalBarLegend rows={flexibleAgg} colors={FLEX_COLORS} />
        </div>
      </div>
    </section>
  );
}
