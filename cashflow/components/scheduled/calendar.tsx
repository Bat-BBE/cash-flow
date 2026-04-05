// components/scheduled/calendar.tsx
'use client';

import { CalendarDay } from './types';
import {
  cn,
  formatCompactCalendarAmountInline,
  formatCurrency,
} from '@/lib/utils';
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
  onMonthPickerToggle,
  onGoToToday,
}: CalendarProps) {
  const isSidebar = variant === 'sidebar';

  return (
    <div
      className={cn(
        'w-full rounded-[1.15rem] border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/75 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-lg sm:rounded-2xl',
        isSidebar ? 'p-2' : 'p-3 sm:p-5 md:p-6',
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
              'group flex items-center rounded-xl border border-white/10 bg-brand-bg/60 transition-all hover:border-brand-primary/40',
              isSidebar ? 'min-w-0 flex-1 gap-1.5 px-2 py-1.5' : 'gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5',
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined shrink-0 text-brand-primary transition-transform group-hover:scale-105',
                isSidebar ? 'text-base' : 'text-[20px] sm:text-[22px]',
              )}
            >
              calendar_month
            </span>
            <span
              className={cn(
                'truncate font-bold text-white',
                isSidebar ? 'text-xs' : 'text-[0.95rem] sm:text-lg',
              )}
            >
              {formatMnMonthYear(currentDate)}
            </span>
            <span
              className={cn(
                'material-symbols-outlined shrink-0 text-brand-muted',
                isSidebar ? 'text-xs' : 'text-base',
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
              'flex shrink-0 items-center justify-center rounded-lg border border-brand-primary/30 bg-brand-primary/15 text-brand-primary transition-colors hover:border-brand-primary/50 hover:bg-brand-primary/25',
              isSidebar ? 'p-1.5' : 'p-2',
            )}
          >
            <span className={cn('material-symbols-outlined', isSidebar ? 'text-base' : 'text-[20px] sm:text-[22px]')}>
              today
            </span>
          </button>
        </div>

        <div className={cn('flex gap-1 justify-end', isSidebar && 'w-full')}>
          <button
            onClick={onPrevMonth}
            className={cn(
              'rounded-xl border border-white/10 bg-brand-bg/50 text-brand-muted transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white',
              isSidebar ? 'p-1.5' : 'p-2 sm:p-2.5',
            )}
          >
            <span className={cn('material-symbols-outlined', isSidebar && 'text-lg')}>
              chevron_left
            </span>
          </button>
          <button
            onClick={onNextMonth}
            className={cn(
              'rounded-xl border border-white/10 bg-brand-bg/50 text-brand-muted transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white',
              isSidebar ? 'p-1.5' : 'p-2 sm:p-2.5',
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
      <div className="calendar-grid grid grid-cols-7 overflow-hidden rounded-xl border border-white/5 bg-brand-bg/30">
        {/* Weekday headers */}
        {MN_WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className={cn(
              'calendar-cell bg-brand-card/80 text-center font-bold tracking-wide text-brand-muted',
              isSidebar ? 'py-1 text-[7px]' : 'py-2 text-[10px] sm:py-2.5 sm:text-[11px]',
            )}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day) => (
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
        'mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-white/5 bg-brand-bg/40 sm:mb-4 sm:gap-x-4',
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
              className={cn('text-brand-muted', compact ? 'text-[7px]' : 'text-[10px] sm:text-[11px]')}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

interface DayKindSegment {
  kind: CalendarLineKind;
  total: number;
  count: number;
}

function buildDayKindSegments(day: CalendarDay): DayKindSegment[] {
  const bill = day.bills.reduce((s, b) => s + b.amount, 0);
  const income = day.income.reduce((s, i) => s + i.amount, 0);
  const loan = (day.loanPayments ?? []).reduce((s, l) => s + l.amount, 0);
  const segments: DayKindSegment[] = [];
  if (bill > 0) segments.push({ kind: 'bill', total: bill, count: day.bills.length });
  if (income > 0) segments.push({ kind: 'income', total: income, count: day.income.length });
  if (loan > 0) segments.push({ kind: 'loan', total: loan, count: (day.loanPayments ?? []).length });
  return segments;
}

const SEGMENT_STYLES: Record<
  CalendarLineKind,
  { dot: string; chip: string; text: string }
> = {
  bill: {
    dot: 'bg-violet-400',
    chip: 'bg-violet-500/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
    text: 'text-violet-100/95',
  },
  income: {
    dot: 'bg-emerald-400',
    chip: 'bg-emerald-500/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
    text: 'text-emerald-100/95',
  },
  loan: {
    dot: 'bg-yellow-400',
    chip: 'bg-yellow-500/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
    text: 'text-yellow-100/95',
  },
};

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
  const segments = buildDayKindSegments(day);
  const hasEvents = lines.length > 0;

  const tooltip = hasEvents
    ? lines
        .map((l) => {
          const label = l.kind === 'bill' ? 'Төлбөр' : l.kind === 'income' ? 'Орлого' : 'Зээл';
          return `${label}: ${formatCurrency(l.amount, currency)}`;
        })
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
        compact
          ? 'h-[3rem] p-0.5 text-[10px]'
          : 'min-h-0 h-[3.875rem] p-0.5 sm:h-[4.125rem] sm:p-1',
        day.isCurrentMonth
          ? 'text-white/80 hover:bg-white/[0.05]'
          : 'bg-brand-bg/25 text-white/25',
        day.isToday &&
          'z-[2] rounded-xl bg-gradient-to-br from-brand-primary/35 via-brand-primary/15 to-violet-600/20 shadow-[0_0_0_2px_rgba(112,96,240,0.55),0_8px_24px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-2 ring-brand-primary/70',
        !day.isToday && day.isSelected && 'ring-2 ring-brand-primary/60',
        day.isToday && day.isSelected && 'ring-2 ring-white/35',
      )}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full',
          compact ? 'size-[1rem] text-[8px]' : 'size-5 text-[10px] sm:size-[1.375rem] sm:text-[11px]',
          day.isToday &&
            (compact
              ? 'size-[1.125rem] bg-gradient-to-br from-brand-primary to-violet-600 font-black text-white shadow-md shadow-brand-primary/30 ring-1 ring-white/25'
              : 'size-6 bg-gradient-to-br from-brand-primary to-violet-600 font-black text-white shadow-lg shadow-brand-primary/35 ring-2 ring-white/25 sm:size-7 sm:text-xs'),
          !day.isToday && 'font-medium',
        )}
      >
        {day.day}
      </span>

      {/* Нэг мөр: төрөл тус бүрийн нийлбэр (товч формат) */}
      {hasEvents && segments.length > 0 && (
        <div className={cn('mt-auto min-h-0 w-full min-w-0 pt-px', compact && 'pt-0')}>
          <div
            className={cn(
              'flex min-h-0 w-full min-w-0 items-stretch overflow-hidden rounded border border-white/[0.07] bg-gradient-to-b from-black/[0.28] to-black/[0.38] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-[2px]',
              compact ? 'gap-px p-px' : 'gap-px p-px sm:gap-0.5 sm:p-0.5',
            )}
          >
            {segments.map((seg) => {
              const st = SEGMENT_STYLES[seg.kind];
              const fullLabel =
                seg.kind === 'bill' ? 'Төлбөр' : seg.kind === 'income' ? 'Орлого' : 'Зээл';
              const title = `${fullLabel}${seg.count > 1 ? ` (${seg.count})` : ''}: ${formatCurrency(seg.total, currency)}`;
              return (
                <div
                  key={seg.kind}
                  title={title}
                  className={cn(
                    'flex min-h-0 min-w-0 flex-1 items-center justify-center gap-0.5 rounded-md border border-white/[0.06] tabular-nums',
                    st.chip,
                    compact ? 'px-0.5 py-px' : 'px-0.5 py-px sm:px-1 sm:py-0.5',
                  )}
                >
                  <span
                    className={cn('shrink-0 rounded-full ring-1 ring-black/20', st.dot, compact ? 'h-1 w-1' : 'h-1 w-1 sm:h-1.5 sm:w-1.5')}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'min-w-0 max-w-full truncate text-center font-bold leading-none tracking-tight',
                      st.text,
                      compact ? 'text-[7px]' : 'text-[9px] sm:text-[10px]',
                    )}
                  >
                    {formatCompactCalendarAmountInline(seg.total, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}