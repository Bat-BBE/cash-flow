/**
 * Мөнгөн урсгалын Sankey — шаталсан (hierarchical) mock өгөгдөл.
 * Бүтэц: орлого навч → орлогын бүлэг → Нийт орлого → Гол урсгал → зардлын бүлгүүд → навч зардал/зээл/үлдэгдэл.
 */

/** Урсгалын өнгөний ангилал (ribbon + tooltip) */
export type SankeyLinkKind =
  | 'inflow'
  | 'incomeAggregate'
  | 'hub'
  | 'expense'
  | 'loan'
  | 'remaining';

/** Node-ийн төрөл — label байрлал, anchor өнгө */
export type CashflowSankeyNodeKind =
  | 'incomeLeaf'
  | 'incomeGroup'
  | 'totalIncome'
  | 'mainTrunk'
  | 'expenseGroupFixed'
  | 'expenseGroupVar'
  | 'loanGroup'
  | 'savingsGroup'
  | 'expenseLeaf'
  | 'loanLeaf'
  | 'remainingLeaf';

export type CashflowSankeyNodeDef = {
  name: string;
  nodeKind: CashflowSankeyNodeKind;
};

export type CashflowSankeyLinkDef = {
  source: number;
  target: number;
  value: number;
  linkKind: SankeyLinkKind;
};

/**
 * Индексууд (27 node: 0..26)
 *
 * Орлого: навч 0–4 → бүлэг 5–7 → 8 Нийт орлого → 9 Гол мөнгөн урсгал
 * Зардал: 10–13 бүлэг → 14–26 навч
 */
export const SANKEY_NODE_IDS = {
  // —— Орлого: навч ——
  salary: 0,
  rentIncome: 1,
  freelance: 2,
  otherIncomeVar: 3,
  loanFunding: 4,
  // —— Орлого: бүлэг ——
  fixedIncomeGroup: 5,
  variableIncomeGroup: 6,
  financeGroup: 7,
  totalIncome: 8,
  mainFlow: 9,
  // —— Зардал: бүлэг ——
  fixedExpenseGroup: 10,
  variableExpenseGroup: 11,
  loanRepayGroup: 12,
  savingsGroup: 13,
  // —— Зардал: навч ——
  rentExpense: 14,
  bills: 15,
  health: 16,
  food: 17,
  shopping: 18,
  entertainment: 19,
  transport: 20,
  otherExpense: 21,
  loanPrincipal: 22,
  loanInterest: 23,
  creditCard: 24,
  otherDebt: 25,
  savingsLeaf: 26,
} as const;

/** Бүх дүн ₮; нийлбэр 1,000,000 */
export const SANKEY_MOCK_NODES: CashflowSankeyNodeDef[] = [
  { name: 'Цалин', nodeKind: 'incomeLeaf' },
  { name: 'Түрээсийн орлого', nodeKind: 'incomeLeaf' },
  { name: 'Freelance / нэмэлт орлого', nodeKind: 'incomeLeaf' },
  { name: 'Бусад орлого', nodeKind: 'incomeLeaf' },
  { name: 'Зээлийн санхүүжилт', nodeKind: 'incomeLeaf' },
  { name: 'Тогтмол орлого', nodeKind: 'incomeGroup' },
  { name: 'Хувьсах орлого', nodeKind: 'incomeGroup' },
  { name: 'Санхүүжилт', nodeKind: 'incomeGroup' },
  { name: 'Нийт орлого', nodeKind: 'totalIncome' },
  { name: 'Гол мөнгөн урсгал', nodeKind: 'mainTrunk' },
  { name: 'Тогтмол зардал', nodeKind: 'expenseGroupFixed' },
  { name: 'Хувьсах зардал', nodeKind: 'expenseGroupVar' },
  { name: 'Зээлийн төлөлт', nodeKind: 'loanGroup' },
  { name: 'Үлдэгдэл', nodeKind: 'savingsGroup' },
  { name: 'Түрээс / байр', nodeKind: 'expenseLeaf' },
  { name: 'Төлбөрүүд', nodeKind: 'expenseLeaf' },
  { name: 'Эрүүл мэнд', nodeKind: 'expenseLeaf' },
  { name: 'Хоол хүнс', nodeKind: 'expenseLeaf' },
  { name: 'Худалдан авалт', nodeKind: 'expenseLeaf' },
  { name: 'Энтертайнмент', nodeKind: 'expenseLeaf' },
  { name: 'Тээвэр', nodeKind: 'expenseLeaf' },
  { name: 'Бусад зардал', nodeKind: 'expenseLeaf' },
  { name: 'Зээлийн үндсэн төлбөр', nodeKind: 'loanLeaf' },
  { name: 'Зээлийн хүү', nodeKind: 'loanLeaf' },
  { name: 'Кредит картын төлөлт', nodeKind: 'loanLeaf' },
  { name: 'Бусад өр төлөлт', nodeKind: 'loanLeaf' },
  { name: 'Хуримтлал / үлдэгдэл', nodeKind: 'remainingLeaf' },
];

export type CashflowSankeySummary = {
  totalInflow: number;
  totalExpense: number;
  totalLoanPayments: number;
  remainingCash: number;
};

export function getSankeySummaryFromLinks(links: CashflowSankeyLinkDef[]): CashflowSankeySummary {
  const { totalIncome, savingsLeaf } = SANKEY_NODE_IDS;

  const totalInflow = links
    .filter((l) => l.target === totalIncome)
    .reduce((s, l) => s + l.value, 0);

  const totalExpense = links
    .filter((l) => l.linkKind === 'expense')
    .reduce((s, l) => s + l.value, 0);

  const totalLoanPayments = links
    .filter((l) => l.linkKind === 'loan')
    .reduce((s, l) => s + l.value, 0);

  const remainingCash = links
    .filter((l) => l.target === savingsLeaf)
    .reduce((s, l) => s + l.value, 0);

  return { totalInflow, totalExpense, totalLoanPayments, remainingCash };
}

export type SankeyDisplayMode = 'amount' | 'percentage';

export function pctOfTotalInflow(amount: number, totalInflow: number): number {
  if (!Number.isFinite(amount) || !Number.isFinite(totalInflow) || totalInflow <= 0) return 0;
  return (amount / totalInflow) * 100;
}

export function formatCompactMnt(amount: number): string {
  const n = Math.abs(amount);
  if (n >= 1_000_000) return `₮ ${(amount / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `₮ ${Math.round(amount / 1_000)}k`;
  return `₮ ${Math.round(amount)}`;
}

export function formatPctOneDecimal(pct: number): string {
  return `${pct.toFixed(1)}%`;
}
