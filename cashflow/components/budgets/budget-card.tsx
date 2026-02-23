// components/budgets/budget-card.tsx
'use client';

import { useState } from 'react';
import { Budget, BUDGET_STATUS_CONFIG } from './types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BudgetCardProps {
  budget: Budget;
  onTransfer: (budget: Budget) => void;
  onAdjust: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onEdit: (budget: Budget) => void;
}

export function BudgetCard({ 
  budget, 
  onTransfer, 
  onAdjust, 
  onDelete, 
  onEdit 
}: BudgetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const percentage = (budget.spent / budget.limit) * 100;
  const isOverBudget = budget.spent > budget.limit;
  const status = budget.status;
  const statusConfig = BUDGET_STATUS_CONFIG[status];

  const progressColor = isOverBudget ? 'bg-red-500' : statusConfig.progressColor;

  return (
    <div 
      className={cn(
        "group bg-[#2b3550] border border-slate-700/50 p-6 rounded-xl hover:border-primary/50 transition-all duration-300 shadow-md relative overflow-hidden",
        isOverBudget && "border-l-4 border-l-red-500"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "size-12 rounded-xl flex items-center justify-center border",
            isOverBudget 
              ? 'bg-red-500/10 border-red-500/20' 
              : 'bg-primary/10 border-primary/20'
          )}>
            <span className={cn(
              "material-symbols-outlined text-2xl",
              isOverBudget ? 'text-red-400' : 'text-primary'
            )}>
              {budget.icon}
            </span>
          </div>
          
          <div>
            <h5 className="font-bold text-white text-lg">{budget.category}</h5>
            <span className={cn(
              "text-[9px] uppercase font-black px-2 py-0.5 rounded-full border tracking-widest",
              statusConfig.bg,
              statusConfig.color,
              statusConfig.border
            )}>
              {percentage.toFixed(0)}% Used
            </span>
          </div>
        </div>

        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
          <span className="material-symbols-outlined">more_horiz</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">
            Spent vs Limit
          </span>
          <span className={cn(
            "font-bold",
            isOverBudget ? 'text-red-400' : 'text-white'
          )}>
            {formatCurrency(budget.spent, 'USD')}
            <span className="text-slate-500 font-normal mx-1">/</span>
            <span className="text-slate-400">{formatCurrency(budget.limit, 'USD')}</span>
          </span>
        </div>
        
        <div className="w-full bg-slate-900 rounded-full overflow-hidden shadow-inner h-2">
          <div 
            className={cn("h-full transition-all duration-500", progressColor)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-tighter",
          isOverBudget ? 'text-red-400' : 'text-slate-500'
        )}>
          {budget.paidDate 
            ? `Paid on ${budget.paidDate}`
            : isOverBudget 
              ? `${formatCurrency(Math.abs(budget.remaining), 'USD')} over limit`
              : `${formatCurrency(budget.remaining, 'USD')} remaining`
          }
        </p>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isOverBudget ? onTransfer(budget) : onAdjust(budget)}
          className="text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/10 transition-all uppercase tracking-tighter"
        >
          {isOverBudget ? 'Move Money' : budget.paidDate ? 'Details' : 'Adjust'}
        </Button>
      </div>
    </div>
  );
}