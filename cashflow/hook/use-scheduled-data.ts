'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, get, set, update, remove } from 'firebase/database';
import { db, BASE_PATH } from '@/lib/firebase';
import {
  ScheduledBill,
  ScheduledIncome,
  CalendarDay,
  LiquidityProjection,
  MonthlySummary,
} from '@/components/scheduled/types';

/* ─── Raw Firebase types ─────────────────────────────────────────── */
type RawBill = {
  id: string; name: string; amount: number; date: string;
  dayOfMonth: number; category: string; status: ScheduledBill['status'];
  icon: string; color: string; recurring: boolean; recurrenceDay: number;
};

type RawIncome = {
  id: string; name: string; amount: number; date: string;
  dayOfMonth: number; category: string; status: ScheduledIncome['status'];
  icon: string; color: string; recurring: boolean; recurrenceDay: number;
};

type RawProjection = {
  date: string; dayOfMonth: number;
  projectedBalance: number; currentBalance: number;
  scheduledBill: number; scheduledIncome: number;
};

type RawSummary = {
  startingBalance: number; endingBalance: number;
  totalOutgoing: number; totalIncoming: number;
  netChange: number; overdueCount: number; period: string;
};

/* ─── Calendar builder ───────────────────────────────────────────── */
function buildCalendarDays(
  year: number,
  month: number,
  bills: ScheduledBill[],
  incomes: ScheduledIncome[],
  selectedDate?: Date | null,
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDay   = new Date(year, month, 1);
  const lastDay    = new Date(year, month + 1, 0);
  const today      = new Date();
  const prevOffset = firstDay.getDay();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // Өмнөх сарын сүүлийн өдрүүд
  for (let i = prevOffset - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: false,
      isToday: false,
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      bills: [],
      income: [],
    });
  }

  // Энэ сарын өдрүүд
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date    = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      date,
      day:            i,
      month,
      year,
      isCurrentMonth: true,
      isToday:        date.toDateString() === today.toDateString(),
      isSelected:     selectedDate ? isSameDay(date, selectedDate) : false,
      bills:          bills.filter((b) => b.date === dateStr),
      income:         incomes.filter((inc) => inc.date === dateStr),
    });
  }

  // Дараагийн сарын эхний өдрүүд
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: false,
      isToday: false,
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      bills: [],
      income: [],
    });
  }

  return days;
}

/* ─── Date helpers ──────────────────────────────────────────────── */
const formatYMD = (year: number, monthIndex: number, day: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const extractDayOfMonth = (ymd: string) => {
  const parts = ymd.split('-');
  const day = Number(parts[2]);
  return Number.isFinite(day) ? day : 1;
};

/* ─── Recalculate summary ────────────────────────────────────────── */
function recalcSummary(
  bills: ScheduledBill[],
  incomes: ScheduledIncome[],
  startingBalance: number,
  _period: string,
): MonthlySummary {
  const totalOutgoing = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const totalIncoming = incomes.reduce((s, i) => s + i.amount, 0);
  const endingBalance = startingBalance - totalOutgoing + totalIncoming;
  return {
    startingBalance,
    endingBalance:  Math.round(endingBalance),
    totalOutgoing,
    totalIncoming,
    netChange:      Math.round(endingBalance - startingBalance),
  };
}

/* ─── Hook ───────────────────────────────────────────────────────── */
export function useScheduledData() {
  const [currentDate,      setCurrentDate]      = useState(new Date());
  const [bills,            setBills]            = useState<ScheduledBill[]>([]);
  const [incomes,          setIncomes]          = useState<ScheduledIncome[]>([]);
  const [calendarDays,     setCalendarDays]     = useState<CalendarDay[]>([]);
  const [projections,      setProjections]      = useState<LiquidityProjection[]>([]);
  const [summary,          setSummary]          = useState<MonthlySummary | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [viewMode,         setViewMode]         = useState<'calendar' | 'list'>('calendar');
  const [selectedDate,     setSelectedDate]     = useState<CalendarDay | null>(null);
  const [showMonthPicker,  setShowMonthPicker]  = useState(false);

  /* ── Fetch from Firebase ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await get(ref(db, `${BASE_PATH}/scheduled`));
      if (!snap.exists()) { setLoading(false); return; }

      const raw = snap.val() as {
        bills:       Record<string, RawBill>;
        incomes:     Record<string, RawIncome>;
        projections: Record<string, RawProjection>;
        summary:     RawSummary;
      };

      // Одоогийн сарын огноог тохируулна
      const period = raw.summary?.period ?? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const [py, pm] = period.split('-').map(Number);

      // Bills — period-т тохирох огноогоор шинэчлэнэ
      const billList: ScheduledBill[] = Object.values(raw.bills ?? {}).map((b) => ({
        id:       b.id,
        name:     b.name,
        amount:   b.amount,
        date:     `${py}-${String(pm).padStart(2, '0')}-${String(b.recurrenceDay).padStart(2, '0')}`,
        category: b.category,
        status:   b.status,
        icon:     b.icon,
        color:    b.color,
      }));

      // Incomes
      const incomeList: ScheduledIncome[] = Object.values(raw.incomes ?? {}).map((i) => ({
        id:       i.id,
        name:     i.name,
        amount:   i.amount,
        date:     `${py}-${String(pm).padStart(2, '0')}-${String(i.recurrenceDay).padStart(2, '0')}`,
        category: i.category,
        status:   i.status,
        icon:     i.icon,
        color:    i.color,
      }));

      // Projections
      const projList: LiquidityProjection[] = Object.values(raw.projections ?? {}).map((p) => ({
        date:             p.date,
        projectedBalance: p.projectedBalance,
        currentBalance:   p.currentBalance,
        dayOfMonth:       p.dayOfMonth,
      }));

      // Summary
      const sum: MonthlySummary = {
        startingBalance: raw.summary.startingBalance,
        endingBalance:   raw.summary.endingBalance,
        totalOutgoing:   raw.summary.totalOutgoing,
        totalIncoming:   raw.summary.totalIncoming,
        netChange:       raw.summary.netChange,
      };

      const calDays = buildCalendarDays(py, pm - 1, billList, incomeList, null);

      setBills(billList);
      setIncomes(incomeList);
      setProjections(projList);
      setSummary(sum);
      setCalendarDays(calDays);
      setCurrentDate(new Date(py, pm - 1, 1));
    } catch (err) {
      console.error('[useScheduledData]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Сар солигдоход recurring өдөр (day-of-month)-ийг тухайн сар руу зөөнө.
  // (Firebase-с хадгалагдаж буй нь recurrenceDay тул одоогийн сарын year/month-тай date-г нь тааруулж өгнө.)
  useEffect(() => {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();

    if (bills.length > 0) {
      setBills((prev) =>
        prev.map((b) => {
          const day = extractDayOfMonth(b.date);
          const nextDate = formatYMD(year, monthIndex, day);
          return nextDate === b.date ? b : { ...b, date: nextDate };
        }),
      );
    }

    if (incomes.length > 0) {
      setIncomes((prev) =>
        prev.map((i) => {
          const day = extractDayOfMonth(i.date);
          const nextDate = formatYMD(year, monthIndex, day);
          return nextDate === i.date ? i : { ...i, date: nextDate };
        }),
      );
    }
  }, [currentDate]);

  // Calendar өдөр/сонголтыг дахин тооцно
  useEffect(() => {
    setCalendarDays(
      buildCalendarDays(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        bills,
        incomes,
        selectedDate?.date ?? null,
      ),
    );
  }, [currentDate, bills, incomes, selectedDate]);

  /* ── Сар солих ── */
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return d;
    });
    setSelectedDate(null);
  };

  const jumpToMonth = (monthIndex: number, year: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  /* ── Bill нэмэх ── */
  const addBill = async (bill: Omit<ScheduledBill, 'id'>) => {
    const newBill: ScheduledBill = { ...bill, id: `bill_${Date.now()}` };
    const day = parseInt(bill.date.split('-')[2]);
    await set(ref(db, `${BASE_PATH}/scheduled/bills/${newBill.id}`), {
      ...newBill, recurring: true, recurrenceDay: day,
    });
    const updated = [...bills, newBill];
    setBills(updated);
    setSummary(recalcSummary(updated, incomes, summary?.startingBalance ?? 0, ''));
  };

  /* ── Income нэмэх ── */
  const addIncome = async (income: Omit<ScheduledIncome, 'id'>) => {
    const newIncome: ScheduledIncome = { ...income, id: `inc_${Date.now()}` };
    const day = parseInt(income.date.split('-')[2]);
    await set(ref(db, `${BASE_PATH}/scheduled/incomes/${newIncome.id}`), {
      ...newIncome, recurring: true, recurrenceDay: day,
    });
    const updated = [...incomes, newIncome];
    setIncomes(updated);
    setSummary(recalcSummary(bills, updated, summary?.startingBalance ?? 0, ''));
  };

  /* ── Bill status шинэчлэх ── */
  const updateBillStatus = async (id: string, status: ScheduledBill['status']) => {
    await update(ref(db, `${BASE_PATH}/scheduled/bills/${id}`), { status });
    setBills((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
  };

  /* ── Bill устгах ── */
  const deleteBill = async (id: string) => {
    await remove(ref(db, `${BASE_PATH}/scheduled/bills/${id}`));
    const updated = bills.filter((b) => b.id !== id);
    setBills(updated);
    setSummary(recalcSummary(updated, incomes, summary?.startingBalance ?? 0, ''));
  };

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
    overdueCount:   bills.filter((b) => b.status === 'overdue').length,
    weekDays:       ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    setViewMode,
    setSelectedDate,
    setShowMonthPicker,
    changeMonth,
    jumpToMonth,
    goToToday,
    addBill,
    addIncome,
    updateBillStatus,
    deleteBill,
    refreshData: fetchData,
  };
}