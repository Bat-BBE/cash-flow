'use client';

import { Account } from './types';
import { cn } from '@/lib/utils'; 
import { formatCurrency } from '@/lib/utils'; 
import { AccountActions } from './account-actions';
import { AccountChart } from './account-chart';
import { AccountActivity } from './account-activity';

interface AccountDetailsProps {
  account: Account | null;
  onTransfer: () => void;
  onAddTransaction: () => void;
  onPeriodChange: (period: string) => void;
  selectedPeriod?: string;
}

export function AccountDetails({
  account,
  onTransfer,
  onAddTransaction,
  onPeriodChange,
  selectedPeriod = '1M'
}: AccountDetailsProps) {
  if (!account) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-brand-muted mb-4">
              account_balance
            </span>
            <p className="text-brand-muted">Select an account to view details</p>
          </div>
        </div>
      </div>
    );
  }

  const periods = ['1W', '1M', '3M', '1Y'];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{account.name}</h1>
                {account.active && (
                  <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-black uppercase rounded border border-success/20">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-muted">
                {account.institution || 'Financial Institution'} 
                {account.accountNumber && ` • Account ending in ${account.accountNumber}`}
              </p>
            </div>
            
            {/* <AccountActions
              onTransfer={onTransfer}
              onAddTransaction={onAddTransaction}
            /> */}
          </div>

          {/* Balance and Period Selector */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-brand-muted uppercase mb-1">
                Available Balance
              </p>
              <p className="text-4xl font-black text-white">
                {formatCurrency(account.balance, account.currency || 'MNT')}
              </p>
              <p className="text-[10px] text-brand-muted mt-1">
                Updated just now
              </p>
            </div>
            
            <div className="flex bg-brand-card p-1 rounded-xl border border-white/5">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => onPeriodChange(period)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold transition-all",
                    selectedPeriod === period
                      ? 'bg-brand-primary text-white rounded-lg'
                      : 'text-brand-muted hover:text-white'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <AccountChart
          monthlyAverage={41000000}
          interestAccrued={152400}
          period={selectedPeriod}
        />

        {/* Activity Table */}
        <AccountActivity accountId={account.id} />
      </div>
    </div>
  );
}