// lib/mock-data.ts

import { DashboardData, User } from './types';

export const mockUser: User = {
  id: '1',
  name: 'Tserenchimed',
  username: 'tserenchim17',
  email: 'tserenchimed@example.com',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa_NkUFRqXrA0LDQpNYPirATqy8sASNNeUgcMjsCLguANo487bhy2XHGYfjf1KtglTlgHkk6KTyDFRzP0iQELNjUoel_KDNoLkMHMbHlsU0BplmQMGXyGczxXkqVpooRexNzHx-LbHCfWgvMS3IlNX_h7J39AohTbAfaM--pa95aFvwNMykNSYMCwgRXXkGC1R8rXGEsWkcq6jVfIOB4Ci42D8iWyl5mNMImoekfXx8jyUsb0r6VUFrsujeLBLUziJFXSeeZENsgg',
  membershipType: 'PREMIUM',
  joinedDate: 'October 2022',
  score: 782,
  savings: 14200,
  goals: { completed: 4, total: 6 },
  wealthTier: 'Tier 2',
  bio: 'Strategic investor focused on long-term growth and portfolio diversification. Building generational wealth through automation.',
};

export const mockDashboardData: DashboardData = {
  netWorth: 248500,
  netWorthChange: '+2.4%',
  monthlyIncome: 12400,
  monthlyExpenses: 8200,
  savingsRate: 34.0,
  stats: [
    {
      id: '1',
      title: 'Monthly Income',
      value: '$12,400.00',
      change: '+5.2%',
      changeType: 'positive',
      icon: 'trending_up',
      iconColor: 'text-brand-primary',
      badge: 'PROFITABLE',
      badgeColor: 'emerald'
    },
    {
      id: '2',
      title: 'Monthly Expenses',
      value: '$8,200.00',
      change: '-2.1%',
      changeType: 'negative',
      icon: 'shopping_cart',
      iconColor: 'text-orange-500',
      badge: 'EXPENSES',
      badgeColor: 'orange'
    },
    {
      id: '3',
      title: 'Savings Rate',
      value: '34.0%',
      change: '+1.5%',
      changeType: 'positive',
      icon: 'track_changes',
      iconColor: 'text-sky-500',
      badge: 'SAVING',
      badgeColor: 'sky'
    }
  ],
  transactions: [
    {
      id: '1',
      name: 'Whole Foods Market',
      category: 'GROCERIES',
      categoryColor: 'brand-primary',
      date: '2023-10-24',
      amount: -142.30,
      type: 'expense',
      icon: 'shopping_basket',
      description: 'Debit Card • 4291'
    },
    {
      id: '2',
      name: 'Tech Corp Salary',
      category: 'INCOME',
      categoryColor: 'emerald',
      date: '2023-10-22',
      amount: 4200.00,
      type: 'income',
      icon: 'payments',
      description: 'Direct Deposit'
    },
    {
      id: '3',
      name: 'Netflix Subscription',
      category: 'ENTERTAINMENT',
      categoryColor: 'sky',
      date: '2023-10-21',
      amount: -18.99,
      type: 'expense',
      icon: 'movie',
      description: 'Monthly Bill'
    },
    {
      id: '4',
      name: 'Utility Bill Payment',
      category: 'UTILITIES',
      categoryColor: 'orange',
      date: '2023-10-19',
      amount: -85.00,
      type: 'expense',
      icon: 'bolt',
      description: 'Automatic Pay'
    }
  ],
  budgets: [
    {
      id: '1',
      name: 'Housing Budget',
      spent: 2400,
      limit: 2500,
      percentage: 96,
      color: 'orange'
    },
    {
      id: '2',
      name: 'Food & Dining',
      spent: 650,
      limit: 1200,
      percentage: 54,
      color: 'emerald'
    }
  ],
  spendingMix: [
    { name: 'Housing', percentage: 45, color: '#7060F0' },
    { name: 'Entertainment', percentage: 25, color: '#0ea5e9' },
    { name: 'Others', percentage: 30, color: '#3f4a6d' }
  ],
  trendData: [
    { month: 'May', value: 40 },
    { month: 'Jun', value: 55 },
    { month: 'Jul', value: 45 },
    { month: 'Aug', value: 70 },
    { month: 'Sep', value: 85 },
    { month: 'Oct', value: 100 }
  ]
};
