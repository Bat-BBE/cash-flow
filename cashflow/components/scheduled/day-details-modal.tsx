// components/scheduled/day-details-modal.tsx
'use client';

import { CalendarDay, ScheduledBill, ScheduledIncome } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DayDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: CalendarDay | null;
  onBillClick?: (bill: ScheduledBill) => void;
}

export function DayDetailsModal({ open, onOpenChange, day, onBillClick }: DayDetailsModalProps) {
  if (!day) return null;

  const totalBills = day.bills.reduce((sum, b) => sum + b.amount, 0);
  const totalIncome = day.income.reduce((sum, i) => sum + i.amount, 0);
  const netChange = totalIncome - totalBills;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2533] border-slate-700 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {new Date(day.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-navy-dark/60 p-3 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Bills</p>
              <p className="text-lg font-bold text-red-400">
                {formatCurrency(totalBills, 'USD')}
              </p>
            </div>
            <div className="bg-navy-dark/60 p-3 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Income</p>
              <p className="text-lg font-bold text-secondary">
                {formatCurrency(totalIncome, 'USD')}
              </p>
            </div>
            <div className="bg-navy-dark/60 p-3 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Net</p>
              <p className={cn(
                "text-lg font-bold",
                netChange >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {netChange >= 0 ? '+' : ''}{formatCurrency(netChange, 'USD')}
              </p>
            </div>
          </div>

          {/* Bills */}
          {day.bills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-sm">outbound</span>
                Bills ({day.bills.length})
              </h4>
              <div className="space-y-2">
                {day.bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 bg-navy-dark/60 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-400 text-sm">
                          {bill.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{bill.name}</p>
                        <p className="text-[10px] text-slate-500">{bill.category}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-red-400">
                      -{formatCurrency(bill.amount, 'USD')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Income */}
          {day.income.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">inbound</span>
                Income ({day.income.length})
              </h4>
              <div className="space-y-2">
                {day.income.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 bg-navy-dark/60 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-sm">
                          {income.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{income.name}</p>
                        <p className="text-[10px] text-slate-500">{income.category}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-secondary">
                      +{formatCurrency(income.amount, 'USD')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No events */}
          {day.bills.length === 0 && day.income.length === 0 && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">
                event_busy
              </span>
              <p className="text-slate-400">No scheduled events for this day</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}