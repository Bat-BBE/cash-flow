'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAnalyticsData } from '@/hook/use-analytics-data';

import { AnalyticsHeader } from '@/components/analytics/analytics-header';
import { AnalyticsStats } from '@/components/analytics/analytics-stats';
import { AnalyticsChart } from '@/components/analytics/analytics-chart';
import { AnalyticsGallery } from '@/components/analytics/analytics-gallery';
import { AnalyticsInsights } from '@/components/analytics/analytics-insights';
import { AnalyticsFooter } from '@/components/analytics/analytics-footer';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6M');
  const [lastUpdated] = useState(new Date());
  
  const { data, insights, loading, totals } = useAnalyticsData(period);

  const handleExport = () => {
    console.log('Exporting PDF...');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSync = () => {
    console.log('Syncing data...');
  };

  const handleCardClick = (cardId: string) => {
    console.log(`Opening ${cardId}...`);
  };

  if (loading) {
    return (
      <DashboardShell className="bg-[#1a1f2e]" mainClassName="bg-[#1a1f2e]">
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
            <p className="font-medium text-slate-400">Loading analytics...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell className="bg-[#1a1f2e]" mainClassName="bg-[#1a1f2e]">
        <div className="space-y-8 p-4 sm:p-6 md:p-8">

          <AnalyticsHeader
            period={period}
            onPeriodChange={setPeriod}
            onExport={handleExport}
            totalMonths={totals.monthsCount}
          />

          <AnalyticsStats
            totalIncome={totals.totalIncome}
            totalExpense={totals.totalExpense}
            totalSavings={totals.totalSavings}
            savingsRate={totals.savingsRate}
            incomeChange={totals.incomeChange}
            expenseChange={totals.expenseChange}
          />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="xl:col-span-8 space-y-6 md:space-y-8">

              <AnalyticsChart
                data={data}
                totalIncome={totals.totalIncome}
                totalExpense={totals.totalExpense}
                totalSavings={totals.totalSavings}
                savingsRate={totals.savingsRate}
                maxValue={totals.maxValue}
                activeMonth={data[data.length - 1]?.month}
              />

              <AnalyticsGallery
                totalSavings={totals.totalSavings}
                savingsRate={totals.savingsRate}
                onCardClick={handleCardClick}
              />
              
            </div>

            <div className="xl:col-span-4">
              <AnalyticsInsights
                insights={insights}
                portfolioVelocity={parseFloat(totals.portfolioVelocity.toFixed(2))}
              />
            </div>
          </div>
          
          <AnalyticsFooter
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
            onSync={handleSync}
          />
          
        </div>
    </DashboardShell>
  );
}