'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
<<<<<<< HEAD
=======
import { format } from 'date-fns';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import Link from 'next/link';
import { BrandLogo } from '@/components/dashboard/brand-logo';
>>>>>>> 3e4acc72ed3df6050f52a337c1c70ac2889bdc16

interface HeaderProps {
  onAddTransaction?: (transaction: any) => void;
  accounts?: string[];
  categories?: string[];
}

export function Header({ onAddTransaction, accounts = [], categories = [] }: HeaderProps) {
  const { language, setLanguage, setSidebarOpen } = useDashboard();
  const t = useTranslation(language);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddTransaction = (transaction: any) => {
    if (onAddTransaction) {
      onAddTransaction(transaction);
    }
    setShowAddModal(false);
  };

  return (
    <>
      <header className="h-20 bg-brand-sidebar/50 backdrop-blur-xl px-3 sm:px-4 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link
            href="/home"
            className="lg:hidden shrink-0 rounded-xl outline-none ring-brand-primary/40 focus-visible:ring-2"
            aria-label="CashFlow home"
          >
            <BrandLogo size="sm" maxWidthClassName="max-w-[7rem]" priority />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl bg-brand-card/50 border border-brand-border/30 text-brand-text hover:text-white hover:bg-brand-card transition-all"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 md:gap-4 flex-shrink-0">
          <div
            className="hidden sm:flex items-center gap-1 rounded-xl border border-white/10 bg-brand-card/40 p-0.5"
            title={t('languageToggleLabel')}
          >
            <button
              type="button"
              onClick={() => setLanguage('MN')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                language === 'MN'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              MN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('EN')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                language === 'EN'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 md:px-4 py-2.5 bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white font-bold rounded-2xl text-xs md:text-sm hover:brightness-110 transition-all shadow-lg shadow-brand-primary/25"
          >
            <span className="material-symbols-outlined font-bold text-lg">add</span>
            <span className="hidden sm:inline">{t('addTransaction')}</span>
          </Button>
        </div>
      </header>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTransaction}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}