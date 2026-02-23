export interface Transaction {
  id: string;
  date: string;
  category: string;
  account: string;
  description: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  status?: 'completed' | 'pending' | 'failed';
  receipt?: string;
  merchant?: string;
  location?: string;
}

export interface TransactionFilter {
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  categories: string[];
  accounts: string[];
  types: ('expense' | 'income' | 'transfer')[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drink': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Salary': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Housing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Shopping': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Transfer': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Transportation': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Entertainment': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Healthcare': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Utilities': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Education': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};