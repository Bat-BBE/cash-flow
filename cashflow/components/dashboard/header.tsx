'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
import { createPortal } from 'react-dom';

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
      // ← animate-in орлуулсан
      'transition-all duration-200 ease-out',
    )}>
      {panelContent}
    </div>
  );

  /* ── Desktop: dropdown ── */
  return (
    <div className={cn(
      'absolute right-0 top-full mt-2 z-[60]',
      'w-[340px]',
      'rounded-2xl border border-white/[0.08]',
      // Solid dark background — overlay үгүй
      'bg-[#0c0f1a]',
      'shadow-[0_8px_48px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)]',
      'overflow-hidden',
      // Fade + slide animation
      'animate-in fade-in-0 slide-in-from-top-2 duration-200',
    )}>
      {panelContent}
    </div>
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
  const { language, setSidebarOpen } = useDashboard();
  const t = useTranslation(language);
  const { title: pageTitle, icon: pageIcon } = titleForPath(pathname);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [notifs,       setNotifs]       = useState<NotifItem[]>(INITIAL_NOTIFS);
  const [isMobile,     setIsMobile]     = useState(false);

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
        'fixed inset-x-0 top-0 z-50 h-16 w-full',
        'flex items-center gap-2 px-3 sm:px-5',
        'border-b border-white/[0.06]',
        'bg-[#07090f]/90 backdrop-blur-3xl',
        'before:absolute before:inset-x-0 before:top-0 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-violet-500/30 before:to-transparent',
      )}>

        {/* ── LEFT ── */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {/* Desktop logo */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-xl" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05]">
                <img src="/logo.png" alt="CashFlow" className="h-6 w-6 object-contain" />
              </div>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-400/80">CashFlow</p>
          </div>
          <div className="hidden md:block h-5 w-px bg-white/[0.08] mx-1" />
          <div className="hidden md:flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.07]">
              <span className="material-symbols-outlined text-[15px] text-white/50">{pageIcon}</span>
            </div>
            <h1 className="text-[13px] font-bold text-white/70 tracking-wide">{pageTitle}</h1>
          </div>

          {/* Mobile logo */}
          <Link href="/home" className="md:hidden shrink-0 flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05]">
              <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.18em] text-violet-400/80">CashFlow</span>
          </Link>
          <div className="md:hidden flex items-center gap-1.5 min-w-0">
            <div className="h-3.5 w-px bg-white/[0.1]" />
            <span className="text-[12px] font-semibold text-white/40 truncate">{pageTitle}</span>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* Add transaction */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={cn(
              'group relative flex h-9 items-center gap-1.5 overflow-hidden rounded-xl px-3',
              'bg-gradient-to-r from-violet-600 to-indigo-600',
              'border border-violet-500/40',
              'shadow-[0_0_16px_rgba(139,92,246,0.35)]',
              'text-[11px] sm:text-[12px] font-black text-white',
              'transition-all duration-200 hover:shadow-[0_0_24px_rgba(139,92,246,0.55)] hover:scale-[1.02] active:scale-[0.98]',
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <span className="material-symbols-outlined text-[17px] leading-none font-bold relative z-10">add</span>
            <span className="hidden sm:inline relative z-10">{t('addTransaction')}</span>
          </button>

          {/* Notification */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setShowNotif(v => !v)}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-xl',
                'border border-white/[0.08] bg-white/[0.04]',
                'text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70',
                showNotif && 'bg-white/[0.08] text-white/70 border-white/[0.14]',
              )}
              aria-label="Мэдэгдэл"
            >
              <span className="material-symbols-outlined text-[19px] leading-none">notifications</span>
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 ring-1 ring-[#07090f]" />
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

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={cn(
              'md:hidden flex h-9 w-9 items-center justify-center rounded-xl',
              'border border-white/[0.08] bg-white/[0.04]',
              'text-white/50 transition-all hover:bg-white/[0.08] hover:text-white',
            )}
            aria-label="Цэс нээх"
          >
            <span className="material-symbols-outlined text-[21px] leading-none">menu</span>
          </button>
        </div>
      </header>

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