'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ScheduledBill,
  ScheduledIncome,
  ScheduledLoanPayment,
  CalendarDay,
  LiquidityProjection,
  MonthlySummary,
  type LoanMonthSchedule,
  type UpcomingLoanPaymentRow,
} from '@/components/scheduled/types';
import loanFile from '@/loan.json';
import {
  getScheduledLoanPaymentsForDay,
  type LoanForSchedule,
} from '@/lib/loan-schedule';
import {
  loadScheduledFromStorage,
  saveScheduledToStorage,
  buildStoragePayload,
  rawBillToScheduled,
  rawIncomeToScheduled,
  type RawProjection,
} from '@/lib/scheduled-local-storage';
import {
  transactionsToScheduledBillsAndIncomes,
  isDashboardScheduledId,
  type DashboardRawTx,
} from '@/lib/dashboard-tx-to-scheduled';
import { normalizeCalendarDateKey } from '@/lib/utils';
import { ref, get } from 'firebase/database';
import { db, BASE_PATH } from '@/lib/firebase';

const LOANS: LoanForSchedule[] = (loanFile as { loans: LoanForSchedule[] }).loans ?? [];

/** Хуанлийн одоогийн сараас эхлэн хэдэн сарын зээлийн төлөлтийг жагсаалтаар харуулах */
const LOAN_SCHEDULE_MONTHS_AHEAD = 6;

function buildLoanMonthSchedule(
  year: number,
  month: number,
  loans: LoanForSchedule[],
): LoanMonthSchedule {
  const last = new Date(year, month + 1, 0).getDate();
  const days: { day: number; payments: ScheduledLoanPayment[] }[] = [];
  for (let d = 1; d <= last; d++) {
    const payments = getScheduledLoanPaymentsForDay(loans, year, month, d);
    if (payments.length) days.push({ day: d, payments });
  }
  return { year, month, days };
}

/* ─── Calendar builder ───────────────────────────────────────────── */
function buildCalendarDays(
  year: number,
  month: number,
  bills: ScheduledBill[],
  incomes: ScheduledIncome[],
  loans: LoanForSchedule[] = LOANS,
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  const prevOffset = firstDay.getDay();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  for (let i = prevOffset - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const py = date.getFullYear();
    const pm = date.getMonth();
    const pd = date.getDate();
    days.push({
      date,
      day: pd,
      month: pm,
      year: py,
      isCurrentMonth: false,
      isToday: false,
      bills: [],
      income: [],
      loanPayments: getScheduledLoanPaymentsForDay(loans, py, pm, pd),
    });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      date,
      day: i,
      month,
      year,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      bills: bills.filter(
        (b) => normalizeCalendarDateKey(b.date) === dateStr,
      ),
      income: incomes.filter(
        (inc) => normalizeCalendarDateKey(inc.date) === dateStr,
      ),
      loanPayments: getScheduledLoanPaymentsForDay(loans, year, month, i),
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    const py = date.getFullYear();
    const pm = date.getMonth();
    const pd = date.getDate();
    days.push({
      date,
      day: pd,
      month: pm,
      year: py,
      isCurrentMonth: false,
      isToday: false,
      bills: [],
      income: [],
      loanPayments: getScheduledLoanPaymentsForDay(loans, py, pm, pd),
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
): MonthlySummary {
  const totalOutgoing = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const totalIncoming = incomes.reduce((s, i) => s + i.amount, 0);
  const endingBalance = startingBalance - totalOutgoing + totalIncoming;
  return {
    startingBalance,
    endingBalance: Math.round(endingBalance),
    totalOutgoing,
    totalIncoming,
    netChange: Math.round(endingBalance - startingBalance),
  };
}

function periodFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function projectionsFromRaw(raw: Record<string, RawProjection>): LiquidityProjection[] {
  return Object.values(raw ?? {}).map((p) => ({
    date: p.date,
    projectedBalance: p.projectedBalance,
    currentBalance: p.currentBalance,
    dayOfMonth: p.dayOfMonth,
  }));
}

/* ─── Hook ───────────────────────────────────────────────────────── */
export function useScheduledData() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [bills, setBills] = useState<ScheduledBill[]>([]);
  const [incomes, setIncomes] = useState<ScheduledIncome[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [projections, setProjections] = useState<LiquidityProjection[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  /** Same Firebase path as dashboard (`DashboardDataProvider`): account transactions */
  const [dashboardTxs, setDashboardTxs] = useState<DashboardRawTx[]>([]);
  /** Avoid writing empty state to localStorage before the first load finishes (Strict Mode / race). */
  const initialHydrationDone = useRef(false);

  const { bills: dashBills, incomes: dashIncomes } = useMemo(
    () => transactionsToScheduledBillsAndIncomes(dashboardTxs),
    [dashboardTxs],
  );

  const mergedBills = useMemo(() => [...dashBills, ...bills], [dashBills, bills]);
  const mergedIncomes = useMemo(() => [...dashIncomes, ...incomes], [dashIncomes, incomes]);

  /** Same source as dashboard home: `users/.../transactions` */
  const fetchDashboardTransactions = useCallback(async () => {
    try {
      const snap = await get(ref(db, `${BASE_PATH}/transactions`));
      if (!snap.exists()) {
        setDashboardTxs([]);
        return;
      }
      const txs = Object.values(snap.val() as Record<string, DashboardRawTx>).filter(
        (t) => t.date && t.date !== 'Нийт дүн:',
      );
      setDashboardTxs(txs);
    } catch (e) {
      console.error('[useScheduledData] Firebase transactions (dashboard)', e);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardTransactions();
  }, [fetchDashboardTransactions]);

  const fetchData = useCallback(() => {
    setLoading(true);
    try {
      const raw = loadScheduledFromStorage();
      const now = new Date();
      const defaultPeriod = periodFromDate(now);

      if (!raw) {
        setBills([]);
        setIncomes([]);
        setProjections([]);
        setSummary(null);
        return;
      }

      const period = raw.summary?.period ?? defaultPeriod;

      const billList: ScheduledBill[] = Object.values(raw.bills ?? {}).map((b) =>
        rawBillToScheduled(b, period),
      );
      const incomeList: ScheduledIncome[] = Object.values(raw.incomes ?? {}).map((i) =>
        rawIncomeToScheduled(i, period),
      );
      const projList = projectionsFromRaw(raw.projections ?? {});

      let sum: MonthlySummary | null = null;
      if (raw.summary) {
        sum = {
          startingBalance: raw.summary.startingBalance,
          endingBalance: raw.summary.endingBalance,
          totalOutgoing: raw.summary.totalOutgoing,
          totalIncoming: raw.summary.totalIncoming,
          netChange: raw.summary.netChange,
        };
      } else {
        sum = recalcSummary(billList, incomeList, 0);
      }

      setBills(billList);
      setIncomes(incomeList);
      setProjections(projList);
      setSummary(sum);
    } catch (err) {
      console.error('[useScheduledData]', err);
    } finally {
      initialHydrationDone.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCalendarDays(
      buildCalendarDays(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        mergedBills,
        mergedIncomes,
        LOANS,
      ),
    );
  }, [currentDate, mergedBills, mergedIncomes]);

  /* Persist to localStorage whenever scheduled data changes (after initial load). */
  useEffect(() => {
    if (loading || !initialHydrationDone.current) return;
    const period = periodFromDate(currentDate);
    const overdueCount = bills.filter((b) => b.status === 'overdue').length;
    const payload = buildStoragePayload(bills, incomes, projections, summary, overdueCount, period);
    saveScheduledToStorage(payload);
  }, [bills, incomes, projections, summary, currentDate, loading]);

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

  const goToToday = useCallback(() => {
    const t = new Date();
    setCurrentDate(new Date(t.getFullYear(), t.getMonth(), 1));
  }, []);

  const addBill = useCallback((bill: Omit<ScheduledBill, 'id'>) => {
    const newBill: ScheduledBill = {
      ...bill,
      id: `bill_${Date.now()}`,
      date: normalizeCalendarDateKey(bill.date) || bill.date,
    };
    setBills((prev) => {
      const updated = [...prev, newBill];
      setSummary((s) => recalcSummary(updated, incomes, s?.startingBalance ?? 0));
      return updated;
    });
  }, [incomes]);

  const addIncome = useCallback((income: Omit<ScheduledIncome, 'id'>) => {
    const newIncome: ScheduledIncome = {
      ...income,
      id: `inc_${Date.now()}`,
      date: normalizeCalendarDateKey(income.date) || income.date,
    };
    setIncomes((prev) => {
      const updated = [...prev, newIncome];
      setSummary((s) => recalcSummary(bills, updated, s?.startingBalance ?? 0));
      return updated;
    });
  }, [bills]);

  const updateBillStatus = useCallback((id: string, status: ScheduledBill['status']) => {
    if (isDashboardScheduledId(id)) return;
    setBills((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, status } : b));
      setSummary((s) => recalcSummary(updated, incomes, s?.startingBalance ?? 0));
      return updated;
    });
  }, [incomes]);

  const deleteBill = useCallback((id: string) => {
    if (isDashboardScheduledId(id)) return;
    setBills((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      setSummary((s) => recalcSummary(updated, incomes, s?.startingBalance ?? 0));
      return updated;
    });
  }, [incomes]);

  const loanCurrency = (loanFile as { currency?: string }).currency ?? 'MNT';

  const loanPaymentMonthsAhead = useMemo(() => {
    const blocks: LoanMonthSchedule[] = [];
    const startY = currentDate.getFullYear();
    const startM = currentDate.getMonth();
    for (let i = 0; i < LOAN_SCHEDULE_MONTHS_AHEAD; i++) {
      const cursor = new Date(startY, startM + i, 1);
      blocks.push(buildLoanMonthSchedule(cursor.getFullYear(), cursor.getMonth(), LOANS));
    }
    return blocks;
  }, [currentDate]);

  const upcomingLoanPayments = useMemo(() => {
    const rows: UpcomingLoanPaymentRow[] = [];
    for (const block of loanPaymentMonthsAhead) {
      for (const { day, payments } of block.days) {
        for (const p of payments) {
          const dueDate = `${block.year}-${String(block.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          rows.push({
            ...p,
            dueDate,
            listKey: `${p.id}-${dueDate}`,
          });
        }
      }
    }
    rows.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return rows;
  }, [loanPaymentMonthsAhead]);

  const refreshAll = useCallback(() => {
    fetchData();
    void fetchDashboardTransactions();
  }, [fetchData, fetchDashboardTransactions]);

  return {
    bills: mergedBills,
    incomes: mergedIncomes,
    calendarDays,
    projections,
    summary,
    loading,
    currentDate,
    viewMode,
    selectedDate,
    showMonthPicker,
    overdueCount: bills.filter((b) => b.status === 'overdue').length,
    setViewMode,
    setSelectedDate,
    setShowMonthPicker,
    changeMonth,
    goToToday,
    addBill,
    addIncome,
    updateBillStatus,
    deleteBill,
    refreshData: refreshAll,
    loanCurrency,
    upcomingLoanPayments,
  };
}
