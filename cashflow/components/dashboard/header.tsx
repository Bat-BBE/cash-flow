'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { Currency } from '@/lib/types';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
import { format } from 'date-fns';

interface HeaderProps {
  onAddTransaction?: (transaction: any) => void;
  accounts?: string[];
  categories?: string[];
}

export function Header({ onAddTransaction, accounts = [], categories = [] }: HeaderProps) {
  const router = useRouter();
  const { currency, setCurrency, selectedMonth, language, setLanguage, setSidebarOpen } = useDashboard();
  const t = useTranslation(language);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const currencies: Currency[] = ['MNT', 'USD', 'EUR'];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const searchEvent = new CustomEvent('globalSearch', { detail: e.target.value });
    window.dispatchEvent(searchEvent);
  };

  const clearSearch = () => {
    setSearchQuery('');
    const searchEvent = new CustomEvent('globalSearch', { detail: '' });
    window.dispatchEvent(searchEvent);
  };

  const handleAddTransaction = (transaction: any) => {
    if (onAddTransaction) {
      onAddTransaction(transaction);
    }
    setShowAddModal(false);
  };

  const handleCalendarClick = () => {
    router.push('/scheduled');
  };

  return (
    <>
      <header className="h-20 bg-brand-sidebar/50 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl bg-brand-card/50 border border-brand-border/30 text-brand-text hover:text-white hover:bg-brand-card transition-all"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-xl">
              search
            </span>
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-brand-card/50 border-brand-border/30 pl-12 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary text-white placeholder:text-brand-muted/50"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 bg-brand-card/80 p-1.5 rounded-2xl border border-brand-border/30">
            {(['MN', 'EN'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  'px-2 md:px-3 py-1.5 text-xs font-bold rounded-xl transition-all min-w-[50px]',
                  language === lang
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                    : 'text-brand-muted hover:text-white hover:bg-brand-card'
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <Button
            onClick={handleCalendarClick}
            variant="outline"
            className="hidden sm:flex items-center gap-2 px-3 py-2.5 bg-brand-card/80 border-brand-border/30 rounded-2xl text-brand-text text-sm hover:bg-brand-card hover:border-brand-primary/50 font-medium transition-all group"
          >
            <span className="material-symbols-outlined text-lg text-brand-primary group-hover:scale-110 transition-transform">
              calendar_month
            </span>
            <span className="hidden md:inline">
              {format(date, 'MMM dd, yyyy')}
            </span>
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 md:px-4 py-2.5 bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white font-bold rounded-2xl text-sm hover:brightness-110 transition-all shadow-lg shadow-brand-primary/25"
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