'use client';

import type { SavingsGoal } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const ACCENT: Record<
  SavingsGoal['accent'],
  { bar: string; glow: string; icon: string; ring: string }
> = {
  emerald: {
    bar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    glow: 'from-emerald-500/[0.12]',
    icon: 'text-emerald-300/95',
    ring: 'ring-emerald-500/15',
  },
  violet: {
    bar: 'bg-gradient-to-r from-violet-400 to-indigo-500',
    glow: 'from-violet-500/[0.14]',
    icon: 'text-violet-300/95',
    ring: 'ring-violet-500/15',
  },
  amber: {
    bar: 'bg-gradient-to-r from-amber-400 to-orange-400',
    glow: 'from-amber-500/[0.12]',
    icon: 'text-amber-200/95',
    ring: 'ring-amber-500/15',
  },
  sky: {
    bar: 'bg-gradient-to-r from-sky-400 to-blue-500',
    glow: 'from-sky-500/[0.12]',
    icon: 'text-sky-300/95',
    ring: 'ring-sky-500/15',
  },
  rose: {
    bar: 'bg-gradient-to-r from-rose-400 to-pink-500',
    glow: 'from-rose-500/[0.12]',
    icon: 'text-rose-300/95',
    ring: 'ring-rose-500/15',
  },
};

function goalName(g: SavingsGoal, lang: 'MN' | 'EN') {
  return lang === 'MN' ? g.nameMn : g.nameEn;
}

function formatDeadline(iso: string, lang: 'MN' | 'EN') {
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'MN' ? 'mn-MN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SavingsGoalsSection({
  goals,
  currency,
  lang,
  sectionTitle,
  ofLabel,
  deadlinePrefix,
  emptyMessage,
}: {
  goals: SavingsGoal[];
  currency: string;
  lang: 'MN' | 'EN';
  sectionTitle: string;
  ofLabel: string;
  deadlinePrefix: string;
  emptyMessage?: string;
}) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">{sectionTitle}</h2>

      {goals.length === 0 && emptyMessage ? (
        <div className="rounded-2xl border border-dashed border-violet-500/20 bg-violet-500/[0.04] px-3 py-6 text-center text-[10px] leading-relaxed text-slate-400 sm:px-4 sm:py-7 sm:text-[11px]">
          {emptyMessage}
        </div>
      ) : null}

      <div className="space-y-2 sm:space-y-2.5">
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
          const a = ACCENT[g.accent];
          return (
            <div
              key={g.id}
              className={cn(
                'relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#1e2438]/95 to-[#181e2e]/90 p-3 sm:p-3.5',
                'shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)]',
                'ring-1 ring-inset',
                a.ring,
              )}
            >
              <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b to-transparent opacity-80', a.glow)} />
              <div className="relative flex gap-2.5 sm:gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/35 ring-1 ring-white/[0.06]',
                    'sm:h-11 sm:w-11',
                  )}
                >
                  <span className={cn('material-symbols-outlined text-[20px] sm:text-[22px]', a.icon)}>{g.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[12px] font-semibold leading-tight text-white/95 sm:text-[13px]">{goalName(g, lang)}</p>
                    <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-300/90">
                      {pct}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] tabular-nums leading-snug text-slate-400/95 sm:text-[11px]">
                    {formatCurrency(g.current, currency)}
                    <span className="mx-1 text-slate-600">/</span>
                    {formatCurrency(g.target, currency)}
                    <span className="ml-1 text-slate-500">{ofLabel}</span>
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className={cn('h-full rounded-full transition-all duration-500', a.bar)} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[9px] text-slate-500 sm:text-[10px]">
                    {deadlinePrefix}: {formatDeadline(g.deadline, lang)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
