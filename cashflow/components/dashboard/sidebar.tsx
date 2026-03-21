'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useIsNarrow } from '@/hook/use-is-mobile';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { ProfileDrawer } from './profile-drawer';
interface NavItem {
  label: string;
  translationKey: string;
  icon: string;
  href: string;
  badge?: { count?: number; color?: string };
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
    label: 'Analytics', 
    translationKey: 'analytics', 
    icon: 'analytics', 
    href: '/analytics' 
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

const badgeColors: Record<string, string> = {
  brand:   'bg-violet-500/15 text-violet-300 border-violet-500/25',
  emerald: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
  amber:   'bg-amber-500/12 text-amber-400 border-amber-500/20',
  blue:    'bg-blue-500/12 text-blue-400 border-blue-500/20',
  red:     'bg-red-500/12 text-red-400 border-red-500/20',
};

/* ── tiny glow dot per nav item ── */
const itemGlows: Record<string, string> = {
  '/home':      'from-emerald-500/20',
  '/accounts':  'from-violet-500/20',
  '/budgets':   'from-amber-500/20',
  '/analytics': 'from-blue-500/20',
};

export function Sidebar() {
  const { user, language, sidebarOpen, setSidebarOpen } = useDashboard();
  const t        = useTranslation(language);
  const pathname = usePathname();
  const router   = useRouter();

  const [expandedItems,      setExpandedItems]      = useState<string[]>([]);
  const [isCollapsed,        setIsCollapsed]        = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [showUserMenu,       setShowUserMenu]       = useState(false);
  const isMobile = useIsNarrow(768);
  const menuRef = useRef<HTMLDivElement>(null);

  /* close user menu on outside click */
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  /* close sidebar when route changes on mobile */
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile, setSidebarOpen]);

  /** Drawer: нээлттэй үед бүрэн гарчиг; desktop: зөвхөн товчлуураар нээгдэнэ (hover-оор биш). */
  const expanded           = isMobile ? sidebarOpen : !isCollapsed;
  const effectiveOpen      = isMobile ? sidebarOpen : true;

  const toggleExpand = (href: string) =>
    setExpandedItems(prev =>
      prev.includes(href) ? prev.filter(i => i !== href) : [...prev, href]
    );

  /* ── Nav item renderer ── */
  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive   = pathname === item.href;
    const isExpanded = expandedItems.includes(item.href);
    const hasChildren = !!item.children?.length;

    return (
      <div key={item.href}>
        <Link
          href={item.href}
          onClick={(e) => {
            if (hasChildren) { e.preventDefault(); toggleExpand(item.href); }
            if (isMobile) setSidebarOpen(false);
          }}
          className={cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 mb-3',
            depth > 0 && 'ml-7 py-2 text-[12px]',
            isActive
              ? 'bg-white/[0.08] text-white'
              : 'text-white/40 hover:bg-white/[0.05] hover:text-white/80',
          )}
        >
          {/* Active left accent */}
          {isActive && (
            <span
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gradient-to-b',
                'from-violet-400 to-violet-600',
              )}
            />
          )}

          {/* Active glow */}
          {isActive && (
            <span
              className={cn(
                'absolute inset-0 rounded-xl opacity-30 bg-gradient-to-r to-transparent pointer-events-none',
                itemGlows[item.href] ?? 'from-white/10',
              )}
            />
          )}

          {/* Icon */}
          <span className={cn(
            'material-symbols-outlined shrink-0 transition-all duration-200',
            expanded ? 'text-[20px]' : 'text-[22px]',
            isActive ? 'text-white' : 'text-white/35 group-hover:text-white/70',
          )}>
            {item.icon}
          </span>

          {/* Label + badge */}
          {expanded && (
            <>
              <span className="flex-1 truncate">{t(item.translationKey as any)}</span>

              {item.badge && (
                <span className={cn(
                  'shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full border leading-none',
                  badgeColors[item.badge.color ?? 'brand'],
                )}>
                  {item.badge.count ?? 'Шинэ'}
                </span>
              )}

              {hasChildren && (
                <span className={cn(
                  'material-symbols-outlined text-[16px] text-white/25 transition-transform duration-200',
                  isExpanded && 'rotate-180',
                )}>
                  expand_more
                </span>
              )}
            </>
          )}

          {/* Collapsed tooltip */}
          {!expanded && (
            <div className={cn(
              'pointer-events-none invisible absolute left-full z-50 ml-3 whitespace-nowrap',
              'rounded-lg border border-white/10 bg-[#131220]/95 px-2.5 py-1.5',
              'text-[11px] font-semibold text-white/80 shadow-xl backdrop-blur-xl',
              'opacity-0 translate-x-1 transition-all duration-150',
              'group-hover:visible group-hover:opacity-100 group-hover:translate-x-0',
            )}>
              {t(item.translationKey as any)}
              {item.badge && (
                <span className={cn('ml-2 text-[9px] font-bold', badgeColors[item.badge.color ?? 'brand'])}>
                  {item.badge.count ?? 'Шинэ'}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Children */}
        {hasChildren && isExpanded && expanded && (
          <div className="mt-0.5 space-y-0.5">
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarWidth = expanded ? 'w-60' : 'w-[68px]';

  return (
    <div className="relative flex shrink-0">
      {/*
        Spacer (md+): fixed sidebar flex мөрөнд зай үлдээнэ. Mobile-д drawer тул зайгүй.
      */}
      <div
        aria-hidden
        className={cn(
          'hidden shrink-0 self-stretch md:block',
          'transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
          sidebarWidth,
        )}
      />

      {/* Mobile overlay — header-ийн доор */}
      {isMobile && (
        <div
          aria-hidden
          className={cn(
            'fixed inset-x-0 bottom-0 top-16 z-[35] bg-black/70 backdrop-blur-sm transition-all duration-300 lg:hidden',
            effectiveOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        onMouseLeave={() => setShowUserMenu(false)}
        className={cn(
          'fixed left-0 top-16 z-40 flex min-h-0 flex-col border-r border-white/[0.06]',
          'bg-[#0e0c1e]/80 backdrop-blur-2xl',
          'h-[calc(100dvh-4rem)]',
          'transition-[width,transform] duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
          sidebarWidth,
          isMobile
            ? effectiveOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0',
        )}
      >
        {/* Subtle inner noise / gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-none">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ── Desktop collapse toggle ── */}
        {!isMobile && (
          <button
            type="button"
            aria-label={isCollapsed ? 'Сидбарыг нээх' : 'Сидбарыг хаах'}
            onClick={() => setIsCollapsed(v => !v)}
            className={cn(
              'absolute -right-3 top-8 z-10',
              'flex h-6 w-6 items-center justify-center rounded-full',
              'border border-white/10 bg-[#1a1830] shadow-lg',
              'text-white/40 transition-all duration-200 hover:border-violet-500/40 hover:text-violet-400',
            )}
          >
            <span className={cn(
              'material-symbols-outlined text-[14px] transition-transform duration-300',
              isCollapsed ? 'rotate-180' : '',
            )}>
              chevron_left
            </span>
          </button>
        )}

        {/* ── Mobile close button ── */}
        {isMobile && effectiveOpen && (
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/20">Цэс</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-2.5 py-5 custom-scrollbar">
          {/* Section label */}
          {expanded && (
            <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.15em] text-white/20">
              {t('main')}
            </p>
          )}

          {mainNavItems.map(item => renderNavItem(item))}

          {/* Divider */}
          {/* <div className="my-3 mx-3 border-t border-white/[0.05]" /> */}

          {/* Settings + support as slim items */}
          {/* {([
            { href: '/settings', icon: 'settings',     key: 'settings' },
            { href: '/support',  icon: 'help_center',  key: 'support'  },
          ] as { href: string; icon: string; key: string }[]).map(({ href, icon, key }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => { if (isMobile) setSidebarOpen(false); }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.07] text-white'
                    : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60',
                )}
              >
                <span className={cn(
                  'material-symbols-outlined shrink-0 transition-all',
                  expanded ? 'text-[20px]' : 'text-[22px]',
                )}>
                  {icon}
                </span>
                {expanded && <span className="truncate">{t(key as any)}</span>}

                {!expanded && (
                  <div className="pointer-events-none invisible absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-[#131220]/95 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 shadow-xl backdrop-blur-xl opacity-0 translate-x-1 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                    {t(key as any)}
                  </div>
                )}
              </Link>
            );
          })} */}
        </nav>

        {/* ── User / account — доод талд бэхтэй ── */}
        <div
          ref={menuRef}
          className="relative mt-auto shrink-0 border-t border-white/[0.06] bg-[#0e0c1e]/40 p-2.5"
        >
          {/* Popup menu */}
          <div className={cn(
            'absolute bottom-full left-2 right-2 z-50 mb-2 overflow-hidden rounded-2xl',
            'border border-white/[0.08] bg-[#131220]/98 shadow-2xl backdrop-blur-2xl',
            'transition-all duration-200 origin-bottom',
            showUserMenu && expanded
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none',
          )}>
            {[
              { icon: 'person',   label: t('profileLabel'), action: () => { setIsProfileDrawerOpen(true); setShowUserMenu(false); } },
              { icon: 'settings', label: t('settings'),     action: () => { router.push('/settings');      setShowUserMenu(false); } },
              { icon: 'help',     label: t('support'),      action: () => { router.push('/support');       setShowUserMenu(false); } },
            ].map(({ icon, label, action }) => (
              <button
                key={icon}
                onClick={action}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px] text-white/30">{icon}</span>
                {label}
              </button>
            ))}
            <div className="border-t border-white/[0.06]" />
            <button
              onClick={() => { router.push('/'); setShowUserMenu(false); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-rose-400/80 transition-colors hover:bg-rose-500/[0.08] hover:text-rose-300"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t('logoutLabel')}
            </button>
          </div>

          {/* Avatar button */}
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl p-2 transition-all duration-200',
              'hover:bg-white/[0.05]',
              showUserMenu && 'bg-white/[0.05]',
              !expanded && 'justify-center',
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 ring-1 ring-white/10 ring-offset-1 ring-offset-[#0e0c1e]">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-violet-800 text-white text-xs font-bold">
                  {user.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-[#0e0c1e]" />
            </div>

            {expanded && (
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <p className="truncate text-[12px] font-semibold text-white/85 leading-tight">
                  {user.name ?? 'User'}
                </p>
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-400/70">
                  {user.membershipType ?? 'PREMIUM'}
                </span>
              </div>
            )}

            {expanded && (
              <span className={cn(
                'material-symbols-outlined text-[16px] text-white/20 transition-transform duration-200 shrink-0',
                showUserMenu && 'rotate-180',
              )}>
                expand_less
              </span>
            )}
          </button>

          {/* Collapsed tooltip for avatar */}
          {!expanded && (
            <div className="group/avatar absolute bottom-3 left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-[#131220]/95 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 shadow-xl backdrop-blur-xl opacity-0 pointer-events-none">
              {user.name}
            </div>
          )}
        </div>
      </aside>

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={{
          name:           user.name,
          username:       user.username,
          avatarUrl:      user.avatarUrl,
          membershipType: user.membershipType,
          joinedDate:     user.joinedDate,
          score:          user.score,
          goals:          user.goals,
          wealthTier:     user.wealthTier,
          bio:            user.bio,
        }}
      />
    </div>
  );
}