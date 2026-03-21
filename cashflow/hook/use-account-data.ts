'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db, BASE_PATH, DEFAULT_ACCOUNT_ID } from '@/lib/firebase';
import { Account, Transaction, AccountStats, AccountGroup } from '@/components/accounts/types';
import loanFile from '@/loan.json';

type LoanJsonRow = {
  id: string;
  name: string;
  lender: string;
  balance: number;
  icon: string;
  status: string;
};

function buildLoanAccounts(currency: string): Account[] {
  const rows = (loanFile as { loans?: LoanJsonRow[] }).loans ?? [];
  return rows.map((loan) => ({
    id: loan.id,
    name: loan.name,
    type: 'LOAN' as const,
    /** Negative = liability (owed). */
    balance: -Math.abs(loan.balance),
    currency,
    icon: loan.icon || 'payments',
    institution: loan.lender,
    active: loan.status === 'active',
  }));
}

/* ─── useAccountData ─────────────────────────────────────────────── */
type RawAccount = {
  id: string; name: string; type: string; balance: number;
  currency: string; icon: string; institution: string;
  accountNumber?: string; active?: boolean; color?: string;
};

type RawTx = {
  date: string;
  debit: number;
  credit: number;
  description: string;
  category: string;
  merchant: string | null;
  type?: 'income' | 'expense';
  /** When missing, row is treated as belonging to the default checking account. */
  accountId?: string;
};

function rawRowsToTransactions(
  rawTxs: Record<string, RawTx>,
  defaultAccountId: string,
): Transaction[] {
  const rows: Transaction[] = [];
  for (const [id, t] of Object.entries(rawTxs)) {
    if (!t.date || t.date === 'Нийт дүн:') continue;
    const baseDate = t.date.split(' ')[0];
    const desc = t.description ?? '';
    const aid = t.accountId ?? defaultAccountId;

    const hasDebit = Math.abs(t.debit) > 0;
    const hasCredit = Math.abs(t.credit) > 0;

    if (hasDebit) {
      rows.push({
        id: `${id}-d`,
        name: desc || 'Зарлага',
        date: baseDate,
        amount: Math.abs(t.debit),
        type: 'expense',
        icon: 'shopping_bag',
        category: (t.category || 'Бусад зарлага').toUpperCase(),
        description: desc,
        accountId: aid,
      });
    }
    if (hasCredit) {
      rows.push({
        id: `${id}-c`,
        name: desc || 'Орлого',
        date: baseDate,
        amount: Math.abs(t.credit),
        type: 'income',
        icon: 'trending_up',
        category: (t.category || 'Бусад орлого').toUpperCase(),
        description: desc,
        accountId: aid,
      });
    }
  }
  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function useAccountData(initialAccountId: string = DEFAULT_ACCOUNT_ID) {
  const [accounts,         setAccounts]         = useState<Account[]>([]);
  const [transactions,     setTransactions]     = useState<Transaction[]>([]);
  const [selectedAccount,  setSelectedAccount]  = useState<Account | null>(null);
  const [stats,            setStats]            = useState<AccountStats | null>(null);
  const [loading,          setLoading]          = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const loanCurrency = (loanFile as { currency?: string }).currency ?? 'MNT';
      const loanAccounts = buildLoanAccounts(loanCurrency);

      // Accounts (Firebase — may be empty)
      const accSnap = await get(ref(db, `${BASE_PATH}/accounts`));
      const rawAccs: Record<string, RawAccount> = accSnap.exists() ? accSnap.val() : {};
      const accList: Account[] = Object.values(rawAccs).map((a) => ({
        id:            a.id,
        name:          a.name,
        type:          a.type as Account['type'],
        balance:       a.balance,
        currency:      a.currency,
        icon:          a.icon,
        institution:   a.institution,
        accountNumber: a.accountNumber,
        active:        a.active,
        color:         a.color,
      }));

      /** Drop cash, cards, savings & investment accounts; add loans from loan.json. */
      const accListFiltered = accList.filter(
        (a) =>
          a.type !== 'CASH' &&
          a.type !== 'CARDS' &&
          a.type !== 'SAVINGS' &&
          a.type !== 'INVESTMENT',
      );
      const merged = [...accListFiltered, ...loanAccounts];
      setAccounts(merged);

      // Stats (includes loan liabilities as negative balances)
      const totalBalance = merged.reduce((s, a) => s + a.balance, 0);
      const prevBalance = totalBalance * 0.976;
      setStats({
        totalBalance,
        totalChange: Math.round(totalBalance - prevBalance),
        changePercentage: 2.4,
        monthlyAverage: Math.round(merged.length ? totalBalance / 12 : 0),
        interestAccrued: Math.round(
          merged
            .filter((a) => a.type === 'BANK')
            .reduce((s, a) => s + a.balance * 0.015 / 12, 0),
        ),
        activeAccounts: merged.filter((a) => a.active).length,
      });

      const def =
        merged.find((a) => a.id === initialAccountId) ??
        merged.find((a) => a.id === DEFAULT_ACCOUNT_ID) ??
        merged.find((a) => a.active) ??
        merged[0] ??
        null;
      setSelectedAccount(def);

      const txSnap = await get(ref(db, `${BASE_PATH}/transactions`));
      if (txSnap.exists()) {
        const rawTxs: Record<string, RawTx> = txSnap.val();
        setTransactions(rawRowsToTransactions(rawTxs, DEFAULT_ACCOUNT_ID));
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('[useAccountData]', err);
    } finally {
      setLoading(false);
    }
  }, [initialAccountId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const selectAccount = (account: Account) => setSelectedAccount(account);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: `tx-${Date.now()}` };
    setTransactions((prev) => [newTx, ...prev]);
    if (selectedAccount) {
      const updated = accounts.map((a) =>
        a.id === selectedAccount.id
          ? { ...a, balance: transaction.type === 'income' ? a.balance + transaction.amount : a.balance - transaction.amount }
          : a
      );
      setAccounts(updated);
      setSelectedAccount(updated.find((a) => a.id === selectedAccount.id) ?? null);
    }
  };

  const transferMoney = (fromId: string, toId: string, amount: number) => {
    const updated = accounts.map((a) => {
      if (a.id === fromId) return { ...a, balance: a.balance - amount };
      if (a.id === toId)   return { ...a, balance: a.balance + amount };
      return a;
    });
    setAccounts(updated);
    if (selectedAccount) setSelectedAccount(updated.find((a) => a.id === selectedAccount.id) ?? null);
  };

  const accountGroups = (): AccountGroup[] => {
    const groups: AccountGroup[] = [
      { title: 'bank', type: 'BANK', icon: 'account_balance', accounts: [] },
      { title: 'loans', type: 'LOAN', icon: 'request_quote', accounts: [] },
    ];
    accounts.forEach((acc) => {
      const g = groups.find((gr) => gr.type === acc.type);
      if (g) g.accounts.push(acc);
    });
    return groups.filter((g) => g.accounts.length > 0);
  };

  return {
    accounts, transactions, selectedAccount, stats, loading,
    selectAccount, addTransaction, transferMoney,
    accountGroups: accountGroups(),
  };
}