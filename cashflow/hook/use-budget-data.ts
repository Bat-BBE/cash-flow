// hooks/use-budget-data.ts
'use client';

import { useState, useEffect } from 'react';
import { Budget, BudgetSummary, TransferData } from '@/components/budgets/types';

// Mock өгөгдөл генератор
const generateBudgets = (): Budget[] => [
  {
    id: '1',
    category: 'Housing',
    icon: 'home',
    spent: 1200,
    limit: 1200,
    status: 'healthy',
    paidDate: 'Oct 1',
    remaining: 0,
    color: '#7060F0'
  },
  {
    id: '2',
    category: 'Groceries',
    icon: 'shopping_cart',
    spent: 450,
    limit: 600,
    status: 'warning',
    remaining: 150,
    color: '#7060F0'
  },
  {
    id: '3',
    category: 'Leisure',
    icon: 'movie',
    spent: 120,
    limit: 300,
    status: 'safe',
    remaining: 180,
    color: '#7060F0'
  },
  {
    id: '4',
    category: 'Transport',
    icon: 'directions_car',
    spent: 275,
    limit: 250,
    status: 'alert',
    remaining: -25,
    color: '#E04B5A'
  },
  {
    id: '5',
    category: 'Utilities',
    icon: 'bolt',
    spent: 210,
    limit: 350,
    status: 'healthy',
    paidDate: 'Oct 12',
    remaining: 140,
    color: '#7060F0'
  },
  {
    id: '6',
    category: 'Shopping',
    icon: 'shopping_bag',
    spent: 380,
    limit: 500,
    status: 'warning',
    remaining: 120,
    color: '#7060F0'
  },
  {
    id: '7',
    category: 'Healthcare',
    icon: 'local_hospital',
    spent: 150,
    limit: 400,
    status: 'safe',
    remaining: 250,
    color: '#7060F0'
  },
  {
    id: '8',
    category: 'Dining',
    icon: 'restaurant',
    spent: 320,
    limit: 400,
    status: 'warning',
    remaining: 80,
    color: '#7060F0'
  }
];

const calculateSummary = (budgets: Budget[]): BudgetSummary => {
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
  const percentageUsed = (totalSpent / totalBudgeted) * 100;

  return {
    totalBudgeted,
    totalSpent,
    totalRemaining,
    percentageUsed,
    categories: budgets.length
  };
};

export function useBudgetData() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('October 2023');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const generatedBudgets = generateBudgets();
    setBudgets(generatedBudgets);
    setSummary(calculateSummary(generatedBudgets));
    setLoading(false);
  };

  // Шүүлтүүр
  const filteredBudgets = budgets.filter(budget => {
    // Search filter
    if (searchQuery && !budget.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && budget.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Мөнгө шилжүүлэх
  const transferMoney = (data: TransferData) => {
    setBudgets(prev => prev.map(budget => {
      if (budget.id === data.fromBudgetId) {
        const newSpent = Math.max(0, budget.spent - data.amount);
        return {
          ...budget,
          spent: newSpent,
          remaining: budget.limit - newSpent,
          status: updateStatus(newSpent, budget.limit)
        };
      }
      if (budget.id === data.toBudgetId) {
        const newSpent = budget.spent + data.amount;
        return {
          ...budget,
          spent: newSpent,
          remaining: budget.limit - newSpent,
          status: updateStatus(newSpent, budget.limit)
        };
      }
      return budget;
    }));

    // Summary шинэчлэх
    setSummary(prev => {
      if (!prev) return null;
      return calculateSummary(budgets);
    });
  };

  // Төсвийн статус шинэчлэх
  const updateStatus = (spent: number, limit: number): Budget['status'] => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'alert';
    if (percentage >= 85) return 'warning';
    if (percentage >= 50) return 'healthy';
    return 'safe';
  };

  // Шинэ категори нэмэх
  const addBudget = (budget: Omit<Budget, 'id' | 'remaining' | 'status'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `budget-${Date.now()}`,
      remaining: budget.limit - budget.spent,
      status: updateStatus(budget.spent, budget.limit)
    };
    
    setBudgets(prev => [...prev, newBudget]);
    setSummary(calculateSummary([...budgets, newBudget]));
  };

  // Төсөв устгах
  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    setSummary(calculateSummary(budgets.filter(b => b.id !== id)));
  };

  // Төсөв шинэчлэх
  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => {
      if (budget.id === id) {
        const updated = { ...budget, ...updates };
        return {
          ...updated,
          remaining: updated.limit - updated.spent,
          status: updateStatus(updated.spent, updated.limit)
        };
      }
      return budget;
    }));
    
    setSummary(calculateSummary(budgets));
  };

  // Refresh функц
  const refreshBudgets = async () => {
    await fetchBudgets();
  };

  return {
    budgets: filteredBudgets,
    allBudgets: budgets,
    summary,
    loading,
    selectedPeriod,
    setSelectedPeriod,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    transferMoney,
    addBudget,
    deleteBudget,
    updateBudget,
    refreshBudgets
  };
}