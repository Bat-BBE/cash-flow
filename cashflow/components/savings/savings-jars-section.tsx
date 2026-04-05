'use client';

import type { SavingsJar } from './types';
import { formatCompactCalendarAmount } from '@/lib/utils';
import { cn } from '@/lib/utils';

const JAR: Record<SavingsJar['tint'], { border: string; bg: string; text: string; glow: string }> = {
  emerald: {
    border: 'border-emerald-500/20',
    bg: 'from-emerald-500/[0.1]',
    text: 'text-emerald-200/90',
    glow: 'shadow-[inset_0_1px_0_0_rgba(52,211,153,0.12)]',
  },
  violet: {
    border: 'border-violet-500/20',
    bg: 'from-violet-500/[0.12]',
    text: 'text-violet-200/90',
    glow: 'shadow-[inset_0_1px_0_0_rgba(167,139,250,0.12)]',
  },
  amber: {
    border: 'border-amber-500/20',
    bg: 'from-amber-500/[0.1]',
    text: 'text-amber-100/90',
    glow: 'shadow-[inset_0_1px_0_0_rgba(251,191,36,0.1)]',
  },
  cyan: {
    border: 'border-cyan-500/20',
    bg: 'from-cyan-500/[0.1]',
    text: 'text-cyan-100/90',
    glow: 'shadow-[inset_0_1px_0_0_rgba(34,211,238,0.1)]',
  },
  rose: {
    border: 'border-rose-500/20',
    bg: 'from-rose-500/[0.1]',
    text: 'text-rose-100/90',
    glow: 'shadow-[inset_0_1px_0_0_rgba(251,113,133,0.1)]',
  },
};

function jarName(j: SavingsJar, lang: 'MN' | 'EN') {
  return lang === 'MN' ? j.nameMn : j.nameEn;
}

export function SavingsJarsSection({
  jars,
  currency,
  lang,
  title,
}: {
  jars: SavingsJar[];
  currency: string;
  lang: 'MN' | 'EN';
  title: string;
}) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">{title}</h2>
      <div
        className={cn(
          '-mx-1 flex gap-2 overflow-x-auto overflow-y-hidden px-1 pb-0.5',
          'snap-x snap-mandatory scroll-pl-3',
          'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'touch-pan-x',
        )}
      >
        {jars.map((j) => {
          const st = JAR[j.tint];
          return (
            <div
              key={j.id}
              className={cn(
                'w-[8.75rem] shrink-0 snap-start sm:w-[9.5rem]',
                'rounded-xl border bg-gradient-to-b to-[#1a1f2e]/95 p-2.5 sm:rounded-2xl sm:p-3',
                st.border,
                st.bg,
                st.glow,
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn('material-symbols-outlined text-[18px] opacity-90', st.text)}>{j.icon}</span>
                <p className={cn('min-w-0 flex-1 truncate text-[11px] font-medium leading-tight', st.text)}>{jarName(j, lang)}</p>
              </div>
              <p className="mt-2 text-[13px] font-semibold tabular-nums tracking-tight text-white/95 sm:text-sm">
                {formatCompactCalendarAmount(j.balance, currency)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
