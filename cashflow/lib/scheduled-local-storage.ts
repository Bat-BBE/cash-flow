/**
 * Demo: scheduled bills / income persist in the browser (shared per origin, not per user).
 * Replaces Firebase for the scheduled calendar flow.
 */

import type { ScheduledBill, ScheduledIncome } from '@/components/scheduled/types';
import type { LiquidityProjection, MonthlySummary } from '@/components/scheduled/types';
import { normalizeCalendarDateKey } from '@/lib/utils';

export const SCHEDULED_STORAGE_KEY = 'cashflow_scheduled_demo_v1';

export type RawBill = {
  id: string;
  name: string;
  amount: number;
  date: string;
  dayOfMonth: number;
  category: string;
  status: ScheduledBill['status'];
  icon: string;
  color: string;
  recurring: boolean;
  recurrenceDay: number;
};

export type RawIncome = {
  id: string;
  name: string;
  amount: number;
  date: string;
  dayOfMonth: number;
  category: string;
  status: ScheduledIncome['status'];
  icon: string;
  color: string;
  recurring: boolean;
  recurrenceDay: number;
};

export type RawProjection = {
  date: string;
  dayOfMonth: number;
  projectedBalance: number;
  currentBalance: number;
  scheduledBill: number;
  scheduledIncome: number;
};

export type RawSummary = {
  startingBalance: number;
  endingBalance: number;
  totalOutgoing: number;
  totalIncoming: number;
  netChange: number;
  overdueCount: number;
  period: string;
};

export type ScheduledStoragePayload = {
  bills: Record<string, RawBill>;
  incomes: Record<string, RawIncome>;
  projections: Record<string, RawProjection>;
  summary: RawSummary | null;
};

function safeParse(json: string | null): ScheduledStoragePayload | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json) as ScheduledStoragePayload & {
      bills?: Record<string, RawBill> | RawBill[];
      incomes?: Record<string, RawIncome> | RawIncome[];
    };
    if (!v || typeof v !== 'object') return null;

    const billsRecord = Array.isArray(v.bills)
      ? Object.fromEntries(v.bills.filter((b) => b?.id).map((b) => [b.id, b]))
      : (v.bills ?? {});
    const incomesRecord = Array.isArray(v.incomes)
      ? Object.fromEntries(v.incomes.filter((i) => i?.id).map((i) => [i.id, i]))
      : (v.incomes ?? {});

    return {
      bills: billsRecord,
      incomes: incomesRecord,
      projections: v.projections ?? {},
      summary: v.summary ?? null,
    };
  } catch {
    return null;
  }
}

export function loadScheduledFromStorage(): ScheduledStoragePayload | null {
  if (typeof window === 'undefined') return null;
  return safeParse(localStorage.getItem(SCHEDULED_STORAGE_KEY));
}

export function saveScheduledToStorage(payload: ScheduledStoragePayload): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('[scheduled-local-storage] save failed', e);
  }
}

export function billToRaw(b: ScheduledBill): RawBill {
  const dateNorm = normalizeCalendarDateKey(b.date) || b.date;
  const recurrenceDay = parseInt(dateNorm.split('-')[2] ?? '1', 10);
  return {
    id: b.id,
    name: b.name,
    amount: b.amount,
    date: dateNorm,
    dayOfMonth: recurrenceDay,
    category: b.category,
    status: b.status,
    icon: b.icon,
    color: b.color ?? '#3B82F6',
    recurring: true,
    recurrenceDay,
  };
}

export function incomeToRaw(i: ScheduledIncome): RawIncome {
  const dateNorm = normalizeCalendarDateKey(i.date) || i.date;
  const recurrenceDay = parseInt(dateNorm.split('-')[2] ?? '1', 10);
  return {
    id: i.id,
    name: i.name,
    amount: i.amount,
    date: dateNorm,
    dayOfMonth: recurrenceDay,
    category: i.category,
    status: i.status,
    icon: i.icon,
    color: i.color ?? '#34d399',
    recurring: true,
    recurrenceDay,
  };
}

/** Prefer stored `date` so bills can span multiple months in the calendar. */
export function rawBillToScheduled(b: RawBill, periodFallback: string): ScheduledBill {
  const [py, pm] = periodFallback.split('-').map(Number);
  const fallbackDate = `${py}-${String(pm).padStart(2, '0')}-${String(b.recurrenceDay).padStart(2, '0')}`;
  const dateRaw = b.date || fallbackDate;
  return {
    id: b.id,
    name: b.name,
    amount: b.amount,
    date: normalizeCalendarDateKey(dateRaw) || dateRaw,
    category: b.category,
    status: b.status,
    icon: b.icon,
    color: b.color,
  };
}

export function rawIncomeToScheduled(i: RawIncome, periodFallback: string): ScheduledIncome {
  const [py, pm] = periodFallback.split('-').map(Number);
  const fallbackDate = `${py}-${String(pm).padStart(2, '0')}-${String(i.recurrenceDay).padStart(2, '0')}`;
  const dateRaw = i.date || fallbackDate;
  return {
    id: i.id,
    name: i.name,
    amount: i.amount,
    date: normalizeCalendarDateKey(dateRaw) || dateRaw,
    category: i.category,
    status: i.status,
    icon: i.icon,
    color: i.color,
  };
}

export function buildStoragePayload(
  bills: ScheduledBill[],
  incomes: ScheduledIncome[],
  projections: LiquidityProjection[],
  summary: MonthlySummary | null,
  overdueCount: number,
  period: string,
): ScheduledStoragePayload {
  const projRecord: Record<string, RawProjection> = {};
  projections.forEach((p, idx) => {
    projRecord[`p_${idx}`] = {
      date: p.date,
      dayOfMonth: p.dayOfMonth,
      projectedBalance: p.projectedBalance,
      currentBalance: p.currentBalance,
      scheduledBill: 0,
      scheduledIncome: 0,
    };
  });

  const rawSummary: RawSummary | null = summary
    ? {
        startingBalance: summary.startingBalance,
        endingBalance: summary.endingBalance,
        totalOutgoing: summary.totalOutgoing,
        totalIncoming: summary.totalIncoming,
        netChange: summary.netChange,
        overdueCount,
        period,
      }
    : null;

  return {
    bills: Object.fromEntries(bills.map((b) => [b.id, billToRaw(b)])),
    incomes: Object.fromEntries(incomes.map((i) => [i.id, incomeToRaw(i)])),
    projections: projRecord,
    summary: rawSummary,
  };
}
