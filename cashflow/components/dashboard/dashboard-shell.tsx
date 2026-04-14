'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { ProfileDrawer } from '@/components/dashboard/profile-drawer';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { DashboardDataProvider } from '@/contexts/dashboard-data-context';
import { AiChatbotFab } from '@/components/dashboard/ai-chatbot-fab';
import { FirebaseDataBanner } from '@/components/dashboard/firebase-data-banner';

type DashboardShellProps = {
  children: ReactNode;
  /** Root wrapper */
  className?: string;
  /** Main scroll area (өөр дэвсгэр өнгө) */
  mainClassName?: string;
};

function DashboardProfileDrawer() {
  const { user, profileDrawerOpen, setProfileDrawerOpen } = useDashboard();
  return (
    <ProfileDrawer
      isOpen={profileDrawerOpen}
      onClose={() => setProfileDrawerOpen(false)}
      user={{
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        membershipType: user.membershipType,
        joinedDate: user.joinedDate,
        score: user.score,
        goals: user.goals,
        wealthTier: user.wealthTier,
        bio: user.bio,
      }}
    />
  );
}

export function DashboardShell({ children, className, mainClassName }: DashboardShellProps) {
  return (
    <DashboardDataProvider>
    <div className={cn('flex min-h-screen min-h-[100dvh] flex-col bg-brand-bg', className)}>
      <Header />
      <div className="flex min-h-0 flex-1 items-stretch pt-[calc(3.75rem+env(safe-area-inset-top))] md:pt-[calc(4.25rem+env(safe-area-inset-top))]">
        <Sidebar />
        <main
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-brand-bg custom-scrollbar',
            /* Full-width доод tab: нягт өндөр + зөвхөн safe-area */
            'pb-[calc(4.05rem+env(safe-area-inset-bottom))] md:pb-0',
            mainClassName,
          )}
        >
          <FirebaseDataBanner />
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <AiChatbotFab />
      <DashboardProfileDrawer />
    </div>
    </DashboardDataProvider>
  );
}
