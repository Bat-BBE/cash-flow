'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db, BASE_PATH } from '@/lib/firebase';
import { Account, Transaction, AccountStats, AccountGroup } from '@/components/accounts/types';

/* ─── useAccountData ─────────────────────────────────────────────── */
type RawAccount = {
  id: string; name: string; type: string; balance: number;
  currency: string; icon: string; institution: string;
  accountNumber?: string; active?: boolean; color?: string;
};

type RawTx = {
  date: string; debit: number; credit: number;
  description: string; category: string; merchant: string | null;
  type: 'income' | 'expense';
};

export function useAccountData(initialAccountId?: string) {
  const [accounts,         setAccounts]         = useState<Account[]>([]);
  const [transactions,     setTransactions]     = useState<Transaction[]>([]);
  const [selectedAccount,  setSelectedAccount]  = useState<Account | null>(null);
  const [stats,            setStats]            = useState<AccountStats | null>(null);
  const [loading,          setLoading]          = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Accounts
      const accSnap = await get(ref(db, `${BASE_PATH}/accounts`));
      if (!accSnap.exists()) { setLoading(false); return; }

      const rawAccs: Record<string, RawAccount> = accSnap.val();
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
      setAccounts(accList);

      // Stats
      const totalBalance    = accList.reduce((s, a) => s + a.balance, 0);
      const prevBalance     = totalBalance * 0.976; // ~2.4% өөрчлөлт
      setStats({
        totalBalance,
        totalChange:       Math.round(totalBalance - prevBalance),
        changePercentage:  2.4,
        monthlyAverage:    Math.round(totalBalance / 12),
        interestAccrued:   Math.round(accList.filter((a) => ['SAVINGS','BANK'].includes(a.type)).reduce((s, a) => s + a.balance * 0.015 / 12, 0)),
        activeAccounts:    accList.filter((a) => a.active).length,
      });

      // Default selected account
      const def = accList.find((a) => a.id === initialAccountId)
        ?? accList.find((a) => a.active)
        ?? accList[0];
      setSelectedAccount(def);

      // Transactions (сүүлийн 20)
      const txSnap = await get(ref(db, `${BASE_PATH}/transactions`));
      if (txSnap.exists()) {
        const rawTxs: Record<string, RawTx> = txSnap.val();
        const txList: Transaction[] = Object.entries(rawTxs)
          .filter(([, t]) => t.date && t.date !== 'Нийт дүн:')
          .map(([id, t]) => ({
            id,
            name:        t.description || '—',
            date:        t.date.split(' ')[0],
            amount:      Math.abs(t.debit !== 0 ? t.debit : t.credit),
            type:        t.type ?? (t.debit !== 0 ? 'expense' : 'income'),
            icon:        t.type === 'income' ? 'trending_up' : 'shopping_bag',
            category:    t.category?.toUpperCase() ?? 'OTHER',
            description: t.description,
            accountId:   '5466262686',
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20);
        setTransactions(txList);
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
      { title: 'cash',              type: 'CASH',       icon: 'payments',         accounts: [] },
      { title: 'bank',              type: 'BANK',       icon: 'account_balance',  accounts: [] },
      { title: 'cards',             type: 'CARDS',      icon: 'credit_card',      accounts: [] },
      { title: 'savingsInvestments',type: 'SAVINGS',    icon: 'savings',          accounts: [] },
      { title: 'investments',       type: 'INVESTMENT', icon: 'trending_up',      accounts: [] },
    ];
    accounts.forEach((acc) => {
      const g = groups.find((g) => g.type === acc.type);
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