// components/budgets/types.ts
export interface Budget {
  id: string;
  category: string;
  icon: string;
  spent: number;
  limit: number;
  status: 'healthy' | 'warning' | 'alert' | 'safe';
  paidDate?: string;
  remaining: number;
  color?: string;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  percentageUsed: number;
  categories: number;
}

export interface TransferData {
  fromBudgetId: string;
  toBudgetId: string;
  amount: number;
}

export type BudgetStatus = 'healthy' | 'warning' | 'alert' | 'safe';

export const BUDGET_STATUS_CONFIG = {
  healthy: {
    label: 'Healthy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    progressColor: 'bg-emerald-500'
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    progressColor: 'bg-yellow-500'
  },
  alert: {
    label: 'Alert',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    progressColor: 'bg-red-500'
  },
  safe: {
    label: 'Safe',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    progressColor: 'bg-blue-500'
  }
} as const;