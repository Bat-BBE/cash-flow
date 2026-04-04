// components/scheduled/month-picker.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MN_MONTH_NAMES } from '@/lib/calendar-locale-mn';

interface MonthPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onSelectMonth: (month: number, year: number) => void;
}

export function MonthPicker({ isOpen, onClose, currentDate, onSelectMonth }: MonthPickerProps) {
  const [viewYear, setViewYear] = useState(() => currentDate.getFullYear());

  useEffect(() => {
    if (isOpen) setViewYear(currentDate.getFullYear());
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  const shiftYear = (delta: number) => {
    setViewYear((y) => Math.min(2035, Math.max(2020, y + delta)));
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Сар сонгох"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[20rem] sm:max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-card shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-3 py-3 sm:px-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => shiftYear(-1)}
                className="rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Өмнөх жил"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="min-w-[3.5rem] text-center text-sm font-black tabular-nums text-white sm:text-base">
                {viewYear}
              </span>
              <button
                type="button"
                onClick={() => shiftYear(1)}
                className="rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Дараагийн жил"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-brand-muted transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Хаах"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-3 sm:gap-2 sm:p-4">
            {MN_MONTH_NAMES.map((month, index) => {
              const isActive =
                index === currentDate.getMonth() && viewYear === currentDate.getFullYear();
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => {
                    onSelectMonth(index, viewYear);
                    onClose();
                  }}
                  className={cn(
                    'rounded-xl px-2 py-2.5 text-[11px] font-bold transition-colors sm:py-3 sm:text-xs',
                    isActive
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                      : 'text-brand-muted hover:bg-white/[0.06] hover:text-white',
                  )}
                >
                  {month}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/5 px-3 py-2.5 text-center sm:px-4">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-bold text-brand-primary hover:underline sm:text-xs"
            >
              Буцах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
