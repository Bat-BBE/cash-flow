'use client';

import { Account, AccountGroup } from './types';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface AccountsSidebarProps {
  accountGroups: AccountGroup[];
  selectedAccount: Account | null;
  totalBalance: number;
  totalChange: number;
  changePercentage: number;
  onSelectAccount: (account: Account) => void;
  isLoading?: boolean;
}

function AccountCard({ 
  account, 
  isSelected, 
  onClick 
}: { 
  account: Account; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const isNegative = account.balance < 0;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl mb-2 cursor-pointer transition-all',
        isSelected
          ? 'bg-brand-primary/10 border-2 border-brand-primary/40 shadow-lg'
          : 'bg-brand-card border border-brand-border/20 hover:border-brand-primary/50'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-brand-muted">{account.name}</p>
        {account.active && (
          <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded-full uppercase font-bold">
            Active
          </span>
        )}
      </div>
      <p className={cn(
        "text-base font-bold",
        isNegative ? 'text-red-400' : 'text-white'
      )}>
        {formatCurrency(account.balance, account.currency || 'MNT')}
      </p>
      {account.accountNumber && (
        <p className="text-[8px] text-brand-muted mt-1">
          •••• {account.accountNumber}
        </p>
      )}
    </div>
  );
}

function AccountGroupSection({ 
  group, 
  selectedAccount, 
  onSelectAccount 
}: { 
  group: AccountGroup; 
  selectedAccount: Account | null; 
  onSelectAccount: (account: Account) => void;
}) {
  if (group.accounts.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-brand-muted flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-sm">{group.icon}</span>
        {group.title}
        <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded-full">
          {group.accounts.length}
        </span>
      </h3>
      {group.accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          isSelected={selectedAccount?.id === account.id}
          onClick={() => onSelectAccount(account)}
        />
      ))}
    </div>
  );
}

export function AccountsSidebar({
  accountGroups,
  selectedAccount,
  totalBalance,
  totalChange,
  changePercentage,
  onSelectAccount,
  isLoading = false
}: AccountsSidebarProps) {
  if (isLoading) {
    return (
      <div className="w-full sm:w-72 lg:w-80 border-r border-white/5 overflow-y-auto custom-scrollbar bg-brand-sidebar/30 rounded-2xl sm:rounded-none sm:border-r">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/5 rounded w-24 mb-2"></div>
            <div className="h-8 bg-white/5 rounded w-32 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-6">
                <div className="h-4 bg-white/5 rounded w-20 mb-3"></div>
                <div className="h-20 bg-white/5 rounded-xl mb-2"></div>
                <div className="h-20 bg-white/5 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-72 lg:w-80 border-r border-white/5 overflow-y-auto custom-scrollbar bg-brand-sidebar/30 rounded-2xl sm:rounded-none sm:border-r">
      <div className="p-4 sm:p-6">
        {/* Total Overview */}
        <div className="mb-6">
          <p className="text-xs font-bold text-brand-muted uppercase mb-1">
            Total Balance
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">
              {formatCurrency(totalBalance, 'MNT')}
            </span>
            <span className="text-brand-primary text-xs font-bold mb-1 flex items-center">
              <span className="material-symbols-outlined text-sm">
                {changePercentage >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              {changePercentage >= 0 ? '+' : ''}{changePercentage}%
            </span>
          </div>
          <p className="text-[8px] text-brand-muted mt-1">
            Change: {formatCurrency(totalChange, 'MNT')}
          </p>
        </div>

        {/* Account Groups */}
        {accountGroups.map((group) => (
          <AccountGroupSection
            key={group.type}
            group={group}
            selectedAccount={selectedAccount}
            onSelectAccount={onSelectAccount}
          />
        ))}
      </div>
    </div>
  );
}