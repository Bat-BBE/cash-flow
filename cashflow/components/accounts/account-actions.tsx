'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccountActionsProps {
  onTransfer: () => void;
  onAddTransaction: () => void;
  className?: string;
}

export function AccountActions({ 
  onTransfer, 
  onAddTransaction, 
  className 
}: AccountActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("flex gap-3", className)}>
      <Button
        onClick={onTransfer}
        variant="outline"
        className="px-5 py-2 bg-brand-card border border-brand-primary/40 text-brand-primary rounded-xl text-sm font-bold hover:bg-brand-primary/10 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">sync</span>
        Transfer
      </Button>
      
      <Button
        onClick={onAddTransaction}
        className="px-5 py-2 bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Add Transaction
      </Button>

      {/* Mobile dropdown menu */}
      <div className="relative lg:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          className="p-2 bg-brand-card rounded-xl"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </Button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-brand-card border border-white/5 rounded-xl shadow-2xl z-50 py-1">
            <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Account
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">description</span>
              Statement
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">block</span>
              Freeze Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}