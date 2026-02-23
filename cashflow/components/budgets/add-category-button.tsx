// components/budgets/add-category-button.tsx
'use client';

import { cn } from '@/lib/utils';

interface AddCategoryButtonProps {
  onClick: () => void;
}

export function AddCategoryButton({ onClick }: AddCategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-dashed border-slate-700/50 p-6 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all duration-300 group"
    >
      <span className="material-symbols-outlined text-4xl mb-3 group-hover:scale-110 transition-transform">
        add_circle
      </span>
      <p className="font-bold text-sm uppercase tracking-widest">Add Category</p>
    </button>
  );
}