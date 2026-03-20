// components/dashboard/smart-insight.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hook/use-dashboard-data';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation, TranslationKey } from '@/lib/translations';

export function SmartInsight() {
  const { insights, loading } = useDashboardData();
  const { language } = useDashboard();
  const t = useTranslation(language);

  const insightTypeLabel = (type: string): string => {
    const map: Record<string, TranslationKey> = {
      warning: 'typeWarning',
      success: 'typeSuccess',
      info: 'typeInfo',
      tip: 'typeTip',
    };
    const key = map[type];
    return key ? t(key) : type;
  };
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'tip': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-white/5 text-brand-muted border-white/10';
    }
  };

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-brand-primary/10 to-transparent rounded-2xl border border-white/5 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/5 rounded w-24 mb-4"></div>
          <div className="h-4 bg-white/5 rounded w-32 mb-2"></div>
          <div className="h-3 bg-white/5 rounded w-full mb-4"></div>
          <div className="h-8 bg-white/5 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const currentInsight = insights[currentIndex];

  return (
    <div className="bg-gradient-to-br from-brand-primary/10 to-transparent rounded-2xl border border-white/5 p-6 relative overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/dots.svg')] opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={cn(
              "material-symbols-outlined p-2 rounded-xl text-sm",
              getTypeStyles(currentInsight.type)
            )}>
              {currentInsight.icon}
            </span>
            <h3 className="text-sm font-bold text-white">{t('aiInsightTitle')}</h3>
          </div>
          
          <span className={cn(
            "text-[8px] px-2 py-1 rounded-full uppercase font-black border",
            getTypeStyles(currentInsight.type)
          )}>
            {insightTypeLabel(currentInsight.type)}
          </span>
        </div>

        <h4 className="text-lg font-bold text-white mb-2">
          {currentInsight.title}
        </h4>
        
        <p className="text-sm text-brand-muted leading-relaxed mb-6">
          {currentInsight.message}
        </p>

        {currentInsight.action && (
          <button className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-white transition-colors group/btn">
            {currentInsight.action}
            <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        )}

        {/* Navigation Dots */}
        {insights.length > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <div className="flex gap-1">
              {insights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    index === currentIndex
                      ? 'w-4 bg-brand-primary'
                      : 'bg-white/20 hover:bg-white/40'
                  )}
                />
              ))}
            </div>
            
            <button
              onClick={nextInsight}
              className="text-xs text-brand-muted hover:text-white transition-colors flex items-center gap-1"
            >
              {t('nextTip')}
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}