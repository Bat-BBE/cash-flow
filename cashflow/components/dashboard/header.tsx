'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
import { createPortal } from 'react-dom';
import type { Language } from '@/lib/types';

const PAGE_TITLE: Record<string, string> = {
  '/home':               'Хянах самбар',
  '/accounts':           'Данснууд',
  '/budgets':            'Төсөв',
  '/analytics':          'Шинжилгээ',
  '/payments':           'Зээл',
  '/payments/plan':      'Төлөвлөгөө',
  '/payments/simulator': 'Тооцоолуур',
  '/scheduled':          'Хуваарь',
  '/savings':            'Хадгаламж',
  '/settings':           'Тохиргоо',
  '/support':            'Тусламж',
};

const PAGE_ICONS: Record<string, string> = {
  '/home':               'dashboard',
  '/accounts':           'account_balance_wallet',
  '/budgets':            'savings',
  '/analytics':          'analytics',
  '/payments':           'payments',
  '/payments/plan':      'event_note',
  '/payments/simulator': 'calculate',
  '/scheduled':          'calendar_month',
  '/savings':            'savings',
  '/settings':           'settings',
  '/support':            'help_center',
};

function titleForPath(p: string | null): { title: string; icon: string } {
  if (!p) return { title: 'CashFlow', icon: 'home' };
  const key = PAGE_TITLE[p] ? p : `/${p.split('/').filter(Boolean)[0]}`;
  return { title: PAGE_TITLE[key] ?? 'CashFlow', icon: PAGE_ICONS[key] ?? 'circle' };
}

interface NotifItem {
  id: string; icon: string; color: string; bg: string;
  title: string; desc: string; time: string; read: boolean;
}

const INITIAL_NOTIFS: NotifItem[] = [
  { id: '1', icon: 'trending_up',    color: 'text-emerald-400', bg: 'bg-emerald-500/20', title: 'Орлого нэмэгдлээ',    desc: 'Энэ сарын орлого өмнөхөөс 12% өсчээ.',        time: '2 цагийн өмнө',  read: false },
  { id: '2', icon: 'warning',        color: 'text-amber-400',   bg: 'bg-amber-500/20',   title: 'Зарлагын лимит',      desc: 'Хоол хүнсний зарлага лимитийн 85%-д хүрлээ.', time: '5 цагийн өмнө',  read: false },
  { id: '3', icon: 'calendar_month', color: 'text-sky-400',     bg: 'bg-sky-500/20',     title: 'Төлбөрийн сануулга', desc: 'Маргааш интернетийн төлбөр хийгдэнэ.',        time: 'Өчигдөр',         read: false },
  { id: '4', icon: 'savings',        color: 'text-violet-400',  bg: 'bg-violet-500/20',  title: 'Зорилго биелэлт',    desc: 'Хадгаламжийн зорилгын 60%-д хүрлээ.',         time: '2 өдрийн өмнө',  read: true  },
  { id: '5', icon: 'receipt_long',   color: 'text-rose-400',    bg: 'bg-rose-500/20',    title: 'Шинэ гүйлгээ',       desc: 'ATM-ээс 150,000₮ авлаа.',                      time: '3 өдрийн өмнө',  read: true  },
];

/* ════════════════════════════════════════════
   NOTIFICATION PANEL
════════════════════════════════════════════ */
function NotifPanel({
  notifs, onRead, onReadAll, onClose, isMobile,
}: {
  notifs: NotifItem[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onClose: () => void;
  isMobile: boolean;
}) {
  const unread = notifs.filter(n => !n.read).length;

  const panelContent = (
    <>
      {/* ── Header ── */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-between border-b border-white/[0.07]',
          isMobile ? 'px-3 py-2.5' : 'px-4 py-3.5',
        )}
      >
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15">
            <span className="material-symbols-outlined text-[14px] text-violet-400">notifications</span>
          </div>
          <span className={cn('font-semibold text-white', isMobile ? 'text-[12px]' : 'text-[13px] font-black')}>
            Мэдэгдэл
          </span>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-violet-500/20 border border-violet-500/30 text-violet-300 leading-none">
              {unread} шинэ
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={onReadAll}
              className="text-[10px] font-bold text-white/35 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10"
            >
              Бүгдийг уншсан
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-all"
          >
            <span className="material-symbols-outlined text-[14px] text-white/50">close</span>
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div
        className={cn(
          'overflow-y-auto',
          isMobile && 'min-h-0 flex-1',
        )}
        style={!isMobile ? { maxHeight: '380px' } : undefined}
      >
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-white/15">notifications_off</span>
            </div>
            <p className="text-[12px] text-white/25 font-medium">Мэдэгдэл байхгүй</p>
          </div>
        ) : (
          <div className="py-1.5">
            {notifs.map((n, i) => (
              <button
                key={n.id}
                onClick={() => onRead(n.id)}
                className={cn(
                  'w-full flex items-start text-left transition-all',
                  isMobile ? 'gap-2.5 px-3 py-3' : 'gap-3 px-4 py-3.5',
                  'hover:bg-white/[0.05] active:bg-white/[0.08]',
                  !n.read && 'bg-white/[0.025]',
                )}
              >
                {/* Unread indicator */}
                <div className="relative shrink-0 mt-0.5">
                  <div className={cn(
                    'w-9 h-9 rounded-2xl flex items-center justify-center border',
                    n.bg,
                    n.read ? 'border-white/[0.06] opacity-60' : 'border-white/[0.12]',
                  )}>
                    <span className={cn('material-symbols-outlined text-[16px]', n.color)}>
                      {n.icon}
                    </span>
                  </div>
                  {!n.read && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#12151f] bg-violet-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-[12px] font-bold leading-tight mb-0.5',
                    n.read ? 'text-white/45' : 'text-white',
                  )}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 mb-1">
                    {n.desc}
                  </p>
                  <p className="text-[10px] text-white/20 font-medium">{n.time}</p>
                </div>

                {/* Read chevron */}
                <span className="material-symbols-outlined text-[14px] text-white/15 shrink-0 mt-1">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className={cn('shrink-0 border-t border-white/[0.07]', isMobile ? 'px-3 py-2' : 'px-4 py-3')}>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-semibold text-white/35 transition-all hover:bg-white/[0.04] hover:text-white/65 sm:text-[11px]',
          )}
        >
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          Бүгдийг харах
        </button>
      </div>
    </>
  );

  /* ── Mobile: dropdown under header (профайл цэсний адил — доод tab/footer биш) ── */
  if (isMobile) {
    return createPortal(
      <>
        <div
          className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[1px]"
          style={{ top: 'calc(3.75rem + env(safe-area-inset-top))' }}
          onClick={onClose}
          aria-hidden
        />
        <div
          className={cn(
            'fixed z-[81] flex max-h-[min(72vh,calc(100dvh-4.75rem))] flex-col overflow-hidden',
            'left-2 right-2 sm:left-auto sm:right-3 sm:w-[min(22rem,calc(100vw-1rem))]',
            'top-[calc(3.75rem+env(safe-area-inset-top)+6px)]',
            'rounded-2xl border border-white/[0.09]',
            'bg-[#12151f]/98 pb-[env(safe-area-inset-bottom)] shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)]',
            'backdrop-blur-xl',
            'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200',
          )}
          role="dialog"
          aria-label="Мэдэгдэл"
        >
          {panelContent}
        </div>
      </>,
      document.body,
    );
  }
  /* ── Desktop: dropdown ── */
  return (
    <div className={cn(
      'absolute right-0 top-full mt-2 z-[60]',
      'w-[340px]',
      'rounded-2xl border border-white/[0.08]',
      'bg-[#0c0f1a]',
      'shadow-[0_8px_48px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)]',
      'overflow-hidden',
      'transition-all duration-200 ease-out',
    )}>
      {panelContent}
    </div>
  );
}

function MobileAccountSheet({
  open,
  onClose,
  language,
}: {
  open: boolean;
  onClose: () => void;
  language: Language;
}) {
  const t = useTranslation(language);
  const router = useRouter();
  const { user, setProfileDrawerOpen } = useDashboard();

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Доод биш — аватарын доор, header-ээс доош */}
      <div
        className="fixed inset-0 z-[78] bg-black/45 backdrop-blur-[1px]"
        style={{ top: 'calc(3.75rem + env(safe-area-inset-top))' }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'fixed z-[79] w-[min(17.5rem,calc(100vw-1rem))]',
          'right-2 sm:right-3',
          'top-[calc(3.75rem+env(safe-area-inset-top)+6px)]',
          'overflow-hidden rounded-2xl border border-white/[0.09]',
          'bg-[#12151f]/98 shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)]',
          'backdrop-blur-xl',
        )}
        role="menu"
      >
        <p className="border-b border-white/[0.06] px-3 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">
          {user.name ?? 'Account'}
        </p>
        <div className="py-1">
          {[
            { icon: 'person' as const,   label: t('profileLabel'), action: () => { setProfileDrawerOpen(true); onClose(); } },
            { icon: 'settings' as const, label: t('settings'),     action: () => { router.push('/settings'); onClose(); } },
            { icon: 'help' as const,     label: t('support'),      action: () => { router.push('/support'); onClose(); } },
          ].map(({ icon, label, action }) => (
            <button
              key={icon}
              type="button"
              role="menuitem"
              onClick={action}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-medium text-white/75 transition-colors active:bg-white/10 hover:bg-white/[0.06] hover:text-white"
            >
              <span className="material-symbols-outlined text-[17px] text-violet-400/70">{icon}</span>
              {label}
            </button>
          ))}
          <div className="mx-2 border-t border-white/[0.06]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => { router.push('/'); onClose(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-medium text-rose-400/85 transition-colors active:bg-rose-500/15 hover:bg-rose-500/[0.08] hover:text-rose-300"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
            {t('logoutLabel')}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

/* ════════════════════════════════════════════
   HEADER
════════════════════════════════════════════ */
export interface HeaderProps {
  onAddTransaction?: (tx: unknown) => void;
  accounts?:         string[];
  categories?:       string[];
}

export function Header({ onAddTransaction, accounts = [], categories = [] }: HeaderProps) {
  const pathname = usePathname();
  const { language, user } = useDashboard();
  const t = useTranslation(language);
  const { title: pageTitle, icon: pageIcon } = titleForPath(pathname);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [notifs,       setNotifs]       = useState<NotifItem[]>(INITIAL_NOTIFS);
  const [isMobile,     setIsMobile]     = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const unread   = notifs.filter(n => !n.read).length;

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Desktop: гадна дарахад хаах */
  useEffect(() => {
    if (!showNotif || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotif, isMobile]);

  const handleRead    = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleReadAll = ()            => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <>
      <header className={cn(
        'fixed inset-x-0 top-0 z-50 w-full',
        'pt-[env(safe-area-inset-top)]',
        'border-b border-white/[0.06]',
        'bg-brand-bg/92 backdrop-blur-xl backdrop-saturate-125',
        'shadow-[0_4px_22px_rgba(15,23,42,0.22)]',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-violet-400/35 before:to-transparent',
      )}>
        <div className="flex h-[3.75rem] items-center gap-1.5 px-2.5 sm:gap-2 md:h-[4.25rem] md:gap-2 md:px-5">

        {/* ── LEFT ── */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
          {/* Desktop logo */}
          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <img
              src="/logo.png"
              alt="CashFlow"
              className="h-12 w-12 shrink-0 object-contain opacity-95"
            />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-400/80">CashFlow</p>
          </div>
          <div className="hidden md:block h-5 w-px bg-white/[0.08] mx-1" />
          <div className="hidden md:flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.07]">
              <span className="material-symbols-outlined text-[15px] text-white/50">{pageIcon}</span>
            </div>
            <h1 className="text-[13px] font-bold text-white/70 tracking-wide">{pageTitle}</h1>
          </div>

          {/* Mobile logo — хүрээгүй */}
          <Link href="/home" className="flex shrink-0 items-center gap-1.5 md:hidden">
            <img src="/logo.png" alt="" className="h-10 w-8 shrink-0 object-contain opacity-95" />
            <span className="hidden min-[360px]:inline text-[10px] font-black uppercase tracking-[0.2em] text-violet-400/75">CashFlow</span>
          </Link>
          <div className="md:hidden flex min-w-0 items-center gap-1.5">
            <div className="hidden min-[360px]:block h-3 w-px shrink-0 bg-white/[0.08]" />
            <span className="truncate text-[11px] font-semibold leading-tight text-white/45">{pageTitle}</span>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex shrink-0 items-center gap-1 md:gap-2">

          {/* Add transaction */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={cn(
              'group relative flex shrink-0 items-center justify-center overflow-hidden rounded-md md:rounded-lg',
              'h-7 w-7 md:h-8 md:w-auto md:gap-1 md:px-2.5',
              'bg-gradient-to-r from-violet-600 to-indigo-600',
              'border border-violet-500/35',
              'shadow-[0_2px_10px_rgba(124,58,237,0.3)]',
              'text-[9px] font-black text-white md:text-[11px]',
              'transition-all duration-200 active:scale-[0.96] md:hover:shadow-[0_3px_16px_rgba(124,58,237,0.4)] md:hover:scale-[1.02]',
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
            <span className="material-symbols-outlined relative z-10 text-[16px] leading-none md:text-[15px]">add</span>
            <span className="relative z-10 hidden md:inline">{t('addTransaction')}</span>
          </button>

          {/* Notification */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAccountSheet(false);
                setShowNotif(v => !v);
              }}
              className={cn(
                'relative flex h-7 w-7 items-center justify-center rounded-md md:h-8 md:w-8 md:rounded-lg',
                'border border-white/[0.07] bg-white/[0.035]',
                'text-white/38 transition-colors hover:bg-white/[0.07] hover:text-white/65',
                showNotif && 'border-white/[0.12] bg-white/[0.07] text-white/75',
              )}
              aria-label="Мэдэгдэл"
            >
              <span className="material-symbols-outlined text-[16px] leading-none md:text-[17px]">notifications</span>
              {unread > 0 && (
                <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-violet-400 ring-2 ring-brand-bg" />
              )}
            </button>

            {showNotif && (
              <NotifPanel
                notifs={notifs}
                onRead={handleRead}
                onReadAll={handleReadAll}
                onClose={() => setShowNotif(false)}
                isMobile={isMobile}
              />
            )}
          </div>

          {/* Mobile: профайл — доод tab bar үндсэн навигац */}
          <button
            type="button"
            onClick={() => {
              setShowNotif(false);
              setShowAccountSheet(true);
            }}
            className={cn(
              'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full md:hidden',
              'ring-1 ring-white/[0.14] ring-offset-[1.5px] ring-offset-brand-bg',
              'transition-transform active:scale-95',
            )}
            aria-label={t('profileLabel')}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatarUrl} alt={user.name ?? ''} />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-violet-800 text-[9px] font-bold text-white">
                {user.name?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-px -right-px h-[5px] w-[5px] rounded-full bg-emerald-500 ring-[1.5px] ring-brand-bg" />
          </button>
        </div>
        </div>
      </header>

      <MobileAccountSheet
        open={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
        language={language}
      />

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(tx) => { onAddTransaction?.(tx); setShowAddModal(false); }}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}