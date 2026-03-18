// components/scheduled/calendar.tsx
'use client';

import { CalendarDay } from './types';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface CalendarProps {
  days: CalendarDay[];
  currentDate: Date;
  onDayClick: (day: CalendarDay) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthPickerToggle: () => void;
  weekDays: string[];
}

export function Calendar({
  days,
  currentDate,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  onMonthPickerToggle,
  weekDays
}: CalendarProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="lg:col-span-7 bg-navy-dark/40 rounded-2xl border border-white/5 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMonthPickerToggle}
            className="flex items-center gap-3 bg-navy-dark border border-white/10 hover:border-primary/50 px-4 py-2.5 rounded-xl transition-all group"
          >
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
              calendar_month
            </span>
            <span className="text-lg font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <span className="material-symbols-outlined text-slate-500 text-sm">
              expand_more
            </span>
          </button>
          
          <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider">
            Today
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onPrevMonth}
            className="p-2.5 bg-navy-dark border border-white/5 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button 
            onClick={onNextMonth}
            className="p-2.5 bg-navy-dark border border-white/5 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid grid grid-cols-7 overflow-hidden rounded-xl border border-white/5">
        {/* Weekday headers */}
        {weekDays.map((day) => (
          <div 
            key={day}
            className="calendar-cell bg-navy-dark/60 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <CalendarCell
            key={index}
            day={day}
            onClick={() => onDayClick(day)}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarCell({ day, onClick }: { day: CalendarDay; onClick: () => void }) {
  const hasEvents = day.bills.length > 0 || day.income.length > 0;
  const isOverdue = day.bills.some(b => b.status === 'overdue');

  return (
    <div
      onClick={onClick}
      className={cn(
        "calendar-cell p-3 h-28 text-xs font-medium relative transition-all cursor-pointer",
        day.isCurrentMonth 
          ? 'text-slate-400 hover:bg-white/[0.03]' 
          : 'text-slate-700 bg-navy-dark/20',
        day.isToday && 'bg-primary/5',
        day.isSelected && 'ring-2 ring-primary'
      )}
    >
      {/* Day number */}
      <span className={cn(
        "inline-flex items-center justify-center size-7",
        day.isToday && 'bg-primary rounded-full text-white font-black glow-violet'
      )}>
        {day.day}
      </span>

      {/* Event indicators */}
      {hasEvents && (
        <div className="mt-2 flex flex-col gap-1.5">
          {day.bills.slice(0, 2).map((bill, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-full border-l-2 rounded-sm",
                bill.status === 'overdue' 
                  ? 'bg-red-500/20 border-red-500'
                  : 'bg-primary/30 border-primary'
              )}
            />
          ))}
          {day.income.slice(0, 1).map((income, i) => (
            <div
              key={i}
              className="h-1.5 w-full bg-secondary/30 border-l-2 border-secondary rounded-sm"
            />
          ))}
        </div>
      )}

      {/* Overdue indicator */}
      {isOverdue && (
        <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}