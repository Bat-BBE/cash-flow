/**
 * Шинжилгээ хуудасны нэгдсэн өгөгдлийн загвар.
 * Доорх ангилал → дээрх Sankey + summary + mini chart бүгд эндээс гарна.
 */

import {
  SANKEY_MOCK_NODES,
  type CashflowSankeyNodeDef,
  type CashflowSankeySummary,
  type SankeyLinkKind,
  SANKEY_NODE_IDS,
  getSankeySummaryFromLinks,
  type CashflowSankeyLinkDef,
} from '@/lib/analytics/cashflow-sankey-data';

export type IncomeClassification = 'fixed' | 'variable';
export type ExpenseClassification = 'fixed' | 'variable_nonfixed';
export type FlexibleClassification = 'cuttable' | 'not_cuttable';
export type ClassificationTab = 'income' | 'expense' | 'flexible';

export type SankeyIncomeSlot =
  | 'salary'
  | 'rentIncome'
  | 'freelance'
  | 'otherIncome'
  | 'loanFunding';

export type SankeyExpenseSlot =
  | 'rent'
  | 'bills'
  | 'health'
  | 'food'
  | 'shopping'
  | 'entertainment'
  | 'transport'
  | 'otherExpense';

/** Нэг гүйлгээ — бүх визуал энэ массиваас */
export type AnalysisTransaction = {
  id: string;
  label: string;
  amount: number;
  tab: ClassificationTab;
  date?: string;
  categoryHint?: string;
  income?: IncomeClassification;
  expense?: ExpenseClassification;
  flexible?: FlexibleClassification;
  sankeyIncomeSlot?: SankeyIncomeSlot;
  sankeyExpenseSlot?: SankeyExpenseSlot;
};

/** Зээлийн навч руу хуваарилах суурь харьцаа (нийт зээл = 170 үеийн эталон) */
const LOAN_LEAF_SHARE: Record<number, number> = {
  [SANKEY_NODE_IDS.loanPrincipal]: 80 / 170,
  [SANKEY_NODE_IDS.loanInterest]: 25 / 170,
  [SANKEY_NODE_IDS.creditCard]: 45 / 170,
  [SANKEY_NODE_IDS.otherDebt]: 20 / 170,
};

const LOAN_FRAC_OF_GAP = 170 / 350;
const SAVINGS_FRAC_OF_GAP = 180 / 350;

function incomeLeaf(tx: AnalysisTransaction): number {
  const G = SANKEY_NODE_IDS;
  if (tx.sankeyIncomeSlot === 'loanFunding') return G.loanFunding;
  if (tx.income === 'fixed') {
    if (tx.sankeyIncomeSlot === 'rentIncome') return G.rentIncome;
    /** Тогтмол freelance / бусад → цалингийн баганаар нэгтгэнэ */
    return G.salary;
  }
  return tx.sankeyIncomeSlot === 'freelance' ? G.freelance : G.otherIncomeVar;
}

/** Тогтмол зардал: навч 14–16; тогтмол биш: 17–21 */
function expenseLeafAndGroup(
  tx: AnalysisTransaction
): { leaf: number; groupFixed: boolean } {
  const slot = tx.sankeyExpenseSlot ?? 'otherExpense';
  const varLeaf: Record<SankeyExpenseSlot, number> = {
    rent: SANKEY_NODE_IDS.rentExpense,
    bills: SANKEY_NODE_IDS.bills,
    health: SANKEY_NODE_IDS.health,
    food: SANKEY_NODE_IDS.food,
    shopping: SANKEY_NODE_IDS.shopping,
    entertainment: SANKEY_NODE_IDS.entertainment,
    transport: SANKEY_NODE_IDS.transport,
    otherExpense: SANKEY_NODE_IDS.otherExpense,
  };
  const leaf = varLeaf[slot];
  if (tx.expense === 'fixed') {
    if (slot === 'rent') return { leaf: SANKEY_NODE_IDS.rentExpense, groupFixed: true };
    if (slot === 'bills') return { leaf: SANKEY_NODE_IDS.bills, groupFixed: true };
    return { leaf: SANKEY_NODE_IDS.health, groupFixed: true };
  }
  return { leaf, groupFixed: false };
}

/** Уян хатан: танаж болох → энтертайнмент, болохгүй → төлбөрүүд (тод харагдахын тулд) */
function flexibleLeaf(tx: AnalysisTransaction): number {
  return tx.flexible === 'cuttable'
    ? SANKEY_NODE_IDS.entertainment
    : SANKEY_NODE_IDS.bills;
}

function add(map: Record<number, number>, key: number, v: number) {
  if (v <= 0) return;
  map[key] = (map[key] ?? 0) + v;
}

/**
 * Гүйлгээнээс Sankey nodes + links үүсгэнэ.
 * Нийт орлого = бүх орлогын навч; үлдсэн нь зээл + үлдэгдэлд хуваагдана.
 */
export function buildSankeyFromTransactions(
  transactions: AnalysisTransaction[]
): {
  nodes: Array<CashflowSankeyNodeDef & Record<string, unknown>>;
  links: Array<{ source: number; target: number; value: number; linkKind: SankeyLinkKind }>;
} {
  const incomeLeafAmt: Record<number, number> = {};
  const fixedLeafAmt: Record<number, number> = {};
  const varLeafAmt: Record<number, number> = {};

  for (const tx of transactions) {
    if (tx.tab === 'income') {
      add(incomeLeafAmt, incomeLeaf(tx), tx.amount);
    } else if (tx.tab === 'expense') {
      const { leaf, groupFixed } = expenseLeafAndGroup(tx);
      if (groupFixed) add(fixedLeafAmt, leaf, tx.amount);
      else add(varLeafAmt, leaf, tx.amount);
    } else if (tx.tab === 'flexible') {
      const lf = flexibleLeaf(tx);
      if (tx.flexible === 'cuttable') add(varLeafAmt, lf, tx.amount);
      else add(fixedLeafAmt, lf, tx.amount);
    }
  }

  const totalIn = Object.values(incomeLeafAmt).reduce((s, v) => s + v, 0);
  const userFixed = Object.values(fixedLeafAmt).reduce((s, v) => s + v, 0);
  const userVar = Object.values(varLeafAmt).reduce((s, v) => s + v, 0);
  const userOut = userFixed + userVar;

  let gap = Math.max(0, totalIn - userOut);
  let loanTotal = gap * LOAN_FRAC_OF_GAP;
  let savingsTotal = gap * SAVINGS_FRAC_OF_GAP;

  const loanLeafAmt: Record<number, number> = {};
  for (const leaf of [
    SANKEY_NODE_IDS.loanPrincipal,
    SANKEY_NODE_IDS.loanInterest,
    SANKEY_NODE_IDS.creditCard,
    SANKEY_NODE_IDS.otherDebt,
  ]) {
    loanLeafAmt[leaf] = loanTotal * LOAN_LEAF_SHARE[leaf];
  }

  const savingsLeaf = SANKEY_NODE_IDS.savingsLeaf;
  const savingsAmt: Record<number, number> = { [savingsLeaf]: savingsTotal };

  const links: CashflowSankeyLinkDef[] = [];

  const push = (
    source: number,
    target: number,
    value: number,
    linkKind: SankeyLinkKind
  ) => {
    if (value <= 0) return;
    links.push({ source, target, value, linkKind });
  };

  const G = SANKEY_NODE_IDS;

  const incomeLeaves = [
    G.salary,
    G.rentIncome,
    G.freelance,
    G.otherIncomeVar,
    G.loanFunding,
  ] as const;
  for (const leaf of incomeLeaves) {
    const v = incomeLeafAmt[leaf] ?? 0;
    if (v <= 0) continue;
    let tgt: number;
    if (leaf <= G.rentIncome) tgt = G.fixedIncomeGroup;
    else if (leaf === G.loanFunding) tgt = G.financeGroup;
    else tgt = G.variableIncomeGroup;
    push(leaf, tgt, v, 'inflow');
  }

  const sumFixedIn =
    (incomeLeafAmt[G.salary] ?? 0) + (incomeLeafAmt[G.rentIncome] ?? 0);
  const sumVarIn =
    (incomeLeafAmt[G.freelance] ?? 0) + (incomeLeafAmt[G.otherIncomeVar] ?? 0);
  const sumFin = incomeLeafAmt[G.loanFunding] ?? 0;

  if (sumFixedIn > 0) {
    push(G.fixedIncomeGroup, G.totalIncome, sumFixedIn, 'incomeAggregate');
  }
  if (sumVarIn > 0) {
    push(G.variableIncomeGroup, G.totalIncome, sumVarIn, 'incomeAggregate');
  }
  if (sumFin > 0) {
    push(G.financeGroup, G.totalIncome, sumFin, 'incomeAggregate');
  }

  if (totalIn > 0) push(G.totalIncome, G.mainFlow, totalIn, 'hub');

  const fixedGroupTotal = Object.values(fixedLeafAmt).reduce((s, v) => s + v, 0);
  const varGroupTotal = Object.values(varLeafAmt).reduce((s, v) => s + v, 0);

  if (fixedGroupTotal > 0) push(G.mainFlow, G.fixedExpenseGroup, fixedGroupTotal, 'hub');
  if (varGroupTotal > 0) push(G.mainFlow, G.variableExpenseGroup, varGroupTotal, 'hub');
  if (loanTotal > 0) push(G.mainFlow, G.loanRepayGroup, loanTotal, 'hub');
  if (savingsTotal > 0) push(G.mainFlow, G.savingsGroup, savingsTotal, 'hub');

  for (const leaf of [G.rentExpense, G.bills, G.health]) {
    const v = fixedLeafAmt[leaf] ?? 0;
    if (v > 0) push(G.fixedExpenseGroup, leaf, v, 'expense');
  }
  for (const leaf of [
    G.food,
    G.shopping,
    G.entertainment,
    G.transport,
    G.otherExpense,
  ]) {
    const v = varLeafAmt[leaf] ?? 0;
    if (v > 0) push(G.variableExpenseGroup, leaf, v, 'expense');
  }

  for (const leaf of [
    G.loanPrincipal,
    G.loanInterest,
    G.creditCard,
    G.otherDebt,
  ]) {
    const v = loanLeafAmt[leaf] ?? 0;
    if (v > 0) push(G.loanRepayGroup, leaf, v, 'loan');
  }

  if ((savingsAmt[savingsLeaf] ?? 0) > 0) {
    push(G.savingsGroup, savingsLeaf, savingsAmt[savingsLeaf], 'remaining');
  }

  const sorted = [...links].sort((a, b) => a.value - b.value);

  return {
    nodes: SANKEY_MOCK_NODES.map((n) => ({ ...n })),
    links: sorted,
  };
}

export function deriveCashflowSummary(
  transactions: AnalysisTransaction[]
): CashflowSankeySummary {
  const { links } = buildSankeyFromTransactions(transactions);
  return getSankeySummaryFromLinks(links as CashflowSankeyLinkDef[]);
}

export function aggregateIncomeStructure(rows: AnalysisTransaction[]) {
  let fixed = 0;
  let variable = 0;
  for (const r of rows.filter((x) => x.tab === 'income')) {
    if (r.income === 'fixed') fixed += r.amount;
    else variable += r.amount;
  }
  return [
    { name: 'Тогтмол', value: fixed, key: 'fixed' as const },
    { name: 'Хувьсах', value: variable, key: 'variable' as const },
  ];
}

export function aggregateExpenseStructure(rows: AnalysisTransaction[]) {
  let fixed = 0;
  let variable = 0;
  for (const r of rows.filter((x) => x.tab === 'expense')) {
    if (r.expense === 'fixed') fixed += r.amount;
    else variable += r.amount;
  }
  return [
    { name: 'Тогтмол', value: fixed, key: 'fixed' as const },
    { name: 'Тогтмол биш', value: variable, key: 'variable_nonfixed' as const },
  ];
}

export function aggregateFlexibleStructure(rows: AnalysisTransaction[]) {
  let cut = 0;
  let notCut = 0;
  for (const r of rows.filter((x) => x.tab === 'flexible')) {
    if (r.flexible === 'cuttable') cut += r.amount;
    else notCut += r.amount;
  }
  return [
    { name: 'Танаж болох', value: cut, key: 'cuttable' as const },
    { name: 'Танаж болохгүй', value: notCut, key: 'not_cuttable' as const },
  ];
}

/**
 * Эхлэл: нийт орлого 1M, зардал+уян хатан нийлбэрээр зээл/үлдэгдэл автоматаар тэнцэнэ.
 * Уян хатангийн дүн нийлбэр 180k (жишээ) — үлдэгдэл ~170k, зээл ~170k эталонтой ойрхон.
 */
export const INITIAL_ANALYSIS_TRANSACTIONS: AnalysisTransaction[] = [
  {
    id: 'inc-1',
    label: 'Цалин',
    amount: 600_000,
    tab: 'income',
    income: 'fixed',
    sankeyIncomeSlot: 'salary',
  },
  {
    id: 'inc-2',
    label: 'Түрээсийн орлого',
    amount: 80_000,
    tab: 'income',
    income: 'fixed',
    sankeyIncomeSlot: 'rentIncome',
  },
  {
    id: 'inc-3',
    label: 'Freelance / нэмэлт орлого',
    amount: 150_000,
    tab: 'income',
    income: 'variable',
    sankeyIncomeSlot: 'freelance',
  },
  {
    id: 'inc-4',
    label: 'Бусад орлого',
    amount: 80_000,
    tab: 'income',
    income: 'variable',
    sankeyIncomeSlot: 'otherIncome',
  },
  {
    id: 'inc-5',
    label: 'Зээлийн санхүүжилт',
    amount: 90_000,
    tab: 'income',
    income: 'variable',
    sankeyIncomeSlot: 'loanFunding',
  },
  {
    id: 'exp-1',
    label: 'Түрээс / байр',
    amount: 150_000,
    tab: 'expense',
    expense: 'fixed',
    sankeyExpenseSlot: 'rent',
    date: '2025-03-01',
    categoryHint: 'Орон сууц',
  },
  {
    id: 'exp-2',
    label: 'Төлбөрүүд (цахилгаан, интернет)',
    amount: 120_000,
    tab: 'expense',
    expense: 'fixed',
    sankeyExpenseSlot: 'bills',
    date: '2025-03-05',
    categoryHint: 'Нийтийн үйлчилгээ',
  },
  {
    id: 'exp-3',
    label: 'Эрүүл мэнд (даатгал)',
    amount: 40_000,
    tab: 'expense',
    expense: 'fixed',
    sankeyExpenseSlot: 'health',
    date: '2025-03-08',
    categoryHint: 'Даатгал',
  },
  {
    id: 'exp-4',
    label: 'Хоол хүнс',
    amount: 120_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    sankeyExpenseSlot: 'food',
    date: '2025-03-10',
    categoryHint: 'Өдөр тутам',
  },
  {
    id: 'exp-5',
    label: 'Худалдан авалт',
    amount: 80_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    sankeyExpenseSlot: 'shopping',
    date: '2025-03-12',
    categoryHint: 'Дэлгүүр',
  },
  {
    id: 'exp-6',
    label: 'Энтертайнмент',
    amount: 60_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    sankeyExpenseSlot: 'entertainment',
    date: '2025-03-11',
    categoryHint: 'Зугаа',
  },
  {
    id: 'exp-7',
    label: 'Тээвэр',
    amount: 45_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    sankeyExpenseSlot: 'transport',
    date: '2025-03-14',
    categoryHint: 'Аялал',
  },
  {
    id: 'exp-8',
    label: 'Бусад зардал',
    amount: 35_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    sankeyExpenseSlot: 'otherExpense',
    date: '2025-03-15',
    categoryHint: 'Бусад',
  },
  {
    id: 'flx-1',
    label: 'Netflix / streaming',
    amount: 25_000,
    tab: 'flexible',
    flexible: 'cuttable',
    categoryHint: 'Streaming',
  },
  {
    id: 'flx-2',
    label: 'Кофе / зугаа',
    amount: 35_000,
    tab: 'flexible',
    flexible: 'cuttable',
    categoryHint: 'Жижиг зугаа',
  },
  {
    id: 'flx-3',
    label: 'Энтертайнмент',
    amount: 40_000,
    tab: 'flexible',
    flexible: 'cuttable',
    categoryHint: 'Гадуур',
  },
  {
    id: 'flx-4',
    label: 'Цахилгаан (үлдэгдэл)',
    amount: 30_000,
    tab: 'flexible',
    flexible: 'not_cuttable',
    categoryHint: 'Тогтмол шинжтэй',
  },
  {
    id: 'flx-5',
    label: 'Эм, эрүүл мэнд',
    amount: 30_000,
    tab: 'flexible',
    flexible: 'not_cuttable',
    categoryHint: 'Эрүүл мэнд',
  },
  {
    id: 'flx-6',
    label: 'Сургалтын төлбөр',
    amount: 20_000,
    tab: 'flexible',
    flexible: 'not_cuttable',
    categoryHint: 'Сургалт',
  },
];

export const MOCK_EXPENSE_IDS_ORDER: string[] = INITIAL_ANALYSIS_TRANSACTIONS.filter(
  (x) => x.tab === 'expense'
).map((x) => x.id);

export function cloneInitialTransactions(): AnalysisTransaction[] {
  return INITIAL_ANALYSIS_TRANSACTIONS.map((t) => ({ ...t }));
}
