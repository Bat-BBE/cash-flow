/**
 * Шинэ зээл авах боломж — одоогийн зээлийн суурь төлбөр + profile орлогоор
 * loan-suggestions-тай ижил "цалингаас зээл төлөх дээд хэмжээ"-тэй харьцуулна.
 */

import type { InterestRange, LoanForSuggestion, UserProfile } from '@/lib/loan-suggestions';
import { paydownFloorTotal } from '@/lib/loan-suggestions';

export type NewLoanFeasibilityVerdict =
  | 'no_income'
  | 'existing_over_ceiling'
  | 'not_feasible'
  | 'feasible'
  | 'invalid_input';

function monthlyRateDecimal(interestRate: number, interestRange: InterestRange): number {
  if (interestRange === 'monthly') return interestRate / 100;
  return interestRate / 100 / 12;
}

/**
 * `computeStrategy` / LoanSuggestionsPanel-тай ижил: орлогын 40% шаардлага, дараа нь 0.9×0.885.
 */
export function salaryPayableLoanCeiling(monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 0;
  const essentials = monthlyIncome * 0.4;
  const disposableBase = Math.max(0, monthlyIncome - essentials);
  const disposable = disposableBase * 0.9 * 0.885;
  return Math.round(disposable);
}

/**
 * Аннуитетийн сарын төлбөр (тогтмол). Хүү 0 бол үндсэн / сар.
 */
export function computeAnnuityMonthlyPayment(
  principal: number,
  termMonths: number,
  interestRate: number,
  interestRange: InterestRange,
): number {
  const p = Math.max(0, principal);
  const n = Math.max(1, Math.floor(termMonths));
  const r = monthlyRateDecimal(interestRate, interestRange);
  if (p === 0) return 0;
  if (r <= 0) return Math.round(p / n);
  const pow = (1 + r) ** n;
  const pmt = (p * r * pow) / (pow - 1);
  if (!Number.isFinite(pmt) || pmt <= 0) return NaN;
  return Math.round(pmt);
}

export type AmortMonthRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balanceAfter: number;
};

/** Эхний `maxRows` сарын хуваарь (тогтмол сарын төлбөр). */
export function buildNewLoanPaymentSchedule(
  principal: number,
  monthlyPayment: number,
  termMonths: number,
  interestRate: number,
  interestRange: InterestRange,
  maxRows = 12,
): AmortMonthRow[] {
  const r = monthlyRateDecimal(interestRate, interestRange);
  const pmt = monthlyPayment;
  let balance = principal;
  const rows: AmortMonthRow[] = [];
  const cap = Math.min(termMonths, maxRows, 600);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  for (let m = 1; m <= cap && balance > 0.01; m++) {
    const interest = round2(balance * r);
    let princ = round2(pmt - interest);
    if (princ < 0) princ = 0;
    if (princ > balance) princ = round2(balance);
    const payment = round2(princ + interest);
    balance = round2(balance - princ);
    if (balance < 0) balance = 0;
    rows.push({
      month: m,
      payment,
      principal: princ,
      interest,
      balanceAfter: balance,
    });
  }
  return rows;
}

export interface NewLoanFeasibilityInput {
  newPrincipal: number;
  newTermMonths: number;
  newInterestRate: number;
  newInterestRange: InterestRange;
  loans: LoanForSuggestion[];
  userProfile?: UserProfile;
}

export interface NewLoanFeasibilityResult {
  verdict: NewLoanFeasibilityVerdict;
  monthlyIncome: number;
  salaryCeiling: number;
  existingFloorTotal: number;
  newMonthlyPayment: number;
  totalMonthlyAfter: number;
  /** salaryCeiling - totalMonthlyAfter (сарын үлдэгдэл "зай") */
  monthlyMargin: number;
  /** Нийт зээлийн төлбөр / орлого × 100 */
  debtToIncomePercent: number | null;
  hasOverdueOrStress: boolean;
  overdueLoanNames: string[];
  /** Эхний хэдэн сарын хуваарь (боломжтой үед) */
  schedulePreview: AmortMonthRow[];
}

function hasLoanStress(loans: LoanForSuggestion[]): { overdueNames: string[] } {
  const overdueNames: string[] = [];
  for (const l of loans) {
    const od = l.overdues?.reduce((s, o) => s + (o.totalAmount || 0), 0) ?? 0;
    if (od > 0 || l.status === 'overdue') overdueNames.push(l.name);
  }
  return { overdueNames };
}

export function analyzeNewLoanFeasibility(input: NewLoanFeasibilityInput): NewLoanFeasibilityResult {
  const income = input.userProfile?.monthlyIncome ?? 0;
  const existingFloorTotal = input.loans.reduce((s, l) => s + paydownFloorTotal(l), 0);
  const salaryCeiling = salaryPayableLoanCeiling(income);

  const { overdueNames } = hasLoanStress(input.loans);
  const hasOverdueOrStress = overdueNames.length > 0;

  const p = input.newPrincipal;
  const n = input.newTermMonths;
  const rate = input.newInterestRate;

  if (p < 0 || n < 1 || !Number.isFinite(rate)) {
    return {
      verdict: 'invalid_input',
      monthlyIncome: income,
      salaryCeiling,
      existingFloorTotal,
      newMonthlyPayment: 0,
      totalMonthlyAfter: existingFloorTotal,
      monthlyMargin: salaryCeiling - existingFloorTotal,
      debtToIncomePercent: income > 0 ? (existingFloorTotal / income) * 100 : null,
      hasOverdueOrStress,
      overdueLoanNames: overdueNames,
      schedulePreview: [],
    };
  }

  const newPmt = computeAnnuityMonthlyPayment(p, n, rate, input.newInterestRange);
  if (!Number.isFinite(newPmt) || newPmt < 0) {
    return {
      verdict: 'invalid_input',
      monthlyIncome: income,
      salaryCeiling,
      existingFloorTotal,
      newMonthlyPayment: NaN,
      totalMonthlyAfter: existingFloorTotal,
      monthlyMargin: salaryCeiling - existingFloorTotal,
      debtToIncomePercent: income > 0 ? (existingFloorTotal / income) * 100 : null,
      hasOverdueOrStress,
      overdueLoanNames: overdueNames,
      schedulePreview: [],
    };
  }

  const totalAfter = existingFloorTotal + newPmt;
  const margin = salaryCeiling - totalAfter;
  const dti = income > 0 ? (totalAfter / income) * 100 : null;

  let schedulePreview: AmortMonthRow[] = [];
  if (p > 0 && newPmt > 0) {
    schedulePreview = buildNewLoanPaymentSchedule(p, newPmt, n, rate, input.newInterestRange, 12);
  }

  if (income <= 0) {
    return {
      verdict: 'no_income',
      monthlyIncome: 0,
      salaryCeiling: 0,
      existingFloorTotal,
      newMonthlyPayment: newPmt,
      totalMonthlyAfter: totalAfter,
      monthlyMargin: margin,
      debtToIncomePercent: dti,
      hasOverdueOrStress,
      overdueLoanNames: overdueNames,
      schedulePreview,
    };
  }

  if (existingFloorTotal > salaryCeiling) {
    return {
      verdict: 'existing_over_ceiling',
      monthlyIncome: income,
      salaryCeiling,
      existingFloorTotal,
      newMonthlyPayment: newPmt,
      totalMonthlyAfter: totalAfter,
      monthlyMargin: salaryCeiling - totalAfter,
      debtToIncomePercent: dti,
      hasOverdueOrStress,
      overdueLoanNames: overdueNames,
      schedulePreview,
    };
  }

  if (totalAfter > salaryCeiling) {
    return {
      verdict: 'not_feasible',
      monthlyIncome: income,
      salaryCeiling,
      existingFloorTotal,
      newMonthlyPayment: newPmt,
      totalMonthlyAfter: totalAfter,
      monthlyMargin: margin,
      debtToIncomePercent: dti,
      hasOverdueOrStress,
      overdueLoanNames: overdueNames,
      schedulePreview,
    };
  }

  return {
    verdict: 'feasible',
    monthlyIncome: income,
    salaryCeiling,
    existingFloorTotal,
    newMonthlyPayment: newPmt,
    totalMonthlyAfter: totalAfter,
    monthlyMargin: margin,
    debtToIncomePercent: dti,
    hasOverdueOrStress,
    overdueLoanNames: overdueNames,
    schedulePreview,
  };
}
