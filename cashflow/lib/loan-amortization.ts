import loanFile from '@/loan.json';

export type LoanAmortizationInput = {
  id: string;
  principal: number;
  interestRate: number;
  interestRange: 'yearly' | 'monthly';
  termMonths: number;
  monthlyPayment: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balanceAfter: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function getMonthlyRate(
  loan: Pick<LoanAmortizationInput, 'interestRate' | 'interestRange'>,
): number {
  if (loan.interestRange === 'yearly') {
    return loan.interestRate / 100 / 12;
  }
  return loan.interestRate / 100;
}

/**
 * Fixed-PMT schedule: early months = more interest (rate); later = more principal (loan body).
 */
export function buildAmortizationSchedule(loan: LoanAmortizationInput): AmortizationRow[] {
  const r = getMonthlyRate(loan);
  const pmt = loan.monthlyPayment;
  let balance = loan.principal;
  const rows: AmortizationRow[] = [];
  const maxMonths = Math.min(loan.termMonths, 600);

  for (let m = 1; m <= maxMonths && balance > 0.01; m++) {
    const interest = round2(balance * r);
    let principal = round2(pmt - interest);
    if (principal < 0) principal = 0;
    if (principal > balance) principal = round2(balance);

    const payment = round2(principal + interest);
    balance = round2(balance - principal);
    if (balance < 0) balance = 0;

    rows.push({
      month: m,
      payment,
      principal,
      interest,
      balanceAfter: balance,
    });
  }

  return rows;
}

export function getLoanForAmortization(id: string): LoanAmortizationInput | null {
  const loans = (loanFile as { loans?: LoanAmortizationInput[] }).loans ?? [];
  const raw = loans.find((l) => l.id === id);
  return raw ?? null;
}
