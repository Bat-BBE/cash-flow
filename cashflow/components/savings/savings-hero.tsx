'use client';

import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function SavingsHero({
  totalSaved,
  currency,
  title,
  caption,
}: {
  totalSaved: number;
  currency: string;
  title: string;
  caption: string;
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-violet-500/[0.12]',
        'bg-gradient-to-br from-[#1a1628] via-[#232a42] to-[#151a28]',
        'p-3.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        'sm:p-5',
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-violet-500/[0.18] blur-[48px]" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-cyan-500/[0.08] blur-[40px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(112,96,240,0.14),transparent_55%)]" />

      <div className="relative">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">{title}</p>
        <p
          className={cn(
            'mt-1.5 break-words bg-gradient-to-br from-white via-white to-slate-300 bg-clip-text font-bold tabular-nums tracking-tight text-transparent',
            'text-[1.35rem] leading-[1.15] sm:text-[1.65rem]',
          )}
        >
          {formatCurrency(totalSaved, currency)}
        </p>
        <p className="mt-2 max-w-md text-[10px] leading-snug text-slate-400/95 sm:text-[11px]">{caption}</p>
      </div>
    </section>
  );
}
