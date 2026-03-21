import type { ScheduledLoanPayment } from '@/components/scheduled/types';
import { parseDateInputUTC } from '@/lib/utils';

export type LoanForSchedule = {
  id: string;
  name: string;
  lender: string;
  monthlyPayment: number;
  startDate: string;
  status: string;
  icon: string;
  color?: string;
};

/**
 * Day-of-month when a monthly loan payment is due for the given calendar month.
 * `null` if the loan has not started yet or is paid off.
 */
export function getLoanDueDayInMonth(
  loan: LoanForSchedule,
  year: number,
  month: number,
): number | null {
  if (loan.status === 'paid') return null;
  const start = parseDateInputUTC(loan.startDate);
  const startY = start.getUTCFullYear();
  const startM = start.getUTCMonth();
  const startD = start.getUTCDate();
  const viewMonthIndex = year * 12 + month;
  const startMonthIndex = startY * 12 + startM;
  if (viewMonthIndex < startMonthIndex) return null;

  const lastDay = new Date(year, month + 1, 0).getDate();

  if (viewMonthIndex === startMonthIndex) {
    return Math.min(startD, lastDay);
  }
  return Math.min(startD, lastDay);
}

function toScheduledLoanPayment(loan: LoanForSchedule): ScheduledLoanPayment {
  return {
    id: loan.id,
    name: loan.name,
    lender: loan.lender,
    amount: loan.monthlyPayment,
    icon: loan.icon,
    color: loan.color,
    status:
      loan.status === 'overdue' ? 'overdue' : loan.status === 'paid' ? 'paid' : 'active',
  };
}

/** Loan payments due on this calendar day (month 0–11). */
export function getScheduledLoanPaymentsForDay(
  loans: LoanForSchedule[],
  year: number,
  month: number,
  dayOfMonth: number,
): ScheduledLoanPayment[] {
  const out: ScheduledLoanPayment[] = [];
  for (const loan of loans) {
    const due = getLoanDueDayInMonth(loan, year, month);
    if (due === null || due !== dayOfMonth) continue;
    out.push(toScheduledLoanPayment(loan));
  }
  return out;
}
