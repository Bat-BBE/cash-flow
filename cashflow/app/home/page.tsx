'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { NetWorthCard } from '@/components/dashboard/net-worth-card';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { BudgetCards } from '@/components/dashboard/budget-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { SmartInsight } from '@/components/dashboard/smart-insight';
import { TrendChart } from '@/components/dashboard/trend-chart';
// import { DashboardProvider } from '@/components/providers/dashboard-provider';
import { DashboardDataProvider } from '@/contexts/dashboard-data-context';

export default function DashboardPage() {
  return (
    <DashboardDataProvider>
      <DashboardShell>
        <div className="mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:p-4 md:space-y-8 md:p-8">
            <section className="grid grid-cols-1 gap-4 md:gap-8">
              <NetWorthCard />
              <StatsCards />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8 items-start">
              <div className="xl:col-span-2 space-y-4 md:space-y-6">
                <TransactionsTable />
                <BudgetCards />
              </div>

              <aside className="space-y-4 md:space-y-8">
                <SpendingChart />
                <SmartInsight />
                <TrendChart />
              </aside>
            </div>
          </div>
      </DashboardShell>
    </DashboardDataProvider>
  );
}