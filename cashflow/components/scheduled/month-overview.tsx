// components/scheduled/month-overview.tsx
'use client';

import { useMemo } from 'react';
import type { CalendarDay } from './types';
import { cn, formatCurrency } from '@/lib/utils';
import { formatMnMonthYear } from '@/lib/calendar-locale-mn';
import { Button } from '@/components/ui/button';

export interface ScheduledMonthOverviewProps {
  currentDate: Date;
  calendarDays: CalendarDay[];
  currency?: string;
  onAddBill: () => void;
  onAddIncome: () => void;
}

function aggregateVisibleMonth(
  days: CalendarDay[],
  year: number,
  month: number,
) {
  let income = 0;
  let billsUnpaid = 0;
  let loan = 0;
  let incomeN = 0;
  let billsUnpaidN = 0;
  let loanN = 0;

  for (const d of days) {
    if (!d.isCurrentMonth || d.year !== year || d.month !== month) continue;
    for (const i of d.income) {
      income += i.amount;
      incomeN += 1;
    }
    for (const b of d.bills) {
      if (b.status !== 'paid') {
        billsUnpaid += b.amount;
        billsUnpaidN += 1;
      }
    }
    for (const l of d.loanPayments ?? []) {
      loan += l.amount;
      loanN += 1;
    }
  }

  const net = income - billsUnpaid - loan;
  return {
    income,
    billsUnpaid,
    loan,
    net,
    incomeN,
    billsUnpaidN,
    loanN,
  };
}

type StatVisual = {
  label: string;
  sub?: string;
  value: number;
  icon: string;
  /** Card shell */
  shell: string;
  /** Top sheen */
  sheen: string;
  /** Icon circle */
  iconBg: string;
  iconColor: string;
  /** Amount */
  valueColor: string;
  /** Optional left accent */
  accentBar: string;
};

export function ScheduledMonthOverview({
  currentDate,
  calendarDays,
  currency = 'MNT',
  onAddBill,
  onAddIncome,
}: ScheduledMonthOverviewProps) {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const totals = useMemo(
    () => aggregateVisibleMonth(calendarDays, y, m),
    [calendarDays, y, m],
  );

  const statCards: StatVisual[] = [
    {
      label: 'Орлого',
      sub: totals.incomeN ? `${totals.incomeN} удаа` : 'Бүртгэлгүй',
      value: totals.income,
      icon: 'trending_up',
      shell:
        'border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.12] via-brand-card/40 to-brand-card/30 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]',
      sheen: 'from-emerald-400/25 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-400/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
      iconColor: 'text-emerald-300',
      valueColor: 'text-emerald-50',
      accentBar: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
    },
    {
      label: 'Төлбөр',
      sub: totals.billsUnpaidN ? `${totals.billsUnpaidN} үлдсэн` : 'Төлөгдсөн',
      value: totals.billsUnpaid,
      icon: 'credit_card',
      shell:
        'border-violet-400/15 bg-gradient-to-br from-violet-500/[0.14] via-brand-card/40 to-brand-card/30 shadow-[0_0_0_1px_rgba(139,92,246,0.08)]',
      sheen: 'from-violet-400/25 via-violet-500/5 to-transparent',
      iconBg: 'bg-violet-500/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
      iconColor: 'text-violet-200',
      valueColor: 'text-violet-50',
      accentBar: 'bg-gradient-to-b from-violet-400 to-violet-600',
    },
    {
      label: 'Зээл',
      sub: totals.loanN ? `${totals.loanN} төлөлт` : 'Төлөлтгүй',
      value: totals.loan,
      icon: 'account_balance',
      shell:
        'border-amber-400/15 bg-gradient-to-br from-amber-500/[0.12] via-brand-card/40 to-brand-card/30 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]',
      sheen: 'from-amber-400/22 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-400/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
      iconColor: 'text-amber-200',
      valueColor: 'text-amber-50',
      accentBar: 'bg-gradient-to-b from-amber-400 to-amber-600',
    },
    {
      label: 'Сарын цэвэр',
      sub: 'Орлого − төлбөр − зээл',
      value: totals.net,
      icon: totals.net >= 0 ? 'savings' : 'warning',
      shell: cn(
        'border-white/[0.08] bg-gradient-to-br via-brand-card/35 to-brand-card/25',
        totals.net > 0 &&
          'from-emerald-600/[0.14] shadow-[0_0_0_1px_rgba(16,185,129,0.1)]',
        totals.net < 0 &&
          'from-rose-600/[0.14] shadow-[0_0_0_1px_rgba(244,63,94,0.1)]',
        totals.net === 0 && 'from-slate-600/20 shadow-[0_0_0_1px_rgba(148,163,184,0.06)]',
      ),
      sheen:
        totals.net > 0
          ? 'from-emerald-400/20 via-transparent to-transparent'
          : totals.net < 0
            ? 'from-rose-400/20 via-transparent to-transparent'
            : 'from-white/10 via-transparent to-transparent',
      iconBg: cn(
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
        totals.net > 0 && 'bg-emerald-400/15',
        totals.net < 0 && 'bg-rose-400/15',
        totals.net === 0 && 'bg-slate-500/20',
      ),
      iconColor:
        totals.net > 0 ? 'text-emerald-300' : totals.net < 0 ? 'text-rose-300' : 'text-slate-300',
      valueColor:
        totals.net > 0 ? 'text-emerald-50' : totals.net < 0 ? 'text-rose-50' : 'text-slate-100',
      accentBar:
        totals.net > 0
          ? 'bg-gradient-to-b from-emerald-400 to-teal-600'
          : totals.net < 0
            ? 'bg-gradient-to-b from-rose-400 to-rose-700'
            : 'bg-gradient-to-b from-slate-400 to-slate-600',
    },
  ];

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[1.25rem] border border-white/[0.07]',
        'bg-gradient-to-b from-brand-card/98 via-[#28324c] to-[#222c44]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.28),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        'backdrop-blur-xl',
        'p-4 sm:rounded-2xl sm:p-5 md:p-6',
      )}
      aria-labelledby="scheduled-month-overview-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="scheduled-month-overview-title"
              className="text-lg font-bold leading-none tracking-tight text-white sm:text-xl"
            >
              Сарын тойм
            </h2>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold leading-none text-brand-muted sm:text-xs">
              {formatMnMonthYear(currentDate)}
            </span>
          </div>
          <p className="max-w-md text-[13px] leading-relaxed text-slate-400 sm:text-sm sm:text-slate-400/95">
            Сонгосон сарын орлого, үлдсэн төлбөр, зээлийн төлөлтийн нийлбэр — хуанлийн өгөгдөлтэй
            таарна.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:shrink-0 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            title="Шинэ төлбөр бүртгэх"
            className={cn(
              'h-11 min-h-[44px] rounded-xl border-brand-primary/40 bg-brand-primary/12 px-3',
              'text-[13px] font-semibold text-[#c4b5fd] shadow-sm shadow-brand-primary/10',
              'transition-[transform,background-color,border-color] active:scale-[0.98]',
              'hover:border-brand-primary/55 hover:bg-brand-primary/22',
            )}
            onClick={onAddBill}
          >
            <span className="material-symbols-outlined mr-1.5 text-[20px] text-brand-secondary">
              receipt_long
            </span>
            Төлбөр
          </Button>
          <Button
            type="button"
            variant="outline"
            title="Шинэ орлого бүртгэх"
            className={cn(
              'h-11 min-h-[44px] rounded-xl border-emerald-400/35 bg-emerald-500/10 px-3',
              'text-[13px] font-semibold text-emerald-100 shadow-sm shadow-emerald-500/10',
              'transition-[transform,background-color,border-color] active:scale-[0.98]',
              'hover:border-emerald-400/50 hover:bg-emerald-500/18',
            )}
            onClick={onAddIncome}
          >
            <span className="material-symbols-outlined mr-1.5 text-[20px] text-emerald-300/95">
              payments
            </span>
            Орлого
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-3.5 sm:p-4',
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
              'transition-[transform,box-shadow] duration-200 active:scale-[0.99]',
              card.shell,
            )}
          >
            <span
              className={cn('absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-90', card.accentBar)}
              aria-hidden
            />
            <div
              className={cn(
                'pointer-events-none absolute inset-0 -translate-y-1/2 bg-gradient-to-b opacity-60',
                card.sheen,
              )}
              aria-hidden
            />
            <div className="relative pl-2">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 flex-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.08em] text-slate-400 sm:text-xs">
                  {card.label}
                </p>
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-xl sm:size-9',
                    card.iconBg,
                  )}
                  aria-hidden
                >
                  <span className={cn('material-symbols-outlined text-[18px] sm:text-[20px]', card.iconColor)}>
                    {card.icon}
                  </span>
                </span>
              </div>
              <p
                className={cn(
                  'mt-2.5 break-words font-bold tabular-nums tracking-tight',
                  'text-[15px] leading-[1.15] sm:text-lg md:text-xl',
                  card.valueColor,
                )}
                title={formatCurrency(card.value, currency)}
              >
                {formatCurrency(card.value, currency)}
              </p>
              {card.sub && (
                <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-500 sm:text-[12px] sm:text-slate-500/95">
                  {card.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
