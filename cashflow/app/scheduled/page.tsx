'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useScheduledCalendar } from '@/contexts/scheduled-calendar-context';
import { Calendar } from '@/components/scheduled/calendar';
import { MonthPicker } from '@/components/scheduled/month-picker';
import { BillsList } from '@/components/scheduled/bills-list';
import { IncomeList } from '@/components/scheduled/income-list';
import { LiquidityChart } from '@/components/scheduled/liquidity-chart';
import { AddItemModal } from '@/components/scheduled/add-item-modal';
import { DayDetailsModal } from '@/components/scheduled/day-details-modal';
import { Button } from '@/components/ui/button';
import { formatDateForInputLocal } from '@/lib/utils';
import type { CalendarDay } from '@/components/scheduled/types';

export default function ScheduledPage() {
  const {
    bills,
    incomes,
    calendarDays,
    projections,
    summary,
    loading,
    currentDate,
    showMonthPicker,
    setShowMonthPicker,
    changeMonth,
    goToToday,
    selectedDate,
    setSelectedDate,
    updateBillStatus,
    deleteBill,
    loanCurrency,
    upcomingLoanPayments,
    addBill,
    addIncome,
  } = useScheduledCalendar();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'bill' | 'income'>('bill');
  const [prefillDateForAdd, setPrefillDateForAdd] = useState<string | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);

  const handleAddClick = (type: 'bill' | 'income') => {
    setPrefillDateForAdd(null);
    setAddModalType(type);
    setShowAddModal(true);
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day);
    setShowDayDetails(true);
  };

  const openAddFromSelectedDay = (type: 'bill' | 'income') => {
    if (!selectedDate) return;
    const iso = formatDateForInputLocal(
      selectedDate.date instanceof Date ? selectedDate.date : new Date(selectedDate.date),
    );
    setPrefillDateForAdd(iso);
    setAddModalType(type);
    setShowDayDetails(false);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <DashboardShell className="bg-navy-deep" mainClassName="bg-navy-deep">
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
            <p className="font-medium text-slate-400">Loading scheduled data...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-screen flex bg-navy-deep">
      <Sidebar />

      <main className="flex-1 min-h-screen overflow-y-auto custom-scrollbar flex flex-col bg-navy-deep">
        <Header />

        <div className="flex-1 p-4 sm:p-6 max-w-[1440px] mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Санхүүгийн календарь
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 relative">
            <Calendar
              days={calendarDays}
              currentDate={currentDate}
              currency={loanCurrency}
              onDayClick={handleDayClick}
              onPrevMonth={() => changeMonth('prev')}
              onNextMonth={() => changeMonth('next')}
              onMonthPickerToggle={() => setShowMonthPicker(!showMonthPicker)}
              onGoToToday={goToToday}
            />

            <MonthPicker
              isOpen={showMonthPicker}
              onClose={() => setShowMonthPicker(false)}
              currentDate={currentDate}
              onSelectMonth={() => {
                changeMonth('next');
              }}
            />

            <div className="lg:col-span-5 flex flex-col gap-6">
              <BillsList
                bills={bills}
                onUpdateStatus={updateBillStatus}
                onDelete={deleteBill}
                upcomingLoanPayments={upcomingLoanPayments}
                currency={loanCurrency}
              />

              <IncomeList incomes={incomes} currency={loanCurrency} />
            </div>
          </div>

          <LiquidityChart projections={projections} summary={summary} />

          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
            <Button
              onClick={() => handleAddClick('income')}
              className="bg-secondary hover:bg-secondary/90 text-white rounded-full shadow-lg shadow-secondary/20"
            >
              <span className="material-symbols-outlined mr-2">add</span>
              Add Income
            </Button>
            <Button
              onClick={() => handleAddClick('bill')}
              className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined mr-2">add</span>
              Add Bill
            </Button>
          </div>
        </div>
    </DashboardShell>

      <AddItemModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setPrefillDateForAdd(null);
        }}
        type={addModalType}
        initialDate={prefillDateForAdd}
        onAdd={addModalType === 'bill' ? addBill : addIncome}
      />

      <DayDetailsModal
        open={showDayDetails}
        onOpenChange={setShowDayDetails}
        day={selectedDate}
        currency={loanCurrency}
        onAddBill={() => openAddFromSelectedDay('bill')}
        onAddIncome={() => openAddFromSelectedDay('income')}
      />
    </>
  );
}
