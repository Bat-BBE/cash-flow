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
import { useDashboardOptional } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { DEFAULT_LANGUAGE } from '@/lib/types';

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
  const dashboard = useDashboardOptional();
  const language = dashboard?.language ?? DEFAULT_LANGUAGE;
  const tr = useTranslation(language);

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
      <DialogContent className="bg-[#0f172a] text-white w-[95vw] max-w-md sm:max-w-lg p-0 overflow-hidden border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/40">
        {/* Top gradient header */}
        <div className="relative px-3 sm:px-6 pt-3 pb-2 sm:pt-4 sm:pb-3 border-b border-white/5 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent">
          <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08)_0,_transparent_55%)]" />
          <DialogHeader className="relative z-10 p-0">
            <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-base sm:text-lg text-primary bg-black/20 rounded-xl p-1.5 border border-white/10">
                add_card
              </span>
              <span>{tr('newTransactionTitle')}</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-3 sm:space-y-5 px-3 sm:px-6 py-3 sm:py-4 max-h-[65vh] sm:max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* Transaction Type */}
          <div className="flex p-1 bg-black/20 rounded-xl border border-white/5 text-xs sm:text-sm">
            {(['expense', 'income', 'transfer'] as const).map((txType) => (
              <button
                key={txType}
                onClick={() => setType(txType)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all",
                  type === txType
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {txType === 'expense' ? tr('tabExpense') : txType === 'income' ? tr('tabIncome') : tr('tabTransfer')}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {tr('amountLabel')}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-semibold text-slate-500">
                $
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 sm:py-4 pl-10 text-2xl sm:text-3xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent text-white shadow-inner"
                step="0.01"
              />
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {tr('date')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                  calendar_today
                </span>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-10 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {tr('category')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                  label
                </span>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-black/20 border border-white/10 rounded-2xl pl-10 py-2.5 text-sm text-white">
                    <SelectValue placeholder={tr('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#020617] border-slate-700 text-white rounded-2xl">
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
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {tr('accountLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                credit_card
              </span>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="w-full bg-black/20 border border-white/10 rounded-2xl pl-10 py-2.5 text-sm text-white">
                  <SelectValue placeholder={tr('selectAccount')} />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-slate-700 text-white rounded-2xl">
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
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {tr('descriptionLabel')}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={tr('descriptionPlaceholder')}
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent text-white resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 px-3 sm:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4 border-t border-white/5 bg-black/20">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 bg-white/5 text-slate-300 border border-white/10 text-sm font-bold hover:bg-white/10"
          >
            {tr('cancelBtn')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || !category || !account}
            className="w-full sm:flex-[2] py-3 bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/30"
          >
            {tr('saveTransactionBtn')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}