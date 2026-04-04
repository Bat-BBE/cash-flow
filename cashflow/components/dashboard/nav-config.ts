export interface NavItem {
  label: string;
  translationKey: string;
  icon: string;
  href: string;
  badge?: { count?: number; color?: string };
  children?: NavItem[];
}

export const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    translationKey: 'dashboard',
    icon: 'dashboard',
    href: '/home',
    badge: { color: 'emerald' },
  },
  {
    label: 'Accounts',
    translationKey: 'accounts',
    icon: 'account_balance_wallet',
    href: '/accounts',
    badge: { count: 5, color: 'brand' },
  },
  {
    label: 'Analytics',
    translationKey: 'analytics',
    icon: 'analytics',
    href: '/analytics',
  },
  {
    label: 'loan',
    translationKey: 'loan',
    icon: 'payments',
    href: '/payments',
  },
  {
    label: 'Calendar',
    translationKey: 'calendar',
    icon: 'calendar_month',
    href: '/scheduled',
  },
];

export const badgeColors: Record<string, string> = {
  brand: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  emerald: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  blue: 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  red: 'bg-red-500/12 text-red-400 border-red-500/20',
};

export const itemGlows: Record<string, string> = {
  '/home': 'from-emerald-500/20',
  '/accounts': 'from-violet-500/20',
  '/budgets': 'from-amber-500/20',
  '/analytics': 'from-blue-500/20',
};
