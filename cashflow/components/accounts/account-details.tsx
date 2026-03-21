'use client';

import { Account, Transaction } from './types';
import { cn } from '@/lib/utils'; 
import { formatCurrency } from '@/lib/utils'; 
import { AccountActivity } from './account-activity';
import { LoanPaidHistory } from './loan-paid-history';
import { LoanPmtChart } from './loan-pmt-chart';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation, type TranslationKey } from '@/lib/translations';
import { ACCOUNT_PERIOD_IDS } from '@/lib/account-period';

function periodTranslationKey(period: string): TranslationKey {
  switch (period) {
    case '1W':
      return 'periodRange1W';
    case '1M':
      return 'periodRange1M';
    case '3M':
      return 'periodRange3M';
    case '1Y':
      return 'periodRange1Y';
    default:
      return 'periodRange1M';
  }
}

interface AccountDetailsProps {
  account: Account | null;
  /** Firebase-backed rows; filtered by account in AccountActivity */
  transactions: Transaction[];
  transactionsLoading?: boolean;
  onTransfer: () => void;
  onAddTransaction: () => void;
  onPeriodChange: (period: string) => void;
  selectedPeriod?: string;
}

export function AccountDetails({
  account,
  transactions,
  transactionsLoading = false,
  onTransfer,
  onAddTransaction,
  onPeriodChange,
  selectedPeriod = '1M'
}: AccountDetailsProps) {
  const { language } = useDashboard();
  const t = useTranslation(language);

  if (!account) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[260px] md:h-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-brand-muted mb-4">
              account_balance
            </span>
            <p className="text-brand-muted">{t('selectAccountToViewDetails')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{account.name}</h1>
              </div>
              <p className="text-sm text-brand-muted">
                {account.institution || t('financialInstitution')}
                {account.accountNumber &&
                  ` • ${t('accountEndingIn')} ${account.accountNumber}`}
              </p>
            </div>
          </div>

          {account.type === 'LOAN' ? (
            <div></div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div>
                <p className="text-xs font-bold text-brand-muted mb-1">
                  {t('availableBalance')}
                </p>
                <p className="text-4xl font-black text-white">
                  {formatCurrency(account.balance, account.currency || 'MNT')}
                </p>
                <p className="text-[10px] text-brand-muted mt-1">{t('updatedJustNow')}</p>
              </div>

              <div className="flex flex-wrap bg-brand-card p-1 rounded-xl border border-white/5 self-start sm:self-auto gap-0.5">
                {ACCOUNT_PERIOD_IDS.map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => onPeriodChange(period)}
                    className={cn(
                      'px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap',
                      selectedPeriod === period
                        ? 'bg-brand-primary text-white rounded-lg'
                        : 'text-brand-muted hover:text-white',
                    )}
                  >
                    {t(periodTranslationKey(period))}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {account.type === 'LOAN' && (
          <LoanPmtChart loanId={account.id} currency={account.currency || 'MNT'} />
        )}

        {account.type === 'LOAN' ? (
          <LoanPaidHistory loanId={account.id} currency={account.currency || 'MNT'} />
        ) : (
          <AccountActivity
            accountId={account.id}
            transactions={transactions}
            loading={transactionsLoading}
            currency={account.currency || 'MNT'}
            selectedPeriod={selectedPeriod}
          />
        )}
      </div>
    </div>
  );
}