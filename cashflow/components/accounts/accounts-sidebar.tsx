'use client';

import { Account, AccountGroup } from './types';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation, type TranslationKey } from '@/lib/translations';

interface AccountsSidebarProps {
  accountGroups: AccountGroup[];
  selectedAccount: Account | null;
  totalBalance: number;
  totalChange: number;
  changePercentage: number;
  onSelectAccount: (account: Account) => void;
  isLoading?: boolean;
}

const GROUP_ICON_COLOR: Record<string, string> = {
  BANK:       'text-sky-400 bg-sky-500/[0.08] border-sky-500/20',
  LOAN:       'text-rose-400 bg-rose-500/[0.08] border-rose-500/20',
  CASH:       'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20',
  CARDS:      'text-violet-400 bg-violet-500/[0.08] border-violet-500/20',
  SAVINGS:    'text-amber-400 bg-amber-500/[0.08] border-amber-500/20',
  INVESTMENT: 'text-indigo-400 bg-indigo-500/[0.08] border-indigo-500/20',
};

function AccountCard({
  account,
  isSelected,
  onClick,
}: {
  account: Account;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isLoan     = account.type === 'LOAN';
  const isNegative = account.balance < 0;
  const displayAmt = isLoan ? Math.abs(account.balance) : account.balance;

  const amountColor = isLoan
    ? 'text-rose-300'
    : isNegative
    ? 'text-rose-300'
    : 'text-white';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full rounded-[0.85rem] border p-2.5 text-left transition-colors duration-100 active:bg-white/[0.06] sm:rounded-xl sm:p-3.5',
        isSelected
          ? 'border-brand-primary/35 bg-brand-primary/[0.08] shadow-[0_0_16px_rgba(var(--color-primary-rgb),0.08)]'
          : 'border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-white/70 transition-colors group-hover:text-white/90 sm:text-[12px]">
            {account.name}
          </p>
          {account.accountNumber && (
            <p className="mt-0.5 text-[9px] text-white/30 sm:text-[10px]">
              •••• {account.accountNumber}
            </p>
          )}
        </div>
        {isSelected && (
          <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
        )}
      </div>

      <p className={cn('mt-1.5 text-[13px] font-black leading-none tracking-tight tabular-nums sm:mt-2 sm:text-[15px]', amountColor)}>
        {formatCurrency(displayAmt, account.currency || 'MNT')}
        {isLoan && (
          <span className="ml-1 text-[8px] font-black uppercase tracking-widest text-rose-400/70 sm:ml-1.5 sm:text-[9px]">зээл</span>
        )}
      </p>
    </button>
  );
}

function groupHeading(group: AccountGroup, t: (key: TranslationKey) => string) {
  switch (group.type) {
    case 'BANK':       return t('bank');
    case 'LOAN':       return t('loan');
    case 'CASH':       return t('cash');
    case 'CARDS':      return t('cards');
    case 'SAVINGS':    return t('savingsInvestments');
    case 'INVESTMENT': return t('investments');
    default:           return t('accountsOverview');
  }
}

function AccountGroupSection({
  group,
  selectedAccount,
  onSelectAccount,
  groupLabel,
}: {
  group: AccountGroup;
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  groupLabel: string;
}) {
  if (group.accounts.length === 0) return null;
  const iconCls = GROUP_ICON_COLOR[group.type] ?? 'text-white/40 bg-white/[0.04] border-white/10';

  return (
    <div className="mb-4 sm:mb-5">
      <div className="mb-2 flex items-center gap-2 sm:mb-2.5">
        <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border sm:h-6 sm:w-6 sm:rounded-lg', iconCls)}>
          <span className="material-symbols-outlined text-[12px] sm:text-[13px]">{group.icon}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45 sm:text-[11px] sm:tracking-[0.14em]">
          {groupLabel}
        </span>
        <span className="ml-auto flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-white/[0.06] px-1 text-[8px] font-black text-white/35 sm:h-4 sm:min-w-4 sm:px-1.5 sm:text-[9px]">
          {group.accounts.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {group.accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isSelected={selectedAccount?.id === account.id}
            onClick={() => onSelectAccount(account)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-5">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded-full bg-white/[0.05]" />
        <div className="h-8 w-36 rounded-full bg-white/[0.05]" />
        <div className="h-2.5 w-28 rounded-full bg-white/[0.04]" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-white/[0.04]" />
          <div className="h-14 rounded-xl bg-white/[0.03]" />
          <div className="h-14 rounded-xl bg-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   Main sidebar
══════════════════════════════════════════ */
export function AccountsSidebar({
  accountGroups,
  selectedAccount,
  totalBalance,
  totalChange,
  changePercentage,
  onSelectAccount,
  isLoading = false,
}: AccountsSidebarProps) {
  const { language } = useDashboard();
  const t = useTranslation(language);

  const isPositive = changePercentage >= 0;

  return (
    <div
      className={cn(
        'flex flex-col rounded-[1.15rem] border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm sm:rounded-2xl',
        /* Desktop: өндөр тогтмол, жагсаалт дотор scroll */
        'lg:h-full lg:min-h-0 lg:overflow-hidden',
        /* Mobile: өндөр агуулгын дагуу — бүх тойм нэг удаагийн гадна scroll-оор бүрэн харагдана */
        'max-lg:h-auto max-lg:overflow-visible',
      )}
    >
      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        <>
          {/* ── Total balance header ── */}
          <div className="relative shrink-0 overflow-hidden px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
            {/* ambient glow */}
            <div
              className="pointer-events-none absolute -top-6 left-0 h-24 w-full opacity-20 blur-3xl"
              style={{
                background: isPositive
                  ? 'radial-gradient(ellipse at 30% 0%, #10b981, transparent 65%)'
                  : 'radial-gradient(ellipse at 30% 0%, #f43f5e, transparent 65%)',
              }}
            />

            <div className="relative z-10">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/35 sm:text-[9px] lg:text-[10px]">
                {t('accountsSidebarTotalBalance')}
              </p>

              <p className="mt-1 text-[1.35rem] font-black leading-none tracking-tight text-white tabular-nums min-[380px]:text-[1.45rem] sm:mt-1.5 sm:text-[1.65rem] md:text-[28px]">
                {formatCurrency(totalBalance, 'MNT')}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-1 sm:mt-2 sm:gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-black sm:px-2 sm:text-[10px]',
                    isPositive
                      ? 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400'
                      : 'border-rose-500/25 bg-rose-500/[0.08] text-rose-400',
                  )}
                >
                  <span className="material-symbols-outlined text-[11px] sm:text-[12px]">
                    {isPositive ? 'trending_up' : 'trending_down'}
                  </span>
                  {isPositive ? '+' : ''}{changePercentage}%
                </span>
                <span className="text-[9px] leading-snug text-white/35 sm:text-[10px] lg:text-[11px]">
                  {t('accountsSidebarChange')}: {formatCurrency(totalChange, 'MNT')}
                </span>
              </div>
            </div>

            {/* bottom divider */}
            <div className="absolute bottom-0 inset-x-4 h-px bg-white/[0.06] sm:inset-x-5" />
          </div>

          {/* ── Account groups: desktop дотор scroll; mobile дээр бүхэлд нь хуудас scroll ── */}
          <div
            className={cn(
              'px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4',
              'lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain',
              'max-lg:flex-none max-lg:overflow-visible',
            )}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}
          >
            {accountGroups.map((group) => (
              <AccountGroupSection
                key={group.type}
                group={group}
                selectedAccount={selectedAccount}
                onSelectAccount={onSelectAccount}
                groupLabel={groupHeading(group, t)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}