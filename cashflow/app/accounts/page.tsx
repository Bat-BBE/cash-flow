'use client';

import { useState } from 'react';
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

  /* ── Loading ── */
  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-brand-primary" />
            <p className="text-[13px] font-semibold text-white/40">{t('loadingAccounts')}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex h-full flex-col">

        {/* ── Mobile tab bar ── */}
        <div className="shrink-0 border-b border-white/[0.05] px-4 pt-3 lg:hidden">
          <div className="flex gap-0">
            {[
              { key: 'sidebar', label: 'Дансууд', icon: 'account_balance' },
              { key: 'detail',  label: 'Дэлгэрэнгүй', icon: 'bar_chart' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMobileView(key as 'sidebar' | 'detail')}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 pb-3 pt-1 text-[12px] font-bold transition-all duration-200',
                  mobileView === key ? 'text-white' : 'text-white/35 hover:text-white/60',
                )}
              >
                <span className="material-symbols-outlined text-[15px]">{icon}</span>
                {label}
                {mobileView === key && (
                  <span className="absolute bottom-0 inset-x-2 h-[2px] rounded-full bg-brand-primary" />
                )}
              </button>
            ))}

            {/* Back button in detail view */}
            {mobileView === 'detail' && selectedAccount && (
              <button
                type="button"
                onClick={() => setMobileView('sidebar')}
                className="ml-auto flex items-center gap-1 pb-3 pt-1 text-[12px] font-bold text-white/35 hover:text-white/65"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Буцах
              </button>
            )}
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="flex min-h-0 flex-1 gap-4 p-3 sm:p-4 lg:gap-5 lg:p-6">

          {/* ── Sidebar — left on desktop, shown/hidden on mobile ── */}
          <div
            className={cn(
              'shrink-0 lg:block lg:w-[300px] xl:w-[340px]',
              /* mobile: full width when active, hidden otherwise */
              'max-lg:w-full max-lg:flex-1',
              mobileView === 'sidebar' ? 'max-lg:flex' : 'max-lg:hidden',
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
