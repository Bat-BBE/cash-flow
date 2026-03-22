'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
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
            <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="font-medium text-slate-400">Ачааллаж байна...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <>
      <DashboardShell className="bg-navy-deep" mainClassName="bg-navy-deep">
        <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Санхүүгийн календарь
              </h1>
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
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

            <div className="flex flex-col gap-6 lg:col-span-5">
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
