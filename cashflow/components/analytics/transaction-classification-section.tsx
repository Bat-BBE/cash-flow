'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useIsNarrow } from '@/hook/use-is-mobile';
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
  const narrow = useIsNarrow();
  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = data.filter((d) => d.value > 0);
  const innerR = narrow ? 22 : 28;
  const outerR = narrow ? 34 : 44;

  if (total === 0) {
    return (
      <div className="flex h-[88px] items-center justify-center text-[10px] text-slate-500 sm:h-[100px] sm:text-xs">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-[88px] w-full sm:h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerR}
            outerRadius={outerR}
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
              borderRadius: 10,
              fontSize: narrow ? 10 : 12,
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
    <div className="space-y-1.5 sm:space-y-2">
      {rows.map((r, i) => (
        <div key={r.name} className="flex items-center gap-1 text-[9px] sm:gap-2 sm:text-[11px]">
          <span
            className="size-1.5 shrink-0 rounded-sm sm:size-2"
            style={{ backgroundColor: colors[i % 2] }}
          />
          <span className="flex-1 truncate text-brand-muted">{r.name}</span>
          <span className="shrink-0 font-mono tabular-nums text-white/90">
            {formatCurrency(r.value, 'MNT')}
          </span>
          <span className="w-9 shrink-0 text-right text-white/45 sm:w-10">
            {((r.value / total) * 100).toFixed(0)}%
          </span>
        </div>
      ))}
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06] sm:mt-2 sm:h-2">
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

type SummaryMiniCardProps = {
  title: string;
  subtitle: string;
  data: { name: string; value: number }[];
  colors: readonly [string, string];
  emptyLabel: string;
};

function SummaryMiniCard({ title, subtitle, data, colors, emptyLabel }: SummaryMiniCardProps) {
  return (
    <div className="rounded-[0.85rem] border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/80 p-2 sm:rounded-2xl sm:p-4">
      <p className="text-[7px] font-bold uppercase tracking-wider text-brand-muted sm:text-[10px]">
        {title}
      </p>
      <p className="mt-0.5 text-[8px] leading-tight text-brand-muted sm:mt-1 sm:text-xs">{subtitle}</p>
      <MiniDonut data={data} colors={colors} emptyLabel={emptyLabel} />
      <HorizontalBarLegend rows={data} colors={colors} />
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

  const chartsScrollerRef = useRef<HTMLDivElement>(null);
  const [chartsSlide, setChartsSlide] = useState(0);

  const syncChartsSlideFromScroll = useCallback(() => {
    const el = chartsScrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    setChartsSlide(Math.min(1, Math.round(el.scrollLeft / w)));
  }, []);

  useEffect(() => {
    const el = chartsScrollerRef.current;
    if (!el) return;
    syncChartsSlideFromScroll();
    el.addEventListener('scroll', syncChartsSlideFromScroll, { passive: true });
    return () => el.removeEventListener('scroll', syncChartsSlideFromScroll);
  }, [syncChartsSlideFromScroll]);

  return (
    <section className="mt-5 space-y-3 border-t border-white/[0.06] pt-5 sm:mt-8 sm:space-y-4 sm:pt-8">
      <div>
        <h2 className="text-[0.9375rem] font-bold leading-snug tracking-tight text-white sm:text-xl md:text-2xl md:font-black">
          Гүйлгээ ангилах
        </h2>
        <p className="mt-0.5 max-w-2xl text-[9px] leading-relaxed text-brand-muted sm:mt-1 sm:text-sm">
          Орлого, зардлаа энгийн ангиллаар ялгаж, зарцуулалтын хэв маягаа ойлгоорой.
        </p>
      </div>

      {/* Tabs — жижиг, нэг мөртэй сегмент */}
      <div
        className="flex gap-0.5 rounded-xl border border-white/5 bg-brand-bg/80 p-0.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] sm:gap-1 sm:rounded-2xl sm:p-1"
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
              'min-h-[34px] flex-1 rounded-[0.6rem] px-1 py-1 text-center transition-all sm:min-h-[40px] sm:rounded-xl sm:px-2 sm:py-1.5',
              activeTab === t.id
                ? 'bg-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-1 ring-brand-primary/35'
                : 'text-brand-muted hover:bg-white/[0.04] hover:text-white/80'
            )}
          >
            <span className="block text-[8px] font-semibold uppercase leading-tight tracking-wide sm:text-[10px] sm:font-bold">
              {t.title}
            </span>
            <span
              className={cn(
                'mt-0.5 hidden text-[8px] font-medium leading-tight sm:block sm:text-[9px]',
                activeTab === t.id ? 'text-white/65' : 'text-white/35'
              )}
            >
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      {/* Active classification card */}
      <div
        className="rounded-[1.15rem] border border-white/5 bg-brand-card/90 p-3 shadow-[0_0_40px_rgba(0,0,0,0.25)] sm:rounded-2xl sm:p-5"
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
              className="flex flex-col gap-2.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight text-slate-100 sm:text-base">{tx.label}</p>
                <p className="mt-0.5 font-mono text-xs font-bold tabular-nums text-sky-200/90 sm:text-sm">
                  {formatCurrency(tx.amount, 'MNT')}
                </p>
              </div>

              {activeTab === 'income' && (
                <div className="flex flex-wrap gap-1.5 sm:justify-end sm:gap-2">
                  <button
                    type="button"
                    onClick={() => updateIncome(tx.id, 'fixed')}
                    className={cn(
                      'rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition-all sm:px-3.5 sm:py-2 sm:text-xs',
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
                      'rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition-all sm:px-3.5 sm:py-2 sm:text-xs',
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
                <div className="flex flex-wrap gap-1.5 sm:justify-end sm:gap-2">
                  <button
                    type="button"
                    onClick={() => updateFlexible(tx.id, 'cuttable')}
                    className={cn(
                      'rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition-all sm:px-3.5 sm:py-2 sm:text-xs',
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
                      'rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition-all sm:px-3.5 sm:py-2 sm:text-xs',
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

      <div className="hidden gap-3 lg:grid lg:grid-cols-3 lg:gap-4">
        <SummaryMiniCard
          title="Орлогын бүтэц"
          subtitle="Тогтмол vs хувьсах"
          data={incomeAgg}
          colors={INCOME_COLORS}
          emptyLabel="Өгөгдөл алга"
        />
        <SummaryMiniCard
          title="Зардлын бүтэц"
          subtitle="Тогтмол vs тогтмол биш"
          data={expenseAgg}
          colors={EXPENSE_COLORS}
          emptyLabel="Өгөгдөл алга"
        />
        <SummaryMiniCard
          title="Уян хатан зардал"
          subtitle="Танаж болох vs болохгүй"
          data={flexibleAgg}
          colors={FLEX_COLORS}
          emptyLabel="Өгөгдөл алга"
        />
      </div>

      {/* Утас: хэвтээ свайп — орлого+зардал | уян хатан (товчгүй) */}
      <div className="lg:hidden">
        <p className="mb-1 text-center text-[8px] text-white/40 sm:text-[9px]">
          Свайп: орлого/зардал · уян хатан
        </p>
        <div
          ref={chartsScrollerRef}
          className="flex touch-pan-x snap-x snap-mandatory overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="w-full min-w-full shrink-0 snap-center snap-always px-0.5">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <SummaryMiniCard
                title="Орлогын бүтэц"
                subtitle="Тогтмол vs хувьсах"
                data={incomeAgg}
                colors={INCOME_COLORS}
                emptyLabel="Өгөгдөл алга"
              />
              <SummaryMiniCard
                title="Зардлын бүтэц"
                subtitle="Тогтмол vs тогтмол биш"
                data={expenseAgg}
                colors={EXPENSE_COLORS}
                emptyLabel="Өгөгдөл алга"
              />
            </div>
          </div>
          <div className="w-full min-w-full shrink-0 snap-center snap-always px-0.5">
            <SummaryMiniCard
              title="Уян хатан зардал"
              subtitle="Танаж болох vs болохгүй"
              data={flexibleAgg}
              colors={FLEX_COLORS}
              emptyLabel="Өгөгдөл алга"
            />
          </div>
        </div>
        <div
          className="mt-1.5 flex items-center justify-center gap-1.5"
          aria-hidden
        >
          <span
            className={cn(
              'h-1 rounded-full transition-[width,background-color] duration-200',
              chartsSlide === 0 ? 'w-4 bg-white/55' : 'w-1 bg-white/20',
            )}
          />
          <span
            className={cn(
              'h-1 rounded-full transition-[width,background-color] duration-200',
              chartsSlide === 1 ? 'w-4 bg-white/55' : 'w-1 bg-white/20',
            )}
          />
        </div>
      </div>
    </section>
  );
}
