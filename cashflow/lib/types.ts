// lib/types.ts

export interface Transaction {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  icon: string;
  description: string;
  cardLast4?: string;
}

export interface Budget {
  id: string;
  name: string;
  spent: number;
  limit: number;
  percentage: number;
  color: string;
}

export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  iconColor: string;
  badge: string;
  badgeColor: string;
}

export interface SpendingCategory {
  name: string;
  percentage: number;
  color: string;
}

export interface TrendData {
  month: string;
  value: number;
}

export interface DashboardData {
  netWorth: number;
  netWorthChange: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  transactions: Transaction[];
  budgets: Budget[];
  stats: StatCard[];
  spendingMix: SpendingCategory[];
  trendData: TrendData[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  membershipType?: string;
  joinedDate?: string;
  score?: number;
  savings?: number;
  goals?: { completed: number; total: number };
  wealthTier?: string;
  bio?: string;

}

export type Currency = 'MNT' | 'USD' | 'EUR';

/** Mongolian is the primary locale; English is secondary. */
export type Language = 'MN' | 'EN';

export const DEFAULT_LANGUAGE: Language = 'MN';

export type TransactionFilter = 'all' | 'income' | 'expenses';
