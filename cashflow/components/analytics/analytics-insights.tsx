// components/analytics/analytics-insights.tsx
'use client';

import { cn } from '@/lib/utils';

export interface Insight {
  id: string;
  type: 'strategy' | 'volatility' | 'opportunity';
  title: string;
  time: string;
  message: string;
  action?: string;
  metric?: {
    label: string;
    value: string;
    trend?: 'up' | 'down';
  };
}

interface AIInsightCardProps {
  insight: Insight;
}

function AIInsightCard({ insight }: AIInsightCardProps) {
  const getTypeStyles = () => {
    switch (insight.type) {
      case 'strategy':
        return 'text-success bg-success/10';
      case 'volatility':
        return 'text-primary bg-primary/10';
      case 'opportunity':
        return 'text-amber-500 bg-amber-500/10';
      default:
        return 'text-slate-400 bg-white/5';
    }
  };

  const getIcon = () => {
    switch (insight.type) {
      case 'strategy':
        return 'strategy';
      case 'volatility':
        return 'warning';
      case 'opportunity':
        return 'lightbulb';
      default:
        return 'insights';
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm p-5 rounded-2xl border border-white/5 shadow-xl hover:border-white/10 transition-all group">
      <div className="flex items-start gap-3 mb-3">
        <span className={cn(
          "material-symbols-outlined text-sm p-1.5 rounded-lg",
          getTypeStyles()
        )}>
          {getIcon()}
        </span>
        <div className="flex-1 flex items-center justify-between">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
            getTypeStyles()
          )}>
            {insight.title}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">{insight.time}</span>
        </div>
      </div>
      
      <p className="text-sm text-slate-200 leading-relaxed mb-4 pl-2">
        {insight.message}
      </p>
      
      {insight.metric && (
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#2b3550]/50 border border-white/5 group-hover:bg-[#2b3550]/70 transition-colors">
            <span className="text-slate-300">{insight.metric.label}</span>
            <span className={cn(
              "font-black",
              insight.metric.trend === 'up' ? 'text-success' : 'text-red-400'
            )}>
              {insight.metric.value}
            </span>
          </div>
        </div>
      )}
      
      {insight.action && (
        <button className="text-xs font-black text-primary hover:text-white transition-all flex items-center gap-2 uppercase tracking-wider group/btn mt-3 pl-2">
          {insight.action}
          <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>
      )}
    </div>
  );
}

interface AnalyticsInsightsProps {
  insights: Insight[];
  portfolioVelocity: number;
}

export function AnalyticsInsights({ insights, portfolioVelocity }: AnalyticsInsightsProps) {
  return (
    <div className="bg-gradient-to-br from-[#2b3550]/10 via-[#1a1f2e] to-[#1a1f2e] border border-white/5 rounded-2xl p-6 md:p-8 h-full flex flex-col relative overflow-hidden shadow-2xl">
      <div className="absolute -top-10 -right-10 size-48 bg-primary/10 blur-[80px] rounded-full"></div>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="size-10 flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/30 relative">
          <span className="material-symbols-outlined text-white">auto_awesome</span>
          <span className="absolute -top-1 -right-1 size-2 bg-success rounded-full animate-pulse"></span>
        </div>
        <div>
          <h3 className="text-xl font-black text-white leading-tight">AI Insights</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {insights.length} New Updates
          </p>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-5 flex-1 relative z-10">
        {insights.map((insight) => (
          <AIInsightCard key={insight.id} insight={insight} />
        ))}

        {/* Portfolio Velocity Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden mt-6">
          <div className="absolute right-0 bottom-0 opacity-10">
            <span className="material-symbols-outlined text-8xl">insights</span>
          </div>
          
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">
            Portfolio Velocity
          </p>
          <p className="text-3xl font-black text-white tracking-tight">{portfolioVelocity}x</p>
          
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/80">
            <span className="material-symbols-outlined text-xs">
              {portfolioVelocity > 1 ? 'keyboard_double_arrow_up' : 'trending_flat'}
            </span>
            <span>
              {portfolioVelocity > 1 
                ? 'Faster capital growth than industry average' 
                : 'Matching market performance'}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-white/10 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((portfolioVelocity / 2) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>


      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
          AI Engine
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">v2.4.1</span>
        </div>
      </div>
    </div>
  );
}