export interface SavingsGoal {
  id: string;
  nameMn: string;
  nameEn: string;
  current: number;
  target: number;
  /** YYYY-MM-DD */
  deadline: string;
  icon: string;
  accent: 'emerald' | 'violet' | 'amber' | 'sky' | 'rose';
}

export interface SavingsJar {
  id: string;
  nameMn: string;
  nameEn: string;
  balance: number;
  icon: string;
  tint: 'emerald' | 'violet' | 'amber' | 'cyan' | 'rose';
}
