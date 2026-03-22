'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';

type DashboardShellProps = {
  children: ReactNode;
  /** Root wrapper */
  className?: string;
  /** Main scroll area (өөр дэвсгэр өнгө) */
  mainClassName?: string;
};

export function DashboardShell({ children, className, mainClassName }: DashboardShellProps) {
  return (
    <div className={cn('flex min-h-screen min-h-[100dvh] flex-col bg-brand-bg', className)}>
      <Header />
      <div className="flex min-h-0 flex-1 items-stretch pt-16">
        <Sidebar />
        <main
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-brand-bg custom-scrollbar',
            mainClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
