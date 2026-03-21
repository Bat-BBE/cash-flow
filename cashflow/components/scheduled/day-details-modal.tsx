// components/scheduled/day-details-modal.tsx
'use client';

import { CalendarDay, ScheduledBill, ScheduledIncome } from './types';
import { formatMnFullDate } from '@/lib/calendar-locale-mn';
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
  /** loan.json валют (MNT) */
  currency?: string;
  /** Open add flow for this day (saves to localStorage in parent). */
  onAddBill?: () => void;
  onAddIncome?: () => void;
}

export function DayDetailsModal({
  open,
  onOpenChange,
  day,
  onBillClick,
  currency = 'MNT',
  onAddBill,
  onAddIncome,
}: DayDetailsModalProps) {
  if (!day) return null;

  const loans = day.loanPayments ?? [];
  const totalBills = day.bills.reduce((sum, b) => sum + b.amount, 0);
  const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalIncome = day.income.reduce((sum, i) => sum + i.amount, 0);
  const totalOutgoing = totalBills + totalLoans;
  const netChange = totalIncome - totalOutgoing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2533] border-slate-700 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {formatMnFullDate(new Date(day.date))}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-navy-dark/60 p-3 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Төлбөр</p>
              <p className="text-lg font-bold text-red-400">
                {formatCurrency(totalBills, currency)}
              </p>
            </div>
            <div className="bg-navy-dark/60 p-3 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Зээл</p>
              <p className="text-lg font-bold text-violet-300">
                {formatCurrency(totalLoans, currency)}
              </p>
            </div>
            <div className="bg-navy-dark/60 p-3 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Орлого</p>
              <p className="text-lg font-bold text-secondary">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>
            <div className="bg-navy-dark/60 p-3 rounded-xl">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Цэвэр</p>
              <p className={cn(
                "text-lg font-bold",
                netChange >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {netChange >= 0 ? '+' : ''}{formatCurrency(netChange, currency)}
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
                      -{formatCurrency(bill.amount, currency)}
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
                      +{formatCurrency(income.amount, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Зээлийн сарын төлөлт (loan.json) */}
          {loans.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-400 text-sm">account_balance</span>
                Зээлийн төлөлт ({loans.length})
              </h4>
              <div className="space-y-2">
                {loans.map((lp) => (
                  <div
                    key={lp.id}
                    className="flex items-center justify-between p-3 bg-navy-dark/60 rounded-xl border border-violet-500/15"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0"
                        style={lp.color ? { color: lp.color } : undefined}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {lp.icon}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{lp.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{lp.lender}</p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        'text-sm font-bold shrink-0',
                        lp.status === 'overdue' ? 'text-amber-400' : 'text-violet-300',
                      )}
                    >
                      -{formatCurrency(lp.amount, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No events */}
          {day.bills.length === 0 && day.income.length === 0 && loans.length === 0 && (
            <div className="text-center py-6">
              <span className="material-symbols-outlined mb-3 text-5xl text-slate-600">
                event_busy
              </span>
              <p className="text-slate-400">No scheduled events for this day</p>
            </div>
          )}

          {/* Add bill / income for this day → persisted in browser localStorage */}
          {(onAddBill || onAddIncome) && (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
              {onAddBill && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-violet-500/40 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 hover:text-white"
                  onClick={() => onAddBill()}
                >
                  <span className="material-symbols-outlined mr-2 text-sm">receipt_long</span>
                  Төлбөр нэмэх
                </Button>
              )}
              {onAddIncome && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 hover:text-white"
                  onClick={() => onAddIncome()}
                >
                  <span className="material-symbols-outlined mr-2 text-sm">payments</span>
                  Орлого нэмэх
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
   </Dialog>
  );
}