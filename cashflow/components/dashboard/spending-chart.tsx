'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { cn, formatCurrency }                    from '@/lib/utils';
import { useIsNarrow }                           from '@/hook/use-is-mobile';
import { Button }                                from '@/components/ui/button';
import { Input }                                 from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
}                                                from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
}                                                from '@/components/ui/select';
import { useDashboardData }                      from '@/contexts/dashboard-data-context';
import { timeRangeLabelMn, budgetLimitMultiplier } from '@/lib/dashboard-time-range';
import { useDashboard }                          from '@/components/providers/dashboard-provider';
import { useTranslation }                        from '@/lib/translations';

const MASK = '••••••••';

function fmtCompact(v: number, masked?: boolean): string {
  if (masked) return MASK;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}сая₮`;
  if (v >= 1_000)     return `${Math.round(v / 1_000)}мян₮`;
  return `${v}₮`;
}

interface Seg { category: string; amount: number; color: string; percentage: number }

function DonutChart({
  segments, total, highlighted, onHover, privacyMasked,
}: {
  segments: Seg[]; total: number;
  highlighted: string | null; onHover: (c: string | null) => void;
  privacyMasked?: boolean;
}) {
  const [prog, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setProgress(0);
    let start: number | null = null;
    const dur = 650;
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const GAP = 1.5;
  const R = 42, r = 27, cx = 50, cy = 50;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let cursor = -90;

  const paths = segments.map((seg) => {
    const fullDeg = (seg.amount / total) * 360 * prog;
    const deg     = Math.max(0, fullDeg - GAP);
    const startD  = cursor + GAP / 2;
    const endD    = startD + deg;
    cursor       += (seg.amount / total) * 360 * prog;
    if (deg <= 0) return null;

    const x1  = cx + R * Math.cos(toRad(startD));
    const y1  = cy + R * Math.sin(toRad(startD));
    const x2  = cx + R * Math.cos(toRad(endD));
    const y2  = cy + R * Math.sin(toRad(endD));
    const ix1 = cx + r * Math.cos(toRad(endD));
    const iy1 = cy + r * Math.sin(toRad(endD));
    const ix2 = cx + r * Math.cos(toRad(startD));
    const iy2 = cy + r * Math.sin(toRad(startD));
    const large = deg > 180 ? 1 : 0;

    const isHl  = highlighted === seg.category;
    const isDim = highlighted !== null && !isHl;
    const midD  = (startD + endD) / 2;
    const off   = isHl ? 4 : 0;

    return (
      <path
        key={seg.category}
        d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2} Z`}
        fill={seg.color}
        opacity={isDim ? 0.18 : 1}
        transform={`translate(${off * Math.cos(toRad(midD))},${off * Math.sin(toRad(midD))})`}
        style={{ transition: 'opacity .2s, transform .2s' }}
        className="cursor-pointer touch-manipulation"
        onMouseEnter={() => onHover(seg.category)}
        onMouseLeave={() => onHover(null)}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') onHover(seg.category);
        }}
      />
    );
  });

  const hl = highlighted ? segments.find((s) => s.category === highlighted) : null;

  return (
    <div className="relative mx-auto aspect-square w-[8.25rem] shrink-0 sm:w-60">
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
        {paths}
        <circle cx={cx} cy={cy} r={r - 1} fill="transparent" />
      </svg>
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3"
        style={{ opacity: prog }}
      >
        {hl ? (
          <>
            <p className="max-w-full truncate text-center text-[9px] font-semibold leading-snug text-white/55 sm:text-[13px]">
              {hl.category}
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-white sm:mt-1 sm:text-base">
              {privacyMasked ? MASK : `${hl.percentage}%`}
            </p>
          </>
        ) : (
          <>
            <p className="text-[11px] text-white/35 sm:text-[14px]">нийт</p>
            <p className="mt-0.5 max-w-full truncate text-center text-xs font-bold tabular-nums text-white sm:text-sm">
              {fmtCompact(total, privacyMasked)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  item, pct, budget, isHl, onEnter, onLeave, onTapToggle, narrow, privacyMasked,
}: {
  item:        Seg;
  pct:         number;
  budget:      { spent: number; limit: number; bpct: number } | null;
  isHl:        boolean;
  onEnter:     () => void;
  onLeave:     () => void;
  onTapToggle: () => void;
  narrow:      boolean;
  privacyMasked?: boolean;
}) {
  const isOver = !!budget && budget.bpct >= 100;
  const isNear = !!budget && budget.bpct >= 80 && budget.bpct < 100;

  return (
    <div
      role={narrow ? 'button' : undefined}
      tabIndex={narrow ? 0 : undefined}
      onKeyDown={(e) => {
        if (narrow && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onTapToggle();
        }
      }}
      className={cn(
        'min-w-0 rounded-xl px-2 py-2 cursor-pointer transition-all duration-150',
        isHl ? 'bg-white/[0.07] ring-1 ring-white/10' : 'hover:bg-white/[0.035]',
      )}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={narrow ? onTapToggle : undefined}
    >
      <div className={cn(
        'grid min-w-0 items-center gap-x-2',
        budget && budget.limit > 0
          ? 'grid-cols-[1rem_minmax(0,1fr)_auto_auto_2rem]'
          : 'grid-cols-[1rem_minmax(0,1fr)_auto_2rem]',
      )}>
        <span
          className="size-2 shrink-0 rounded-sm sm:size-2.5"
          style={{
            background: item.color,
            transform: isHl ? 'scale(1.35)' : 'scale(1)',
            transition: 'transform .15s',
          }}
          aria-hidden
        />

        <span
          className={cn(
            'block min-w-0 truncate text-[10px] font-medium leading-snug sm:text-[11px]',
            isHl ? 'text-white' : 'text-white/48',
          )}
          title={item.category}
        >
          {item.category}
        </span>

        {budget && budget.limit > 0 && (
          <span className={cn(
            'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums leading-none',
            isOver  ? 'bg-rose-500/20 text-rose-400'
            : isNear ? 'bg-amber-500/20 text-amber-400'
            :          'bg-emerald-500/12 text-emerald-400',
          )}>
            {budget.bpct}%
          </span>
        )}

        <span className="shrink-0 text-right text-[10px] font-bold tabular-nums text-white sm:text-[11px]">
          {fmtCompact(item.amount, privacyMasked)}
        </span>

        <span className="shrink-0 text-right text-[10px] tabular-nums text-white/28">
          {Math.round(pct)}%
        </span>
      </div>

      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: item.color,
            opacity: isHl ? 1 : 0.5,
            transition: 'opacity .15s, width .5s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>

      {budget && budget.limit > 0 && isHl && (
        <div className="mt-1.5 flex min-w-0 items-center gap-2">
          <div className="h-[2px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                isOver ? 'bg-rose-500' : isNear ? 'bg-amber-400' : 'bg-emerald-400',
              )}
              style={{ width: `${Math.min(budget.bpct, 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-[9px] tabular-nums leading-none text-white/28">
            {fmtCompact(budget.spent, privacyMasked)} / {fmtCompact(budget.limit, privacyMasked)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
type BreakdownMode = 'expense' | 'income';

export function SpendingChart() {
  const {
    spendingData,
    incomeBreakdownData,
    loading,
    budgets,
    timeRange,
    setBudgetLimit,
    privacyMasked,
  } = useDashboardData();
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('expense');
  const { language } = useDashboard();
  const t            = useTranslation(language);
  const narrow       = useIsNarrow();

  const [hovered,    setHovered]    = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjCat,     setAdjCat]     = useState('');
  const [adjInput,   setAdjInput]   = useState('');

  useEffect(() => {
    if (!adjustOpen) return;
    if (!adjCat && budgets.length) setAdjCat(budgets[0].category);
  }, [adjustOpen, adjCat, budgets]);

  useEffect(() => {
    if (!adjustOpen || !adjCat) return;
    const b = budgets.find((x) => x.category === adjCat);
    if (!b) return;
    const mult = budgetLimitMultiplier(timeRange);
    setAdjInput(String(Math.round(b.limit / Math.max(mult, 1e-6))));
  }, [adjustOpen, adjCat, budgets, timeRange]);

  const activeData = breakdownMode === 'expense' ? spendingData : incomeBreakdownData;

  const totalSpent = useMemo(
    () => activeData.reduce((s, d) => s + d.amount, 0),
    [activeData],
  );

  const budgetMap = useMemo(() => {
    const map: Record<string, { spent: number; limit: number; bpct: number }> = {};
    budgets.forEach((b) => {
      map[b.category] = {
        spent: b.spent,
        limit: b.limit,
        bpct:  b.limit > 0 ? Math.min(Math.round((b.spent / b.limit) * 100), 100) : 0,
      };
    });
    return map;
  }, [budgets]);

  const overBudget = useMemo(
    () => Object.entries(budgetMap).filter(([, b]) => b.limit > 0 && b.bpct >= 100),
    [budgetMap],
  );

  const donutKey = useMemo(
    () => activeData.map((s) => `${s.category}:${s.amount}`).join('|'),
    [activeData],
  );

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="rounded-[1.15rem] border border-white/5 bg-brand-card p-3.5 sm:rounded-2xl sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-36 rounded bg-white/5" />
          <div className="flex items-center gap-4">
            <div className="size-40 shrink-0 rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="size-2 shrink-0 rounded-sm bg-white/5" />
                  <div className="h-2.5 flex-1 rounded bg-white/5" />
                  <div className="h-2.5 w-14 shrink-0 rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!spendingData.length && !incomeBreakdownData.length) {
    return (
      <div className="flex items-center gap-2.5 rounded-[1.15rem] border border-white/5 bg-brand-card p-4 sm:gap-3 sm:rounded-2xl sm:p-6">
        <span className="material-symbols-outlined shrink-0 text-xl text-white/15 sm:text-2xl">pie_chart</span>
        <p className="text-[11px] leading-snug text-white/35 sm:text-sm sm:text-white/30">Зарлага / орлогын задралд өгөгдөл байхгүй</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.15rem] border border-white/5 bg-brand-card p-3.5 sm:rounded-2xl sm:p-6">

      {/* ── Header ── */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2 sm:mb-4">
        <div className="min-w-0">
          <h3 className="text-[0.8125rem] font-semibold leading-snug tracking-tight text-white sm:text-sm sm:font-bold">
            {breakdownMode === 'expense' ? t('spendingBreakdownTitle') : 'Орлогын задрал'}
          </h3>
          <p className="mt-0.5 text-[9px] text-white/35 sm:text-[10px]">
            {timeRangeLabelMn(timeRange)}
            {' · '}
            <span className="font-semibold text-white/55">{fmtCompact(totalSpent, privacyMasked)}</span>
          </p>
        </div>

        <div className="flex shrink-0 gap-1 rounded-full border border-white/[0.08] bg-black/25 p-0.5">
          {(['expense', 'income'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setBreakdownMode(m)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[9px] font-semibold transition-all sm:px-3 sm:text-[10px]',
                breakdownMode === m
                  ? m === 'expense'
                    ? 'bg-rose-500/25 text-rose-200'
                    : 'bg-emerald-500/25 text-emerald-200'
                  : 'text-white/40 hover:text-white/65',
              )}
            >
              {m === 'expense' ? 'Зарлага' : 'Орлого'}
            </button>
          ))}
        </div>

        {/* ✅ Budget button — restored, wired to dialog */}
        {/* <button
          type="button"
          onClick={() => setAdjustOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-violet-300 transition-colors hover:bg-violet-500/20"
        >
          <span className="material-symbols-outlined text-[15px] leading-none">tune</span>
          Төсөв
        </button> */}
      </div>


      {activeData.length === 0 ? (
        <p className="py-6 text-center text-[11px] text-white/35">
          {breakdownMode === 'income' ? 'Орлогын мэдээлэл байхгүй' : 'Зарлагын мэдээлэл байхгүй'}
        </p>
      ) : (
      <div className="flex flex-col items-center gap-3 sm:items-start sm:gap-6">
        <DonutChart
          key={donutKey}
          segments={activeData}
          total={totalSpent}
          highlighted={hovered}
          onHover={setHovered}
          privacyMasked={privacyMasked}
        />

        <div className="w-full min-w-0 flex-1 space-y-0.5">
          {activeData.map((item) => (
            <CategoryRow
              key={item.category}
              item={item}
              pct={totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0}
              budget={breakdownMode === 'expense' ? budgetMap[item.category] ?? null : null}
              isHl={hovered === item.category}
              narrow={narrow}
              privacyMasked={privacyMasked}
              onEnter={() => { if (!narrow) setHovered(item.category); }}
              onLeave={() => { if (!narrow) setHovered(null); }}
              onTapToggle={() =>
                setHovered((h) => (h === item.category ? null : item.category))
              }
            />
          ))}
        </div>
      </div>
      )}

      {/* ── Over-budget alert ── */}
      {breakdownMode === 'expense' && overBudget.length > 0 && (
        <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-2.5 py-2 sm:mt-4 sm:px-3 sm:py-2.5">
          <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5">
            <span className="material-symbols-outlined text-[15px] leading-none text-rose-400 sm:text-sm">warning</span>
            <p className="text-[10px] font-semibold leading-snug text-rose-400 sm:text-[11px]">Хязгаар хэтэрсэн ангиллууд</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {overBudget.map(([cat, b]) => (
              <span
                key={cat}
                className="max-w-[14rem] truncate rounded-full border border-rose-500/20 bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-300"
                title={`${cat} · ${b.bpct}%`}
              >
                {cat} · {b.bpct}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Budget adjust dialog ── */}
      {/* <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="bg-[#13111f] border-white/10 text-white sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="material-symbols-outlined text-base leading-none text-violet-400">tune</span>
              Сарын төсвийн лимит
            </DialogTitle>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/35">
              Ангиллын <span className="text-white/55">1 сарын</span> хязгаарыг оруулна уу.
              {months > 1 && (
                <span className="ml-1 text-violet-400">({months} сараар нийт тооцогдоно)</span>
              )}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Ангилал</p>
              <Select value={adjCat} onValueChange={setAdjCat}>
                <SelectTrigger className="h-9 border-white/10 bg-white/[0.06] text-[12px] text-white">
                  <SelectValue placeholder="Ангилал сонгох" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#13111f]">
                  {budgets.map((b) => (
                    <SelectItem
                      key={b.category}
                      value={b.category}
                      className="text-[12px] text-white/70 focus:bg-violet-600/25 focus:text-white"
                    >
                      {b.category}
                      {b.limit > 0 && b.spent / b.limit >= 1 && (
                        <span className="ml-2 text-[9px] font-bold text-rose-400">хэтэрсэн</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {adjCat && budgetMap[adjCat] && (
              <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
                <span className="text-[11px] text-white/35">Зарцуулсан</span>
                <span className="text-[11px] font-bold tabular-nums text-white">
                  {fmtCompact(budgetMap[adjCat].spent)}
                  <span className="ml-1 text-[10px] font-normal text-white/25">
                    / {fmtCompact(budgetMap[adjCat].limit)}
                  </span>
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Сарын хязгаар</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-bold text-white/35">₮</span>
                <Input
                  type="number"
                  value={adjInput}
                  onChange={(e) => setAdjInput(e.target.value)}
                  className="h-9 border-white/10 bg-white/[0.06] pl-7 text-sm text-white focus-visible:ring-violet-500/40"
                  min={0}
                  step={10_000}
                  placeholder="500000"
                />
              </div>
              {adjInput && months > 1 && Number(adjInput) > 0 && (
                <p className="text-[10px] text-white/30">
                  {months} сарын нийт:{' '}
                  <span className="font-semibold text-violet-400">
                    {fmtCompact(Number(adjInput) * months)}
                  </span>
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-0">
            <Button
              variant="ghost"
              onClick={() => setAdjustOpen(false)}
              className="h-8 text-xs text-white/40 hover:bg-white/5 hover:text-white"
            >
              {t('cancelBtn')}
            </Button>
            <Button
              onClick={() => {
                const v = Number(adjInput);
                if (!adjCat || !Number.isFinite(v) || v < 0) return;
                setBudgetLimit(adjCat, v);
                setAdjustOpen(false);
              }}
              disabled={
                !adjCat ||
                !adjInput ||
                Number.isNaN(Number(adjInput)) ||
                Number(adjInput) < 0
              }
              className="h-8 bg-violet-600 px-4 text-xs text-white hover:bg-violet-500"
            >
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}