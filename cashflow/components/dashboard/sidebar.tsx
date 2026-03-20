'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { ProfileDrawer } from './profile-drawer';
import { set } from 'date-fns';

interface NavItem {
  label: string;
  translationKey: string;
  icon: string;
  href: string;
  badge?: {
    count?: number;
    color?: string;
  };
  children?: NavItem[];
}

const mainNavItems: NavItem[] = [
  { 
    label: 'Dashboard', 
    translationKey: 'dashboard', 
    icon: 'dashboard', 
    href: '/home',
    badge: { color: 'emerald' }
  },
  { 
    label: 'Accounts', 
    translationKey: 'accounts', 
    icon: 'account_balance_wallet', 
    href: '/accounts',
    badge: { count: 5, color: 'brand' }
  },
  { 
    label: 'Budgets', 
    translationKey: 'budgets', 
    icon: 'savings', 
    href: '/budgets',
    badge: { count: 2, color: 'amber' }
  },
  { 
    label: 'Analytics', 
    translationKey: 'analytics', 
    icon: 'analytics', 
    href: '/analytics' 
  },
];

const systemNavItems: NavItem[] = [
  { 
    label: 'Settings', 
    translationKey: 'settings', 
    icon: 'settings', 
    href: '/settings' 
  },
  { 
    label: 'Support', 
    translationKey: 'support', 
    icon: 'help_center', 
    href: '/support' 
  },
];

const badgeColors = {
  brand: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function Sidebar() {
  const { user, language, sidebarOpen, setSidebarOpen } = useDashboard();
  const t = useTranslation(language);
  const pathname = usePathname();
  const router = useRouter();
  
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  const effectiveCollapsed = isMobile || isTablet ? true : isCollapsed;
  const effectiveOpen = isMobile ? sidebarOpen : true;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const handleLogout = () => {
    router.push('/');
  };

  const handleProfileClick = () => {
    setIsProfileDrawerOpen(true);
  };

  const handleSystemClick = () => {
    router.push('/settings');
  };

  const handleSupportClick = () => {
    router.push('/support');;
  };

  const handleProfileDrawerClose = () => {
    setIsProfileDrawerOpen(false);
  };

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.href);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.href} className="relative">
        <Link
          href={item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpand(item.href);
            }
            if (isMobile) setSidebarOpen(false);
          }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative',
            effectiveCollapsed && !isHovered ? 'justify-center' : 'justify-start',
            isActive 
              ? 'bg-gradient-to-r from-brand-primary/20 to-brand-primary/5 text-brand-primary'
              : 'text-brand-muted hover:bg-white/5 hover:text-white'
          )}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-primary rounded-r-full" />
          )}

          <span className={cn(
            'material-symbols-outlined transition-all duration-200',
            isActive ? 'text-brand-primary' : 'group-hover:scale-110',
            effectiveCollapsed && !isHovered ? 'text-2xl' : 'text-xl'
          )}>
            {item.icon}
          </span>

          {(!effectiveCollapsed || isHovered) && (
            <>
              <span className={cn(
                'flex-1 text-sm transition-all',
                isActive ? 'font-bold' : 'font-medium',
                isSubItem && 'opacity-80'
              )}>
                {t(item.translationKey as any)}
              </span>

              {item.badge && (
                <span className={cn(
                  'px-2 py-0.5 text-[10px] font-bold rounded-full border',
                  badgeColors[item.badge.color as keyof typeof badgeColors]
                )}>
                  {item.badge.count || 'New'}
                </span>
              )}

              {hasChildren && (
                <span className="material-symbols-outlined text-sm transition-transform duration-200">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
              )}
            </>
          )}

          {effectiveCollapsed && !isHovered && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-brand-card border border-white/5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {t(item.translationKey as any)}
            </div>
          )}
        </Link>

        {hasChildren && isExpanded && (!effectiveCollapsed || isHovered) && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && effectiveOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-brand-sidebar to-brand-sidebar/95 flex flex-col shrink-0 border-r border-white/5 z-50 transition-all duration-300',
          effectiveCollapsed && !isHovered ? 'w-20' : 'w-64',
          isMobile 
            ? effectiveOpen ? 'translate-x-0' : '-translate-x-full'
            : 'translate-x-0'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <div className={cn(
          "p-6 flex items-center border-b border-white/5 relative",
          effectiveCollapsed && !isHovered ? 'justify-center' : 'justify-between'
        )}>
          <div className={cn(
            "flex items-center",
            effectiveCollapsed && !isHovered ? 'gap-0' : 'gap-3'
          )}>
            <div className="relative">
              <div className="absolute inset-0 bg-brand-primary/20 blur-lg rounded-full" />
              {/* <div className="relative w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <span className="material-symbols-outlined text-white font-bold text-2xl">
                  account_balance_wallet
                </span>
              </div> */}
              <img src="/logo.png" alt="CashFlow Logo" className="relative w-12 h-9 rounded-xl" />
            </div>
            
            {(!effectiveCollapsed || isHovered) && (
              <div className="animate-slideIn">
                <h1 className="text-white text-lg font-black tracking-tight">CashFlow</h1>
                <p className="text-brand-muted text-[8px] uppercase tracking-widest font-bold">
                  {t('wealthManagement')}
                </p>
              </div>
            )}
          </div>

          {isMobile && effectiveOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 text-brand-muted hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}

          {!isMobile && !isTablet && (
            <button
              onClick={toggleCollapse}
              className={cn(
                "absolute -right-3 top-8 h-6 w-6 bg-brand-card border border-white/10 rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all z-10",
                isCollapsed && !isHovered && 'rotate-180'
              )}
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-1">
              {(!effectiveCollapsed || isHovered) && (
                <p className="px-4 pb-2 text-[10px] font-bold text-brand-muted/50 uppercase tracking-widest">
                  {t('main')}
                </p>
              )}
              {mainNavItems.map(item => renderNavItem(item))}
            </div>

            {/* <div className="space-y-1">
              {(!effectiveCollapsed || isHovered) && (
                <p className="px-4 pb-2 text-[10px] font-bold text-brand-muted/50 uppercase tracking-widest">
                  {t('system')}
                </p>
              )}
              {systemNavItems.map(item => renderNavItem(item))}
            </div> */}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={cn(
          "p-4 mt-auto border-t border-white/5 relative",
          effectiveCollapsed && !isHovered ? 'flex justify-center' : ''
        )}>
          {showUserMenu && (!effectiveCollapsed || isHovered) && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-brand-card border border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-slideUp z-50">

              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-brand-muted">person</span>
                {t('profileLabel')}
              </button>

              <button
                onClick={handleSystemClick}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-brand-muted">settings</span>
                {t('settings')}
              </button>

              <button
                onClick={handleSupportClick}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-brand-muted">help</span>
                {t('support')}
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors border-t border-white/5"
              >
                <span className="material-symbols-outlined">logout</span>
                {t('logoutLabel')}
              </button>

            </div>
          )}
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className={cn(
              "flex items-center gap-3 w-full p-2 rounded-2xl transition-all hover:bg-white/5",
              effectiveCollapsed && !isHovered ? 'justify-center' : 'justify-start'
            )}
          >
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-brand-primary/20 ring-offset-2 ring-offset-brand-sidebar">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-primary/80 text-white">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-brand-sidebar" />
            </div>

            {(!effectiveCollapsed || isHovered) && (
              <div className="flex-1 text-left animate-slideIn">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name || 'User'}
                </p>
                <span className="text-[8px] font-black text-brand-primary uppercase tracking-wider">
                  {user.membershipType || 'PREMIUM'}
                </span>
              </div>
            )}
          </button>

          {effectiveCollapsed && !isHovered && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[6px] text-brand-muted/30 font-bold">v2.4.1</span>
            </div>
          )}
        </div>

      </aside>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={handleProfileDrawerClose}
        user={{
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          membershipType: user.membershipType,
          joinedDate: user.joinedDate,
          score: user.score,
          savings: user.savings,
          goals: user.goals,
          wealthTier: user.wealthTier,
          bio: user.bio,
        }}
        sidebarCollapsed={effectiveCollapsed}
      />
    </>
  );
}