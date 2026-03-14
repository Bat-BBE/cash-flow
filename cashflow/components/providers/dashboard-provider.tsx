'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardData, Currency, TransactionFilter, User, Language } from '@/lib/types';
import { mockDashboardData, mockUser } from '@/lib/mock-data';

interface DashboardContextType {
  data: DashboardData;
  user: User;
  username: string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  transactionFilter: TransactionFilter;
  setTransactionFilter: (filter: TransactionFilter) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data] = useState<DashboardData>(mockDashboardData);
  const [user] = useState<User>(mockUser);
  const [currency, setCurrency] = useState<Currency>('MNT');
  const [language, setLanguage] = useState<Language>('MN');
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState('Oct 2023');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        data,
        user,
        username: user.name,
        currency,
        setCurrency,
        language,
        setLanguage,
        transactionFilter,
        setTransactionFilter,
        selectedMonth,
        setSelectedMonth,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}