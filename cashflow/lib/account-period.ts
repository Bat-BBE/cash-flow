/**
 * Date range presets for the bank account detail view (matches transaction list filter).
 */
export type AccountPeriodId = '1W' | '1M' | '3M' | '1Y';

export const ACCOUNT_PERIOD_IDS: AccountPeriodId[] = ['1W', '1M', '3M', '1Y'];

/** Inclusive start of [start, today] in local calendar days. */
export function getAccountPeriodStart(period: string): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  switch (period) {
    case '1W':
      start.setDate(start.getDate() - 7);
      break;
    case '1M':
      start.setMonth(start.getMonth() - 1);
      break;
    case '3M':
      start.setMonth(start.getMonth() - 3);
      break;
    case '1Y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }
  return start;
}

function parseTransactionDate(txDate: string): Date {
  const trimmed = txDate.trim().split(' ')[0];
  const parts = trimmed.split(/[-/]/);
  if (parts.length >= 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  return new Date(trimmed);
}

/** Whether the transaction's booking date falls in [periodStart, end of today] (local). */
export function isTransactionInAccountPeriod(txDate: string, period: string): boolean {
  const tx = parseTransactionDate(txDate);
  tx.setHours(12, 0, 0, 0);
  const start = getAccountPeriodStart(period);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return tx >= start && tx <= end;
}
