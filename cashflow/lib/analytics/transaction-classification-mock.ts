/**
 * Гүйлгээ ангилал — mock өгөгдөл + нийлбэр тооцоолох.
 * Дараа нь Firebase/API-тай холбохдоо энэ бүтцийг хадгална.
 */

export type IncomeClassification = 'fixed' | 'variable';

export type ExpenseClassification = 'fixed' | 'variable_nonfixed';

export type FlexibleClassification = 'cuttable' | 'not_cuttable';

export type ClassificationTab = 'income' | 'expense' | 'flexible';

export type MockClassifiedTransaction = {
  id: string;
  label: string;
  amount: number;
  tab: ClassificationTab;
  /** Орлогын таб */
  income?: IncomeClassification;
  /** Зардлын таб */
  expense?: ExpenseClassification;
  /** Уян хатан таб */
  flexible?: FlexibleClassification;
  /** Зардалын карт — огноо, ангиллын зөвлөмж */
  date?: string;
  categoryHint?: string;
};

export const INITIAL_MOCK_TRANSACTIONS: MockClassifiedTransaction[] = [
  // Орлого
  {
    id: 'inc-1',
    label: 'Цалин',
    amount: 2_400_000,
    tab: 'income',
    income: 'fixed',
  },
  {
    id: 'inc-2',
    label: 'Түрээсийн орлого',
    amount: 450_000,
    tab: 'income',
    income: 'fixed',
  },
  {
    id: 'inc-3',
    label: 'Freelance / нэмэлт орлого',
    amount: 680_000,
    tab: 'income',
    income: 'variable',
  },
  {
    id: 'inc-4',
    label: 'Бусад орлого',
    amount: 120_000,
    tab: 'income',
    income: 'variable',
  },
  {
    id: 'inc-5',
    label: 'Зээлийн санхүүжилт',
    amount: 500_000,
    tab: 'income',
    income: 'variable',
  },
  // Зардал
  {
    id: 'exp-1',
    label: 'Түрээс / байр',
    amount: 1_200_000,
    tab: 'expense',
    expense: 'fixed',
    date: '2025-03-01',
    categoryHint: 'Орон сууц',
  },
  {
    id: 'exp-2',
    label: 'Төлбөрүүд (цахилгаан, интернет)',
    amount: 185_000,
    tab: 'expense',
    expense: 'fixed',
    date: '2025-03-05',
    categoryHint: 'Нийтийн үйлчилгээ',
  },
  {
    id: 'exp-3',
    label: 'Эрүүл мэнд (даатгал)',
    amount: 95_000,
    tab: 'expense',
    expense: 'fixed',
    date: '2025-03-08',
    categoryHint: 'Даатгал',
  },
  {
    id: 'exp-4',
    label: 'Хоол хүнс',
    amount: 420_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    date: '2025-03-10',
    categoryHint: 'Өдөр тутам',
  },
  {
    id: 'exp-5',
    label: 'Худалдан авалт',
    amount: 280_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    date: '2025-03-12',
    categoryHint: 'Дэлгүүр',
  },
  {
    id: 'exp-6',
    label: 'Тээвэр',
    amount: 140_000,
    tab: 'expense',
    expense: 'variable_nonfixed',
    date: '2025-03-14',
    categoryHint: 'Аялал',
  },
  // Уян хатан
  {
    id: 'flx-1',
    label: 'Netflix / streaming',
    amount: 45_000,
    tab: 'flexible',
    flexible: 'cuttable',
  },
  {
    id: 'flx-2',
    label: 'Кофе / зугаа',
    amount: 85_000,
    tab: 'flexible',
    flexible: 'cuttable',
  },
  {
    id: 'flx-3',
    label: 'Энтертайнмент',
    amount: 120_000,
    tab: 'flexible',
    flexible: 'cuttable',
  },
  {
    id: 'flx-4',
    label: 'Цахилгаан (үлдэгдэл)',
    amount: 62_000,
    tab: 'flexible',
    flexible: 'not_cuttable',
  },
  {
    id: 'flx-5',
    label: 'Эм, эрүүл мэнд',
    amount: 110_000,
    tab: 'flexible',
    flexible: 'not_cuttable',
  },
  {
    id: 'flx-6',
    label: 'Сургалтын төлбөр',
    amount: 350_000,
    tab: 'flexible',
    flexible: 'not_cuttable',
  },
];

/** Swipe deck-ийн дараалал (зардал) */
export const MOCK_EXPENSE_IDS_ORDER: string[] = INITIAL_MOCK_TRANSACTIONS.filter(
  (x) => x.tab === 'expense'
).map((x) => x.id);

export function aggregateIncomeStructure(rows: MockClassifiedTransaction[]) {
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

export function aggregateExpenseStructure(rows: MockClassifiedTransaction[]) {
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

export function aggregateFlexibleStructure(rows: MockClassifiedTransaction[]) {
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
