'use client';

import { useState, useEffect } from 'react';
import {
  NetWorth,
  Stats,
  Transaction,
  Budget,
  SpendingData,
  Insight,
  TrendData
} from '@/components/dashboard/types';

const generateNetWorth = (): NetWorth => {
  const total = 124592000;
  const change = 1240000;
  const changePercentage = 2.4;

  const history = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      date: date.toISOString().split('T')[0],
      value: total - (Math.random() * 20000000 - 10000000)
    };
  });

  return { total, change, changePercentage, history };
};

const generateStats = (): Stats => {
  return {
    income: {
      total: 42500000,
      change: 3200000,
      changePercentage: 8.1
    },
    expenses: {
      total: 28100000,
      change: -1200000,
      changePercentage: -4.2
    },
    savings: {
      total: 14400000,
      rate: 33.9
    },
    investments: {
      total: 70121380,
      return: 5240000,
      returnPercentage: 8.1
    }
  };
};

const generateTransactions = (): Transaction[] => {
  return [
    {
      id: '1',
      name: 'Amazon.com',
      date: '2024-02-12',
      amount: 125000,
      type: 'expense',
      category: 'Дэлгүүр худалдаа',
      account: 'Үндсэн данс',
      avatar: 'AMZ',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Netflix',
      date: '2024-02-11',
      amount: 18500,
      type: 'expense',
      category: 'Зугаа цэнгэл',
      account: 'Кредит карт',
      avatar: 'NFLX',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Цалингийн орлого',
      date: '2024-02-10',
      amount: 5200000,
      type: 'income',
      category: 'Цалин',
      account: 'Үндсэн данс',
      avatar: 'SAL',
      status: 'completed'
    },
    {
      id: '4',
      name: 'Starbucks',
      date: '2024-02-09',
      amount: 24500,
      type: 'expense',
      category: 'Хоол унд',
      account: 'Кредит карт',
      avatar: 'SBUX',
      status: 'pending'
    },
    {
      id: '5',
      name: 'Ногдол ашгийн төлбөр',
      date: '2024-02-08',
      amount: 384000,
      type: 'income',
      category: 'Хөрөнгө оруулалт',
      account: 'Индекс сан',
      avatar: 'DIV',
      status: 'completed'
    }
  ];
};

const generateBudgets = (): Budget[] => {
  return [
    {
      id: '1',
      category: 'Орон сууц',
      spent: 1250000,
      limit: 1500000,
      color: 'bg-blue-500',
      icon: 'home'
    },
    {
      id: '2',
      category: 'Тээвэр',
      spent: 380000,
      limit: 500000,
      color: 'bg-green-500',
      icon: 'directions_car'
    },
    {
      id: '3',
      category: 'Хоол хүнс',
      spent: 820000,
      limit: 900000,
      color: 'bg-yellow-500',
      icon: 'restaurant'
    },
    {
      id: '4',
      category: 'Дэлгүүр',
      spent: 450000,
      limit: 600000,
      color: 'bg-purple-500',
      icon: 'shopping_bag'
    },
    {
      id: '5',
      category: 'Зугаа цэнгэл',
      spent: 180000,
      limit: 300000,
      color: 'bg-pink-500',
      icon: 'movie'
    }
  ];
};

const generateSpendingData = (): SpendingData[] => {
  return [
    { category: 'Орон сууц', amount: 1250000, percentage: 35, color: '#3B82F6' },
    { category: 'Хоол хүнс', amount: 820000, percentage: 23, color: '#10B981' },
    { category: 'Дэлгүүр', amount: 450000, percentage: 13, color: '#8B5CF6' },
    { category: 'Тээвэр', amount: 380000, percentage: 11, color: '#F59E0B' },
    { category: 'Зугаа цэнгэл', amount: 180000, percentage: 5, color: '#EC4899' },
    { category: 'Бусад', amount: 450000, percentage: 13, color: '#6B7280' }
  ];
};

const generateInsights = (): Insight[] => {
  return [
    {
      id: '1',
      type: 'warning',
      title: 'Төсвийн анхааруулга',
      message:
        'Энэ сард «Дэлгүүр» ангиллын төсвийнхөө 85%-ийг ашигласан байна. Сарын үлдсэн хугацаа 15 хоног.',
      action: 'Төсвийг шалгах',
      icon: 'warning'
    },
    {
      id: '2',
      type: 'success',
      title: 'Хадгаламжийн зорилго',
      message:
        'Жилийн эцсийн хадгаламжийн зорилгоо (₮15,000,000) хүрэхэд төлөвлөгөөний дагуу явж байна.',
      action: 'Явцыг харах',
      icon: 'savings'
    },
    {
      id: '3',
      type: 'tip',
      title: 'Хөрөнгө оруулалтын санал',
      message:
        'Сарын хөрөнгө оруулалтаа 10%-аар нэмбэл урт хугацааны өгөөжийг илүү ашигтай авах боломжтой.',
      action: 'Дэлгэрэнгүй',
      icon: 'lightbulb'
    }
  ];
};

const generateTrendData = (): TrendData[] => {
  return [
    { month: 'Jan', income: 4200000, expenses: 2800000, savings: 1400000 },
    { month: 'Feb', income: 4500000, expenses: 2900000, savings: 1600000 },
    { month: 'Mar', income: 4800000, expenses: 3100000, savings: 1700000 },
    { month: 'Apr', income: 5100000, expenses: 3200000, savings: 1900000 },
    { month: 'May', income: 4900000, expenses: 3300000, savings: 1600000 },
    { month: 'Jun', income: 5200000, expenses: 3000000, savings: 2200000 }
  ];
};

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [netWorth, setNetWorth] = useState<NetWorth | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  const fetchData = async () => {
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    setNetWorth(generateNetWorth());
    setStats(generateStats());
    setTransactions(generateTransactions());
    setBudgets(generateBudgets());
    setSpendingData(generateSpendingData());
    setInsights(generateInsights());
    setTrendData(generateTrendData());

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  const getTransactionsByType = (type: 'income' | 'expense') => {
    return transactions.filter(t => t.type === type);
  };

  const getTransactionsByCategory = (category: string) => {
    return transactions.filter(t => t.category === category);
  };

  const getBudgetProgress = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return 0;
    return Math.min(Math.round((budget.spent / budget.limit) * 100), 100);
  };

  const getTotalSpent = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}`
    };
    setTransactions(prev => [newTransaction, ...prev]);

    if (stats) {
      if (transaction.type === 'income') {
        setStats({
          ...stats,
          income: {
            ...stats.income,
            total: stats.income.total + transaction.amount
          }
        });
      } else {
        setStats({
          ...stats,
          expenses: {
            ...stats.expenses,
            total: stats.expenses.total + transaction.amount
          }
        });
      }
    }
  };

  const updateBudgetSpent = (category: string, amount: number) => {
    setBudgets(prev =>
      prev.map(budget =>
        budget.category === category
          ? { ...budget, spent: budget.spent + amount }
          : budget
      )
    );
  };

  return {
    netWorth,
    stats,
    transactions,
    budgets,
    spendingData,
    insights,
    trendData,
    loading,

    totalIncome: getTotalIncome(),
    totalExpenses: getTotalSpent(),

    getTransactionsByType,
    getTransactionsByCategory,
    getBudgetProgress,
    addTransaction,
    updateBudgetSpent,
    refreshData,
    fetchData
  };
}
