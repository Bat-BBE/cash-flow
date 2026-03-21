// components/accounts/account-chart.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AccountChartProps {
  monthlyAverage: number;
  interestAccrued: number;
  period: string;
  className?: string;
}

interface ChartDataPoint {
  date: string;
  balance: number;
}

const generateChartData = (period: string): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  let days = 30;
  
  switch (period) {
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '3M': days = 90; break;
    case '1Y': days = 365; break;
    default: days = 30;
  }

  let balance = 40000000;
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random walk for realistic chart
    balance += (Math.random() - 0.5) * 2000000;
    balance = Math.max(balance, 35000000);
    balance = Math.min(balance, 48000000);
    
    data.push({
      date: date.toISOString().split('T')[0],
      balance: Math.round(balance)
    });
  }
  
  return data;
};

export function AccountChart({
  monthlyAverage,
  interestAccrued,
  period,
  className
}: AccountChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    setChartData(generateChartData(period));
  }, [period]);

  // Calculate chart dimensions
  const minBalance = Math.min(...chartData.map(d => d.balance));
  const maxBalance = Math.max(...chartData.map(d => d.balance));
  const range = maxBalance - minBalance;
  
  // Generate SVG path
  const generatePath = () => {
    if (chartData.length === 0) return '';
    
    const width = 1000;
    const height = 80;
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * width;
      const y = height - ((d.balance - minBalance) / range) * height;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };

  return (
    <div className={cn(
      "bg-brand-card rounded-2xl border border-white/5 p-6 relative overflow-hidden",
      className
    )}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent"></div>
      
      {/* Chart SVG */}
      <div className="relative z-10 h-56">
        <svg 
          className="w-full h-full text-brand-primary opacity-60"
          preserveAspectRatio="none"
          viewBox="0 0 1000 100"
        >
          {/* Area under the line */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(112, 96, 240)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(112, 96, 240)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          
          {/* Area */}
          <path
            d={`${generatePath()} L1000,100 L0,100 Z`}
            fill="url(#gradient)"
          />
          
          {/* Data points */}
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * 1000;
            const y = 80 - ((d.balance - minBalance) / range) * 80;
            
            return (
              <circle
                key={d.date}
                cx={x}
                cy={y}
                r={hoveredPoint === i ? 4 : 2}
                fill="rgb(112, 96, 240)"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint !== null && chartData[hoveredPoint] && (
          <div 
            className="absolute bg-white text-[#151b2b] p-2 rounded-lg text-xs font-bold shadow-2xl"
            style={{
              left: `${(hoveredPoint / (chartData.length - 1)) * 100}%`,
              top: '20%',
              transform: 'translateX(-50%)'
            }}
          >
            <p className="text-[8px] uppercase text-slate-500">
              {chartData[hoveredPoint].date}
            </p>
            <p className="text-brand-primary">
              {new Intl.NumberFormat('mn-MN', {
                style: 'currency',
                currency: 'MNT',
                minimumFractionDigits: 0
              }).format(chartData[hoveredPoint].balance)}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="relative z-10 flex flex-wrap gap-6 md:gap-10 mt-4">
        <div>
          <p className="text-[10px] text-brand-muted font-bold uppercase mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            Avg. Monthly Balance
          </p>
          <p className="text-lg md:text-xl font-bold text-white">
            {new Intl.NumberFormat('mn-MN', {
              style: 'currency',
              currency: 'MNT',
              minimumFractionDigits: 0
            }).format(monthlyAverage)}
          </p>
        </div>
        
        <div>
          <p className="text-[10px] text-brand-muted font-bold uppercase mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">savings</span>
            Interest Accrued
          </p>
          <p className="text-lg md:text-xl font-bold text-brand-primary">
            +{new Intl.NumberFormat('mn-MN', {
              style: 'currency',
              currency: 'MNT',
              minimumFractionDigits: 0
            }).format(interestAccrued)}
          </p>
          <p className="text-[8px] text-brand-muted mt-1">This month</p>
        </div>

        <div>
          <p className="text-[10px] text-brand-muted font-bold uppercase mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">insights</span>
            Performance
          </p>
          <p className="text-lg md:text-xl font-bold text-success">
            +2.4%
          </p>
          <p className="text-[8px] text-brand-muted mt-1">vs last month</p>
        </div>
      </div>

      {/* Period indicator */}
      <div className="absolute top-4 right-4 text-[8px] text-brand-muted bg-black/20 px-2 py-1 rounded-full">
        {period} Trend
      </div>
    </div>
  );
}