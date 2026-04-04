'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AccountsSidebar } from '@/components/accounts/accounts-sidebar';
import { AccountDetails } from '@/components/accounts/account-details';
import { useAccountData } from '@/hook/use-account-data';
import { DEFAULT_ACCOUNT_ID } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export default function AccountsPage() {
  const { language } = useDashboard();
  const t = useTranslation(language);

  const {
    transactions,
    selectedAccount,
    stats,
    loading,
    selectAccount,
    accountGroups,
  } = useAccountData(DEFAULT_ACCOUNT_ID);

  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  /* Mobile: show sidebar or detail panel */
  const [mobileView, setMobileView] = useState<'sidebar' | 'detail'>('sidebar');

  const handleSelectAccount = (account: any) => {
    selectAccount(account);
    setMobileView('detail');
  };

  useEffect(() => {
    if (!selectedAccount && mobileView === 'detail') setMobileView('sidebar');
  }, [selectedAccount, mobileView]);

  /* ── Loading ── */
  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-brand-primary" />
            <p className="text-[11px] font-semibold text-white/40 sm:text-[13px]">{t('loadingAccounts')}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex min-h-0 flex-col max-lg:h-auto lg:h-full">

        {/* ── Mobile: дэлгэрэнгүй дээр sticky header (банкны апп шиг жагсаалт → буцах) ── */}
        {mobileView === 'detail' && selectedAccount && (
          <div
            className="sticky top-0 z-20 flex shrink-0 items-center gap-1.5 border-b border-white/[0.06] bg-brand-bg/95 px-2.5 py-2 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-2.5 lg:hidden"
          >
            <button
              type="button"
              onClick={() => setMobileView('sidebar')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/80 active:bg-white/[0.08] sm:h-10 sm:w-10"
              aria-label="Буцах"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">arrow_back</span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold leading-tight tracking-tight text-white sm:text-[15px]">
                {selectedAccount.name}
              </p>
              <p className="truncate text-[10px] text-white/40 sm:text-[11px]">
                {selectedAccount.institution || 'Данс'}
                {selectedAccount.accountNumber ? ` · •••• ${selectedAccount.accountNumber}` : ''}
              </p>
            </div>
          </div>
        )}

        {/* ── Mobile: жагсаалтын дээр товч гарчиг ── */}
        {mobileView === 'sidebar' && (
          <div className="shrink-0 px-3 pt-1 pb-1.5 lg:hidden">
            <h1 className="text-[1rem] font-bold leading-tight tracking-tight text-white sm:text-[1.125rem]">
              {t('accountsOverview')}
            </h1>
            <p className="mt-0.5 text-[10px] leading-relaxed text-white/38 sm:text-[11px]">
              Дансаа сонгоод үлдэгдэл, гүйлгээг үзнэ үү
            </p>
          </div>
        )}

        {/* ── Main content area — mobile дээр тойм бүхэлдээ scroll (дотоод scroll биш) ── */}
        <div
          className={cn(
            'flex min-h-0 items-start gap-3 px-3 pb-4 pt-0 sm:gap-4 sm:px-4 sm:pb-4 lg:min-h-0 lg:items-stretch lg:gap-5 lg:p-6',
            'max-lg:w-full max-lg:flex-none',
            'lg:flex-1',
          )}
        >

          {/* ── Sidebar — left on desktop, shown/hidden on mobile ── */}
          <div
            className={cn(
              'shrink-0 max-lg:w-full max-lg:flex-none max-lg:self-start lg:block lg:min-h-0 lg:w-[300px] lg:self-stretch xl:w-[340px]',
              mobileView === 'sidebar' ? 'max-lg:block' : 'max-lg:hidden',
            )}
          >
            <AccountsSidebar
              accountGroups={accountGroups}
              selectedAccount={selectedAccount}
              totalBalance={stats?.totalBalance || 0}
              totalChange={stats?.totalChange || 0}
              changePercentage={stats?.changePercentage || 0}
              onSelectAccount={handleSelectAccount}
            />
          </div>

          {/* ── Detail panel ── */}
          <div
            className={cn(
              'min-w-0 flex-1 lg:block',
              mobileView === 'detail' ? 'max-lg:flex max-lg:flex-col' : 'max-lg:hidden',
            )}
          >
            <AccountDetails
              account={selectedAccount}
              transactions={transactions}
              transactionsLoading={loading}
              onTransfer={() => console.log('Transfer')}
              onAddTransaction={() => console.log('Add')}
              onPeriodChange={setSelectedPeriod}
              selectedPeriod={selectedPeriod}
            />
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
