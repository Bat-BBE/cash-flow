'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useScheduledData } from '@/hook/use-scheduled-data';
import { Calendar } from '@/components/scheduled/calendar';
import { MonthPicker } from '@/components/scheduled/month-picker';
import { BillsList } from '@/components/scheduled/bills-list';
import { IncomeList } from '@/components/scheduled/income-list';
import { LiquidityChart } from '@/components/scheduled/liquidity-chart';
import { AddItemModal } from '@/components/scheduled/add-item-modal';
import { DayDetailsModal } from '@/components/scheduled/day-details-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ScheduledPage() {
  const {
    bills,
    incomes,
    calendarDays,
    projections,
    summary,
    loading,
    currentDate,
    viewMode,
    selectedDate,
    showMonthPicker,
    overdueCount,
    weekDays,
    setViewMode,
    setSelectedDate,
    setShowMonthPicker,
    changeMonth,
    addBill,
    addIncome,
    updateBillStatus,
    deleteBill
  } = useScheduledData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'bill' | 'income'>('bill');
  const [showDayDetails, setShowDayDetails] = useState(false);

  const handleAddClick = (type: 'bill' | 'income') => {
    setAddModalType(type);
    setShowAddModal(true);
  };

  const handleDayClick = (day: any) => {
    setSelectedDate(day);
    setShowDayDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-navy-deep">
        <Sidebar />
        <main className="flex-1 min-h-screen flex flex-col bg-navy-deep">
          <Header />
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium">Loading scheduled data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-navy-deep">
      <Sidebar />

      <main className="flex-1 min-h-screen overflow-y-auto custom-scrollbar flex flex-col bg-navy-deep">
        <Header />

        <div className="flex-1 p-4 sm:p-6 max-w-[1440px] mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Scheduled Bills & Forecast
              </h1>
              <p className="text-slate-400 mt-1">
                Plan your liquidity and track upcoming commitments.
              </p>
            </div>

            <div className="flex bg-navy-dark p-1 rounded-xl border border-white/5 shadow-inner">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-bold transition-colors",
                  viewMode === 'calendar'
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'text-slate-500 hover:text-white'
                )}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-semibold transition-colors",
                  viewMode === 'list'
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'text-slate-500 hover:text-white'
                )}
              >
                List View
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 relative">
            {/* Calendar Section */}
            <Calendar
              days={calendarDays}
              currentDate={currentDate}
              onDayClick={handleDayClick}
              onPrevMonth={() => changeMonth('prev')}
              onNextMonth={() => changeMonth('next')}
              onMonthPickerToggle={() => setShowMonthPicker(!showMonthPicker)}
              weekDays={weekDays}
            />

            {/* Month Picker Popup */}
            <MonthPicker
              isOpen={showMonthPicker}
              onClose={() => setShowMonthPicker(false)}
              currentDate={currentDate}
              onSelectMonth={(month, year) => {
                changeMonth('next'); // Simplified
              }}
            />

            {/* Bills & Income Lists */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <BillsList
                bills={bills}
                overdueCount={overdueCount}
                onUpdateStatus={updateBillStatus}
                onDelete={deleteBill}
              />

              <IncomeList incomes={incomes} />
            </div>
          </div>

          {/* Liquidity Chart */}
          <LiquidityChart projections={projections} summary={summary} />

          {/* Floating Action Button */}
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
      </main>

      {/* Modals */}
      <AddItemModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        type={addModalType}
        onAdd={addModalType === 'bill' ? addBill : addIncome}
      />

      <DayDetailsModal
        open={showDayDetails}
        onOpenChange={setShowDayDetails}
        day={selectedDate}
      />
    </div>
  );
}