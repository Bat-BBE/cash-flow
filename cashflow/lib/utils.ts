// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'MNT'): string {
  if (currency === 'MNT') {
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
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
