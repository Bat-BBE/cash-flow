'use client';

import { useMemo, useState } from 'react';
import type { LoanForSuggestion, UserProfile } from '@/lib/loan-suggestions';
import type { InterestRange } from '@/lib/loan-suggestions';
import type { Language } from '@/lib/types';
import { analyzeNewLoanFeasibility } from '@/lib/new-loan-feasibility';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface NewLoanFeasibilityCardProps {
  loans: LoanForSuggestion[];
  currency: string;
  userProfile?: UserProfile;
  language: Language;
}

function parseNum(s: string): number {
  const n = Number(String(s).replace(/\s/g, '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function NewLoanFeasibilityCard({
  loans,
  currency,
  userProfile,
  language,
}: NewLoanFeasibilityCardProps) {
  const L = language;
  const [principalStr, setPrincipalStr] = useState('');
  const [termStr, setTermStr] = useState('12');
  const [rateStr, setRateStr] = useState('18');
  const [range, setRange] = useState<InterestRange>('yearly');

  const principal = parseNum(principalStr);
  const termMonths = Math.max(0, Math.floor(parseNum(termStr)));
  const rate = parseNum(rateStr);

  const result = useMemo(
    () =>
      analyzeNewLoanFeasibility({
        newPrincipal: principal,
        newTermMonths: termMonths || 1,
        newInterestRate: rate,
        newInterestRange: range,
        loans,
        userProfile,
      }),
    [principal, termMonths, rate, range, loans, userProfile],
  );

  const copy = useMemo(() => {
    if (L === 'EN') {
      return {
        badge: 'New loan check',
        title: 'Can you afford another loan?',
        lead:
          'We compare your loan.json monthly income, current loan minimum payments (scheduled + bank floor + overdue), and the same “max from salary” rule used in payment suggestions. This is a model, not a bank decision.',
        amount: 'Loan amount',
        term: 'Term (months)',
        rate: 'Interest rate',
        yearly: 'Per year (APR)',
      monthly: 'Per month',
        baselineTitle: 'Your baseline (from data)',
        income: 'Monthly income (profile)',
        ceiling: 'Max for loan payments (model)',
        existing: 'Current loans — floor total / month',
        newPmt: 'New loan — est. payment / month',
        total: 'Total / month after new loan',
        margin: 'Remaining headroom',
        dti: 'Debt payments ÷ income',
        schedule: 'First months (new loan only)',
        month: 'Mo',
        interest: 'Interest',
        princ: 'Principal',
        balance: 'Balance',
        needAmount: 'Enter an amount to see the analysis.',
        tight:
          'You are within budget, but headroom is small — any income drop or extra expense could strain you.',
        overdueWarn: 'You have overdue exposure — even if the math fits, banks may decline or charge more.',
      };
    }
    return {
      badge: 'Шинэ зээл шалгах',
      title: 'Шинэ зээл танд одоогийн нөхцөлд тохирох уу?',
      lead:
        'loan.json дахь сарын орлого, одоогийн зээлүүдийн суурь төлбөр (гэрээний төлбөр, банкны доод дүн, хуулийн нэмэгдэл)-г ашиглан, зээлийн санал хэсэгтэй ижил “цалингаас зээлд зориулах дээд хэмжээ”-тэй харьцуулна. Энэ нь загварын тооцоо, банкны шийдвэр биш.',
      amount: 'Зээлийн дүн',
      term: 'Хугацаа (сар)',
      rate: 'Хүү (%)',
      yearly: 'Жилийн (APR)',
      monthly: 'Сарын',
      baselineTitle: 'Өгөгдлөөс (суурь)',
      income: 'Сарын орлого (profile)',
      ceiling: 'Зээлийн төлбөрт зориулах дээд хэмжээ (загвар)',
      existing: 'Одоогийн зээл — сарын суурь нийлбэр',
      newPmt: 'Шинэ зээл — тооцоолсон сарын төлбөр',
      total: 'Шинэ зээл нэмсний дараа нийт / сар',
      margin: 'Үлдэгдэл зай (дээд хэмжээнээс)',
      dti: 'Зээлийн төлбөр ÷ орлого',
      schedule: 'Эхний сарууд (зөвхөн шинэ зээл)',
      month: 'Сар',
      interest: 'Хүү',
      princ: 'Үндсэн',
      balance: 'Үлдэгдэл',
      needAmount: 'Тооцоолол харахын тулд зээлийн дүн оруулна уу.',
      tight:
        'Тооцоо нь багтаж байгаа ч үлдэгдэл зай бага — орлого буурах эсвэл гэнэтийн зардалд өртөмтгий.',
      overdueWarn: 'Хуулийн нэмэгдэлтэй зээл байна — тоо багтаж байсан ч банк татгалзах эсвэл нөхцөл өөрчлөгдөж болно.',
    };
  }, [L]);

  const showSchedule = result.verdict === 'feasible' && result.schedulePreview.length > 0;
  const tightMargin =
    result.verdict === 'feasible' &&
    result.salaryCeiling > 0 &&
    result.monthlyMargin >= 0 &&
    result.monthlyMargin < result.salaryCeiling * 0.08;

  const explain = useMemo(() => {
    const fmt = (n: number) => formatCurrency(Math.round(n), currency);
    const inc = result.monthlyIncome;
    const ceil = result.salaryCeiling;
    const ex = result.existingFloorTotal;
    const newP = result.newMonthlyPayment;

    if (L === 'EN') {
      if (result.verdict === 'no_income') {
        return {
          title: 'Need income in loan.json',
          body:
            'Add `userProfile.monthlyIncome` in loan.json. Without it we cannot estimate how much of your salary can go to loan payments under this app’s model.',
          detail: [] as string[],
        };
      }
      if (result.verdict === 'invalid_input') {
        return {
          title: 'Check the numbers',
          body: 'Enter a positive amount and a term of at least 1 month. Interest should be realistic for the rate type you selected.',
          detail: [],
        };
      }
      if (result.verdict === 'existing_over_ceiling') {
        return {
          title: 'Already above the model limit',
          body:
            'Even before the new loan, your required floor payments exceed what this model allows from your stated income. That usually means: income in the file is too low vs reality, expenses are higher than the model assumes, or you need to restructure/refinance before taking more debt.',
          detail: [
            `Income: ${fmt(inc)}`,
            `Model max for all loan payments: ${fmt(ceil)}`,
            `Current floor total: ${fmt(ex)} (short by ${fmt(ex - ceil)})`,
            `New loan would add ~${fmt(newP)}/mo on top.`,
          ],
        };
      }
      if (result.verdict === 'not_feasible') {
        return {
          title: 'This payment does not fit the model',
          body:
            'With your current loans, adding this new monthly payment would push total debt service above the app’s salary-based ceiling. To make it fit you could: reduce the amount, lengthen the term (lower payment), improve income (in profile), or pay down existing loans first.',
          detail: [
            `Model ceiling: ${fmt(ceil)}`,
            `After new loan: ${fmt(result.totalMonthlyAfter)}`,
            `Gap: ${fmt(-result.monthlyMargin)} / month`,
          ],
        };
      }
      if (result.verdict === 'feasible') {
        return {
          title: 'Fits the model',
          body:
            'Total monthly payments (existing floor + new estimated payment) stay at or below the modeled maximum from your income. Keep a buffer for living costs and emergencies — the model already sets aside part of income for essentials.',
          detail: [
            `Headroom: ${fmt(result.monthlyMargin)}/mo under the ceiling`,
            result.debtToIncomePercent != null
              ? `Debt payments / income ≈ ${result.debtToIncomePercent.toFixed(1)}%`
              : '',
          ].filter(Boolean),
        };
      }
      return { title: '', body: '', detail: [] };
    }

    if (result.verdict === 'no_income') {
      return {
        title: 'Орлого заагаагүй байна',
        body:
          'loan.json дотор `userProfile.monthlyIncome` талбарыг бөглөнө үү. Үгүй бол энэ апп-ын загварын дагуу сарын хэдийг зээлд зориулахыг тооцож чадахгүй.',
        detail: [] as string[],
      };
    }
    if (result.verdict === 'invalid_input') {
      return {
        title: 'Тоо зөв эсэхийг шалгана уу',
        body: 'Эерэг дүн, хамгийн багадаа 1 сарын хугацаа, сонгосон хүүний төрөлд тохирох хүү оруулна уу.',
        detail: [],
      };
    }
    if (result.verdict === 'existing_over_ceiling') {
      return {
        title: 'Шинэ зээлээс өмнөхөөсөө аль хэдийн хэмжээ хэтэрсэн',
        body:
          'Таны одоогийн зээлүүдийн “суурь” сарын төлбөрийн нийлбэр аль хэдийн энэ загварын орлогоос тооцсон дээд хэмжээнээс их байна. Ихэвчлэн: файл дахь орлого бодитоос доогуур, эсвэл зардал загварынхаас их, эсвэл зээл дахин бүтэцлэх шаардлагатай гэсэн үг.',
        detail: [
          `Орлого: ${fmt(inc)}`,
          `Зээлд зориулах загварын дээд хэмжээ: ${fmt(ceil)}`,
          `Одоогийн суурь нийт: ${fmt(ex)} (дахин ${fmt(ex - ceil)}-аар их)`,
          `Шинэ зээл нэмбэл сард ~${fmt(newP)} нэмэгдэнэ.`,
        ],
      };
    }
    if (result.verdict === 'not_feasible') {
      return {
        title: 'Энэ нөхцөлөөр сарын төлбөр “багтахгүй” байна',
        body:
          'Одоогийн зээлүүдийн дээр энэ шинэ зээлийн сарын төлбөрийг нэмэхэд нийт нь таны орлогоос тооцсон зээл төлөх дээд хэмжээг давна. Боломжтой болгохын тулд: дүнг багасгах, хугацааг уртасгах (сарын төлбөр бууна), орлогыг (profile) нэмэгдүүлэх, эсвэл одоогийн зээлээ эхлээд бууруулах.',
        detail: [
          `Загварын дээд хэмжээ: ${fmt(ceil)}`,
          `Шинэ зээл нэмсний дараа: ${fmt(result.totalMonthlyAfter)}`,
          `Дутуу: сард ${fmt(-result.monthlyMargin)}`,
        ],
      };
    }
    if (result.verdict === 'feasible') {
      return {
        title: 'Загварын хэмжээнд багтаж байна',
        body:
          'Одоогийн зээлийн суурь төлбөр + шинэ зээлийн тооцоолсон төлбөр нь таны орлогоос гаргасан “зээлд зориулах дээд хэмжээ”-д орж байна. Амьдралын зардал, гэнэтийн зардлыг өөрөө нэмж тооцоорой — загвар нь орлогын хэсгийг аль хэдийн “шаардлагатай зардал” гэж суулгасан.',
        detail: [
          `Дээд хэмжээнээс үлдэгдэл зай: сард ${fmt(result.monthlyMargin)}`,
          result.debtToIncomePercent != null
            ? `Зээлийн төлбөр / орлого ≈ ${result.debtToIncomePercent.toFixed(1)}%`
            : '',
        ].filter(Boolean),
      };
    }
    return { title: '', body: '', detail: [] };
  }, [L, result, currency]);

  const ready = principal > 0 && termMonths >= 1;

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-brand-card/70 p-6 md:p-8 shadow-xl shadow-black/20 backdrop-blur-lg">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-6 mb-6">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200/90">
            <span className="material-symbols-outlined text-[16px]">balance</span>
            {copy.badge}
          </div>
          <h2 className="text-xl font-black tracking-tight text-white md:text-2xl">{copy.title}</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">{copy.lead}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">{copy.amount}</span>
          <input
            type="text"
            inputMode="numeric"
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            placeholder={L === 'EN' ? 'e.g. 10000000' : 'жишээ нь 10000000'}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">{copy.term}</span>
          <input
            type="text"
            inputMode="numeric"
            value={termStr}
            onChange={(e) => setTermStr(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">{copy.rate}</span>
          <input
            type="text"
            inputMode="decimal"
            value={rateStr}
            onChange={(e) => setRateStr(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500 block">
            {L === 'EN' ? 'Rate type' : 'Хүүний төрөл'}
          </span>
          <div className="flex rounded-xl border border-white/10 p-0.5 bg-black/20">
            <button
              type="button"
              onClick={() => setRange('yearly')}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-bold transition-colors',
                range === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white',
              )}
            >
              {copy.yearly}
            </button>
            <button
              type="button"
              onClick={() => setRange('monthly')}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-bold transition-colors',
                range === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white',
              )}
            >
              {copy.monthly}
            </button>
          </div>
        </div>
      </div>

      {!ready ? (
        <p className="text-sm text-slate-500 text-center py-6 border border-dashed border-white/10 rounded-2xl">
          {copy.needAmount}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{copy.baselineTitle}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">{copy.income}</span>
                  <span className="font-mono tabular-nums text-white">
                    {formatCurrency(result.monthlyIncome, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">{copy.ceiling}</span>
                  <span className="font-mono tabular-nums text-emerald-300">
                    {formatCurrency(result.salaryCeiling, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">{copy.existing}</span>
                  <span className="font-mono tabular-nums text-white">
                    {formatCurrency(result.existingFloorTotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">{copy.newPmt}</span>
                  <span className="font-mono tabular-nums text-amber-200">
                    {Number.isFinite(result.newMonthlyPayment)
                      ? formatCurrency(result.newMonthlyPayment, currency)
                      : '—'}
                  </span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between gap-3">
                  <span className="text-slate-300 font-medium">{copy.total}</span>
                  <span className="font-mono tabular-nums font-bold text-white">
                    {formatCurrency(result.totalMonthlyAfter, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">{copy.margin}</span>
                  <span
                    className={cn(
                      'font-mono tabular-nums font-bold',
                      result.monthlyMargin >= 0 ? 'text-sky-300' : 'text-red-400',
                    )}
                  >
                    {formatCurrency(result.monthlyMargin, currency)}
                  </span>
                </div>
                {result.debtToIncomePercent != null ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">{copy.dti}</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {result.debtToIncomePercent.toFixed(1)}%
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className={cn(
                'rounded-2xl border p-4 md:p-5 flex flex-col justify-center',
                result.verdict === 'feasible'
                  ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
                  : result.verdict === 'invalid_input'
                    ? 'border-white/10 bg-white/[0.03]'
                    : 'border-red-500/25 bg-red-500/[0.06]',
              )}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {L === 'EN' ? 'Verdict' : 'Дүгнэлт'}
              </p>
              <p className="text-lg font-black text-white mb-2">{explain.title}</p>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">{explain.body}</p>
              {explain.detail.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {explain.detail.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {result.verdict === 'feasible' && result.hasOverdueOrStress ? (
                <p className="mt-3 text-xs text-amber-200/90 border border-amber-500/20 rounded-lg p-2 bg-amber-500/5">
                  {copy.overdueWarn}
                </p>
              ) : null}
              {tightMargin ? (
                <p className="mt-3 text-xs text-sky-200/90 border border-sky-500/20 rounded-lg p-2 bg-sky-500/5">
                  {copy.tight}
                </p>
              ) : null}
            </div>
          </div>

          {showSchedule ? (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <p className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 bg-black/20">
                {copy.schedule}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase text-slate-500">
                    <th className="px-4 py-2 font-semibold">{copy.month}</th>
                    <th className="px-4 py-2 font-semibold">{L === 'EN' ? 'Payment' : 'Төлбөр'}</th>
                    <th className="px-4 py-2 font-semibold">{copy.interest}</th>
                    <th className="px-4 py-2 font-semibold">{copy.princ}</th>
                    <th className="px-4 py-2 font-semibold">{copy.balance}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedulePreview.map((row) => (
                    <tr key={row.month} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-2 tabular-nums text-slate-400">{row.month}</td>
                      <td className="px-4 py-2 tabular-nums text-white">{formatCurrency(row.payment, currency)}</td>
                      <td className="px-4 py-2 tabular-nums text-amber-200/90">
                        {formatCurrency(row.interest, currency)}
                      </td>
                      <td className="px-4 py-2 tabular-nums text-emerald-300/90">
                        {formatCurrency(row.principal, currency)}
                      </td>
                      <td className="px-4 py-2 tabular-nums text-slate-300">
                        {formatCurrency(row.balanceAfter, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
