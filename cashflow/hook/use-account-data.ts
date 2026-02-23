// hooks/use-account-data.ts
'use client';

import { useState, useEffect } from 'react';
import { Account, Transaction, AccountStats, AccountGroup } from '@/components/accounts/types';

// Mock data generator
const generateAccounts = (): Account[] => [
  {
    id: '1',
    name: 'Physical Wallet',
    type: 'CASH',
    balance: 1240000,
    currency: 'MNT',
    icon: 'payments',
    institution: 'Personal'
  },
  {
    id: '2',
    name: 'High Yield Savings',
    type: 'BANK',
    balance: 42500500,
    currency: 'MNT',
    icon: 'account_balance',
    active: true,
    accountNumber: '8829',
    institution: 'State Bank'
  },
  {
    id: '3',
    name: 'Main Checking',
    type: 'BANK',
    balance: 8320120,
    currency: 'MNT',
    icon: 'account_balance',
    accountNumber: '4532',
    institution: 'TDB Bank'
  },
  {
    id: '4',
    name: 'Premium Credit',
    type: 'CARDS',
    balance: -2410000,
    currency: 'MNT',
    icon: 'credit_card',
    accountNumber: '7890',
    institution: 'Visa'
  },
  {
    id: '5',
    name: 'Index Fund',
    type: 'SAVINGS',
    balance: 70121380,
    currency: 'MNT',
    icon: 'savings',
    institution: 'Ard Fund'
  },
  {
    id: '6',
    name: 'Crypto Wallet',
    type: 'INVESTMENT',
    balance: 12500000,
    currency: 'MNT',
    icon: 'currency_bitcoin',
    institution: 'Coinbase'
  },
  {
    id: '7',
    name: 'Business Account',
    type: 'BANK',
    balance: 15600000,
    currency: 'MNT',
    icon: 'business_center',
    accountNumber: '1234',
    institution: 'Khan Bank'
  }
];

const generateTransactions = (accountId?: string): Transaction[] => {
  const baseTransactions = [
    {
      id: '1',
      name: 'Interest Payment',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 152400,
      type: 'income' as const,
      icon: 'trending_up',
      category: 'INVESTMENT',
      description: 'Monthly interest accrued'
    },
    {
      id: '2',
      name: 'Transfer from Checking',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 1000000,
      type: 'income' as const,
      icon: 'sync_alt',
      category: 'TRANSFER',
      description: 'Automatic savings transfer'
    },
    {
      id: '3',
      name: 'Wealth Settlement',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 2500000,
      type: 'expense' as const,
      icon: 'account_balance_wallet',
      category: 'SAVINGS',
      description: 'Quarterly investment'
    },
    {
      id: '4',
      name: 'Groceries',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 245000,
      type: 'expense' as const,
      icon: 'shopping_cart',
      category: 'SHOPPING',
      description: 'Weekly groceries'
    },
    {
      id: '5',
      name: 'Salary Deposit',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 5200000,
      type: 'income' as const,
      icon: 'payments',
      category: 'INCOME',
      description: 'Monthly salary'
    },
    {
      id: '6',
      name: 'Netflix Subscription',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 18500,
      type: 'expense' as const,
      icon: 'subscriptions',
      category: 'ENTERTAINMENT',
      description: 'Monthly subscription'
    }
  ];

  if (accountId) {
    return baseTransactions.map(t => ({ ...t, accountId })).slice(0, 4);
  }

  return baseTransactions;
};

const calculateStats = (accounts: Account[]): AccountStats => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const positiveAccounts = accounts.filter(acc => acc.balance > 0);
  const monthlyAverage = totalBalance / 12;
  const interestAccrued = accounts
    .filter(acc => acc.type === 'SAVINGS' || acc.type === 'BANK')
    .reduce((sum, acc) => sum + (acc.balance * 0.015 / 12), 0);

  return {
    totalBalance,
    totalChange: 1240000,
    changePercentage: 2.4,
    monthlyAverage,
    interestAccrued,
    activeAccounts: accounts.filter(acc => acc.active).length
  };
};

export function useAccountData(initialAccountId?: string) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AccountStats | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      const generatedAccounts = generateAccounts();
      const generatedTransactions = generateTransactions();
      const calculatedStats = calculateStats(generatedAccounts);
      
      setAccounts(generatedAccounts);
      setTransactions(generatedTransactions);
      setStats(calculatedStats);
      
      // Set default selected account
      const defaultAccount = generatedAccounts.find(acc => acc.id === initialAccountId) 
        || generatedAccounts.find(acc => acc.active) 
        || generatedAccounts[1];
      
      setSelectedAccount(defaultAccount);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [initialAccountId]);

  const selectAccount = (account: Account) => {
    setSelectedAccount(account);
    // Filter transactions for selected account
    const accountTransactions = generateTransactions(account.id);
    setTransactions(accountTransactions);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update account balance
    if (selectedAccount) {
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === selectedAccount.id) {
          return {
            ...acc,
            balance: transaction.type === 'income' 
              ? acc.balance + transaction.amount 
              : acc.balance - transaction.amount
          };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      
      const updatedSelected = updatedAccounts.find(acc => acc.id === selectedAccount.id);
      if (updatedSelected) {
        setSelectedAccount(updatedSelected);
      }
      
      // Recalculate stats
      setStats(calculateStats(updatedAccounts));
    }
  };

  const transferMoney = (fromAccountId: string, toAccountId: string, amount: number) => {
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === fromAccountId) {
        return { ...acc, balance: acc.balance - amount };
      }
      if (acc.id === toAccountId) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });
    
    setAccounts(updatedAccounts);
    
    // Update selected account if it was involved in transfer
    if (selectedAccount) {
      const updatedSelected = updatedAccounts.find(acc => acc.id === selectedAccount.id);
      if (updatedSelected) {
        setSelectedAccount(updatedSelected);
      }
    }
    
    // Add transfer transaction
    const transferTx: Transaction = {
      id: `tx-${Date.now()}`,
      name: 'Transfer',
      date: new Date().toISOString().split('T')[0],
      amount,
      type: 'transfer',
      icon: 'sync_alt',
      category: 'TRANSFER',
      description: `Transfer to account ...${toAccountId.slice(-4)}`,
      accountId: fromAccountId
    };
    
    setTransactions(prev => [transferTx, ...prev]);
    setStats(calculateStats(updatedAccounts));
  };

  const accountGroups = (): AccountGroup[] => {
    const groups: AccountGroup[] = [
      { title: 'cash', type: 'CASH', icon: 'payments', accounts: [] },
      { title: 'bank', type: 'BANK', icon: 'account_balance', accounts: [] },
      { title: 'cards', type: 'CARDS', icon: 'credit_card', accounts: [] },
      { title: 'savingsInvestments', type: 'SAVINGS', icon: 'savings', accounts: [] },
      { title: 'investments', type: 'INVESTMENT', icon: 'trending_up', accounts: [] },
    ];

    accounts.forEach(account => {
      const group = groups.find(g => g.type === account.type);
      if (group) {
        group.accounts.push(account);
      }
    });

    return groups.filter(g => g.accounts.length > 0);
  };

  return {
    accounts,
    transactions,
    selectedAccount,
    stats,
    loading,
    selectAccount,
    addTransaction,
    transferMoney,
    accountGroups: accountGroups(),
  };
}