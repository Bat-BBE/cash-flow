// components/scheduled/bills-list.tsx
'use client';

import { ScheduledBill, BILL_STATUS_CONFIG } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BillsListProps {
  bills: ScheduledBill[];
  overdueCount: number;
  onUpdateStatus: (id: string, status: ScheduledBill['status']) => void;
  onDelete: (id: string) => void;
}

export function BillsList({ bills, overdueCount, onUpdateStatus, onDelete }: BillsListProps) {
  const sortedBills = [...bills].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="bg-card-surface rounded-2xl border border-white/5 flex-1 flex flex-col shadow-2xl">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <h4 className="font-bold flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-red-400">outbound</span>
          Upcoming Bills
        </h4>
        {overdueCount > 0 && (
          <span className="bg-red-500/10 text-red-400 text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border border-red-500/20">
            {overdueCount} Overdue
          </span>
        )}
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[380px] scrollbar-hide">
        {sortedBills.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">
              check_circle
            </span>
            <p className="text-sm text-slate-500">No pending bills</p>
          </div>
        ) : (
          sortedBills.map((bill) => {
            const statusConfig = BILL_STATUS_CONFIG[bill.status];
            const isOverdue = bill.status === 'overdue';
            
            return (
              <div
                key={bill.id}
                className="group p-4 bg-navy-dark/60 rounded-xl hover:bg-navy-dark/80 border border-white/5 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center border",
                      isOverdue 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-slate-700/30 text-slate-400 border-white/5'
                    )}>
                      <span className="material-symbols-outlined">{bill.icon}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-200">{bill.name}</p>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold",
                          statusConfig.bg,
                          statusConfig.color,
                          statusConfig.border
                        )}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(bill.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={cn(
                      "font-black text-sm",
                      isOverdue ? 'text-red-400' : 'text-slate-200'
                    )}>
                      -{formatCurrency(bill.amount, 'USD')}
                    </p>
                    
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
                          <span className="material-symbols-outlined mr-2 text-sm">
                            delete
                          </span>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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