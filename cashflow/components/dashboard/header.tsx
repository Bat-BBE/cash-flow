'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboard }            from '@/components/providers/dashboard-provider';
import { useTranslation }          from '@/lib/translations';
import { cn }                      from '@/lib/utils';
import { AddTransactionModal }     from '@/components/transactions/add-transaction-modal';
import { format }                  from 'date-fns';

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
      <header
        className="fixed inset-x-0 top-0 z-50 flex h-16 w-full max-w-full items-center gap-3 border-b border-white/[0.06] bg-[#0e0c1e]/80 px-3 backdrop-blur-2xl sm:px-5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-all hover:bg-white/[0.09] hover:text-white lg:hidden"
            aria-label="Цэс нээх"
          >
            <span className="material-symbols-outlined text-[22px] leading-none">menu</span>
          </button>

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div
              className={cn(
                'relative shrink-0 overflow-hidden rounded-xl',
                'h-10 w-10 sm:h-11 sm:w-11',
              )}
            >
              <img
                src="/logo.png"
                alt=""
                className="size-full object-contain p-1"
              />
            </div>
            <div className="min-w-0 hidden md:block">
              <p className="text-[16px] font-black uppercase leading-none tracking-wider text-brand-primary">
                CashFlow
              </p>
              <h1 className="mt-0.5 truncate text-sm leading-tight text-white sm:text-xs lg:text-sm">
                {pageTitle}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* <button
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
            <span className="hidden md:inline tabular-nums text-[11px]">
              {format(date, 'MMM d')}
            </span>
          </button> */}

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