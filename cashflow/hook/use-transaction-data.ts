// hooks/use-transaction-data.ts
'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionFilter } from '@/components/transactions/types';

// Mock өгөгдөл генератор
const generateTransactions = (): Transaction[] => [
  {
    id: '1',
    date: '2023-10-24',
    category: 'Food & Drink',
    account: 'Chase Checking',
    description: 'Starbucks Coffee',
    amount: 5.50,
    type: 'expense',
    status: 'completed',
    merchant: 'Starbucks',
  },
  {
    id: '2',
    date: '2023-10-23',
    category: 'Salary',
    account: 'Savings',
    description: 'Company XYZ Payroll',
    amount: 4500.00,
    type: 'income',
    status: 'completed',
    merchant: 'Company XYZ',
  },
  {
    id: '3',
    date: '2023-10-22',
    category: 'Housing',
    account: 'Chase Checking',
    description: 'Monthly Rent Payment',
    amount: 1200.00,
    type: 'expense',
    status: 'completed',
    merchant: 'Property Management',
  },
  {
    id: '4',
    date: '2023-10-21',
    category: 'Shopping',
    account: 'Credit Card',
    description: 'Amazon Marketplace',
    amount: 45.20,
    type: 'expense',
    status: 'completed',
    merchant: 'Amazon',
  },
  {
    id: '5',
    date: '2023-10-20',
    category: 'Transfer',
    account: 'Savings',
    description: 'Internal Transfer',
    amount: 200.00,
    type: 'transfer',
    status: 'completed',
  },
  {
    id: '6',
    date: '2023-10-19',
    category: 'Transportation',
    account: 'Credit Card',
    description: 'Uber Ride',
    amount: 25.50,
    type: 'expense',
    status: 'completed',
    merchant: 'Uber',
  },
  {
    id: '7',
    date: '2023-10-18',
    category: 'Entertainment',
    account: 'Credit Card',
    description: 'Netflix Subscription',
    amount: 15.99,
    type: 'expense',
    status: 'pending',
    merchant: 'Netflix',
  },
  {
    id: '8',
    date: '2023-10-17',
    category: 'Utilities',
    account: 'Chase Checking',
    description: 'Electric Bill',
    amount: 85.75,
    type: 'expense',
    status: 'completed',
    merchant: 'Electric Company',
  },
];

const accounts = [
  'Chase Checking (...4291)',
  'Savings (...8802)',
  'Credit Card (...1103)',
];

const categories = [
  'Food & Drink',
  'Salary',
  'Housing',
  'Shopping',
  'Transfer',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Education',
];

export function useTransactionData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  
  // Filter state
  const [dateRange, setDateRange] = useState('month');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, dateRange, selectedCategories, selectedAccounts, searchQuery]);

  const fetchTransactions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const data = generateTransactions();
    setTransactions(data);
    setFilteredTransactions(data);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category));
    }

    // Account filter
    if (selectedAccounts.length > 0) {
      filtered = filtered.filter(t => selectedAccounts.includes(t.account));
    }

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(t => new Date(t.date) >= today);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(t => new Date(t.date) >= monthAgo);
        break;
    }

    setFilteredTransactions(filtered);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowAddModal(false);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setSelectedTransaction(null);
    setShowDetailsPanel(false);
  };

  const clearFilters = () => {
    setDateRange('month');
    setSelectedCategories([]);
    setSelectedAccounts([]);
    setSearchQuery('');
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return {
    // Data
    transactions: filteredTransactions,
    allTransactions: transactions,
    selectedTransaction,
    setSelectedTransaction,
    loading,
    
    // Modal states
    showAddModal,
    setShowAddModal,
    showDetailsPanel,
    setShowDetailsPanel,
    
    // Filter states
    dateRange,
    setDateRange,
    selectedCategories,
    setSelectedCategories,
    selectedAccounts,
    setSelectedAccounts,
    searchQuery,
    setSearchQuery,
    clearFilters,
    
    // Stats
    totalIncome,
    totalExpenses,
    balance,
    
    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    
    // Constants
    accounts,
    categories,
  };
}