'use client';

import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function SavingsStatsRow({
  monthSaved,
  activeGoals,
  combinedTarget,
  currency,
  lMonth,
  lGoals,
  lTarget,
}: {
  monthSaved: number;
  activeGoals: number;
  combinedTarget: number;
  currency: string;
  lMonth: string;
  lGoals: string;
  lTarget: string;
}) {
  const items = [
    {
      label: lMonth,
      value: formatCurrency(monthSaved, currency),
      left: 'border-l-emerald-400/55',
      valueClass: 'text-emerald-200/95',
    },
    {
      label: lGoals,
      value: String(activeGoals),
      left: 'border-l-violet-400/55',
      valueClass: 'text-violet-200/95',
    },
    {
      label: lTarget,
      value: formatCurrency(combinedTarget, currency),
      left: 'border-l-amber-400/50',
      valueClass: 'text-amber-100/95',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {items.map((it) => (
        <div
          key={it.label}
          className={cn(
            'relative overflow-hidden rounded-xl border border-white/[0.06] border-l-[3px] bg-[#1a1f30]/95 px-2.5 py-2.5 sm:rounded-[1rem] sm:py-3',
            it.left,
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
          <p className="relative text-[8px] font-medium uppercase leading-tight tracking-wide text-slate-500 sm:text-[9px]">{it.label}</p>
          <p className={cn('relative mt-1 truncate text-[11px] font-semibold tabular-nums sm:text-xs', it.valueClass)}>{it.value}</p>
        </div>
      ))}
    </div>
  );
}
