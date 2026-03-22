'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { CashflowSankeySection } from '@/components/analytics/cashflow-sankey';
import { TransactionClassificationSection } from '@/components/analytics/transaction-classification-section';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex bg-[#1a1f2e]">
      <Sidebar />

      <main className="flex-1 min-h-screen overflow-y-auto custom-scrollbar flex flex-col bg-[#1a1f2e]">
        <Header />

        <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5">
          <CashflowSankeySection />
          <TransactionClassificationSection />
        </div>
      </main>
    </div>
  );
}
