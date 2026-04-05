'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SavingsGoal } from './types';
import { DEMO_GOALS } from './demo-data';

const STORAGE_KEY = 'cashflow-savings-goals-v1';

function loadGoals(): SavingsGoal[] {
  if (typeof window === 'undefined') return DEMO_GOALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_GOALS;
    const parsed = JSON.parse(raw) as SavingsGoal[];
    return Array.isArray(parsed) ? parsed : DEMO_GOALS;
  } catch {
    return DEMO_GOALS;
  }
}

export function useSavingsGoals() {
  const [goals, setGoalsState] = useState<SavingsGoal[]>(DEMO_GOALS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGoalsState(loadGoals());
    setReady(true);
  }, []);

  const setGoals = useCallback((next: SavingsGoal[]) => {
    setGoalsState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const addGoal = useCallback(
    (g: Omit<SavingsGoal, 'id'>) => {
      const id = `g_${Date.now()}`;
      setGoalsState((prev) => {
        const next = [...prev, { ...g, id }];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  return { goals, setGoals, addGoal, ready };
}
