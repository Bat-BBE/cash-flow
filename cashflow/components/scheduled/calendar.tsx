// components/scheduled/calendar.tsx
'use client';

import { CalendarDay } from './types';
import { cn, formatCompactCalendarAmount, formatCurrency } from '@/lib/utils';
import { formatMnMonthYear, MN_WEEKDAY_LABELS } from '@/lib/calendar-locale-mn';

interface CalendarProps {
  days: CalendarDay[];
  currentDate: Date;
  /** Bills / loans display currency (e.g. from loan.json). */
  currency?: string;
  /** Narrow layout for dashboard sidebar. */
  variant?: 'default' | 'sidebar';
  onDayClick: (day: CalendarDay) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onMonthPickerToggle: () => void;
  onGoToToday: () => void;
}

export function Calendar({
  days,
  currentDate,
  currency = 'MNT',
  variant = 'default',
  onDayClick,
  onPrevMonth,
  onNextMonth,
  onToday,
  onMonthPickerToggle,
  onGoToToday,
}: CalendarProps) {
  const isSidebar = variant === 'sidebar';

  return (
    <div
      className={cn(
        'bg-navy-dark/40 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm',
        isSidebar ? 'w-full p-2' : 'lg:col-span-7 p-4 sm:p-6',
      )}
    >
      {/* Calendar Header */}
      <div
        className={cn(
          'flex justify-between gap-2',
          isSidebar ? 'flex-col mb-3' : 'flex-col md:flex-row md:items-center gap-4 mb-6 md:mb-8',
        )}
      >
        <div className={cn('flex items-center', isSidebar ? 'gap-1.5 flex-wrap' : 'gap-3')}>
          <button
            onClick={onMonthPickerToggle}
            className={cn(
              'flex items-center bg-navy-dark border border-white/10 hover:border-primary/50 rounded-xl transition-all group',
              isSidebar ? 'gap-1.5 px-2 py-1.5 flex-1 min-w-0' : 'gap-3 px-4 py-2.5',
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-primary group-hover:scale-110 transition-transform shrink-0',
                isSidebar && 'text-base',
              )}
            >
              calendar_month
            </span>
            <span
              className={cn(
                'font-bold text-white truncate',
                isSidebar ? 'text-xs' : 'text-lg',
              )}
            >
              {formatMnMonthYear(currentDate)}
            </span>
            <span
              className={cn(
                'material-symbols-outlined text-slate-500 shrink-0',
                isSidebar ? 'text-xs' : 'text-sm',
              )}
            >
              expand_more
            </span>
          </button>

          <button
            type="button"
            onClick={onGoToToday}
            title="Энэ сар руу"
            aria-label="Энэ сар руу"
            className={cn(
              'flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors hover:border-primary/40 hover:bg-primary/20 shrink-0',
              isSidebar ? 'p-1.5' : 'p-2',
            )}
          >
            <span className={cn('material-symbols-outlined', isSidebar ? 'text-base' : 'text-xl')}>
              today
            </span>
          </button>
        </div>

        <div className={cn('flex gap-1 justify-end', isSidebar && 'w-full')}>
          <button
            onClick={onPrevMonth}
            className={cn(
              'bg-navy-dark border border-white/5 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all',
              isSidebar ? 'p-1.5' : 'p-2.5',
            )}
          >
            <span className={cn('material-symbols-outlined', isSidebar && 'text-lg')}>
              chevron_left
            </span>
          </button>
          <button
            onClick={onNextMonth}
            className={cn(
              'bg-navy-dark border border-white/5 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all',
              isSidebar ? 'p-1.5' : 'p-2.5',
            )}
          >
            <span className={cn('material-symbols-outlined', isSidebar && 'text-lg')}>
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <CalendarLegend compact={isSidebar} />

      {/* Calendar Grid */}
      <div className="calendar-grid grid grid-cols-7 overflow-hidden rounded-xl border border-white/5">
        {/* Weekday headers */}
        {MN_WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className={cn(
              'calendar-cell bg-navy-dark/60 text-center font-bold text-slate-500 tracking-wide',
              isSidebar ? 'py-1.5 text-[7px]' : 'py-3 sm:py-4 text-[9px] sm:text-[10px]',
            )}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <CalendarCell
          key={day.date.getTime()}
            day={day}
            currency={currency}
            compact={isSidebar}
            onClick={() => onDayClick(day)}
          />
        ))}
      </div>
    </div>
  );
}

const LEGEND_ACCENTS: Record<'bill' | 'income' | 'loan', string> = {
  bill: 'bg-violet-400/75',
  income: 'bg-emerald-400/70',
  loan: 'bg-yellow-400/75',
};

function CalendarLegend({ compact }: { compact?: boolean }) {
  const items: { label: string; kind: keyof typeof LEGEND_ACCENTS }[] = [
    { label: 'Төлбөр', kind: 'bill' },
    { label: 'Орлого', kind: 'income' },
    { label: 'Зээл', kind: 'loan' },
  ];

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/5 bg-navy-dark/30',
        compact ? 'mb-2 px-2 py-1.5 gap-x-2' : 'px-3 py-2.5 sm:px-4',
      )}
      role="group"
      aria-label="Өнгөний тайлбар"
    >
      <div
        className={cn(
          'flex flex-wrap items-center',
          compact ? 'gap-x-2 gap-y-0.5' : 'gap-x-3 gap-y-1.5 sm:gap-x-4',
        )}
      >
        {items.map(({ label, kind }) => (
          <div key={label} className="flex items-center gap-1">
            <span
              className={cn(
                'inline-flex shrink-0 overflow-hidden rounded border border-slate-500/30 bg-slate-950/50',
                compact ? 'h-2 w-4' : 'h-2.5 w-6',
              )}
              aria-hidden
            >
              <span className={cn('w-0.5 shrink-0', LEGEND_ACCENTS[kind])} />
              <span className="min-w-0 flex-1 bg-white/[0.04]" />
            </span>
            <span
              className={cn('text-slate-400', compact ? 'text-[7px]' : 'text-[10px] sm:text-[11px]')}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Max amount rows shown; if more exist, a +N row hints at the rest. */
const MAX_CALENDAR_LINES = 2;

type CalendarLineKind = 'bill' | 'income' | 'loan';

interface CalendarLine {
  kind: CalendarLineKind;
  id: string;
  amount: number;
}

function buildCalendarLines(day: CalendarDay): CalendarLine[] {
  const lines: CalendarLine[] = [];
  for (const b of day.bills) {
    lines.push({ kind: 'bill', id: b.id, amount: b.amount });
  }
  for (const i of day.income) {
    lines.push({ kind: 'income', id: i.id, amount: i.amount });
  }
  for (const l of day.loanPayments ?? []) {
    lines.push({ kind: 'loan', id: l.id, amount: l.amount });
  }
  return lines;
}

function CalendarCell({
  day,
  currency,
  compact,
  onClick,
}: {
  day: CalendarDay;
  currency: string;
  compact?: boolean;
  onClick: () => void;
}) {
  const lines = buildCalendarLines(day);
  const hasEvents = lines.length > 0;
  const visible = lines.slice(0, MAX_CALENDAR_LINES);
  const overflow = lines.length - visible.length;

  const tooltip = hasEvents
    ? [
        ...lines.map((l) => {
          const label = l.kind === 'bill' ? 'Төлбөр' : l.kind === 'income' ? 'Орлого' : 'Зээл';
          return `${label}: ${formatCurrency(l.amount, currency)}`;
        }),
        overflow > 0 ? `ба ${overflow} бусад` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <div
      onClick={onClick}
      title={tooltip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Select ${day.year}-${day.month + 1}-${day.day}`}
      className={cn(
        'calendar-cell relative flex min-h-0 cursor-pointer flex-col overflow-hidden font-medium transition-all',
        compact ? 'h-[4.25rem] p-1 text-[10px]' : 'h-28 p-2 text-xs sm:p-2.5',
        day.isCurrentMonth
          ? 'text-slate-400 hover:bg-white/[0.04]'
          : 'text-slate-700 bg-navy-dark/20',
        day.isToday &&
          'z-[2] rounded-xl bg-gradient-to-br from-primary/30 via-violet-600/20 to-primary/25 shadow-[0_0_0_2px_rgba(139,92,246,0.65),0_8px_28px_-4px_rgba(88,50,220,0.55),inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-2 ring-primary/80',
        !day.isToday && day.isSelected && 'ring-2 ring-primary',
        day.isToday && day.isSelected && 'ring-2 ring-white/40',
      )}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full',
          compact ? 'size-5 text-[10px]' : 'size-7',
          day.isToday &&
            (compact
              ? 'size-6 bg-gradient-to-br from-primary to-violet-600 font-black text-white shadow-md shadow-primary/50 ring-1 ring-white/25'
              : 'size-8 bg-gradient-to-br from-primary to-violet-600 text-sm font-black text-white shadow-lg shadow-primary/50 ring-2 ring-white/25'),
          !day.isToday && 'font-medium',
        )}
      >
        {day.day}
      </span>

      {/* Үйл явдлын мөр: төрөл + дүн (богино формат) */}
      {hasEvents && (
        <div
          className={cn(
            'mt-auto flex min-h-0 flex-col overflow-hidden',
            compact ? 'gap-0.5 pt-0.5' : 'gap-1 pt-1',
          )}
        >
          {visible.map((line) => (
            <div
              key={`${line.kind}-${line.id}`}
              className={cn(
                'flex min-h-0 w-full items-stretch overflow-hidden rounded border border-slate-500/25 bg-slate-950/35 shadow-sm shadow-black/20',
                compact && 'rounded-sm',
                line.kind === 'bill' && 'text-violet-200/95',
                line.kind === 'income' && 'text-emerald-200/95',
                line.kind === 'loan' && 'text-yellow-200/95',
              )}
            >
              <span
                className={cn(
                  'w-0.5 shrink-0',
                  line.kind === 'bill' && 'bg-violet-400/75',
                  line.kind === 'income' && 'bg-emerald-400/70',
                  line.kind === 'loan' && 'bg-yellow-400/75',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-right font-black tabular-nums leading-tight',
                  compact ? 'py-0 px-0.5 text-[6px]' : 'py-0.5 pl-1 pr-1.5 text-[8px]',
                )}
              >
                {formatCompactCalendarAmount(line.amount, currency)}
              </span>
            </div>
          ))}
          {overflow > 0 && (
            <div
              className={cn(
                'flex w-full items-center justify-center rounded border border-dashed border-slate-500/35 bg-slate-900/60 font-black tabular-nums text-slate-300',
                compact ? 'py-0 text-[6px] leading-none' : 'py-0.5 text-[8px] leading-none',
              )}
              title={`${overflow} бусад үйл явдал`}
            >
              +{overflow}
            </div>
          )}
        </div>
      )}
    </div>
  );
}