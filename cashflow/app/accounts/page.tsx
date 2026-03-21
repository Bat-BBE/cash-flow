'use client';

import { useState } from 'react';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AccountsSidebar } from '@/components/accounts/accounts-sidebar';
import { AccountDetails } from '@/components/accounts/account-details';
import { useAccountData } from '@/hook/use-account-data';
import { DEFAULT_ACCOUNT_ID } from '@/lib/firebase';

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

  const handleTransfer = () => {
    console.log('Transfer initiated');
  };

  const handleAddTransaction = () => {
    console.log('Add transaction');
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 size-12 animate-spin rounded-full border-4 border-brand-primary/30 border-t-brand-primary" />
            <p className="font-medium text-brand-muted">{t('loadingAccounts')}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:flex-row lg:gap-6 lg:p-8">
        <div className="shrink-0 lg:w-[320px] xl:w-[360px]">
          <AccountsSidebar
            accountGroups={accountGroups}
            selectedAccount={selectedAccount}
            totalBalance={stats?.totalBalance || 0}
            totalChange={stats?.totalChange || 0}
            changePercentage={stats?.changePercentage || 0}
            onSelectAccount={selectAccount}
          />
        </div>

        <div className="min-w-0 flex-1">
          <AccountDetails
            account={selectedAccount}
            transactions={transactions}
            transactionsLoading={loading}
            onTransfer={handleTransfer}
            onAddTransaction={handleAddTransaction}
            onPeriodChange={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
