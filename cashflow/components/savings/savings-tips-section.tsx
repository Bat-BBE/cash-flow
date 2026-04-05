'use client';

import { cn } from '@/lib/utils';

export function SavingsTipsSection({ title, tips }: { title: string; tips: string[] }) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-emerald-500/15',
        'bg-gradient-to-br from-emerald-950/35 via-[#1a2330]/95 to-[#181d28]/98',
        'p-3.5 shadow-[inset_0_1px_0_0_rgba(52,211,153,0.06)] sm:p-4',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300/95 ring-1 ring-emerald-400/20">
          <span className="material-symbols-outlined text-[18px]">lightbulb</span>
        </span>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">{title}</h2>
      </div>
      <ol className="mt-2.5 list-decimal space-y-1.5 pl-4 text-[10px] leading-relaxed text-slate-400/95 marker:font-semibold marker:text-emerald-400/75 sm:text-[11px]">
        {tips.map((tip) => (
          <li key={tip} className="pl-0.5">
            {tip}
          </li>
        ))}
      </ol>
    </section>
  );
}
