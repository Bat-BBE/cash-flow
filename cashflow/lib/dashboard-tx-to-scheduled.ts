/**
 * Map Firebase `users/.../transactions` rows (same as dashboard) into scheduled bill/income
 * shapes so the calendar can show them alongside localStorage items + loans.
 */

import type { ScheduledBill, ScheduledIncome } from '@/components/scheduled/types';
import { normalizeCalendarDateKey } from '@/lib/utils';

/** Minimal fields used from dashboard `RawTx` / Firebase transactions */
export type DashboardRawTx = {
  date: string;
  debit: number;
  credit: number;
  description: string;
};

export const DASHBOARD_TX_ID_PREFIX = 'dash-tx-';

export function isDashboardScheduledId(id: string): boolean {
  return id.startsWith(DASHBOARD_TX_ID_PREFIX);
}

export function transactionsToScheduledBillsAndIncomes(txs: DashboardRawTx[]): {
  bills: ScheduledBill[];
  incomes: ScheduledIncome[];
} {
  const bills: ScheduledBill[] = [];
  const incomes: ScheduledIncome[] = [];

  txs.forEach((t, i) => {
    const desc = (t.description || '').trim();
    const datePart = t.date.split(' ')[0];
    const dateKey = normalizeCalendarDateKey(datePart);
    if (!dateKey) return;

    if (Math.abs(t.debit) > 0) {
      bills.push({
        id: `${DASHBOARD_TX_ID_PREFIX}${i}-d`,
        name: desc || 'Зарлага',
        amount: Math.abs(t.debit),
        date: dateKey,
        category: 'Данс',
        status: 'scheduled',
        icon: 'shopping_bag',
      });
    }
    if (Math.abs(t.credit) > 0) {
      incomes.push({
        id: `${DASHBOARD_TX_ID_PREFIX}${i}-c`,
        name: desc || 'Орлого',
        amount: Math.abs(t.credit),
        date: dateKey,
        category: 'Данс',
        status: 'confirmed',
        icon: 'payments',
      });
    }
  });

  return { bills, incomes };
}
