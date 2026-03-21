// components/scheduled/bills-list.tsx
'use client';

import { useMemo } from 'react';
import {
  ScheduledBill,
  BILL_STATUS_CONFIG,
  type UpcomingLoanPaymentRow,
} from './types';
import { formatCurrency, isDateKeyTodayOrFuture } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { isDashboardScheduledId } from '@/lib/dashboard-tx-to-scheduled';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BillsListProps {
  bills: ScheduledBill[];
  onUpdateStatus: (id: string, status: ScheduledBill['status']) => void;
  onDelete: (id: string) => void;
  /** loan.json — Upcoming Bills-д нэгтгэнэ */
  upcomingLoanPayments?: UpcomingLoanPaymentRow[];
  /** Валют (зээл + төлбөр) */
  currency?: string;
}

type MergedRow =
  | { kind: 'bill'; bill: ScheduledBill }
  | { kind: 'loan'; loan: UpcomingLoanPaymentRow };

export function BillsList({
  bills,
  onUpdateStatus,
  onDelete,
  upcomingLoanPayments = [],
  currency = 'MNT',
}: BillsListProps) {
  const billsUpcoming = useMemo(
    () => bills.filter((b) => isDateKeyTodayOrFuture(b.date)),
    [bills],
  );
  /** One row per loan: next upcoming due date only (not every future installment). */
  const loansUpcoming = useMemo(() => {
    const filtered = upcomingLoanPayments.filter((l) => isDateKeyTodayOrFuture(l.dueDate));
    const byLoanId = new Map<string, UpcomingLoanPaymentRow>();
    for (const row of filtered) {
      const prev = byLoanId.get(row.id);
      if (!prev || row.dueDate.localeCompare(prev.dueDate) < 0) {
        byLoanId.set(row.id, row);
      }
    }
    return Array.from(byLoanId.values()).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [upcomingLoanPayments]);
  const overdueUpcomingCount = useMemo(
    () => billsUpcoming.filter((b) => b.status === 'overdue').length,
    [billsUpcoming],
  );

  const mergedRows = useMemo(() => {
    const list: MergedRow[] = [
      ...billsUpcoming.map((b) => ({ kind: 'bill' as const, bill: b })),
      ...loansUpcoming.map((loan) => ({ kind: 'loan' as const, loan })),
    ];

    list.sort((a, b) => {
      const dateA = a.kind === 'bill' ? a.bill.date : a.kind === 'loan' ? a.loan.dueDate : '';
      const dateB = b.kind === 'bill' ? b.bill.date : b.kind === 'loan' ? b.loan.dueDate : '';
      const byDate = dateA.localeCompare(dateB);
      if (byDate !== 0) return byDate;

      if (a.kind === 'bill' && b.kind === 'bill') {
        if (a.bill.status === 'overdue' && b.bill.status !== 'overdue') return -1;
        if (a.bill.status !== 'overdue' && b.bill.status === 'overdue') return 1;
        return a.bill.name.localeCompare(b.bill.name);
      }
      if (a.kind === 'bill' && b.kind === 'loan') return -1;
      if (a.kind === 'loan' && b.kind === 'bill') return 1;
      if (a.kind === 'loan' && b.kind === 'loan') return a.loan.name.localeCompare(b.loan.name);
      return 0;
    });

    return list;
  }, [billsUpcoming, loansUpcoming]);

  return (
    <div className="bg-card-surface rounded-2xl border border-white/5 flex-1 flex flex-col shadow-2xl">
      <div className="p-5 border-b border-white/5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-bold flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-red-400">outbound</span>
            Зарлага
          </h4>
        </div>
        {overdueUpcomingCount > 0 && (
          <span className="bg-red-500/10 text-red-400 text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border border-red-500/20 shrink-0">
            {overdueUpcomingCount} Overdue
          </span>
        )}
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[min(480px,52vh)] scrollbar-hide">
        {mergedRows.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">
              check_circle
            </span>
            <p className="text-sm text-slate-500">No upcoming bills or loan payments</p>
          </div>
        ) : (
          mergedRows.map((row) => {
            if (row.kind === 'bill') {
              const bill = row.bill;
              const statusConfig =
                BILL_STATUS_CONFIG[bill.status] ?? BILL_STATUS_CONFIG.scheduled;
              const isOverdue = bill.status === 'overdue';

              return (
                <div
                  key={bill.id}
                  className={cn(
                    'group rounded-xl border p-4 transition-all',
                    isOverdue
                      ? 'border-red-500/20 bg-navy-dark/60 hover:bg-red-500/[0.04]'
                      : 'border-violet-500/15 bg-navy-dark/60 hover:bg-violet-500/[0.05]',
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                          isOverdue
                            ? 'border-red-500/25 bg-red-500/10 text-red-400'
                            : 'border-violet-500/20 bg-violet-500/10 text-violet-200/90',
                        )}
                      >
                        <span className="material-symbols-outlined">{bill.icon}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-sm text-slate-200 truncate">{bill.name}</p>
                          {isDashboardScheduledId(bill.id) && (
                            <span className="shrink-0 rounded-full border border-sky-500/30 bg-sky-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase text-sky-200">
                              Данс
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold shrink-0',
                              statusConfig.bg,
                              statusConfig.color,
                              statusConfig.border,
                            )}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'text-xs',
                            isOverdue ? 'text-slate-500' : 'text-violet-300/70',
                          )}
                        >
                          {new Date(bill.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          'font-black text-sm tabular-nums tracking-tight',
                          isOverdue ? 'text-red-400' : 'text-violet-200',
                        )}
                      >
                        -{formatCurrency(bill.amount, currency)}
                      </p>

                      {!isDashboardScheduledId(bill.id) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-6 px-2 text-[10px] uppercase font-bold text-slate-600 hover:text-white hover:bg-slate-700"
                            >
                              Update
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1e2533] border-slate-700 text-white">
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(bill.id, 'paid')}
                              className="hover:bg-white/5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined mr-2 text-sm text-emerald-400">
                                check_circle
                              </span>
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateStatus(bill.id, 'scheduled')}
                              className="hover:bg-white/5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined mr-2 text-sm text-blue-400">
                                schedule
                              </span>
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(bill.id)}
                              className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                            >
                              <span className="material-symbols-outlined mr-2 text-sm">delete</span>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <p className="text-[9px] text-slate-600 uppercase tracking-wider">Данс</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            const lp = row.loan;
            const isLoanOverdue = lp.status === 'overdue';

            return (
              <div
                key={lp.listKey}
                className="group p-4 bg-navy-dark/60 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/[0.06] transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-10 shrink-0 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-center justify-center text-yellow-200">
                      <span className="material-symbols-outlined">{lp.icon}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-sm text-slate-200 truncate">{lp.name}</p>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold border border-yellow-500/30 bg-yellow-500/15 text-yellow-200 shrink-0">
                          Зээл
                        </span>
                        {isLoanOverdue && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold bg-yellow-500/25 text-yellow-100 border border-yellow-400/40 shrink-0">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{lp.lender}</p>
                      <p className="mt-0.5 text-[11px] text-yellow-300/90">
                        {new Date(lp.dueDate + 'T12:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        'font-black text-sm tabular-nums tracking-tight',
                        isLoanOverdue ? 'text-yellow-400' : 'text-yellow-200',
                      )}
                    >
                      -{formatCurrency(lp.amount, currency)}
                    </p>
                    <p className="mt-1 text-[9px] font-medium tabular-nums uppercase tracking-wider text-slate-600">
                      loan.json
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
