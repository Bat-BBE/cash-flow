// components/budgets/add-budget-modal.tsx
'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/utils';

const BUDGET_ICONS = [
  'home', 'shopping_cart', 'movie', 'directions_car', 'bolt', 
  'shopping_bag', 'local_hospital', 'restaurant', 'school', 
  'flight', 'fitness_center', 'pets', 'phone_iphone', 'water_drop'
];

const BUDGET_CATEGORIES = [
  'Housing', 'Groceries', 'Leisure', 'Transport', 'Utilities',
  'Shopping', 'Healthcare', 'Dining', 'Education', 'Travel',
  'Fitness', 'Pets', 'Phone', 'Insurance'
];

interface AddBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (budget: any) => void;
}

export function AddBudgetModal({ open, onOpenChange, onAdd }: AddBudgetModalProps) {
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('home');
  const [limit, setLimit] = useState('');
  const [spent, setSpent] = useState('0');

  const handleSubmit = () => {
    onAdd({
      category,
      icon,
      limit: parseFloat(limit),
      spent: parseFloat(spent)
    });
    setCategory('');
    setIcon('home');
    setLimit('');
    setSpent('0');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2533] border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Create New Budget</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#2b3550] border-slate-700 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
                {BUDGET_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="hover:bg-white/5">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Icon
            </label>
            <div className="grid grid-cols-7 gap-2">
              {BUDGET_ICONS.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                    icon === iconName
                      ? 'bg-primary text-white'
                      : 'bg-[#2b3550] text-slate-400 hover:bg-slate-700'
                  )}
                >
                  <span className="material-symbols-outlined">{iconName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Monthly Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0.00"
                className="pl-8 bg-[#2b3550] border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Already Spent (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                type="number"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
                placeholder="0.00"
                className="pl-8 bg-[#2b3550] border-slate-700 text-white"
              />
            </div>
          </div>
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
            disabled={!category || !limit}
            className="bg-primary hover:bg-primary/80 text-white"
          >
            Create Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}