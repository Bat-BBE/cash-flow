'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { useScheduledData } from '@/hook/use-scheduled-data';

type ScheduledCalendarValue = ReturnType<typeof useScheduledData>;

const ScheduledCalendarContext = createContext<ScheduledCalendarValue | null>(null);

export function ScheduledCalendarProvider({ children }: { children: ReactNode }) {
  const value = useScheduledData();
  return (
    <ScheduledCalendarContext.Provider value={value}>{children}</ScheduledCalendarContext.Provider>
  );
}

/** Shared scheduled bills / calendar state (single source for sidebar + /scheduled). */
export function useScheduledCalendar(): ScheduledCalendarValue {
  const ctx = useContext(ScheduledCalendarContext);
  if (!ctx) {
    throw new Error('useScheduledCalendar must be used within ScheduledCalendarProvider');
  }
  return ctx;
}
