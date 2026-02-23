// components/transactions/transaction-filters.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TransactionFiltersProps {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedAccounts: string[];
  onAccountsChange: (accounts: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  categories: string[];
  accounts: string[];
}

export function TransactionFilters({
  dateRange,
  onDateRangeChange,
  selectedCategories,
  onCategoriesChange,
  selectedAccounts,
  onAccountsChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
  categories,
  accounts,
}: TransactionFiltersProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last Year' },
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const toggleAccount = (account: string) => {
    if (selectedAccounts.includes(account)) {
      onAccountsChange(selectedAccounts.filter(a => a !== account));
    } else {
      onAccountsChange([...selectedAccounts, account]);
    }
  };

  const hasActiveFilters = dateRange !== 'month' || 
    selectedCategories.length > 0 || 
    selectedAccounts.length > 0 || 
    searchQuery.length > 0;

  return (
    <section className="px-8 py-6 flex flex-wrap gap-3 items-center border-b border-white/5">
      {/* Date Range */}
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-[180px] bg-[#2b3550] border-slate-700 text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <SelectValue placeholder="Select range" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#1e2533] border-slate-700 text-white">
          {dateRanges.map(range => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Categories Filter */}
      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "bg-[#2b3550] border-slate-700 text-white hover:bg-slate-700",
              selectedCategories.length > 0 && "border-primary bg-primary/10"
            )}
          >
            <span className="material-symbols-outlined text-sm mr-2">category</span>
            {selectedCategories.length > 0 
              ? `${selectedCategories.length} Categories` 
              : 'All Categories'}
            <span className="material-symbols-outlined text-sm ml-2">expand_more</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-[#1e2533] border-slate-700 text-white p-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Filter by Category
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map(category => (
                <label
                  key={category}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCategoriesChange([])}
                className="text-xs text-slate-400"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setCategoryOpen(false)}
                className="bg-primary text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Accounts Filter */}
      <Popover open={accountOpen} onOpenChange={setAccountOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "bg-[#2b3550] border-slate-700 text-white hover:bg-slate-700",
              selectedAccounts.length > 0 && "border-primary bg-primary/10"
            )}
          >
            <span className="material-symbols-outlined text-sm mr-2">account_balance</span>
            {selectedAccounts.length > 0 
              ? `${selectedAccounts.length} Accounts` 
              : 'All Accounts'}
            <span className="material-symbols-outlined text-sm ml-2">expand_more</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 bg-[#1e2533] border-slate-700 text-white p-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Filter by Account
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {accounts.map(account => (
                <label
                  key={account}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account)}
                    onChange={() => toggleAccount(account)}
                    className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{account}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAccountsChange([])}
                className="text-xs text-slate-400"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setAccountOpen(false)}
                className="bg-primary text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <button
            onClick={onClearFilters}
            className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Clear Filters
          </button>
        </>
      )}

      {/* Active Filter Badges */}
      <div className="flex flex-wrap gap-2 ml-2">
        {selectedCategories.slice(0, 2).map(cat => (
          <Badge
            key={cat}
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 text-[10px]"
          >
            {cat}
            <button
              onClick={() => toggleCategory(cat)}
              className="ml-1 hover:text-white"
            >
              ×
            </button>
          </Badge>
        ))}
        {selectedCategories.length > 2 && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
            +{selectedCategories.length - 2} more
          </Badge>
        )}
      </div>
    </section>
  );
}