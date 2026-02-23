// components/scheduled/types.ts
export interface ScheduledBill {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  status: 'pending' | 'scheduled' | 'overdue' | 'paid';
  icon: string;
  color?: string; // Optional color
}

export interface ScheduledIncome {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  status: 'confirmed' | 'estimated' | 'pending';
  icon: string;
  color?: string; // ✅ color нэмсэн
}

export interface CalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected?: boolean;
  bills: ScheduledBill[];
  income: ScheduledIncome[];
}

export interface LiquidityProjection {
  date: string;
  projectedBalance: number;
  currentBalance: number;
  dayOfMonth: number;
}

export interface MonthlySummary {
  startingBalance: number;
  endingBalance: number;
  totalOutgoing: number;
  totalIncoming: number;
  netChange: number;
}

export const BILL_STATUS_CONFIG = {
  overdue: {
    label: 'Overdue',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    iconColor: 'text-red-400'
  },
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400'
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400'
  },
  paid: {
    label: 'Paid',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400'
  }
} as const;

export const INCOME_STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400'
  },
  estimated: {
    label: 'Estimated',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400'
  },
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400'
  }
} as const;