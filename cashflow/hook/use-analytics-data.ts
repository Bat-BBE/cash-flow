'use client';

import { useState, useEffect } from 'react';
import { Transaction, Insight, PeriodOption } from '@/components/analytics/type';

const PERIODS = {
  '1M': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  '3M': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  '6M': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  'YTD': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
};

const generateChartData = (months: string[]): Transaction[] => {
  return months.map((month, index) => {
    const income = Math.floor(Math.random() * 15000) + 5000;
    const expense = Math.floor(Math.random() * 8000) + 2000;
    return {
      id: `month-${index}`,
      month,
      income,
      expense,
      savings: income - expense,
    };
  });
};

const generateInsights = (data: Transaction[]): Insight[] => {
  const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0);
  const savingRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
  
  return [
    {
      id: '1',
      type: 'strategy',
      title: 'Strategy',
      time: 'Now',
      message: `Current saving rate is ${savingRate}%. Maintaining this for 12 months will increase your investment liquidity by $${((totalIncome - totalExpense) * 12 / 1000).toFixed(1)}K.`,
      action: 'Adjust Projections'
    },
    {
      id: '2',
      type: 'volatility',
      title: 'Volatility Alert',
      time: '2h ago',
      message: 'Market fluctuations in your crypto holdings detected. Diversification recommended.',
      metric: {
        label: 'Unrealized P/L',
        value: `+$${(Math.random() * 5000 + 1000).toFixed(2)}`,
        trend: 'up'
      }
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Investment Opportunity',
      time: '1d ago',
      message: 'High-yield savings accounts are currently offering 4.5% APY. Consider moving your emergency fund.',
      action: 'Learn More'
    }
  ];
};

export function useAnalyticsData(period: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const timer = setTimeout(() => {
      const months = PERIODS[period as keyof typeof PERIODS] || PERIODS['6M'];
      const newData = generateChartData(months);
      const newInsights = generateInsights(newData);
      
      setData(newData);
      setInsights(newInsights);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [period]);

  const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0);
  const totalSavings = data.reduce((acc, curr) => acc + curr.savings, 0);
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome * 100) : 0;
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense, Math.abs(d.savings)]));
  const portfolioVelocity = ((totalSavings / (totalExpense || 1) * 0.5) + 0.8);
  
  const incomeChange = data.length >= 2 
    ? ((data[data.length - 1].income / data[0].income - 1) * 100) 
    : 0;
  const expenseChange = data.length >= 2 
    ? ((data[data.length - 1].expense / data[0].expense - 1) * 100) 
    : 0;

  return {
    data,
    insights,
    loading,
    totals: {
      totalIncome,
      totalExpense,
      totalSavings,
      savingsRate,
      maxValue,
      portfolioVelocity,
      incomeChange,
      expenseChange,
      monthsCount: data.length
    }
  };
}