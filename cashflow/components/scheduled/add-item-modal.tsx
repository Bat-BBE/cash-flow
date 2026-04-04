// components/scheduled/add-item-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn, formatDateForInputLocal } from '@/lib/utils';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'bill' | 'income';
  onAdd: (data: any) => void;
  initialDate?: string | null;
}

const BILL_ICONS = [
  'wifi', 'electric_bolt', 'home', 'movie', 'phone_iphone',
  'water_drop', 'local_gas_station', 'credit_card', 'school',
  'fitness_center', 'pets', 'car_rental', 'health_and_safety',
];

const INCOME_ICONS = [
  'work', 'storefront', 'trending_up', 'payments',
  'account_balance', 'real_estate_agent', 'stockpot',
  'psychology', 'design_services', 'business_center',
];

const BILL_CATEGORIES = [
  'Интернет', 'Цахилгаан/Дулаан', 'Орон сууц', 'Үзвэр үйлчилгээ',
  'Гар утас', 'Ус', 'Хий', 'Зээлийн карт', 'Боловсрол',
  'Фитнес', 'Тэжээвэр амьтан', 'Автомашин', 'Эрүүл мэнд',
];

const INCOME_CATEGORIES = [
  'Цалин', 'Freelance', 'Хөрөнгө оруулалт', 'Бизнес',
  'Түрээс', 'Ногдол ашиг', 'Хүү', 'Бэлэг',
];

const BILL_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Төлөвлөсөн',
  pending:   'Хүлээгдэж буй',
  paid:      'Төлсөн',
};

export function AddItemModal({
  open, onOpenChange, type, onAdd, initialDate = null,
}: AddItemModalProps) {
  const [name,     setName]     = useState('');
  const [amount,   setAmount]   = useState('');
  const [date,     setDate]     = useState('');
  const [category, setCategory] = useState('');
  const [icon,     setIcon]     = useState(type === 'bill' ? 'wifi' : 'work');
  const [status,   setStatus]   = useState(type === 'bill' ? 'scheduled' : 'estimated');

  const isBill     = type === 'bill';
  const icons      = isBill ? BILL_ICONS : INCOME_ICONS;
  const categories = isBill ? BILL_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (!open) return;
    setDate(initialDate ?? formatDateForInputLocal(new Date()));
  }, [open, initialDate, type]);

  const handleSubmit = () => {
    onAdd({
      name, amount: parseFloat(amount), date,
      category, icon, status,
      color: isBill ? '#3B82F6' : '#2dd4bf',
    });
    setName(''); setAmount(''); setDate('');
    setCategory(''); setIcon(isBill ? 'wifi' : 'work');
    setStatus(isBill ? 'scheduled' : 'estimated');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92dvh,640px)] overflow-y-auto rounded-2xl border border-white/10 bg-brand-card text-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base font-black text-white sm:text-lg">
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center',
              isBill ? 'bg-rose-500/15' : 'bg-emerald-500/15',
            )}>
              <span className={cn(
                'material-symbols-outlined text-[17px]',
                isBill ? 'text-rose-400' : 'text-emerald-400',
              )}>
                {isBill ? 'receipt_long' : 'trending_up'}
              </span>
            </div>
            {isBill ? 'Төлбөр нэмэх' : 'Орлого нэмэх'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Нэр */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              {isBill ? 'Төлбөрийн нэр' : 'Орлогын эх үүсвэр'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBill ? 'Жн: Цахилгааны төлбөр' : 'Жн: Сарын цалин'}
              className="rounded-xl border-white/10 bg-brand-bg/50 text-white placeholder:text-white/25 focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Дүн */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Дүн (₮)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">₮</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="rounded-xl border-white/10 bg-brand-bg/50 pl-8 text-white placeholder:text-white/25 focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20"
                step="1"
              />
            </div>
          </div>

          {/* Огноо */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Огноо
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-white/10 bg-brand-bg/50 text-white [color-scheme:dark] focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Ангилал */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Ангилал
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl border-white/10 bg-brand-bg/50 text-white focus:ring-2 focus:ring-brand-primary/20">
                <SelectValue placeholder="Ангилал сонгох" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 bg-brand-card text-white">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="hover:bg-white/[0.05] rounded-xl focus:bg-white/[0.05]">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Дүрс */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Дүрс
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {icons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center transition-all border',
                    icon === iconName
                      ? isBill
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:bg-white/[0.07] hover:text-white/60',
                  )}
                >
                  <span className="material-symbols-outlined text-[17px]">{iconName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Статус — зөвхөн төлбөрт */}
          {isBill && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                Статус
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl border-white/10 bg-brand-bg/50 text-white focus:ring-2 focus:ring-brand-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-brand-card text-white">
                  {Object.entries(BILL_STATUS_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val} className="hover:bg-white/[0.05] rounded-xl focus:bg-white/[0.05]">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white/40 hover:text-white hover:bg-white/[0.05] rounded-xl"
          >
            Болих
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !amount || !date || !category}
            className={cn(
              'rounded-xl font-black px-5 transition-all',
              isBill
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 disabled:opacity-30'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 disabled:opacity-30',
            )}
          >
            <span className="material-symbols-outlined text-[15px] mr-1.5">add</span>
            {isBill ? 'Төлбөр нэмэх' : 'Орлого нэмэх'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}