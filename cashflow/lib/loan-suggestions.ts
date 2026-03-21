/**
 * Income-based loan payment suggestions tied to loan.json:
 * - minimal ("Бүх зээлийг ижил үзэх"): same multiplier on each loan's paydown floor (equal % vs baseline)
 * - normal: floor + extra all to shortest termMonths first (least time left)
 * - aggressive: floor + extra all to highest effective monthly rate first
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
  /** PMT/амортизаци ашиглан минимал төлөвлөгөөтэй харьцуулсан нийт хүүгийн хэмнэлт (бүх зээлийн нийлбэр) */
  interestSavingsTotal?: number | null;
  /** Хүү хэмнэлт тооцоонд орсон зээлийн тоо */
  interestSavingsLoanCount?: number;
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

function sumPaydownFloors(loans: LoanForSuggestion[]): number {
  return loans.reduce((s, l) => s + paydownFloorTotal(l), 0);
}

/**
 * Scale each loan's paydown floor by the same factor so total matches budgetCap
 * (equal % increase/decrease vs the shared baseline). Mutates perLoanBase rows.
 */
function applyUniformScaleToFloors(
  perLoanBase: PerLoanSuggestion[],
  budgetCap: number,
  paydownTotal: number,
): number {
  const scale = paydownTotal > 0 ? budgetCap / paydownTotal : 0;
  const scaled = perLoanBase.map((row) => ({
    loanId: row.loanId,
    floor: Math.floor(row.suggestedPayment * scale),
    remainder: row.suggestedPayment * scale - Math.floor(row.suggestedPayment * scale),
  }));
  const sumFloors = scaled.reduce((s, x) => s + x.floor, 0);
  let diff = Math.round(budgetCap) - sumFloors;

  perLoanBase.forEach((row) => {
    const item = scaled.find((s) => s.loanId === row.loanId);
    if (!item) return;
    row.suggestedPayment = item.floor;
  });

  if (diff > 0) {
    const order = [...scaled].sort((a, b) => b.remainder - a.remainder);
    let i = 0;
    while (diff > 0 && i < order.length) {
      const it = order[i];
      const row = perLoanBase.find((r) => r.loanId === it.loanId);
      if (row) {
        row.suggestedPayment += 1;
        diff -= 1;
      }
      i += 1;
      if (i >= order.length) i = 0;
    }
  }

  return perLoanBase.reduce((s, r) => s + r.suggestedPayment, 0);
}

/** Effective monthly rate for ordering (yearly vs monthly interestRange comparable). */
function effectiveMonthlyRate(l: LoanForSuggestion): number {
  return monthlyRateFraction(l.interestRate, l.interestRange);
}

/** Distribute extra: normal = avalanche to shortest-term loan; aggressive = avalanche to highest-rate loan. */
function distributeExtra(
  loans: LoanForSuggestion[],
  extra: number,
  basePerLoan: Map<string, number>,
  strategy: SuggestionStrategyId,
): Map<string, number> {
  const out = new Map(basePerLoan);
  if (extra <= 0) return out;

  // Aggressive (хүүгээр чухалчлах): бүх илүү төлбөрийг хамгийн өндөр хүүтэй зээл рүү (нэг сарын snapshot).
  // `loans` must already be sorted by rate desc (see orderedLoans for aggressive).
  if (strategy === 'aggressive') {
    const top = loans[0];
    if (top) {
      out.set(top.id, (out.get(top.id) || 0) + extra);
    }
    return out;
  }

  // Normal (хугацаанд суурилсан): бүх илүүг хамгийн богино хугацаа үлдсэн зээл рүү.
  // `loans` must already be sorted by termMonths asc (see orderedLoans for normal).
  if (strategy === 'normal') {
    const top = loans[0];
    if (top) {
      out.set(top.id, (out.get(top.id) || 0) + extra);
    }
    return out;
  }

  return out;
}

export function computeStrategy(
  loans: LoanForSuggestion[],
  user: UserProfile | undefined,
  config: Partial<SuggestionConfig> | undefined,
  strategy: SuggestionStrategyId,
  budgetCapOverrideTotal?: number,
): StrategyResult {
  const loanById = new Map(loans.map((l) => [l.id, l]));

  // Ordering for UI + priority distribution.
  const orderedLoans = [...loans].sort((a, b) => {
    if (strategy === 'normal') {
      // Least time left first (proxy: termMonths asc), then higher rate, then larger balance.
      const td = a.termMonths - b.termMonths;
      if (td !== 0) return td;
      const ra = effectiveMonthlyRate(a);
      const rb = effectiveMonthlyRate(b);
      if (rb !== ra) return rb - ra;
      return b.balance - a.balance;
    }
    if (strategy === 'aggressive') {
      // Highest effective interest rate first (yearly/monthly normalized), then larger balance.
      const ra = effectiveMonthlyRate(a);
      const rb = effectiveMonthlyRate(b);
      if (rb !== ra) return rb - ra;
      return b.balance - a.balance;
    }
    // Minimal (equal %): stable order — бүх зээл ижил тэгшитгэл.
    return a.id.localeCompare(b.id);
  });

  const cfg = { ...DEFAULT_CONFIG, ...config };
  const warnings: string[] = [];

  const income = user?.monthlyIncome ?? 0;
  // Essentials must be at 40% of income.
  // "Total amount that can be used as a pay-loan" = income * 0.9 * 0.885 * 0.6
  const essentials = income * 0.4;
  const disposableBase = Math.max(0, income - essentials); // = income * 0.6
  const disposable = disposableBase * 0.9 * 0.885; // salary-payable cap (same as UI max loan payment)
  /** Hard ceiling: suggested plan must not exceed this when income is known */
  const salaryPayCeiling = disposable > 0 ? Math.round(disposable) : null;
  const paydownTotal = sumPaydownFloors(loans);

  const clampToSalaryPayBudget = (budget: number): number => {
    if (salaryPayCeiling == null) return budget;
    return Math.min(budget, salaryPayCeiling);
  };

  // Normal little bit higher, aggressive at max salary-payable cap.
  const effectiveNormalFraction = Math.max(cfg.normalDisposableFraction, 0.95);
  const effectiveAggressiveFraction = 1;

  const paydownBaseMap = new Map<string, number>();
  orderedLoans.forEach((l) => {
    paydownBaseMap.set(l.id, paydownFloorTotal(l));
  });

  const perLoanBase: PerLoanSuggestion[] = orderedLoans.map((l) => {
    const bankMin = bankMinimumMonthly(l);
    const od = overdueExtra(l);
    return {
      loanId: l.id,
      loanName: l.name,
      bankMinimumMonthly: bankMin,
      scheduledMonthly: l.monthlyPayment,
      overdueExtraThisMonth: od,
      suggestedPayment: paydownFloorTotal(l),
      sortWeight:
        strategy === 'aggressive'
          ? effectiveMonthlyRate(l)
          : strategy === 'normal'
            ? l.termMonths
            : strategy === 'minimal'
              ? 1
              : estimatedMonthlyInterest(l),
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
      label = 'Бүх зээлийг ижил үзэх';
      description =
        budgetCapOverrideTotal != null
          ? 'Сонгосон төлбөрийн горимын дээд дүнгээр: бүх зээлийн суурь төлбөрт ижил хувиар өсгөнө (тэгш %-ийн multiplier).'
          : 'Бүх зээлийг ижил гэж үзнэ: суурь төлбөр бүрт ижил хувиар нэмэгдүүлж, нийт нь төлөвлөгөөний дээд хэмжээнд хүрнэ.';
      jsonBaselineTotal = paydownTotal;
      budgetCap =
        budgetCapOverrideTotal != null
          ? Math.round(budgetCapOverrideTotal)
          : disposable > 0
            ? Math.round(disposable * effectiveNormalFraction)
            : paydownTotal;
      budgetCap = clampToSalaryPayBudget(budgetCap);
      if (disposable > 0 && budgetCap < paydownTotal) {
        warnings.push(
          `Төлөвлөгөөний дээд хэмжээ (${budgetCap.toLocaleString()}) суурь нийт төлбөрөөс (${paydownTotal.toLocaleString()}) бага байна.`,
        );
      }
      totalSuggested = applyUniformScaleToFloors(perLoanBase, budgetCap, paydownTotal);
      break;
    }
    case 'normal': {
      label = 'Хугацаанд суурилсан';
      description =
        budgetCapOverrideTotal != null
          ? 'Сонгосон төлбөрийн горимын дээд дүнгээр: суурь төлбөрүүдээс илүүг хамгийн богино хугацаа үлдсэн зээл рүү чиглүүлнэ.'
          : `Үлдэгдэл орлогын ~${Math.round(
              effectiveNormalFraction * 100,
            )}%-ийг зээл төлөлтөд. Суурь: max(гэрээний төлбөр, lowestPayAmount) + overdue, илүүг хамгийн богино хугацаа үлдсэн зээл рүү.`;
      jsonBaselineTotal = paydownTotal;
      budgetCap =
        budgetCapOverrideTotal != null
          ? Math.round(budgetCapOverrideTotal)
          : disposable > 0
            ? Math.round(disposable * effectiveNormalFraction)
            : paydownTotal;
      budgetCap = clampToSalaryPayBudget(budgetCap);
      if (disposable > 0 && budgetCap < paydownTotal) {
        warnings.push(
          `Таны тохируулсан "хэвийн" төлбөрийн дээд хэмжээ (${budgetCap.toLocaleString()}) суурь нийт төлбөрөөс (${paydownTotal.toLocaleString()}) бага байна.`,
        );
      }
      if (budgetCap <= paydownTotal) {
        totalSuggested = applyUniformScaleToFloors(perLoanBase, budgetCap, paydownTotal);
      } else {
        const extra = Math.max(0, budgetCap - paydownTotal);
        const distributed = distributeExtra(
          orderedLoans,
          extra,
          paydownBaseMap,
          strategy,
        );
        totalSuggested = 0;
        perLoanBase.forEach((row) => {
          row.suggestedPayment = Math.round(distributed.get(row.loanId) || row.suggestedPayment);
          totalSuggested += row.suggestedPayment;
        });
      }
      break;
    }
    case 'aggressive': {
      label = 'Хүүгээр чухалчлах';
      description =
        budgetCapOverrideTotal != null
          ? 'Сонгосон төлбөрийн горим (одоогийн / +2% / +4%)-ийн дээд дүнгээр: суурь төлбөрүүдээс илүүг хамгийн өндөр хүүтэй зээл рүү чиглүүлнэ.'
          : `Үлдэгдэл орлогын ~${Math.round(
              effectiveAggressiveFraction * 100,
            )}%-ийг зээлд — илүүг хамгийн өндөр хүүтэй зээл рүү.`;
      jsonBaselineTotal = paydownTotal;
      budgetCap =
        budgetCapOverrideTotal != null
          ? Math.round(budgetCapOverrideTotal)
          : disposable > 0
            ? Math.round(disposable * effectiveAggressiveFraction)
            : paydownTotal;
      budgetCap = clampToSalaryPayBudget(budgetCap);
      if (disposable > 0 && budgetCap < paydownTotal) {
        warnings.push(
          `Идэвхжүүлсэн төлөвлөгөөний дээд хэмжээ суурь төлбөрөөс бага — орлого / зардал тохируулгаа JSON-д шалгана уу.`,
        );
      }
      if (budgetCap <= paydownTotal) {
        totalSuggested = applyUniformScaleToFloors(perLoanBase, budgetCap, paydownTotal);
      } else {
        const extra = Math.max(0, budgetCap - paydownTotal);
        const distributed = distributeExtra(
          orderedLoans,
          extra,
          paydownBaseMap,
          strategy,
        );
        totalSuggested = 0;
        perLoanBase.forEach((row) => {
          row.suggestedPayment = Math.round(distributed.get(row.loanId) || row.suggestedPayment);
          totalSuggested += row.suggestedPayment;
        });
      }
      break;
    }
  }

  if (income > 0 && totalSuggested > income) {
    warnings.push('Санал болгож буй нийт төлбөр сарын орлогоос давсан байна.');
  }

  if (disposable > 0 && totalSuggested > disposable) {
    warnings.push('Санал болгож буй нийт төлбөр (зардал хассан) үлдэгдэл орлогоос давсан байна.');
  }

  // Discrete amortization simulation:
  // Each month:
  // - interest = balance * r
  // - principal paid = payment - interest
  // When the balance reaches 0 (or would be paid off in the current month),
  // we stop immediately. This matches "once the loan ends, stop calculating it".
  function monthlyRate(loan: LoanForSuggestion): number {
    return monthlyRateFraction(loan.interestRate, loan.interestRange);
  }

  /**
   * Upper bound on months needed for fixed payment A to amortize balance P at monthly rate r.
   * Epotek-style loans (урт хугацаа, төлбөр хүүнд ойролцоо) need far more than `termMonths * 2` iterations.
   */
  function maxMonthsForAmortization(balance: number, r: number, A: number, termMonths: number): number {
    if (r <= 0) return Math.max(1, Math.ceil(termMonths * 2));
    if (A <= balance * r) return 0; // caller will reject
    const inside = 1 - (r * balance) / A;
    if (inside <= 0 || inside >= 1) {
      return Math.min(2_000_000, Math.max(1, Math.ceil(termMonths * 2), 1200));
    }
    const nEst = Math.ceil(-Math.log(inside) / Math.log(1 + r));
    return Math.min(
      2_000_000,
      Math.max(nEst + 48, Math.ceil(termMonths * 2), 120),
    );
  }

  function interestForPayment(loan: LoanForSuggestion, payment: number): { months: number | null; totalInterest: number | null } {
    let balance = loan.balance;
    const r = monthlyRate(loan);
    const A = payment;

    if (!Number.isFinite(balance) || !Number.isFinite(A) || A <= 0) {
      return { months: null, totalInterest: null };
    }

    // If monthly rate is 0, there is no interest; last month payment can be smaller.
    if (r === 0) {
      const months = Math.ceil(balance / A);
      return { months, totalInterest: 0 };
    }

    // Payment must exceed first month's interest or balance never decreases.
    if (A <= balance * r) {
      return { months: null, totalInterest: null };
    }

    const maxMonths = maxMonthsForAmortization(balance, r, A, loan.termMonths);
    if (maxMonths <= 0) {
      return { months: null, totalInterest: null };
    }

    let months = 0;
    let totalInterest = 0;
    // eslint-disable-next-line no-constant-condition
    while (balance > 1e-6 && months < maxMonths) {
      const interest = balance * r;
      const principalPaid = A - interest;

      // Payment doesn't cover monthly interest => balance never decreases.
      if (principalPaid <= 0) return { months: null, totalInterest: null };

      // If this month's payment clears the loan, we still only charge this month's interest.
      if (principalPaid >= balance) {
        totalInterest += interest;
        balance = 0;
        months += 1;
        break;
      }

      totalInterest += interest;
      balance -= principalPaid;
      if (balance < 0.01) balance = 0;
      months += 1;
    }

    if (balance > 1e-4) {
      return { months: null, totalInterest: null };
    }

    return { months, totalInterest: Number.isFinite(totalInterest) ? totalInterest : null };
  }

  let interestSavingsTotal: number | null = null;
  let interestSavingsLoanCount = 0;

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

    // Зээл бүрт тусад нь: (хамгийн бага төлбөрийн нийт хүү) − (сонгосон төлбөрийн нийт хүү)
    row.interestSavings = minInterest - curInterest;
    interestSavingsLoanCount += 1;
  });

  // Нийт хэмнэлт = бүх зээл дээрх interestSavings-ийн нийлбэр (нэг эх сурвалж)
  if (interestSavingsLoanCount > 0) {
    interestSavingsTotal = perLoanBase.reduce(
      (sum, r) => sum + (r.interestSavings ?? 0),
      0,
    );
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
    interestSavingsLoanCount,
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
