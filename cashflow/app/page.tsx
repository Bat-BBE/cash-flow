'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { NetWorthCard } from '@/components/dashboard/net-worth-card';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { BudgetCards } from '@/components/dashboard/budget-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { SmartInsight } from '@/components/dashboard/smart-insight';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { DashboardProvider } from '@/components/providers/dashboard-provider';

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen flex overflow-hidden bg-brand-bg">
        <Sidebar />

        <main className="flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col bg-brand-bg">
          <Header />

          <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
            <section className="grid grid-cols-1 gap-8">
              <NetWorthCard />
              <StatsCards />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <TransactionsTable />
                <BudgetCards />
              </div>

              <aside className="space-y-8">
                <SpendingChart />
                <SmartInsight />
                <TrendChart />
              </aside>
            </div>
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}