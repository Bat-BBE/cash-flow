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
    jumpToMonth,
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

  const handlePrevMonth = () => {
    setShowDayDetails(false);
    changeMonth('prev');
  };

  const handleNextMonth = () => {
    setShowDayDetails(false);
    changeMonth('next');
  };

  if (loading) {
    return (
      <DashboardShell className="bg-brand-bg" mainClassName="bg-brand-bg">
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-10 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-brand-primary sm:size-11" />
            <p className="text-[11px] font-semibold text-brand-muted sm:text-[13px]">Ачааллаж байна...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <>
      <DashboardShell className="bg-brand-bg" mainClassName="bg-brand-bg">
        <div className="mx-auto w-full max-w-[1400px] flex-1 space-y-3 px-3 pb-3 pt-1 sm:space-y-4 sm:px-4 sm:pb-4 sm:pt-2 md:space-y-5 md:px-6 md:py-5">
          <div>
            <h1 className="text-[1.125rem] font-black leading-tight tracking-tight text-white sm:text-2xl md:text-3xl">
              Санхүүгийн календарь
            </h1>
            <p className="mt-0.5 max-w-xl text-[10px] leading-relaxed text-brand-muted sm:mt-1 sm:text-sm">
              Төлбөр, орлого, зээлийн төлөлтийг сараар харах.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-12">
            <div className="relative lg:col-span-7">
            <Calendar
              days={calendarDays}
              currentDate={currentDate}
              currency={loanCurrency}
              onDayClick={handleDayClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onMonthPickerToggle={() => setShowMonthPicker(!showMonthPicker)}
              onGoToToday={goToToday}
            />

            <MonthPicker
              isOpen={showMonthPicker}
              onClose={() => setShowMonthPicker(false)}
              currentDate={currentDate}
              onSelectMonth={(monthIndex, year) => jumpToMonth(monthIndex, year)}
            />
            </div>

            <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-5">
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

          {/* <LiquidityChart projections={projections} summary={summary} /> */}
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
