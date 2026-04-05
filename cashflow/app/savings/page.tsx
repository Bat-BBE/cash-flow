'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SavingsPageView } from '@/components/savings/savings-page-view';

export default function SavingsPage() {
  return (
    <DashboardShell className="bg-brand-bg" mainClassName="bg-brand-bg">
      <SavingsPageView />
    </DashboardShell>
  );
}
