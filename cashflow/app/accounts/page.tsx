'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AccountsSidebar } from '@/components/accounts/accounts-sidebar';
import { AccountDetails } from '@/components/accounts/account-details';
import { useAccountData } from '@/hook/use-account-data';

export default function AccountsPage() {
  const {
    selectedAccount,
    stats,
    loading,
    selectAccount,
    accountGroups,
  } = useAccountData('2');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const handleTransfer = () => {
    console.log('Transfer initiated');
  };

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 size-12 animate-spin rounded-full border-4 border-brand-primary/30 border-t-brand-primary"></div>
            <p className="font-medium text-brand-muted">Loading accounts...</p>
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
            onTransfer={handleTransfer}
            onAddTransaction={handleAddTransaction}
            onPeriodChange={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>

      {/* Modals */}
      {/* <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        account={selectedAccount}
      /> */}
    </DashboardShell>
  );
}
