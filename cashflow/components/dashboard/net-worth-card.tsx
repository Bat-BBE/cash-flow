'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { formatCurrency } from '@/lib/utils';

export function NetWorthCard() {
  const { data, currency, language } = useDashboard();
  const t = useTranslation(language);

  return (
    <div className="bg-brand-card card-shadow border border-brand-border/20 p-8 rounded-2xl flex flex-col relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] -mr-32 -mb-32" />

      <div className="flex flex-col md:flex-row justify-between items-start relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-brand-muted text-sm font-semibold uppercase tracking-wider">
              {t('totalNetWorth')}
            </p>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              {data.netWorthChange} {t('vsLastMonth')}
            </span>
          </div>
          <h2 className="text-5xl font-bold text-white tracking-tight">
            {formatCurrency(data.netWorth, 'MNT')}
          </h2>
        </div>

        <div className="mt-6 md:mt-0 flex gap-3">
          <Button
            variant="outline"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl text-sm font-bold"
          >
            {t('details')}
          </Button>
          <Button className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-2xl text-sm hover:bg-brand-secondary shadow-lg shadow-brand-primary/20">
            {t('syncAccounts')}
          </Button>
        </div>
      </div>

      <div className="mt-8 h-40 w-full relative">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <defs>
            <linearGradient id="purpleGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7060F0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7060F0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 L0,60 C150,55 250,85 400,65 C550,45 650,25 800,35 C900,45 1000,15 1000,15 L1000,100 Z"
            fill="url(#purpleGradient)"
          />
          <path
            d="M0,60 C150,55 250,85 400,65 C550,45 650,25 800,35 C900,45 1000,15 1000,15"
            fill="none"
            stroke="#7060F0"
            strokeWidth="3"
          />
        </svg>
        <div className="flex justify-between mt-2 text-[10px] text-brand-muted font-bold uppercase tracking-widest">
          <span>{t('january')}</span>
          <span>{t('february')}</span>
          <span>{t('march')}</span>
          <span>{t('april')}</span>
          <span>{t('may')}</span>
          <span>{t('june')}</span>
          <span>{t('july')}</span>
          <span>{t('august')}</span>
          <span>{t('september')}</span>
          <span>{t('october')}</span>
          <span>{t('november')}</span>
          <span>{t('december')}</span>
        </div>
      </div>
    </div>
  );
}
