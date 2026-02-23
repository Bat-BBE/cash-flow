export interface Transaction {
  id: string;
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface Insight {
  id: string;
  type: 'strategy' | 'volatility' | 'opportunity';
  title: string;
  time: string;
  message: string;
  action?: string;
  metric?: {
    label: string;
    value: string;
    trend?: 'up' | 'down';
  };
}

export interface ChartData {
  months: string[];
  data: Transaction[];
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: number;
  maxValue: number;
}

export interface PeriodOption {
  value: string;
  label: string;
  months: string[];
}