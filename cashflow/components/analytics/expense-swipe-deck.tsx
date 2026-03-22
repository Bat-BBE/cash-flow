'use client';

import { useCallback, useMemo } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { CreditCard, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  aggregateExpenseStructure,
  type AnalysisTransaction,
  type ExpenseClassification,
} from '@/lib/analytics/analysis-flow-model';

const SWIPE_OFFSET_THRESHOLD = 96;
const SWIPE_VELOCITY = 520;

type ExpenseSwipeDeckProps = {
  queue: string[];
  expenseRows: AnalysisTransaction[];
  allRowsForSummary: AnalysisTransaction[];
  onClassify: (id: string, classification: ExpenseClassification) => void;
  onRestartDeck: () => void;
};

function txById(
  rows: AnalysisTransaction[],
  id: string
): AnalysisTransaction | undefined {
  return rows.find((r) => r.id === id);
}

function SwipeableExpenseCard({
  tx,
  onCommit,
}: {
  tx: AnalysisTransaction;
  onCommit: (direction: 'left' | 'right') => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-10, 10]);
  const leftHint = useTransform(x, [-180, -24, 0], [1, 0.35, 0]);
  const rightHint = useTransform(x, [0, 24, 180], [0, 0.35, 1]);

  const commit = useCallback(
    (direction: 'left' | 'right') => {
      const target = direction === 'left' ? -520 : 520;
      animate(x, target, {
        type: 'tween',
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => onCommit(direction),
      });
    },
    [onCommit, x]
  );

  const onDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const dx = info.offset.x;
      const vx = info.velocity.x;
      if (dx < -SWIPE_OFFSET_THRESHOLD || vx < -SWIPE_VELOCITY) {
        commit('left');
      } else if (dx > SWIPE_OFFSET_THRESHOLD || vx > SWIPE_VELOCITY) {
        commit('right');
      } else {
        animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
      }
    },
    [commit, x]
  );

  return (
    <div className="relative mx-auto w-full max-w-md touch-pan-y">
      {/* Side hints */}
      <motion.div
        className="pointer-events-none absolute inset-y-4 left-3 z-0 flex max-w-[42%] items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/15 px-2 py-3 text-center"
        style={{ opacity: leftHint }}
      >
        <span className="text-[11px] font-black uppercase leading-tight tracking-wide text-sky-100">
          Тогтмол
          <br />
          зардал
        </span>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-y-4 right-3 z-0 flex max-w-[42%] items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/12 px-2 py-3 text-center"
        style={{ opacity: rightHint }}
      >
        <span className="text-[11px] font-black uppercase leading-tight tracking-wide text-amber-100">
          Тогтмол биш
          <br />
          зардал
        </span>
      </motion.div>

      <motion.div
        className="relative z-10 cursor-grab select-none active:cursor-grabbing"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.72}
        onDragEnd={onDragEnd}
        whileTap={{ scale: 1.01 }}
      >
        <div
          className={cn(
            'overflow-hidden rounded-3xl border border-white/[0.12]',
            'bg-gradient-to-br from-[#1e2638] via-[#1a2130] to-[#151b28]',
            'shadow-[0_24px_48px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
          )}
        >
          <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-sky-300 ring-1 ring-white/10">
                <Wallet className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-snug text-white">
                  {tx.label}
                </p>
                {tx.categoryHint && (
                  <p className="mt-1 truncate text-xs text-slate-500">{tx.categoryHint}</p>
                )}
              </div>
            </div>
            <CreditCard className="size-5 shrink-0 text-slate-600" strokeWidth={1.5} />
          </div>
          <div className="px-5 pb-5 pt-1">
            <p className="font-mono text-2xl font-black tabular-nums tracking-tight text-sky-200/95">
              {formatCurrency(tx.amount, 'MNT')}
            </p>
            {tx.date && (
              <p className="mt-2 text-xs font-medium text-slate-500">{tx.date}</p>
            )}
          </div>
          <div className="flex justify-between border-t border-white/[0.06] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span className="text-sky-300/90">← чирээд тогтмол</span>
            <span className="text-amber-300/90">тогтмол биш чирээд →</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ExpenseSwipeDeck({
  queue,
  expenseRows,
  allRowsForSummary,
  onClassify,
  onRestartDeck,
}: ExpenseSwipeDeckProps) {
  const total = expenseRows.length;
  const done = total - queue.length;
  const progressPct = total > 0 ? (done / total) * 100 : 0;

  const currentId = queue[0];
  const current = currentId ? txById(expenseRows, currentId) : undefined;
  const stackPreview = useMemo(
    () =>
      queue
        .slice(1, 4)
        .map((id) => txById(expenseRows, id))
        .filter(Boolean) as AnalysisTransaction[],
    [queue, expenseRows]
  );

  const agg = useMemo(
    () => aggregateExpenseStructure(allRowsForSummary),
    [allRowsForSummary]
  );
  const sumVal = agg[0].value + agg[1].value;
  const fixedPct = sumVal > 0 ? (agg[0].value / sumVal) * 100 : 0;
  const varPct = sumVal > 0 ? (agg[1].value / sumVal) * 100 : 0;

  const handleSwipeCommit = useCallback(
    (direction: 'left' | 'right') => {
      if (!current) return;
      const classification: ExpenseClassification =
        direction === 'left' ? 'fixed' : 'variable_nonfixed';
      onClassify(current.id, classification);
    },
    [current, onClassify]
  );

  const handleButton = (classification: ExpenseClassification) => {
    if (!current) return;
    onClassify(current.id, classification);
  };

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">Зардлын гүйлгээ алга.</p>
    );
  }

  if (!current) {
    return (
      <div className="space-y-5 py-6 text-center">
        <p className="text-lg font-bold text-white">Бүх зардлыг ангиллаа</p>
        <p className="text-sm text-slate-400">
          Доорх хураангуй шинэчлэгдсэн. Дахин swipe хийх бол товшино уу.
        </p>
        <button
          type="button"
          onClick={onRestartDeck}
          className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
        >
          Дахин эхлүүлэх
        </button>
        <ExpenseLiveSummary fixedPct={fixedPct} varPct={varPct} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-300">
          <span className="tabular-nums text-white">{done}</span>
          <span className="text-slate-500"> / </span>
          <span className="tabular-nums text-slate-400">{total}</span>
          <span className="ml-2 text-slate-500">ангилсан</span>
        </p>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/[0.06] sm:ml-auto">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-fuchsia-500/90"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      <div className="relative min-h-[300px] py-2">
        {stackPreview.map((tx, i) => (
          <div
            key={tx.id}
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-md px-1"
            style={{
              transform: `scale(${0.92 - i * 0.025}) translateY(${(i + 1) * 10}px)`,
              zIndex: 4 - i,
              opacity: 0.55 - i * 0.12,
            }}
          >
            <div className="rounded-3xl border border-white/[0.06] bg-[#151b28]/95 p-5 shadow-lg">
              <p className="truncate text-sm font-semibold text-slate-500">{tx.label}</p>
            </div>
          </div>
        ))}

        <div className="relative z-10">
          <SwipeableExpenseCard key={current.id} tx={current} onCommit={handleSwipeCommit} />
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={() => handleButton('fixed')}
          className="rounded-2xl border border-sky-400/35 bg-sky-500/15 py-3 text-sm font-bold text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.12)] transition hover:bg-sky-500/25"
        >
          ← Тогтмол зардал
        </button>
        <button
          type="button"
          onClick={() => handleButton('variable_nonfixed')}
          className="rounded-2xl border border-amber-400/35 bg-amber-500/12 py-3 text-sm font-bold text-amber-100 shadow-[0_0_24px_rgba(251,146,60,0.1)] transition hover:bg-amber-500/20"
        >
          Тогтмол биш зардал →
        </button>
      </div>

      <ExpenseLiveSummary fixedPct={fixedPct} varPct={varPct} />
    </div>
  );
}

function ExpenseLiveSummary({ fixedPct, varPct }: { fixedPct: number; varPct: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Шууд хураангуй
      </p>
      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        <span className="text-slate-300">
          Тогтмол зардал:{' '}
          <span className="font-mono font-bold text-sky-200">{fixedPct.toFixed(0)}%</span>
        </span>
        <span className="text-slate-300">
          Тогтмол биш:{' '}
          <span className="font-mono font-bold text-amber-200">{varPct.toFixed(0)}%</span>
        </span>
      </div>
    </div>
  );
}
