// components/dashboard/types.ts
export interface NetWorth {
  total: number;
  change: number;
  changePercentage: number;
  history: { date: string; value: number }[];
}

export interface Stats {
  income: {
    total: number;
    change: number;
    changePercentage: number;
  };
  expenses: {
    total: number;
    change: number;
    changePercentage: number;
  };
  savings: {
    total: number;
    rate: number;
  };
  investments: {
    total: number;
    return: number;
    returnPercentage: number;
  };
}

export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  avatar?: string;
  status?: 'completed' | 'pending' | 'failed';
}

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
  icon: string;
}

export interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  message: string;
  action?: string;
  icon: string;
}

export interface TrendData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}