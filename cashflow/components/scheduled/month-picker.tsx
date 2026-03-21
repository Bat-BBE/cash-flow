// components/scheduled/month-picker.tsx
'use client';

import { cn } from '@/lib/utils';
import { MN_MONTH_NAMES } from '@/lib/calendar-locale-mn';

interface MonthPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onSelectMonth: (month: number, year: number) => void;
}

export function MonthPicker({ isOpen, onClose, currentDate, onSelectMonth }: MonthPickerProps) {
  if (!isOpen) return null;

  const years = [2023, 2024];

  return (
    <div className="absolute top-24 left-6 z-20 w-80 bg-[#121827] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span className="text-xs text-slate-500 font-semibold">Жил</span>
          <span className="text-sm font-bold text-white tabular-nums">{currentDate.getFullYear()}</span>
          <button className="p-1 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
        <button 
          onClick={onClose}
          className="size-7 rounded-full glass-morphism flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <span className="material-symbols-outlined text-sm text-white">close</span>
        </button>
      </div>

      {/* Months grid */}
        <div className="p-4 grid grid-cols-3 gap-2">
        {MN_MONTH_NAMES.map((month, index) => (
          <button
            key={month}
            onClick={() => {
              onSelectMonth(index, currentDate.getFullYear());
              onClose();
            }}
            className={cn(
              "p-2 text-xs font-semibold rounded-lg transition-colors",
              index === currentDate.getMonth()
                ? 'text-white bg-primary shadow-lg shadow-primary/30'
                : 'text-slate-400 hover:bg-white/5'
            )}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 text-center">
        <button 
          onClick={onClose}
          className="text-[11px] font-bold text-primary hover:underline"
        >
          Буцах
        </button>
      </div>
    </div>
  );
}