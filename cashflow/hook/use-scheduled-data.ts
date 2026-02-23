// hooks/use-scheduled-data.ts
'use client';

import { useState, useEffect } from 'react';
import { 
  ScheduledBill, 
  ScheduledIncome, 
  CalendarDay, 
  LiquidityProjection,
  MonthlySummary 
} from '@/components/scheduled/types';

// Mock өгөгдөл генератор
const generateBills = (): ScheduledBill[] => [
  {
    id: '1',
    name: 'Fiber Internet',
    amount: 89.99,
    date: '2023-10-05',
    category: 'Internet',
    status: 'overdue',
    icon: 'wifi',
    color: '#EF4444'
  },
  {
    id: '2',
    name: 'Electric Utility',
    amount: 142.50,
    date: '2023-10-12',
    category: 'Utilities',
    status: 'scheduled',
    icon: 'electric_bolt',
    color: '#3B82F6'
  },
  {
    id: '3',
    name: 'Rent',
    amount: 1200.00,
    date: '2023-10-01',
    category: 'Housing',
    status: 'paid',
    icon: 'home',
    color: '#10B981'
  },
  {
    id: '4',
    name: 'Netflix',
    amount: 15.99,
    date: '2023-10-15',
    category: 'Entertainment',
    status: 'scheduled',
    icon: 'movie',
    color: '#3B82F6'
  },
  {
    id: '5',
    name: 'Phone Bill',
    amount: 65.00,
    date: '2023-10-20',
    category: 'Utilities',
    status: 'scheduled',
    icon: 'phone_iphone',
    color: '#3B82F6'
  }
];

const generateIncomes = (): ScheduledIncome[] => [
  {
    id: '1',
    name: 'Monthly Salary',
    amount: 4250.00,
    date: '2023-10-05',
    category: 'Salary',
    status: 'confirmed',
    icon: 'work',
    color: '#2dd4bf' // ✅ color нэмсэн
  },
  {
    id: '2',
    name: 'Side Hustle Revenue',
    amount: 320.00,
    date: '2023-10-16',
    category: 'Freelance',
    status: 'estimated',
    icon: 'storefront',
    color: '#60A5FA' // ✅ color нэмсэн
  },
  {
    id: '3',
    name: 'Dividend Payment',
    amount: 85.50,
    date: '2023-10-25',
    category: 'Investment',
    status: 'estimated',
    icon: 'trending_up',
    color: '#60A5FA' // ✅ color нэмсэн
  }
];

// Календарь өгөгдөл үүсгэх
const generateCalendarDays = (year: number, month: number, bills: ScheduledBill[], incomes: ScheduledIncome[]): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Өмнөх сарын өдрүүд
  const prevMonthDays = firstDay.getDay();
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: false,
      isToday: false,
      bills: [],
      income: []
    });
  }

  // Одоогийн сарын өдрүүд
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const dateStr = date.toISOString().split('T')[0];
    
    days.push({
      date,
      day: i,
      month,
      year,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      bills: bills.filter(b => b.date === dateStr),
      income: incomes.filter(inc => inc.date === dateStr)
    });
  }

  // Дараагийн сарын өдрүүд
  const totalDays = days.length;
  const nextMonthDays = 42 - totalDays;
  for (let i = 1; i <= nextMonthDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: false,
      isToday: false,
      bills: [],
      income: []
    });
  }

  return days;
};

// Liquidity projection үүсгэх
const generateLiquidityProjections = (days: number = 30): LiquidityProjection[] => {
  const projections: LiquidityProjection[] = [];
  let balance = 12450;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    if (date.getDate() === 5) balance += 4250;
    if (date.getDate() === 5) balance -= 89.99;
    if (date.getDate() === 12) balance -= 142.50;
    if (date.getDate() === 15) balance -= 15.99;
    if (date.getDate() === 16) balance += 320;
    if (date.getDate() === 20) balance -= 65;
    if (date.getDate() === 25) balance += 85.50;
    
    balance += (Math.random() - 0.5) * 200;
    
    projections.push({
      date: date.toISOString().split('T')[0],
      projectedBalance: Math.max(balance, 0),
      currentBalance: balance * 0.95,
      dayOfMonth: date.getDate()
    });
  }
  
  return projections;
};

const calculateSummary = (bills: ScheduledBill[], incomes: ScheduledIncome[], startingBalance: number): MonthlySummary => {
  const totalOutgoing = bills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  
  const totalIncoming = incomes
    .reduce((sum, i) => sum + i.amount, 0);
  
  const endingBalance = startingBalance - totalOutgoing + totalIncoming;
  
  return {
    startingBalance,
    endingBalance,
    totalOutgoing,
    totalIncoming,
    netChange: endingBalance - startingBalance
  };
};

export function useScheduledData() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bills, setBills] = useState<ScheduledBill[]>([]);
  const [incomes, setIncomes] = useState<ScheduledIncome[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [projections, setProjections] = useState<LiquidityProjection[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const generatedBills = generateBills();
    const generatedIncomes = generateIncomes();
    const generatedProjections = generateLiquidityProjections(30);
    const generatedDays = generateCalendarDays(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      generatedBills,
      generatedIncomes
    );

    setBills(generatedBills);
    setIncomes(generatedIncomes);
    setCalendarDays(generatedDays);
    setProjections(generatedProjections);
    setSummary(calculateSummary(generatedBills, generatedIncomes, 12450));
    setLoading(false);
  };

  const overdueCount = bills.filter(b => b.status === 'overdue').length;

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const addBill = (bill: Omit<ScheduledBill, 'id'>) => {
    const newBill: ScheduledBill = {
      ...bill,
      id: `bill-${Date.now()}`
    };
    setBills(prev => [...prev, newBill]);
    
    const updatedDays = generateCalendarDays(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      [...bills, newBill],
      incomes
    );
    setCalendarDays(updatedDays);
    
    if (summary) {
      setSummary(calculateSummary([...bills, newBill], incomes, summary.startingBalance));
    }
  };

  const addIncome = (income: Omit<ScheduledIncome, 'id'>) => {
    const newIncome: ScheduledIncome = {
      ...income,
      id: `income-${Date.now()}`
    };
    setIncomes(prev => [...prev, newIncome]);
    
    const updatedDays = generateCalendarDays(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      bills,
      [...incomes, newIncome]
    );
    setCalendarDays(updatedDays);
    
    if (summary) {
      setSummary(calculateSummary(bills, [...incomes, newIncome], summary.startingBalance));
    }
  };

  const updateBillStatus = (id: string, status: ScheduledBill['status']) => {
    setBills(prev => 
      prev.map(bill => 
        bill.id === id ? { ...bill, status } : bill
      )
    );
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
    
    const updatedDays = generateCalendarDays(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      bills.filter(b => b.id !== id),
      incomes
    );
    setCalendarDays(updatedDays);
    
    if (summary) {
      setSummary(calculateSummary(bills.filter(b => b.id !== id), incomes, summary.startingBalance));
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return {
    bills,
    incomes,
    calendarDays,
    projections,
    summary,
    loading,
    currentDate,
    viewMode,
    selectedDate,
    showMonthPicker,
    overdueCount,
    weekDays,
    setViewMode,
    setSelectedDate,
    setShowMonthPicker,
    changeMonth,
    addBill,
    addIncome,
    updateBillStatus,
    deleteBill,
    refreshData: fetchData
  };
}