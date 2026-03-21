'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnalyticsHeaderProps {
  period: string;
  onPeriodChange: (period: string) => void;
  onExport: () => void;
  totalMonths: number;
}

const PERIODS = [
  { value: '1M', label: '1M', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  { value: '3M', label: '3M', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] },
  { value: '6M', label: '6M', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  { value: 'YTD', label: 'YTD', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
];

export function AnalyticsHeader({ 
  period, 
  onPeriodChange, 
  onExport, 
  totalMonths 
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-4xl font-black text-white tracking-tight">
            Financial Intelligence
          </h2>
          <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-black uppercase rounded border border-success/20">
            Live
          </span>
        </div>
        <p className="text-slate-400 max-w-xl font-medium">
          Deep comparison of Income vs Expenses and predictive wealth modeling.
          {` ${totalMonths} months analyzed.`}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-[#2b3550] p-1 rounded-xl flex border border-white/5 shadow-inner">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={cn(
                "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all",
                period === p.value
                  ? 'bg-primary text-white rounded-lg shadow-lg'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        
        <Button 
          onClick={onExport}
          className="bg-[#2b3550] border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/20 hover:border-primary/50 transition-all shadow-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Export PDF
        </Button>
      </div>
    </div>
  );
}