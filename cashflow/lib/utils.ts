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
  return `₮ ${grouped}`;
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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
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
