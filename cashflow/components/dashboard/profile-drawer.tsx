'use client';

import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface ProfileDrawerUser {
  name?: string;
  username?: string;
  avatarUrl?: string;
  membershipType?: string;
  joinedDate?: string;
  score?: number;
  savings?: number;
  goals?: { completed: number; total: number };
  wealthTier?: string;
  bio?: string;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: ProfileDrawerUser;
  sidebarCollapsed?: boolean;
}

export function ProfileDrawer({ 
  isOpen, 
  onClose, 
  user, 
  sidebarCollapsed = false,
}: ProfileDrawerProps) {
    if (!isOpen) return null;
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && 
          backdropRef.current && backdropRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const defaultUser = {
    name: user?.name || 'Tserenchimed',
    username: user?.username || 'tserenchim17',
    avatarUrl: user?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa_NkUFRqXrA0LDQpNYPirATqy8sASNNeUgcMjsCLguANo487bhy2XHGYfjf1KtglTlgHkk6KTyDFRzP0iQELNjUoel_KDNoLkMHMbHlsU0BplmQMGXyGczxXkqVpooRexNzHx-LbHCfWgvMS3IlNX_h7J39AohTbAfaM--pa95aFvwNMykNSYMCwgRXXkGC1R8rXGEsWkcq6jVfIOB4Ci42D8iWyl5mNMImoekfXx8jyUsb0r6VUFrsujeLBLUziJFXSeeZENsgg',
    membershipType: user?.membershipType || 'PREMIUM',
    joinedDate: user?.joinedDate || 'October 2022',
    score: user?.score || 782,
    savings: user?.savings || 14200,
    goals: user?.goals || { completed: 4, total: 6 },
    wealthTier: user?.wealthTier || 'Tier 2',
    bio: user?.bio || 'Strategic investor focused on long-term growth and portfolio diversification. Building generational wealth through automation.',
  };

  const scorePercentage = (defaultUser.score / 1000) * 100;
  const goalsPercentage = (defaultUser.goals.completed / defaultUser.goals.total) * 100;

  const handleEditProfile = () => {
    router.push('/profile');
    onClose();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(defaultUser.username);
  };
  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  return (
    <>
      <div
        ref={backdropRef}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] transition-opacity duration-300",
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ marginLeft: `${sidebarWidth}px` }}
      />

      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 w-[400px] h-screen bg-[#0B1220] border-r border-white/5 z-[50] flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ left: `${sidebarWidth}px` }}
      >
        <div className="relative w-full shrink-0">
          <div className="h-28 w-full bg-gradient-to-br from-[#121F33] to-[#1e293b] sticky top-0 z-[5] overflow-hidden">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[radial-gradient(circle,rgba(112,96,240,0.3)_0%,transparent_70%)] blur-2xl" />

            <div className="absolute top-4 right-4 z-[20]">
              <button
                onClick={onClose}
                className="w-[40px] h-[40px] rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-all hover:bg-white/10 group"
              >
                <span className="material-symbols-outlined text-brand-muted group-hover:text-white transition-colors text-[20px]">
                  close
                </span>
              </button>
            </div>
          </div>

          <div className="absolute -bottom-10 left-5 z-[15]">
            <div className="h-20 w-20 rounded-full border-[4px] border-[#0B1220] relative bg-[#0B1220] shadow-[0_0_20px_rgba(109,91,255,0.3)]">
              <Avatar className="h-full w-full">
                <AvatarImage 
                  src={defaultUser.avatarUrl} 
                  alt={defaultUser.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-primary/80 text-white text-2xl">
                  {defaultUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 rounded-full border-[3.5px] border-[#0B1220] z-[16]" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-5 pb-4">
            <div className="pt-12 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-white leading-tight">
                  {defaultUser.name}
                </h2>
              </div>
              <p className="text-brand-muted text-sm font-medium">
                @{defaultUser.username}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-brand-muted font-medium border-t border-white/5 pt-3">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                <span>Joined {defaultUser.joinedDate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleEditProfile}
                variant="ghost"
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold transition-all"
              >
                Edit Profile
              </Button>
              <Button
                onClick={handleCopyId}
                variant="ghost"
                className="px-3 py-1.5 text-brand-muted hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copy ID
              </Button>
            </div>
          </div>

          <div className="px-5 border-b border-white/5 flex gap-4">
            {['Overview', 'Stats', 'Activity', 'Badges'].map((tab, index) => (
              <button
                key={tab}
                className={cn(
                  "pb-2 text-xs font-bold transition-all relative",
                  index === 1 
                    ? 'text-white' 
                    : 'text-brand-muted hover:text-white'
                )}
              >
                {tab}
                {index === 1 && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121F33] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  Score
                </span>
                <span className="text-lg font-bold text-white">
                  {defaultUser.score}
                </span>
                <div className="h-1 w-full bg-emerald-500/20 rounded-full mt-1">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${scorePercentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#121F33] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  Savings
                </span>
                <span className="text-lg font-bold text-white">
                  ${(defaultUser.savings / 1000).toFixed(1)}k
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  12%
                </span>
              </div>

              <div className="bg-[#121F33] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  Goals
                </span>
                <span className="text-lg font-bold text-white">
                  {defaultUser.goals.completed}/{defaultUser.goals.total}
                </span>
                <div className="h-1 w-full bg-brand-primary/20 rounded-full mt-1">
                  <div 
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${goalsPercentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#121F33] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  Wealth
                </span>
                <span className="text-lg font-bold text-white">
                  {defaultUser.wealthTier}
                </span>
                <span className="text-[10px] text-brand-primary font-bold">
                  Premium
                </span>
              </div>
            </div>

            <div className="bg-[#121F33] p-4 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-3">
                About Me
              </h4>
              <p className="text-xs text-brand-text leading-relaxed">
                {defaultUser.bio}
              </p>
            </div>

            <div className="bg-[#121F33] p-4 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-3">
                Member Since
              </h4>
              <p className="text-xs text-brand-text">
                Feb 25, 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}