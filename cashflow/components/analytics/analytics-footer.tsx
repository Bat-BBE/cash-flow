// components/analytics/analytics-footer.tsx
'use client';

interface AnalyticsFooterProps {
  lastUpdated: Date;
  onRefresh: () => void;
  onSync: () => void;
}

export function AnalyticsFooter({ lastUpdated, onRefresh, onSync }: AnalyticsFooterProps) {
  return (
    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest">
      <div className="flex items-center gap-4">
        <span>Last updated: {lastUpdated.toLocaleString()}</span>
        <span className="size-1 bg-slate-600 rounded-full"></span>
        <span>Data source: Live API</span>
        <span className="size-1 bg-slate-600 rounded-full"></span>
        <span className="text-success">All systems operational</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onRefresh}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">refresh</span>
          Refresh Data
        </button>
        <button 
          onClick={onSync}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">sync</span>
          Sync
        </button>
      </div>
    </div>
  );
}