// components/budgets/budget-filters.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BudgetFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  totalCategories: number;
}

export function BudgetFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  totalCategories
}: BudgetFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h4 className="text-xl font-bold flex items-center gap-2 text-white">
        Budget Envelopes
        <span className="bg-primary/20 text-primary text-[10px] py-1 px-3 rounded-full border border-primary/20 font-bold uppercase tracking-wider">
          {totalCategories} Categories
        </span>
      </h4>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative flex-1 sm:flex-initial">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <span className="material-symbols-outlined text-lg">search</span>
          </span>
          <Input
            type="text"
            placeholder="Search budgets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-[#2b3550] border-slate-700 text-white w-full sm:w-[200px]"
          />
        </div>

        {/* Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[130px] bg-[#2b3550] border-slate-700 text-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}