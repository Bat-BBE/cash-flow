import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { LoanSuggestionsPanel } from '@/components/payments/loan-suggestions-panel';
import loanFile from '@/loan.json';
import type {
  LoanForSuggestion,
  SuggestionConfig,
  UserProfile,
} from '@/lib/loan-suggestions';
import { paydownFloorTotal } from '@/lib/loan-suggestions';
import { formatCurrency, formatDate, rollMonthlyStartDateIfPast } from '@/lib/utils';

type LoanStatus = 'active' | 'overdue' | 'paid';

interface LoanOverdue {
  rangeId?: number;
  totalAmount: number;
}

interface Loan {
  id: string;
  name: string;
  lender: string;
  principal: number;
  lowestPayAmount?: number;
  interestRate: number;
  interestRange: 'yearly' | 'monthly';
  termMonths: number;
  balance: number;
  monthlyPayment: number;
  startDate: string;
  status: LoanStatus;
  icon: string;
  color?: string;
  overdues?: LoanOverdue[];
}

interface LoansFile {
  currency: string;
  generatedAt?: string;
  userProfile?: UserProfile;
  suggestionConfig?: Partial<SuggestionConfig>;
  loans: Loan[];
}

export default function LoansPage() {
  const { currency, loans, userProfile, suggestionConfig } = loanFile as LoansFile;

  const loansForSuggestions: LoanForSuggestion[] = loans.map((l) => ({
    id: l.id,
    name: l.name,
    balance: l.balance,
    monthlyPayment: l.monthlyPayment,
    lowestPayAmount: l.lowestPayAmount,
    interestRate: l.interestRate,
    interestRange: l.interestRange,
    termMonths: l.termMonths,
    status: l.status,
    overdues: l.overdues,
  }));

  const totalBalance = loans.reduce((sum, l) => sum + l.balance, 0);
  // Match suggestion baseline (normal/aggressive): floor = max(monthlyPayment, lowestPayAmount) + overdue extra.
  const totalMonthlyPayment = loansForSuggestions.reduce(
    (sum, l) => sum + paydownFloorTotal(l),
    0,
  );
  // Total amount that can be used to pay loans from salary:
  // income * 0.9 * 0.885 * 0.6
  const monthlyIncome = userProfile?.monthlyIncome ?? 0;
  const possiblePayFromSalary = Math.max(
    0,
    (userProfile?.monthlyIncome ?? 0) * 0.9 * 0.885 * 0.6,
  );
  // Default UI ordering: "normal" strategy = shortest period left first.
  const prioritizedLoans = [...loans].sort((a, b) => {
    if (a.termMonths !== b.termMonths) return a.termMonths - b.termMonths;
    // Tie-breakers: higher rate first, then bigger balance.
    if (a.interestRate !== b.interestRate) return b.interestRate - a.interestRate;
    return b.balance - a.balance;
  });

  const statusPill = (status: LoanStatus) => {
    const base =
      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border';

    switch (status) {
      case 'active':
        return `${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`;
      case 'overdue':
        return `${base} bg-yellow-500/10 text-yellow-400 border-yellow-500/20`;
      case 'paid':
        return `${base} bg-blue-500/10 text-blue-400 border-blue-500/20`;
      default:
        return `${base} bg-white/5 text-brand-muted border-white/10`;
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-brand-bg">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-brand-bg custom-scrollbar flex flex-col">
        <Header />

        <div className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Нийт зээл</h1>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span className="material-symbols-outlined text-primary">schedule</span>
              {loanFile.generatedAt ? `Шинэчлэгдсэн огноо: ${formatDate(loanFile.generatedAt)}` : '—'}
            </div>
          </div>

          {/* Summary metrics — light tiles, icon + text (no cramped dividers) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
                  <span className="material-symbols-outlined text-[22px]">account_balance</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-400">Нийт үлдэгдэл</p>
                  <p className="text-2xl font-bold tracking-tight text-white tabular-nums md:text-[1.65rem]">
                    {formatCurrency(totalBalance, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/25">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-400">Сарын суурь төлөлт</p>
                  <p className="text-2xl font-bold tracking-tight text-emerald-400 tabular-nums md:text-[1.65rem]">
                    {formatCurrency(totalMonthlyPayment, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-300 ring-1 ring-sky-400/20">
                  <span className="material-symbols-outlined text-[22px]">savings</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-400">Одоогоор төлж байгаа</p>
                  <p className="text-2xl font-bold tracking-tight text-sky-200 tabular-nums md:text-[1.65rem]">
                    {formatCurrency(possiblePayFromSalary, currency)}
                  </p>
                  {monthlyIncome > 0 && (
                    <p className="pt-1 text-xs text-slate-500 tabular-nums">
                      Үндсэн цалин {formatCurrency(monthlyIncome, currency)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <section className="bg-brand-card/60 rounded-3xl border border-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-lg lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_tree</span>
                  Зээлүүд
                </h2>
                <span className="text-xs text-slate-500">{loans.length}</span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {loans.length === 0 ? (
                  <p className="text-slate-400 text-sm">No loans found.</p>
                ) : (
                  prioritizedLoans.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-start justify-between gap-4 bg-brand-card/50 rounded-2xl border border-white/5 p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0"
                            style={l.color ? { color: l.color } : undefined}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {l.icon}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{l.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                              
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-1">
                            {l.lender} • Үлдэгдэл: {formatCurrency(l.balance, currency)} • Хүү:{' '}
                              {l.interestRate.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={statusPill("overdue")}>
                            {formatDate(rollMonthlyStartDateIfPast(l.startDate))}
                          </div>
                          <p className="mt-2 text-sm font-black text-emerald-400">
                            {formatCurrency(l.monthlyPayment, currency)}/сар
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </section>
          </div>

          <LoanSuggestionsPanel
            loans={loansForSuggestions}
            currency={currency}
            userProfile={userProfile}
            suggestionConfig={suggestionConfig}
            referenceDateISO={loanFile.generatedAt ?? new Date().toISOString()}
          />
        </div>
      </main>
    </div>
  );
}

