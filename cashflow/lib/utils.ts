// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** MNT/Globe-safe: Node SSR and browsers disagree on MNT vs ₮ from Intl — use fixed output for hydration. */
function formatMnt(amount: number): string {
  const n = Math.round(amount);
  const grouped = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${grouped} ₮`;
}

/**
 * Shorter amounts for tight UI (e.g. calendar cells). MNT uses k / M suffixes.
 */
export function formatCompactCalendarAmount(amount: number, currency: string = 'MNT'): string {
  if (currency === 'MNT') {
    const a = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (a >= 1_000_000) {
      const v = a / 1_000_000;
      const rounded = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
      return `${sign}${rounded}M ₮`;
    }
    if (a >= 1_000) {
      return `${sign}${Math.round(a / 1_000)}k ₮`;
    }
    return formatMnt(amount);
  }
  return formatCurrency(amount, currency);
}

export function formatCurrency(amount: number, currency: string = 'MNT'): string {
  if (currency === 'MNT') {
    return formatMnt(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Calendar date from `YYYY-M-D` in **UTC** (same instant on server + browser — avoids hydration mismatches).
 */
export function parseDateInputUTC(iso: string): Date {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/u.exec(iso.trim());
  if (m) {
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return d;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addMonthsUTC(date: Date, months: number): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

/**
 * For monthly schedules: if start is before the reference calendar day, advance by whole months
 * until on/after that day. Uses **UTC** calendar math so SSR and client match.
 *
 * @param referenceNowISO - Stable snapshot (e.g. `loan.json` `generatedAt`). Avoid omitting — if omitted, uses a fixed epoch fallback (not "now") so hydration stays deterministic.
 */
export function rollMonthlyStartDateIfPast(
  startDateISO: string,
  referenceNowISO?: string,
): Date {
  const refStr = referenceNowISO ?? '2000-01-01';
  let d = parseDateInputUTC(startDateISO);
  const today = parseDateInputUTC(refStr);
  while (d < today) {
    d = addMonthsUTC(d, 1);
  }
  return d;
}

/**
 * Calendar grid matches bills/income with strict `YYYY-MM-DD` strings.
 * Normalizes ISO datetimes (`2025-03-15T00:00:00.000Z`) and unpadded parts (`2025-3-5`).
 */
export function normalizeCalendarDateKey(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const s = input.trim();
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (!m) return s;
  const y = m[1];
  const mo = String(Number(m[2])).padStart(2, '0');
  const d = String(Number(m[3])).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

/** `YYYY-MM-DD` for `<input type="date">` using **local** calendar (matches scheduled bill dates). */
export function formatDateForInputLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Compares normalized `YYYY-MM-DD` to today (local) — true for today and future dates. */
export function isDateKeyTodayOrFuture(dateKey: string): boolean {
  const n = normalizeCalendarDateKey(dateKey);
  if (!n) return false;
  const today = formatDateForInputLocal(new Date());
  return n >= today;
}

export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/** Same as formatDate but calendar fields in UTC (pair with dates from rollMonthlyStartDateIfPast). */
export function formatDateUTC(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function calculatePercentage(spent: number, limit: number): number {
  return Math.round((spent / limit) * 100);
}

export function getChangeColor(change: string): string {
  return change.startsWith('+') ? 'text-emerald-400' : 'text-orange-400';
}

export function getPercentageColor(percentage: number): string {
  if (percentage >= 90) return 'text-orange-400';
  if (percentage >= 70) return 'text-yellow-400';
  return 'text-emerald-400';
}
