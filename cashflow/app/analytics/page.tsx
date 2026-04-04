'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { CashflowSankeySection } from '@/components/analytics/cashflow-sankey';
import { TransactionClassificationSection } from '@/components/analytics/transaction-classification-section';
import {
  buildSankeyFromTransactions,
  cloneInitialTransactions,
  deriveCashflowSummary,
  type AnalysisTransaction,
} from '@/lib/analytics/analysis-flow-model';

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<AnalysisTransaction[]>(
    cloneInitialTransactions,
  );

  const sankeyData = useMemo(
    () => buildSankeyFromTransactions(transactions),
    [transactions],
  );

  const summary = useMemo(
    () => deriveCashflowSummary(transactions),
    [transactions],
  );

  return (
    <DashboardShell className="bg-brand-bg" mainClassName="bg-brand-bg">
      <div className="mx-auto w-full max-w-[1400px] flex-1 space-y-3 px-3 pb-3 pt-1 sm:space-y-4 sm:px-4 sm:pb-4 sm:pt-2 md:space-y-5 md:px-6 md:py-5">
        <CashflowSankeySection sankeyData={sankeyData} summary={summary} />
        <TransactionClassificationSection
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>
    </DashboardShell>
  );
}
