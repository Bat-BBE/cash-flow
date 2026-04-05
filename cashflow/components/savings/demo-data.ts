import type { SavingsGoal, SavingsJar } from './types';

export const DEMO_GOALS: SavingsGoal[] = [
  {
    id: 'g1',
    nameMn: 'Аялалын сан',
    nameEn: 'Travel fund',
    current: 1_850_000,
    target: 5_000_000,
    deadline: '2026-08-30',
    icon: 'flight_takeoff',
    accent: 'sky',
  },
  {
    id: 'g2',
    nameMn: 'Шинэ laptop',
    nameEn: 'New laptop',
    current: 920_000,
    target: 3_200_000,
    deadline: '2026-06-15',
    icon: 'laptop_mac',
    accent: 'violet',
  },
  {
    id: 'g3',
    nameMn: 'Онцгой сан (6 сар)',
    nameEn: 'Emergency fund (6 mo)',
    current: 4_100_000,
    target: 9_000_000,
    deadline: '2027-01-01',
    icon: 'shield_with_heart',
    accent: 'emerald',
  },
];

export const DEMO_JARS: SavingsJar[] = [
  { id: 'j1', nameMn: 'Боловсрол', nameEn: 'Education', balance: 340_000, icon: 'school', tint: 'violet' },
  { id: 'j2', nameMn: 'Эрүүл мэнд', nameEn: 'Health', balance: 180_000, icon: 'favorite', tint: 'rose' },
  { id: 'j3', nameMn: 'Бэлэг', nameEn: 'Gifts', balance: 95_000, icon: 'redeem', tint: 'amber' },
  { id: 'j4', nameMn: 'Хобби', nameEn: 'Hobbies', balance: 62_000, icon: 'palette', tint: 'cyan' },
];

/** Энэ сарын автомат хадгаламж (жишээ) */
export const DEMO_MONTHLY_SAVED = 420_000;
