'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useBudgetData } from '@/hook/use-budget-data';
import { BudgetSummaryCards } from '@/components/budgets/budget-summary-cards';
import { BudgetCard } from '@/components/budgets/budget-card';
import { BudgetFilters } from '@/components/budgets/budget-filters';
import { AddBudgetModal } from '@/components/budgets/add-budget-modal';
import { TransferMoneyModal } from '@/components/budgets/transfer-money-modal';
import { AddCategoryButton } from '@/components/budgets/add-category-button';
import { Budget } from '@/components/budgets/types';

export default function BudgetsPage() {
  const {
    budgets,
    summary,
    loading,
    selectedPeriod,
    setSelectedPeriod,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    transferMoney,
    addBudget,
    deleteBudget,
    updateBudget,
  } = useBudgetData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const handleTransfer = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowTransferModal(true);
  };

  const handleAdjust = (budget: Budget) => {
    console.log('Adjust budget:', budget);
  };

  const handleEdit = (budget: Budget) => {
    console.log('Edit budget:', budget);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };

  return (
    <>
    <DashboardShell className="bg-[#0f172a]" mainClassName="bg-[#0f172a]">
        <div className="space-y-8 p-4 sm:p-6 md:p-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Monthly Budgets</h2>
              <p className="text-slate-400 font-medium">
                Tracking period: <span className="text-slate-200">{selectedPeriod}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-start md:justify-end">
              <button 
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2b3550] text-primary border border-primary/40 rounded-lg hover:bg-slate-700 font-bold text-sm"
              >
                <span className="material-symbols-outlined text-lg">swap_horiz</span>
                Move Money
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:brightness-110 font-bold text-sm"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                New Category
              </button>
            </div>
          </header>

          <BudgetSummaryCards summary={summary} loading={loading} />
          
          <BudgetFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            totalCategories={budgets.length}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onTransfer={handleTransfer}
                onAdjust={handleAdjust}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
            <AddCategoryButton onClick={() => setShowAddModal(true)} />
          </div>
        </div>
    </DashboardShell>

      <AddBudgetModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={addBudget}
      />

      <TransferMoneyModal
        open={showTransferModal}
        onOpenChange={setShowTransferModal}
        budgets={budgets}
        onTransfer={(fromId, toId, amount) => {
          transferMoney({ fromBudgetId: fromId, toBudgetId: toId, amount });
        }}
        initialBudget={selectedBudget}
      />
    </>
  );
}