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
        <span className="text-[9px] font-black uppercase leading-tight tracking-wide text-sky-100 sm:text-[11px]">
          Тогтмол
          <br />
          зардал
        </span>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-y-4 right-3 z-0 flex max-w-[42%] items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/12 px-2 py-3 text-center"
        style={{ opacity: rightHint }}
      >
        <span className="text-[9px] font-black uppercase leading-tight tracking-wide text-amber-100 sm:text-[11px]">
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
          <div className="flex items-start justify-between gap-2 px-4 pb-1.5 pt-4 sm:gap-3 sm:px-5 sm:pb-2 sm:pt-5">
            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sky-300 ring-1 ring-white/10 sm:size-11 sm:rounded-2xl">
                <Wallet className="size-[18px] sm:size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold leading-snug text-white sm:text-base">
                  {tx.label}
                </p>
                {tx.categoryHint && (
                  <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:mt-1 sm:text-xs">{tx.categoryHint}</p>
                )}
              </div>
            </div>
            <CreditCard className="size-[18px] shrink-0 text-slate-600 sm:size-5" strokeWidth={1.5} />
          </div>
          <div className="px-4 pb-4 pt-0.5 sm:px-5 sm:pb-5 sm:pt-1">
            <p className="font-mono text-[1.35rem] font-black tabular-nums leading-none tracking-tight text-sky-200/95 sm:text-2xl">
              {formatCurrency(tx.amount, 'MNT')}
            </p>
            {tx.date && (
              <p className="mt-1.5 text-[10px] font-medium text-slate-500 sm:mt-2 sm:text-xs">{tx.date}</p>
            )}
          </div>
          <div className="flex justify-between gap-1 border-t border-white/[0.06] px-3 py-2 text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:px-5 sm:py-3 sm:text-[10px]">
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

  if (total === 0) {
    return (
      <p className="py-8 text-center text-[12px] text-slate-500 sm:text-sm">Зардлын гүйлгээ алга.</p>
    );
  }

  if (!current) {
    return (
      <div className="space-y-4 py-5 text-center sm:space-y-5 sm:py-6">
        <p className="text-[1rem] font-bold text-white sm:text-lg">Бүх зардлыг ангиллаа</p>
        <p className="text-[11px] leading-relaxed text-slate-400 sm:text-sm">
          Доорх хураангуй шинэчлэгдсэн. Дахин swipe хийх бол товшино уу.
        </p>
        <button
          type="button"
          onClick={onRestartDeck}
          className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-[12px] font-bold text-white transition hover:bg-white/10 sm:px-6 sm:py-2.5 sm:text-sm"
        >
          Дахин эхлүүлэх
        </button>
        <ExpenseLiveSummary fixedPct={fixedPct} varPct={varPct} />
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <p className="text-[12px] font-semibold text-slate-300 sm:text-sm">
          <span className="tabular-nums text-white">{done}</span>
          <span className="text-slate-500"> / </span>
          <span className="tabular-nums text-slate-400">{total}</span>
          <span className="ml-1.5 text-[11px] text-slate-500 sm:ml-2 sm:text-inherit">ангилсан</span>
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

      <div className="relative min-h-[210px] py-0 sm:min-h-[260px] sm:py-0.5">
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
            <div className="rounded-2xl border border-white/[0.06] bg-[#151b28]/95 p-3.5 shadow-lg sm:rounded-3xl sm:p-5">
              <p className="truncate text-[11px] font-semibold text-slate-500 sm:text-sm">{tx.label}</p>
            </div>
          </div>
        ))}

        <div className="relative z-10">
          <SwipeableExpenseCard key={current.id} tx={current} onCommit={handleSwipeCommit} />
        </div>
      </div>

      <ExpenseLiveSummary fixedPct={fixedPct} varPct={varPct} />
    </div>
  );
}

function ExpenseLiveSummary({ fixedPct, varPct }: { fixedPct: number; varPct: number }) {
  return (
    <div className="rounded-[1rem] border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 sm:rounded-2xl sm:px-4 sm:py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
        Шууд хураангуй
      </p>
      <div className="mt-1 flex flex-wrap gap-2 text-[11px] sm:gap-3 sm:text-sm">
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
