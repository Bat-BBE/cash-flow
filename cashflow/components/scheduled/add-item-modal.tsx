// components/scheduled/add-item-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDateForInputLocal } from '@/lib/utils';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'bill' | 'income';
  onAdd: (data: any) => void;
  /** When set (e.g. from calendar day), pre-fills the date field. */
  initialDate?: string | null;
}

const BILL_ICONS = [
  'wifi', 'electric_bolt', 'home', 'movie', 'phone_iphone',
  'water_drop', 'local_gas_station', 'credit_card', 'school',
  'fitness_center', 'pets', 'car_rental', 'health_and_safety'
];

const INCOME_ICONS = [
  'work', 'storefront', 'trending_up', 'payments',
  'account_balance', 'real_estate_agent', 'stockpot',
  'psychology', 'design_services', 'business_center'
];

const BILL_CATEGORIES = [
  'Internet', 'Utilities', 'Housing', 'Entertainment', 'Phone',
  'Water', 'Gas', 'Credit Card', 'Education', 'Fitness',
  'Pets', 'Car', 'Healthcare'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Business',
  'Rental', 'Dividend', 'Interest', 'Gift'
];

export function AddItemModal({
  open,
  onOpenChange,
  type,
  onAdd,
  initialDate = null,
}: AddItemModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState(type === 'bill' ? 'wifi' : 'work');
  const [status, setStatus] = useState(type === 'bill' ? 'scheduled' : 'estimated');

  const isBill = type === 'bill';
  const icons = isBill ? BILL_ICONS : INCOME_ICONS;
  const categories = isBill ? BILL_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (!open) return;
    setDate(initialDate ?? formatDateForInputLocal(new Date()));
  }, [open, initialDate, type]);

  const handleSubmit = () => {
    onAdd({
      name,
      amount: parseFloat(amount),
      date,
      category,
      icon,
      status,
      color: isBill ? '#3B82F6' : '#2dd4bf'
    });

    // Reset form
    setName('');
    setAmount('');
    setDate('');
    setCategory('');
    setIcon(isBill ? 'wifi' : 'work');
    setStatus(isBill ? 'scheduled' : 'estimated');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2533] border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Add {isBill ? 'Bill' : 'Income'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {isBill ? 'Bill Name' : 'Income Source'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBill ? 'e.g. Electric Bill' : 'e.g. Monthly Salary'}
              className="bg-[#2b3550] border-slate-700 text-white"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 bg-[#2b3550] border-slate-700 text-white"
                step="0.01"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#2b3550] border-slate-700 text-white [color-scheme:dark]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#2b3550] border-slate-700 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="hover:bg-white/5">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Icon
            </label>
            <div className="grid grid-cols-7 gap-2">
              {icons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                    icon === iconName
                      ? isBill
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-white'
                      : 'bg-[#2b3550] text-slate-400 hover:bg-slate-700'
                  )}
                >
                  <span className="material-symbols-outlined">{iconName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          {isBill && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[#2b3550] border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !amount || !date || !category}
            className={isBill 
              ? 'bg-primary hover:bg-primary/80 text-white'
              : 'bg-secondary hover:bg-secondary/80 text-white'
            }
          >
            Add {isBill ? 'Bill' : 'Income'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}