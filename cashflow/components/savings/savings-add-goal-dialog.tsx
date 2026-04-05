'use client';

import { useState } from 'react';
import type { SavingsGoal } from './types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function SavingsAddGoalDialog({
  open,
  onOpenChange,
  onSave,
  labels,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (g: Omit<SavingsGoal, 'id'>) => void;
  labels: {
    title: string;
    name: string;
    target: string;
    deadline: string;
    save: string;
    cancel: string;
  };
}) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tVal = Number(String(target).replace(/\s/g, '').replace(/,/g, ''));
    if (!name.trim() || !deadline || !Number.isFinite(tVal) || tVal <= 0) return;
    onSave({
      nameMn: name.trim(),
      nameEn: name.trim(),
      current: 0,
      target: Math.round(tVal),
      deadline,
      icon: 'flag',
      accent: 'violet',
    });
    setName('');
    setTarget('');
    setDeadline('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[min(90vh,520px)] overflow-y-auto border border-white/[0.08] bg-[#141824] p-4 text-white shadow-2xl sm:max-w-[26rem] sm:p-5',
        )}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-left text-sm font-semibold tracking-tight text-white">{labels.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="sg-name" className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {labels.name}
              </Label>
              <Input
                id="sg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-white/[0.08] bg-black/35 text-sm text-white placeholder:text-white/25"
                placeholder=""
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sg-target" className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {labels.target}
              </Label>
              <Input
                id="sg-target"
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="h-10 border-white/[0.08] bg-black/35 text-sm text-white placeholder:text-white/25"
                placeholder="5000000"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sg-deadline" className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {labels.deadline}
              </Label>
              <Input
                id="sg-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-10 border-white/[0.08] bg-black/35 text-sm text-[color-scheme:dark]"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-5 flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full border-white/12 bg-transparent text-xs text-slate-300 hover:bg-white/[0.06] sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              {labels.cancel}
            </Button>
            <Button type="submit" className="h-9 w-full bg-brand-primary text-xs font-semibold text-white hover:bg-brand-primary/90 sm:w-auto">
              {labels.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
