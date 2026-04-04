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
      <DialogContent className="max-h-[min(90dvh,640px)] overflow-y-auto border-white/10 bg-brand-card text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-black tracking-tight text-white sm:text-xl">
            {formatMnFullDate(new Date(day.date))}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 sm:space-y-6 sm:py-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-xl border border-white/5 bg-brand-bg/50 p-2.5 sm:p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Төлбөр</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-violet-300 sm:text-lg">
                {formatCurrency(totalBills, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-brand-bg/50 p-2.5 sm:p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Зээл</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-amber-300 sm:text-lg">
                {formatCurrency(totalLoans, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-brand-bg/50 p-2.5 sm:p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Орлого</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-emerald-400 sm:text-lg">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-brand-bg/50 p-2.5 sm:p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Цэвэр</p>
              <p className={cn(
                'mt-0.5 text-base font-bold tabular-nums sm:text-lg',
                netChange >= 0 ? 'text-emerald-400' : 'text-red-400',
              )}>
                {netChange >= 0 ? '+' : ''}{formatCurrency(netChange, currency)}
              </p>
            </div>
          </div>

          {/* Bills */}
          {day.bills.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-[11px] font-bold text-white sm:mb-3 sm:text-xs">
                <span className="material-symbols-outlined text-sm text-violet-400">outbound</span>
                Төлбөр ({day.bills.length})
              </h4>
              <div className="space-y-2">
                {day.bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-brand-bg/45 p-2.5 sm:p-3"
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
                    <p className="text-sm font-bold tabular-nums text-violet-300">
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
              <h4 className="mb-2 flex items-center gap-2 text-[11px] font-bold text-white sm:mb-3 sm:text-xs">
                <span className="material-symbols-outlined text-sm text-emerald-400">inbound</span>
                Орлого ({day.income.length})
              </h4>
              <div className="space-y-2">
                {day.income.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-brand-bg/45 p-2.5 sm:p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15">
                        <span className="material-symbols-outlined text-sm text-emerald-400">
                          {income.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{income.name}</p>
                        <p className="text-[10px] text-slate-500">{income.category}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-emerald-400">
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
              <h4 className="mb-2 flex items-center gap-2 text-[11px] font-bold text-white sm:mb-3 sm:text-xs">
                <span className="material-symbols-outlined text-sm text-amber-400">account_balance</span>
                Зээлийн төлөлт ({loans.length})
              </h4>
              <div className="space-y-2">
                {loans.map((lp) => (
                  <div
                    key={lp.id}
                    className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-brand-bg/45 p-2.5 sm:p-3"
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
            <div className="py-6 text-center">
              <span className="material-symbols-outlined mb-2 text-5xl text-white/15 sm:mb-3">
                event_busy
              </span>
              <p className="text-[12px] text-brand-muted sm:text-sm">Энэ өдөр төлөвлөгөө алга</p>
            </div>
          )}

          {/* Add bill / income for this day → persisted in browser localStorage */}
          {(onAddBill || onAddIncome) && (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:pt-4">
              {onAddBill && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl border-violet-500/35 bg-violet-500/10 text-[13px] text-violet-100 hover:bg-violet-500/20 hover:text-white"
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
                  className="flex-1 rounded-xl border-emerald-500/35 bg-emerald-500/10 text-[13px] text-emerald-100 hover:bg-emerald-500/20 hover:text-white"
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