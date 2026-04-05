'use client';

import { cn } from '@/lib/utils';

export function SavingsAddGoalCta({
  onClick,
  title,
  hint,
  ariaLabel,
}: {
  onClick: () => void;
  title: string;
  hint: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? title}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-violet-500/20',
        'bg-gradient-to-r from-violet-600/[0.18] via-[#1e2438]/90 to-indigo-950/40',
        'p-3.5 text-left shadow-[0_12px_40px_-12px_rgba(67,56,202,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        'transition-[transform,box-shadow,border-color] active:scale-[0.99] sm:p-4',
        'hover:border-violet-400/30 hover:shadow-[0_16px_44px_-10px_rgba(91,33,182,0.4)]',
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-500/15 blur-2xl" />
      <div className="relative flex items-center gap-3 sm:gap-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            'bg-gradient-to-br from-violet-500 to-indigo-700 text-white',
            'shadow-lg shadow-violet-900/40 ring-1 ring-white/15',
            'sm:h-12 sm:w-12 sm:rounded-[0.85rem]',
          )}
          aria-hidden
        >
          <span className="material-symbols-outlined text-[22px] sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            flag
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight text-white sm:text-sm">{title}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-400/95 sm:text-[11px]">{hint}</p>
        </div>
        <span className="material-symbols-outlined shrink-0 text-[20px] text-violet-300/50 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-200/80">
          chevron_right
        </span>
      </div>
    </button>
  );
}
