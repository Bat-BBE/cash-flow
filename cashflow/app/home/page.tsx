'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { NetWorthCard } from '@/components/dashboard/net-worth-card';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { TrendChart } from '@/components/dashboard/trend-chart';

export default function DashboardPage() {
  return (
      <DashboardShell>
        <div className="mx-auto w-full max-w-[1400px] space-y-4 px-3 pb-1 pt-1 sm:space-y-6 sm:p-4 md:space-y-8 md:p-8">
            <section className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-8">
              <NetWorthCard />
              <StatsCards />
            </section>

            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3 md:gap-8">
              <div className="xl:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                <TransactionsTable />
                <SpendingChart />
              </div>

              <aside className="space-y-4 sm:space-y-5 md:space-y-8">
                <TrendChart />
              </aside>
            </div>
          </div>
      </DashboardShell>
  );
}