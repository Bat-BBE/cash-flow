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
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-violet-400">notifications</span>
          </div>
          <span className="text-[13px] font-black text-white">Мэдэгдэл</span>
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
      <div className="overflow-y-auto" style={{ maxHeight: isMobile ? '65vh' : '380px' }}>
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
                  'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all',
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
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-400 border-2 border-[#0c0f1a]" />
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
      <div className="px-4 py-3 border-t border-white/[0.07]">
        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          Бүгдийг харах
        </button>
      </div>
    </>
  );

  /* ── Mobile: bottom sheet ── */
  if (isMobile) {
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
          onClick={onClose}
        />

        {/* Sheet */}
        <div className={cn(
          'fixed bottom-0 left-0 right-0 z-[81]',
          'rounded-t-3xl border-t border-white/[0.08]',
          'bg-[#0c0f1a]',
          'shadow-[0_-8px_40px_rgba(0,0,0,0.7)]',

          // ✅ animation
          'translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        )}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          {panelContent}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </>,
      document.body // 🔥 ЭНЭ ЧУХАЛ
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
      <div
        className="fixed inset-0 z-[78] bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[79]',
          'rounded-t-3xl border-t border-white/[0.08] bg-[#0c0f1a]',
          'shadow-[0_-8px_40px_rgba(0,0,0,0.7)]',
          'translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>
        <p className="px-4 pb-2 text-center text-[10px] font-black uppercase tracking-widest text-white/25">
          {user.name ?? 'Account'}
        </p>
        <div className="max-h-[55vh] overflow-y-auto pb-2">
          {[
            { icon: 'person' as const,   label: t('profileLabel'), action: () => { setProfileDrawerOpen(true); onClose(); } },
            { icon: 'settings' as const, label: t('settings'),     action: () => { router.push('/settings'); onClose(); } },
            { icon: 'help' as const,     label: t('support'),      action: () => { router.push('/support'); onClose(); } },
          ].map(({ icon, label, action }) => (
            <button
              key={icon}
              type="button"
              onClick={action}
              className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-white/70 transition-colors active:bg-white/10 hover:bg-white/[0.05] hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px] text-white/30">{icon}</span>
              {label}
            </button>
          ))}
          <div className="mx-4 border-t border-white/[0.06]" />
          <button
            type="button"
            onClick={() => { router.push('/'); onClose(); }}
            className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-rose-400/80 transition-colors active:bg-rose-500/15 hover:bg-rose-500/[0.08] hover:text-rose-300"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {t('logoutLabel')}
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
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
              onClick={() => setShowNotif(v => !v)}
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
            onClick={() => setShowAccountSheet(true)}
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