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

/** Parse `YYYY-M-D` or ISO date strings as local calendar date (avoids UTC off-by-one). */
export function parseDateInputLocal(iso: string): Date {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/u.exec(iso.trim());
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(iso);
}

export function addMonthsLocal(date: Date, months: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * For monthly schedules: if start is before "today", advance by whole months until on/after today.
 * Use when displaying the next occurrence in lists.
 */
export function rollMonthlyStartDateIfPast(startDateISO: string, now: Date = new Date()): Date {
  let d = parseDateInputLocal(startDateISO);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (d < today) {
    d = addMonthsLocal(d, 1);
  }
  return d;
}

export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
