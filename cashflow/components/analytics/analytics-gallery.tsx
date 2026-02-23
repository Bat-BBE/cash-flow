'use client';

import { cn } from '@/lib/utils';

interface GalleryCardProps {
  id: string;
  title: string;
  icon: string;
  value: string;
  change?: string;
  status: string;
  statusColor: 'primary' | 'success' | 'slate';
  onClick?: (id: string) => void;
}

function GalleryCard({ 
  id, 
  title, 
  icon, 
  value, 
  change, 
  status, 
  statusColor, 
  onClick 
}: GalleryCardProps) {
  return (
    <button 
      onClick={() => onClick?.(id)}
      className="bg-[#2b3550] p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all text-left group shadow-lg w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
          {icon}
        </span>
        <span className="material-symbols-outlined text-slate-600 text-sm group-hover:text-primary transition-colors">
          open_in_new
        </span>
      </div>
      
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{title}</p>
      
      <div className="mb-4">
        <p className="text-2xl font-black text-white">{value}</p>
        {change && (
          <p className="text-[10px] text-success mt-1">↑ {change}% this month</p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">
          Open View
        </span>
        <span className={cn(
          "text-[10px] font-black uppercase",
          statusColor === 'primary' && "text-primary",
          statusColor === 'success' && "text-success",
          statusColor === 'slate' && "text-slate-500"
        )}>
          {status}
        </span>
      </div>
    </button>
  );
}

interface AnalyticsGalleryProps {
  totalSavings: number;
  savingsRate: number;
  onCardClick?: (cardId: string) => void;
}

export function AnalyticsGallery({ totalSavings, savingsRate, onCardClick }: AnalyticsGalleryProps) {
  const cards = [
    {
      id: 'net-worth',
      title: "Net Worth",
      icon: "monitoring",
      value: `$${(totalSavings * 3.2 / 1000).toFixed(1)}K`,
      change: "12.4",
      status: "Live",
      statusColor: "primary" as const
    },
    {
      id: 'allocation',
      title: "Allocation",
      icon: "donut_large",
      value: `${Math.round(savingsRate)}% / ${Math.round(100 - savingsRate)}%`,
      status: "Optimized",
      statusColor: "success" as const
    },
    {
      id: 'tax',
      title: "Tax Efficiency",
      icon: "history_edu",
      value: "78%",
      change: "5.2",
      status: "Ready",
      statusColor: "slate" as const
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
          Key Metrics & Reports
        </h3>
        <span className="text-[10px] text-slate-600 font-bold">
          Updated {new Date().toLocaleDateString()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <GalleryCard
            key={card.id}
            {...card}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}