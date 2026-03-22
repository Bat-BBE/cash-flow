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
    <DashboardShell className="bg-[#1a1f2e]" mainClassName="bg-[#1a1f2e]">
      <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5">
        <CashflowSankeySection sankeyData={sankeyData} summary={summary} />
        <TransactionClassificationSection
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>
    </DashboardShell>
  );
}
