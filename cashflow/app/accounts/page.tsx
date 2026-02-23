// app/accounts/page.tsx
'use client';

import { useState } from 'react';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { AccountsSidebar } from '@/components/accounts/accounts-sidebar';
import { AccountDetails } from '@/components/accounts/account-details';
import { useAccountData } from '@/hook/use-account-data';

export default function AccountsPage() {
  const { language } = useDashboard();
  const t = useTranslation(language);
  
  const { 
    accounts, 
    selectedAccount, 
    stats, 
    loading, 
    selectAccount, 
    accountGroups 
  } = useAccountData('2');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const handleTransfer = () => {
    console.log('Transfer initiated');
    // Open transfer modal
  };

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex overflow-hidden bg-brand-bg">
        <Sidebar />
        <main className="flex-1 h-screen flex flex-col bg-brand-bg">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="size-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mb-4"></div>
              <p className="text-brand-muted font-medium">Loading accounts...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-brand-bg">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-brand-bg custom-scrollbar flex flex-col">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Accounts Sidebar */}
          <AccountsSidebar
            accountGroups={accountGroups}
            selectedAccount={selectedAccount}
            totalBalance={stats?.totalBalance || 0}
            totalChange={stats?.totalChange || 0}
            changePercentage={stats?.changePercentage || 0}
            onSelectAccount={selectAccount}
          />

          {/* Account Details */}
          <AccountDetails
            account={selectedAccount}
            onTransfer={handleTransfer}
            onAddTransaction={handleAddTransaction}
            onPeriodChange={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </main>

      {/* Modals */}
      {/* <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        account={selectedAccount}
      /> */}
    </div>
  );
}