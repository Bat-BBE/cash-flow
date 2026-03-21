'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboard }            from '@/components/providers/dashboard-provider';
import { useTranslation }          from '@/lib/translations';
import { cn }                      from '@/lib/utils';
import { AddTransactionModal }     from '@/components/transactions/add-transaction-modal';
import { format }                  from 'date-fns';

/* ─── Page title map ─────────────────────────────────────────────── */
const PAGE_TITLE: Record<string, string> = {
  '/home':                 'Хянах самбар',
  '/accounts':             'Данснууд',
  '/budgets':              'Төсөв',
  '/analytics':            'Шинжилгээ',
  '/payments':             'Зээл',
  '/payments/plan':        'Төлөвлөгөө',
  '/payments/simulator':   'Тооцоолуур',
  '/scheduled':            'Хуваарь',
  '/settings':             'Тохиргоо',
  '/support':              'Тусламж',
};

function titleForPath(p: string | null): string {
  if (!p) return 'CashFlow';
  return PAGE_TITLE[p] ?? PAGE_TITLE[`/${p.split('/').filter(Boolean)[0]}`] ?? 'CashFlow';
}

export interface HeaderProps {
  onAddTransaction?: (tx: unknown) => void;
  accounts?:         string[];
  categories?:       string[];
}

export function Header({ onAddTransaction, accounts = [], categories = [] }: HeaderProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, setSidebarOpen } = useDashboard();
  const t         = useTranslation(language);
  const pageTitle = titleForPath(pathname);

  const [showAddModal, setShowAddModal] = useState(false);
  const [date]                          = useState(() => new Date());

  return (
    <>
      {/*
        ┌─────────────────────────────────────────────────────────┐
        │  FIXED HEADER  h-16 (64px)                              │
        │  z-40 — sidebar (z-50) дээр дарагдана                   │
        │  Layout:                                                  │
        │    mobile:  [≡ menu]  [logo + pagetitle]  [actions]     │
        │    desktop: [pagetitle]                   [actions]      │
        └─────────────────────────────────────────────────────────┘
      */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40
                         bg-[#1c1c2a]/90 backdrop-blur-xl
                         border-b border-white/[0.06]
                         flex items-center px-3 sm:px-5 gap-3">

        {/* ── Зүүн: mobile menu button + logo/title ── */}
        <div className="flex items-center gap-2 flex-1 min-w-0">

          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-10 w-10 flex items-center justify-center
                       rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-white/50 hover:text-white hover:bg-white/[0.09]
                       transition-all shrink-0"
            aria-label="Цэс нээх"
          >
            <span className="material-symbols-outlined text-[22px] leading-none">menu</span>
          </button>

          {/* Mobile: жижиг лого + хуудасны гарчиг */}
          <div className="flex lg:hidden items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="h-full w-full object-contain p-0.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-wider text-brand-primary leading-none">
                CashFlow
              </p>
              <p className="text-sm font-bold text-white truncate leading-tight mt-0.5">
                {pageTitle}
              </p>
            </div>
          </div>

          {/* Desktop: хуудасны гарчиг */}
          <h1 className="hidden lg:block text-xl font-bold text-white tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>

        {/* ── Баруун: үйлдлүүд ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Language toggle */}
          <div className="flex items-center bg-white/[0.05] border border-white/[0.07]
                          rounded-xl p-[3px] gap-[2px]">
            {(['MN', 'EN'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={cn(
                  'h-7 px-2.5 text-[10px] font-bold rounded-lg transition-all min-w-[34px]',
                  language === lang
                    ? 'bg-brand-primary text-white'
                    : 'text-white/35 hover:text-white/70',
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Calendar — mobile-д icon-л харагдана, md-д огноо нэмэгдэнэ */}
          <button
            type="button"
            onClick={() => router.push('/scheduled')}
            className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3
                       bg-white/[0.05] border border-white/[0.07] rounded-xl
                       text-white/45 hover:text-white hover:bg-white/[0.09]
                       transition-all text-[11px] font-semibold shrink-0"
            aria-label="Хуваарь"
          >
            <span className="material-symbols-outlined text-[18px] leading-none text-brand-primary">
              calendar_month
            </span>
            {/* md-аас дээш огноо харагдана */}
            <span className="hidden md:inline tabular-nums text-[11px]">
              {format(date, 'MMM d')}
            </span>
          </button>

          {/* Add transaction */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-9 px-3
                       bg-brand-primary hover:bg-brand-primary/90
                       text-white font-bold rounded-xl
                       text-[11px] sm:text-xs transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] leading-none font-bold">add</span>
            <span className="hidden sm:inline">{t('addTransaction')}</span>
          </button>
        </div>
      </header>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(tx) => { onAddTransaction?.(tx); setShowAddModal(false); }}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}