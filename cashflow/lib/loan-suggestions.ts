/**
 * Income-based loan payment suggestions tied to loan.json:
 * - minimal: bank minimum `lowestPayAmount` (if set) else `monthlyPayment`, + overdues — "as long as possible"
 * - normal/aggressive: floor = max(monthlyPayment, lowestPayAmount ?? monthlyPayment) + overdues, then extra by rate
 */

export type InterestRange = 'yearly' | 'monthly';

export interface LoanOverdue {
  rangeId?: number;
  totalAmount: number;
}

export interface LoanForSuggestion {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
  /** Monthly minimum allowed (from loan.json); optional — falls back to monthlyPayment */
  lowestPayAmount?: number;
  interestRate: number;
  interestRange: InterestRange;
  termMonths: number;
  status: string;
  overdues?: LoanOverdue[];
}

export interface UserProfile {
  monthlyIncome: number;
  /** Optional in loan.json — defaults to 0 in suggestions & UI */
  monthlyEssentialExpenses?: number;
}

export interface SuggestionConfig {
  /** Fraction of disposable income (income − essentials) for "normal" plan */
  normalDisposableFraction: number;
  /** Fraction of disposable income for "aggressive" plan */
  aggressiveDisposableFraction: number;
}

export type SuggestionStrategyId = 'minimal' | 'normal' | 'aggressive';

export interface PerLoanSuggestion {
  loanId: string;
  loanName: string;
  /** Банкны зөвшөөрсөн сарын доод төлбөр (lowestPayAmount эсвэл гүйцэтгэх monthlyPayment) */
  bankMinimumMonthly: number;
  /** Гэрээний хуваарийн сарын төлбөр */
  scheduledMonthly: number;
  overdueExtraThisMonth: number;
  suggestedPayment: number;
  /** PMT/амортизаци ашиглан тооцсон нийт төлсөн хүү (доод төлөвлөгөө) */
  totalInterestMinimal?: number | null;
  /** PMT/амортизаци ашиглан тооцсон нийт төлсөн хүү (сонгосон төлөвлөгөө) */
  totalInterestSuggested?: number | null;
  /** Хүүгийн нийт хэмнэлт (minimal - suggested) */
  interestSavings?: number | null;
  /** Approx payoff duration (months) using fixed-payment PMT approximation */
  payoffMonthsMinimal?: number | null;
  payoffMonthsSuggested?: number | null;
  /** Minimal months - suggested months (>=0) */
  payoffMonthsFaster?: number | null;
  /** Effective monthly rate for sorting (higher = pay faster in avalanche) */
  sortWeight: number;
}

export interface StrategyResult {
  strategy: SuggestionStrategyId;
  label: string;
  description: string;
  disposableIncome: number;
  minimumTotalFromJson: number;
  budgetCap: number;
  totalSuggested: number;
  perLoan: PerLoanSuggestion[];
  /** PMT/амортизаци ашиглан минимал төлөвлөгөөтэй харьцуулсан нийт хүүгийн хэмнэлт */
  interestSavingsTotal?: number | null;
  warnings: string[];
}

const DEFAULT_CONFIG: SuggestionConfig = {
  // Normal should be little bit higher; aggressive should use the maximum salary-payable amount.
  normalDisposableFraction: 0.95,
  aggressiveDisposableFraction: 1.0,
};

function monthlyRateFraction(interestRate: number, interestRange: InterestRange): number {
  if (interestRange === 'monthly') {
    return interestRate / 100;
  }
  return interestRate / 100 / 12;
}

/** Approx. monthly interest charge (for weighting avalanche) */
export function estimatedMonthlyInterest(loan: LoanForSuggestion): number {
  const r = monthlyRateFraction(loan.interestRate, loan.interestRange);
  return loan.balance * r;
}

function overdueExtra(loan: LoanForSuggestion): number {
  if (!loan.overdues?.length) return 0;
  return loan.overdues.reduce((s, o) => s + (o.totalAmount || 0), 0);
}

/** Банкны заасан сарын доод төлбөр (JSON-д lowestPayAmount байхгүй бол monthlyPayment) */
export function bankMinimumMonthly(loan: LoanForSuggestion): number {
  return loan.lowestPayAmount ?? loan.monthlyPayment;
}

/** Хэвийн/идэвхтэй төлөвлөгөөний доод суурь: гүйцэтгэх төлбөр болон банкны доод хэмжээнээс ихийг */
export function paydownBaselineMonthly(loan: LoanForSuggestion): number {
  return Math.max(loan.monthlyPayment, bankMinimumMonthly(loan));
}

/** Stretch төлөвлөгөөний доод нийт (доод төлбөр + overdue) */
export function minimalFloorTotal(loan: LoanForSuggestion): number {
  return bankMinimumMonthly(loan) + overdueExtra(loan);
}

/** Төлөвлөгөөний суурь нийт (max(scheduled, lowest) + overdue) */
export function paydownFloorTotal(loan: LoanForSuggestion): number {
  return paydownBaselineMonthly(loan) + overdueExtra(loan);
}

/** @deprecated use paydownFloorTotal — retained for external imports */
export function minimumPaymentFromJson(loan: LoanForSuggestion): number {
  return paydownFloorTotal(loan);
}

function sumMinimalFloors(loans: LoanForSuggestion[]): number {
  return loans.reduce((s, l) => s + minimalFloorTotal(l), 0);
}

function sumPaydownFloors(loans: LoanForSuggestion[]): number {
  return loans.reduce((s, l) => s + paydownFloorTotal(l), 0);
}

/** Distribute extra across loans proportional to monthly interest + small weight (avalanche). */
function distributeExtra(
  loans: LoanForSuggestion[],
  extra: number,
  basePerLoan: Map<string, number>,
): Map<string, number> {
  const out = new Map(basePerLoan);
  if (extra <= 0) return out;

  const weights = loans.map((l) => ({
    id: l.id,
    w:
      estimatedMonthlyInterest(l) +
      paydownBaselineMonthly(l) * 0.01 +
      1,
  }));
  const sumW = weights.reduce((s, x) => s + x.w, 0);
  if (sumW <= 0) return out;

  for (const { id, w } of weights) {
    out.set(id, (out.get(id) || 0) + (extra * w) / sumW);
  }
  return out;
}

export function computeStrategy(
  loans: LoanForSuggestion[],
  user: UserProfile | undefined,
  config: Partial<SuggestionConfig> | undefined,
  strategy: SuggestionStrategyId,
): StrategyResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const warnings: string[] = [];

  const income = user?.monthlyIncome ?? 0;
  // Essentials must be at 40% of income.
  // "Total amount that can be used as a pay-loan" = income * 0.9 * 0.885 * 0.6
  const essentials = income * 0.4;
  const disposableBase = Math.max(0, income - essentials); // = income * 0.6
  const disposable = disposableBase * 0.9 * 0.885; // salary-payable cap
  const minimalTotal = sumMinimalFloors(loans);
  const paydownTotal = sumPaydownFloors(loans);

  // Normal little bit higher, aggressive at max salary-payable cap.
  const effectiveNormalFraction = Math.max(cfg.normalDisposableFraction, 0.95);
  const effectiveAggressiveFraction = 1;

  const paydownBaseMap = new Map<string, number>();
  loans.forEach((l) => {
    paydownBaseMap.set(l.id, paydownFloorTotal(l));
  });

  const perLoanBase: PerLoanSuggestion[] = loans.map((l) => {
    const bankMin = bankMinimumMonthly(l);
    const od = overdueExtra(l);
    return {
      loanId: l.id,
      loanName: l.name,
      bankMinimumMonthly: bankMin,
      scheduledMonthly: l.monthlyPayment,
      overdueExtraThisMonth: od,
      suggestedPayment: paydownFloorTotal(l),
      sortWeight: estimatedMonthlyInterest(l),
    };
  });

  let label = '';
  let description = '';
  let budgetCap = 0;
  let totalSuggested = paydownTotal;
  let jsonBaselineTotal = paydownTotal;

  if (!user || income <= 0) {
    warnings.push('loan.json-д userProfile.monthlyIncome нэмнэ үү — орлогоор санал болгох төлөвлөгөө гарна.');
  }

  switch (strategy) {
    case 'minimal': {
      label = 'Хамгийн бага (урт хугацаа)';
      description =
        'loan.json дахь lowestPayAmount (байхгүй бол monthlyPayment) + overdue. Хамгийн бага сарын дарамт.';
      jsonBaselineTotal = minimalTotal;
      budgetCap = minimalTotal;
      totalSuggested = minimalTotal;
      perLoanBase.forEach((row, idx) => {
        row.suggestedPayment = Math.round(minimalFloorTotal(loans[idx]));
      });
      break;
    }
    case 'normal': {
      label = 'Хэвийн';
      description = `Үлдэгдэл орлогын ~${Math.round(
        effectiveNormalFraction * 100,
      )}%-ийг зээл төлөлтөд. Суурь: max(гэрээний төлбөр, lowestPayAmount) + overdue, илүүг хүүнд өндөр зээлд.`;
      jsonBaselineTotal = paydownTotal;
      budgetCap =
        disposable > 0 ? Math.round(disposable * effectiveNormalFraction) : paydownTotal;
      if (disposable > 0 && budgetCap < paydownTotal) {
        warnings.push(
          `Таны тохируулсан "хэвийн" төлбөрийн дээд хэмжээ (${budgetCap.toLocaleString()}) суурь нийт төлбөрөөс (${paydownTotal.toLocaleString()}) бага байна.`,
        );
      }
      const extra = Math.max(0, budgetCap - paydownTotal);
      const distributed = distributeExtra(loans, extra, paydownBaseMap);
      totalSuggested = 0;
      perLoanBase.forEach((row) => {
        row.suggestedPayment = Math.round(distributed.get(row.loanId) || row.suggestedPayment);
        totalSuggested += row.suggestedPayment;
      });
      break;
    }
    case 'aggressive': {
      label = 'Боломжит төлбөрийн дээд';
      description = `Үлдэгдэл орлогын ~${Math.round(
        effectiveAggressiveFraction * 100,
      )}%-ийг зээлд чиглүүлэх — хамгийн хурдан өр тэглэх чиглэлтэй.`;
      jsonBaselineTotal = paydownTotal;
      budgetCap =
        disposable > 0
          ? Math.round(disposable * effectiveAggressiveFraction)
          : paydownTotal;
      if (disposable > 0 && budgetCap < paydownTotal) {
        warnings.push(
          `Идэвхжүүлсэн төлөвлөгөөний дээд хэмжээ суурь төлбөрөөс бага — орлого / зардал тохируулгаа JSON-д шалгана уу.`,
        );
      }
      const extra = Math.max(0, budgetCap - paydownTotal);
      const distributed = distributeExtra(loans, extra, paydownBaseMap);
      totalSuggested = 0;
      perLoanBase.forEach((row) => {
        row.suggestedPayment = Math.round(distributed.get(row.loanId) || row.suggestedPayment);
        totalSuggested += row.suggestedPayment;
      });
      break;
    }
  }

  if (income > 0 && totalSuggested > income) {
    warnings.push('Санал болгож буй нийт төлбөр сарын орлогоос давсан байна.');
  }

  if (disposable > 0 && totalSuggested > disposable) {
    warnings.push('Санал болгож буй нийт төлбөр (зардал хассан) үлдэгдэл орлогоос давсан байна.');
  }

  // PMT-style amortization approximation:
  // given balance (P), monthly rate (r) and fixed monthly payment (A), payoff months:
  // n = -ln(1 - rP/A) / ln(1+r)
  // total interest = A*n - P
  const loanById = new Map(loans.map((l) => [l.id, l]));

  function monthlyRate(loan: LoanForSuggestion): number {
    return monthlyRateFraction(loan.interestRate, loan.interestRange);
  }

  function interestForPayment(loan: LoanForSuggestion, payment: number): { months: number | null; totalInterest: number | null } {
    const P = loan.balance;
    const r = monthlyRate(loan);
    const A = payment;
    if (!Number.isFinite(P) || !Number.isFinite(A) || A <= 0) return { months: null, totalInterest: null };
    if (r === 0) {
      const months = P / A;
      return { months, totalInterest: 0 };
    }
    // If payment is too small, payoff is not achievable (infinite months).
    if (A <= P * r) return { months: null, totalInterest: null };

    const inside = 1 - (r * P) / A;
    if (inside <= 0) return { months: null, totalInterest: null };

    const months = -Math.log(inside) / Math.log(1 + r);
    if (!Number.isFinite(months) || months <= 0) return { months: null, totalInterest: null };
    const totalInterest = A * months - P;
    return { months, totalInterest: Number.isFinite(totalInterest) ? totalInterest : null };
  }

  let interestSavingsTotal: number | null = null;
  let interestMinimalTotalAcc = 0;
  let interestSuggestedTotalAcc = 0;
  let hasAnyFinite = false;

  perLoanBase.forEach((row) => {
    const loan = loanById.get(row.loanId);
    if (!loan) return;

    const minimalPayment = minimalFloorTotal(loan);
    const minCalc = interestForPayment(loan, minimalPayment);
    const curCalc = interestForPayment(loan, row.suggestedPayment);

    const minInterest = minCalc.totalInterest;
    const curInterest = curCalc.totalInterest;
    const minMonths = minCalc.months;
    const curMonths = curCalc.months;

    row.totalInterestMinimal = minInterest;
    row.totalInterestSuggested = curInterest;

    row.payoffMonthsMinimal = minMonths;
    row.payoffMonthsSuggested = curMonths;
    row.payoffMonthsFaster =
      minMonths != null && curMonths != null ? Math.max(0, minMonths - curMonths) : null;

    if (minInterest == null || curInterest == null) {
      row.interestSavings = null;
      return;
    }

    row.interestSavings = minInterest - curInterest;
    interestMinimalTotalAcc += minInterest;
    interestSuggestedTotalAcc += curInterest;
    hasAnyFinite = true;
  });

  if (hasAnyFinite) {
    interestSavingsTotal = interestMinimalTotalAcc - interestSuggestedTotalAcc;
  }

  return {
    strategy,
    label,
    description,
    disposableIncome: disposable,
    minimumTotalFromJson: jsonBaselineTotal,
    budgetCap,
    totalSuggested,
    perLoan: perLoanBase,
    interestSavingsTotal,
    warnings,
  };
}

export function computeAllStrategies(
  loans: LoanForSuggestion[],
  user: UserProfile | undefined,
  config: Partial<SuggestionConfig> | undefined,
): Record<SuggestionStrategyId, StrategyResult> {
  return {
    minimal: computeStrategy(loans, user, config, 'minimal'),
    normal: computeStrategy(loans, user, config, 'normal'),
    aggressive: computeStrategy(loans, user, config, 'aggressive'),
  };
}
