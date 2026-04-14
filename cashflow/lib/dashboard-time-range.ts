import type { RawTx } from '@/contexts/dashboard-data-context';

/** Хянах самбарын хугацаа: 7 хоног · энэ сар · энэ улирал (3 сар) */
export type TimeRange = '7d' | '1m' | '1q';

/** Одоогийн календарийн улирлын эхний өдөр */
export function getQuarterStart(d = new Date()): Date {
  const m = d.getMonth();
  const q0 = Math.floor(m / 3) * 3;
  const c = new Date(d.getFullYear(), q0, 1);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function getCutoffDate(range: TimeRange): Date {
  const now = new Date();
  if (range === '7d') {
    const c = new Date(now);
    c.setDate(c.getDate() - 7);
    c.setHours(0, 0, 0, 0);
    return c;
  }
  if (range === '1m') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return getQuarterStart(now);
}

export function filterTxsByRange(txs: RawTx[], range: TimeRange): RawTx[] {
  const cutoff = getCutoffDate(range);
  return txs.filter((t) => new Date(t.date) >= cutoff);
}

/** Төсвийн нийт лимит = сарын лимит × ижил харьцаа */
export function budgetLimitMultiplier(range: TimeRange): number {
  switch (range) {
    case '7d':
      return 7 / 30;
    case '1m':
      return 1;
    case '1q':
      return 3;
    default:
      return 1;
  }
}

export function timeRangeLabelMn(range: TimeRange): string {
  switch (range) {
    case '7d':
      return 'Сүүлийн 7 хоног';
    case '1m':
      return 'Энэ сар';
    case '1q':
      return 'Энэ улирал';
    default:
      return '';
  }
}
