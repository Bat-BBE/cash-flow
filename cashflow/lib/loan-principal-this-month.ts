import loanFile from '@/loan.json';
import { buildLoanPaidHistory } from '@/lib/loan-paid-history';
import { buildAmortizationSchedule } from '@/lib/loan-amortization';

type LoanJsonRow = {
  id: string;
  principal: number;
  startDate: string;
  interestRate: number;
  interestRange: 'yearly' | 'monthly';
  termMonths: number;
  monthlyPayment: number;
  paidPayments?: { date: string; amount: number }[];
};

function parseStartDate(s: string): Date {
  const p = s.split(/[-/]/).map((x) => parseInt(x, 10));
  return new Date(p[0], p[1] - 1, p[2]);
}

/**
 * Sum of **principal** (loan body) paid down in the calendar month of `now`,
 * across all loans in `loan.json`. Uses amortization schedule + payment dates from
 * `buildLoanPaidHistory` (recorded `paidPayments` or synthetic monthly schedule).
 */
export function sumPrincipalRepaidThisCalendarMonth(now: Date = new Date()): number {
  const loans = (loanFile as { loans?: LoanJsonRow[] }).loans ?? [];
  const y = now.getFullYear();
  const m = now.getMonth();
  let total = 0;

  for (const loan of loans) {
    const schedule = buildAmortizationSchedule({
      id: loan.id,
      principal: loan.principal,
      interestRate: loan.interestRate,
      interestRange: loan.interestRange,
      termMonths: loan.termMonths,
      monthlyPayment: loan.monthlyPayment,
    });

    const start = parseStartDate(loan.startDate);
    const paymentRows = buildLoanPaidHistory(
      {
        id: loan.id,
        startDate: loan.startDate,
        termMonths: loan.termMonths,
        monthlyPayment: loan.monthlyPayment,
        paidPayments: loan.paidPayments,
      },
      now,
    );

    for (const row of paymentRows) {
      const d = new Date(`${row.dateKey}T12:00:00`);
      if (d.getFullYear() !== y || d.getMonth() !== m) continue;

      const monthDiff =
        (d.getFullYear() - start.getFullYear()) * 12 + (d.getMonth() - start.getMonth());
      const scheduleMonth = monthDiff + 1;
      if (scheduleMonth >= 1 && scheduleMonth <= schedule.length) {
        total += schedule[scheduleMonth - 1].principal;
      }
    }
  }

  return Math.round(total);
}
