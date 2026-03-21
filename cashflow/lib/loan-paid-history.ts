import loanFile from '@/loan.json';

export type LoanPaidHistoryRow = {
  /** YYYY-MM-DD */
  dateKey: string;
  /** Display label */
  dateLabel: string;
  amount: number;
};

type PaidPaymentJson = { date: string; amount: number };

type LoanJson = {
  id: string;
  startDate: string;
  termMonths: number;
  monthlyPayment: number;
  paidPayments?: PaidPaymentJson[];
};

function parseStartDate(s: string): Date {
  const p = s.split(/[-/]/).map((x) => parseInt(x, 10));
  const y = p[0];
  const m = p[1];
  const d = p[2];
  return new Date(y, m - 1, d);
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * If `paidPayments` exists in loan.json, use it (recorded payments only).
 * Otherwise derive one payment per month from `startDate` through today, up to `termMonths`
 * (no unpaid / remaining balance shown — only past due dates that have occurred).
 */
export function buildLoanPaidHistory(loan: LoanJson, now: Date = new Date()): LoanPaidHistoryRow[] {
  if (loan.paidPayments?.length) {
    return loan.paidPayments
      .map((p) => {
        const d = parseStartDate(p.date);
        return {
          dateKey: toDateKey(d),
          dateLabel: formatDateLabel(d),
          amount: p.amount,
        };
      })
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }

  const start = parseStartDate(loan.startDate);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const rows: LoanPaidHistoryRow[] = [];

  for (let k = 0; k < loan.termMonths; k++) {
    const due = new Date(start);
    due.setMonth(due.getMonth() + k);
    if (due > endOfToday) break;
    rows.push({
      dateKey: toDateKey(due),
      dateLabel: formatDateLabel(due),
      amount: loan.monthlyPayment,
    });
  }

  return rows.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function getLoanJsonById(id: string): LoanJson | null {
  const loans = (loanFile as { loans?: LoanJson[] }).loans ?? [];
  return loans.find((l) => l.id === id) ?? null;
}
