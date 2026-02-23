// components/transactions/add-transaction-modal.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;  // open -> isOpen болгох
  onClose: () => void;  // close -> onClose болгох, onOpenChange-ыг устгах
  onAdd: (transaction: any) => void;
  accounts: string[];
  categories: string[];
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onAdd,
  accounts,
  categories,
}: AddTransactionModalProps) {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onAdd({
      date,
      category,
      account,
      description,
      amount: parseFloat(amount),
      type,
      status: 'completed',
    });
    
    // Reset form
    setType('expense');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setAccount('');
    setDescription('');
    
    // Modal хаах
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1e2533] border-slate-700 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">New Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Type */}
          <div className="flex p-1 bg-black/20 rounded-xl border border-white/5">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all",
                  type === t
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Amount
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-500">
                $
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/20 border border-white/5 rounded-xl py-4 pl-10 text-3xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                step="0.01"
              />
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Date
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                  calendar_today
                </span>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Category
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                  label
                </span>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 py-2.5 text-sm text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Account
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                credit_card
              </span>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 py-2.5 text-sm text-white">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
                  {accounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent text-white resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 text-slate-300 border border-white/10 text-sm font-bold hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || !category || !account}
            className="flex-[2] py-3 bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/30"
          >
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}