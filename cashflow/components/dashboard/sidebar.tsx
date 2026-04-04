'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useIsNarrow } from '@/hook/use-is-mobile';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { mainNavItems, badgeColors, itemGlows, type NavItem } from './nav-config';

export function Sidebar() {
  const { user, language, setProfileDrawerOpen } = useDashboard();
  const t        = useTranslation(language);
  const pathname = usePathname();
  const router   = useRouter();

  const [expandedItems,      setExpandedItems]      = useState<string[]>([]);
  const [isCollapsed,        setIsCollapsed]        = useState(false);
  const [showUserMenu,       setShowUserMenu]       = useState(false);
  const isMobile = useIsNarrow(768);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Гадна дарахад хаах — нээх товчийг ижил даралтаар буруу хаахгүйн тулд listener-ийг дараагийн тикээр залгана */
  useEffect(() => {
    if (!showUserMenu) return;
    let detach: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      const closeIfOutside = (target: EventTarget | null) => {
        if (menuRef.current && target instanceof Node && !menuRef.current.contains(target)) {
          setShowUserMenu(false);
        }
      };
      const onPointerDown = (e: PointerEvent) => closeIfOutside(e.target);
      document.addEventListener('pointerdown', onPointerDown, true);
      detach = () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      detach?.();
    };
  }, [showUserMenu]);

  /** Desktop: зөвхөн товчлуураар нээгдэнэ (hover-оор биш). Гар утас дээр доод tab bar ашиглана. */
  const expanded = !isCollapsed;

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

  if (isMobile) return null;

  return (
    <div className="relative flex shrink-0">
      <div
        aria-hidden
        className={cn(
          'hidden shrink-0 self-stretch md:block',
          'transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
          sidebarWidth,
        )}
      />

      <aside
        onMouseLeave={() => setShowUserMenu(false)}
        className={cn(
          'fixed z-40 flex min-h-0 flex-col',
          'top-[calc(4.25rem+env(safe-area-inset-top))]',
          'bg-[#0e0c1e]/80 backdrop-blur-2xl',
          'h-[calc(100dvh-4.25rem-env(safe-area-inset-top))]',
          'transition-[width,transform] duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
          sidebarWidth,
          'left-0 border-r border-white/[0.06] translate-x-0',
        )}
      >
        {/* Subtle inner noise / gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-none">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

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

        {/* ── User / account — доод талд, өргөтгөсөн үед төвлөрсөн ── */}
        <div
          ref={menuRef}
          className={cn(
            'relative mt-auto shrink-0 border-t border-white/[0.06] bg-[#0e0c1e]/40 p-2.5',
            expanded && 'flex flex-col items-center',
          )}
        >
          <div
            className={cn(
              'absolute z-[55] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131220]/98 shadow-2xl backdrop-blur-2xl',
              'origin-bottom transition-all duration-200',
              expanded
                ? 'bottom-full left-1/2 mb-2 w-[min(calc(100%-0.75rem),13.5rem)] -translate-x-1/2'
                : 'bottom-full left-2 right-2 mb-2',
              showUserMenu
                ? 'pointer-events-auto opacity-100 scale-100 translate-y-0'
                : 'pointer-events-none opacity-0 scale-95 translate-y-2',
            )}
          >
            {[
              { icon: 'person',   label: t('profileLabel'), action: () => { setProfileDrawerOpen(true); setShowUserMenu(false); } },
              { icon: 'settings', label: t('settings'),     action: () => { router.push('/settings');      setShowUserMenu(false); } },
              { icon: 'help',     label: t('support'),      action: () => { router.push('/support');       setShowUserMenu(false); } },
            ].map(({ icon, label, action }) => (
              <button
                key={icon}
                type="button"
                onClick={action}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px] text-white/30">{icon}</span>
                {label}
              </button>
            ))}
            <div className="border-t border-white/[0.06]" />
            <button
              type="button"
              onClick={() => { router.push('/'); setShowUserMenu(false); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-rose-400/80 transition-colors hover:bg-rose-500/[0.08] hover:text-rose-300"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t('logoutLabel')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowUserMenu(v => !v)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl p-2 transition-all duration-200',
              'hover:bg-white/[0.05]',
              showUserMenu && 'bg-white/[0.05]',
              expanded ? 'flex-col justify-center gap-1.5 py-3' : 'justify-center',
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 ring-1 ring-white/10 ring-offset-2 ring-offset-[#0e0c1e] md:h-10 md:w-10">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-violet-800 text-xs font-bold text-white">
                  {user.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-[#0e0c1e]" />
            </div>

            {expanded && (
              <div className="flex min-w-0 max-w-full flex-col items-center text-center">
                <p className="line-clamp-2 text-[12px] font-semibold leading-tight text-white/85">
                  {user.name ?? 'User'}
                </p>
                <span className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-violet-400/70">
                  {user.membershipType ?? 'PREMIUM'}
                </span>
              </div>
            )}

            {expanded && (
              <span className={cn(
                'material-symbols-outlined shrink-0 text-[18px] text-white/25 transition-transform duration-200',
                showUserMenu && 'rotate-180',
              )}>
                expand_more
              </span>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}