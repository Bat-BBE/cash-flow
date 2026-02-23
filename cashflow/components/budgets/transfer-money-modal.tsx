// components/budgets/transfer-money-modal.tsx
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
import { Budget } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TransferMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgets: Budget[];
  onTransfer: (fromId: string, toId: string, amount: number) => void;
  initialBudget?: Budget | null;
}

export function TransferMoneyModal({
  open,
  onOpenChange,
  budgets,
  onTransfer,
  initialBudget
}: TransferMoneyModalProps) {
  const [fromBudgetId, setFromBudgetId] = useState(initialBudget?.id || '');
  const [toBudgetId, setToBudgetId] = useState('');
  const [amount, setAmount] = useState('25.00');

  const fromBudget = budgets.find(b => b.id === fromBudgetId);
  const toBudget = budgets.find(b => b.id === toBudgetId);

  const handleTransfer = () => {
    if (fromBudgetId && toBudgetId && amount) {
      onTransfer(fromBudgetId, toBudgetId, parseFloat(amount));
      onOpenChange(false);
      
      // Reset
      setFromBudgetId('');
      setToBudgetId('');
      setAmount('25.00');
    }
  };

  const quickAddAmounts = [10, 25, 50, 100];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2533] border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Move Money</DialogTitle>
          <p className="text-xs text-slate-400 font-medium">
            Reallocate funds between envelopes
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Envelope */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Source Envelope
            </label>
            <Select value={fromBudgetId} onValueChange={setFromBudgetId}>
              <SelectTrigger className="bg-[#2b3550] border-slate-700 text-white">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
                {budgets
                  .filter(b => b.remaining > 0)
                  .map(budget => (
                    <SelectItem key={budget.id} value={budget.id} className="hover:bg-white/5">
                      {budget.category} ({formatCurrency(budget.remaining, 'USD')} left)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Arrow */}
          <div className="flex justify-center -my-3 relative z-10">
            <div className="bg-primary size-10 rounded-full flex items-center justify-center border-4 border-[#1e2533] shadow-lg">
              <span className="material-symbols-outlined text-white text-lg font-bold">
                arrow_downward
              </span>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Destination
            </label>
            <Select value={toBudgetId} onValueChange={setToBudgetId}>
              <SelectTrigger className="bg-[#2b3550] border-slate-700 text-white">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
                {budgets
                  .filter(b => b.id !== fromBudgetId)
                  .map(budget => (
                    <SelectItem key={budget.id} value={budget.id} className="hover:bg-white/5">
                      {budget.category} 
                      {budget.remaining < 0 && ` (${formatCurrency(Math.abs(budget.remaining), 'USD')} over)`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Transfer Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#2b3550] border-slate-700 rounded-xl text-lg text-white py-3.5 pl-10 pr-4 font-bold"
                step="0.01"
                min="0"
                max={fromBudget?.remaining}
              />
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-[9px] text-slate-500 font-bold uppercase">Quick add:</p>
              <div className="flex gap-2">
                {quickAddAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="text-[9px] font-bold text-primary hover:underline uppercase"
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>

            {fromBudget && parseFloat(amount) > fromBudget.remaining && (
              <p className="text-[10px] text-red-400 mt-1">
                Amount exceeds available balance
              </p>
            )}
          </div>

          {/* Summary */}
          {fromBudget && toBudget && (
            <div className="bg-slate-800/50 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">From:</span>
                <span className="text-white font-bold">{fromBudget.category}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">To:</span>
                <span className="text-white font-bold">{toBudget.category}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-700">
                <span className="text-slate-400">Amount:</span>
                <span className="text-primary font-bold">${amount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!fromBudgetId || !toBudgetId || !amount || parseFloat(amount) <= 0}
            className="flex-1 bg-primary hover:bg-primary/80 text-white"
          >
            Confirm Transfer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}