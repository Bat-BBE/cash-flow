'use client';

import { cn } from '@/lib/utils';

export function SavingsHabitCard({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-violet-500/[0.12]',
        'bg-gradient-to-b from-[#1c2033]/98 via-[#1a1e2e]/95 to-[#161a28]/98',
        'p-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] sm:p-4',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300/95 ring-1 ring-violet-400/20">
          <span className="material-symbols-outlined text-[18px]">auto_mode</span>
        </span>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">{title}</h2>
      </div>
      <ul className="mt-2.5 space-y-2">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2 text-[10px] leading-snug text-slate-400/95 sm:text-[11px]">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400/70 shadow-[0_0_6px_rgba(167,139,250,0.45)]" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
