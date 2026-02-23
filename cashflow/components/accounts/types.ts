// components/accounts/types.ts
export interface Account {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CARDS' | 'SAVINGS' | 'INVESTMENT';
  balance: number;
  currency?: string;
  icon: string;
  accountNumber?: string;
  institution?: string;
  active?: boolean;
}

export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  icon: string;
  category: string;
  description?: string;
  accountId?: string;
}

export interface AccountGroup {
  title: string;
  type: Account['type'];
  icon: string;
  accounts: Account[];
}

export interface AccountStats {
  totalBalance: number;
  totalChange: number;
  changePercentage: number;
  monthlyAverage: number;
  interestAccrued: number;
  activeAccounts: number;
}