'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { useAnalyticsData } from '@/hook/use-analytics-data';

import { AnalyticsHeader } from '@/components/analytics/analytics-header';
import { AnalyticsStats } from '@/components/analytics/analytics-stats';
import { AnalyticsChart } from '@/components/analytics/analytics-chart';
import { AnalyticsGallery } from '@/components/analytics/analytics-gallery';
import { AnalyticsInsights } from '@/components/analytics/analytics-insights';
import { AnalyticsFooter } from '@/components/analytics/analytics-footer';

export default function AnalyticsPage() {
  const { language } = useDashboard();
  const t = useTranslation(language);
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
      <div className="min-h-screen flex overflow-hidden bg-[#1a1f2e]">
        <Sidebar />
        <main className="flex-1 h-screen flex flex-col bg-[#1a1f2e]">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium">Loading analytics...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#1a1f2e]">
      <Sidebar />
      
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col bg-[#1a1f2e]">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

          {/* Header */}
          <AnalyticsHeader
            period={period}
            onPeriodChange={setPeriod}
            onExport={handleExport}
            totalMonths={totals.monthsCount}
          />

          {/* Stats Cards */}
          <AnalyticsStats
            totalIncome={totals.totalIncome}
            totalExpense={totals.totalExpense}
            totalSavings={totals.totalSavings}
            savingsRate={totals.savingsRate}
            incomeChange={totals.incomeChange}
            expenseChange={totals.expenseChange}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - 8 cols */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Chart */}
              <AnalyticsChart
                data={data}
                totalIncome={totals.totalIncome}
                totalExpense={totals.totalExpense}
                totalSavings={totals.totalSavings}
                savingsRate={totals.savingsRate}
                maxValue={totals.maxValue}
                activeMonth={data[data.length - 1]?.month}
              />

              {/* Gallery */}
              <AnalyticsGallery
                totalSavings={totals.totalSavings}
                savingsRate={totals.savingsRate}
                onCardClick={handleCardClick}
              />
              
            </div>

            {/* Right Column - 4 cols */}
            <div className="col-span-12 lg:col-span-4">
              <AnalyticsInsights
                insights={insights}
                portfolioVelocity={parseFloat(totals.portfolioVelocity.toFixed(2))}
              />
            </div>
          </div>

          {/* Footer */}
          <AnalyticsFooter
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
            onSync={handleSync}
          />
          
        </div>
      </main>
    </div>
  );
}