
export const translations = {
    MN: {
    // Header
    searchPlaceholder: 'Search wealth insights...',
    addTransaction: 'Add Transaction',
    
    // Sidebar
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    budgets: 'Budgets',
    investments: 'Investments',
    analytics: 'Analytics',
    settings: 'Settings',
    support: 'Support',
    system: 'System',
    main: 'Main',
    
    // Net Worth Card
    totalNetWorth: 'Total Net Worth',
    vsLastMonth: 'vs last month',
    details: 'Details',
    syncAccounts: 'Sync Accounts',
    
    // Stats Cards
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    savingsRate: 'Savings Rate',
    profitable: 'PROFITABLE',
    expenses: 'EXPENSES',
    saving: 'SAVING',
    
    // Transactions
    recentTransactions: 'Recent Transactions',
    all: 'All',
    income: 'Income',
    expensesFilter: 'Expenses',
    transaction: 'Transaction',
    category: 'Category',
    date: 'Date',
    amount: 'Amount',
    showAllHistory: 'Show all history',
    
    // Categories
    groceries: 'GROCERIES',
    income_category: 'INCOME',
    entertainment: 'ENTERTAINMENT',
    utilities: 'UTILITIES',
    
    // Budget
    housingBudget: 'Housing Budget',
    foodDining: 'Food & Dining',
    used: 'Used',
    spent: 'Spent',
    limit: 'Limit',
    
    // Spending Chart
    spendingMix: 'Spending Mix',
    housing: 'Housing',
    entertainmentCategory: 'Entertainment',
    others: 'Others',
    
    // Smart Insight
    smartInsight: 'Smart Insight',
    insightText: "You're spending ",
    more: '15% more',
    spending: ' on dining than your average. Adjusting this could increase your yearly savings by ',
    canIncrease: '$1,440',
    applyBudgetRule: 'Apply budget rule',
    
    // Trend
    trend6m: 'Trend (6M)',
    
    // Months
    january: 'Jan',
    february: 'Feb',
    march: 'Mar',
    april: 'Apr',
    may: 'May',
    june: 'Jun',
    july: 'Jul',
    august: 'Aug',
    september: 'Sep',
    october: 'Oct',
    november: 'Nov',
    december: 'Dec',

    // Accounts
    checking: 'Checking Account',
    savings: 'Savings Account',
    creditCard: 'Credit Card',
    accountsOverview: 'Accounts Overview',
    cash: 'Cash',
    bank: 'Bank',
    cards: 'Cards',
    savingsInvestments: 'Savings & Investments',
    transfer: 'Transfer',
    addTransactionBtn: 'Add Transaction',
    availableBalance: 'Available Balance',
    accountActivity: 'Account Activity',

  },
  EN: {
    // Header
    searchPlaceholder: 'Search wealth insights...',
    addTransaction: 'Add Transaction',
    
    // Sidebar
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    budgets: 'Budgets',
    investments: 'Investments',
    analytics: 'Analytics',
    settings: 'Settings',
    support: 'Support',
    system: 'System',
    main: 'Main',
    
    // Net Worth Card
    totalNetWorth: 'Total Net Worth',
    vsLastMonth: 'vs last month',
    details: 'Details',
    syncAccounts: 'Sync Accounts',
    
    // Stats Cards
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    savingsRate: 'Savings Rate',
    profitable: 'PROFITABLE',
    expenses: 'EXPENSES',
    saving: 'SAVING',
    
    // Transactions
    recentTransactions: 'Recent Transactions',
    all: 'All',
    income: 'Income',
    expensesFilter: 'Expenses',
    transaction: 'Transaction',
    category: 'Category',
    date: 'Date',
    amount: 'Amount',
    showAllHistory: 'Show all history',
    
    // Categories
    groceries: 'GROCERIES',
    income_category: 'INCOME',
    entertainment: 'ENTERTAINMENT',
    utilities: 'UTILITIES',
    
    // Budget
    housingBudget: 'Housing Budget',
    foodDining: 'Food & Dining',
    used: 'Used',
    spent: 'Spent',
    limit: 'Limit',
    
    // Spending Chart
    spendingMix: 'Spending Mix',
    housing: 'Housing',
    entertainmentCategory: 'Entertainment',
    others: 'Others',
    
    // Smart Insight
    smartInsight: 'Smart Insight',
    insightText: "You're spending ",
    more: '15% more',
    spending: ' on dining than your average. Adjusting this could increase your yearly savings by ',
    canIncrease: '$1,440',
    applyBudgetRule: 'Apply budget rule',
    
    // Trend
    trend6m: 'Trend (6M)',
    
    // Months
    january: 'Jan',
    february: 'Feb',
    march: 'Mar',
    april: 'Apr',
    may: 'May',
    june: 'Jun',
    july: 'Jul',
    august: 'Aug',
    september: 'Sep',
    october: 'Oct',
    november: 'Nov',
    december: 'Dec',

    // Accounts
    checking: 'Checking Account',
    savings: 'Savings Account',
    creditCard: 'Credit Card',
    accountsOverview: 'Accounts Overview',
    cash: 'Cash',
    bank: 'Bank',
    cards: 'Cards',
    savingsInvestments: 'Savings & Investments',
    transfer: 'Transfer',
    addTransactionBtn: 'Add Transaction',
    availableBalance: 'Available Balance',
    accountActivity: 'Account Activity',

  },
};

export type TranslationKey = keyof typeof translations.EN;

export function useTranslation(language: 'MN' | 'EN') {
  return (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
}
