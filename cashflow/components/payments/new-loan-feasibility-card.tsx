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
  /** Дээд талд гарчиг тусдаа байвал дотоод гарчиг/товч тайлбарыг нуух */
  embedded?: boolean;
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
  embedded = false,
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
      badge: 'Шинэ зээл',
      title: 'Шинэ зээл танд тохирох уу?',
      lead:
        'Орлого, одоогийн зээлийн суурь төлбөрөөс “зээлд зориулах дээд хэмжээ”-г тооцоод харьцуулна. Загварын тоо, банкны шийдвэр биш.',
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
    <section
      className={cn(
        'rounded-[1.15rem] border border-white/5 bg-gradient-to-b from-brand-card/95 to-brand-card/75 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-lg sm:rounded-3xl',
        embedded ? 'p-3 sm:p-5 md:p-6' : 'p-3 sm:p-6 md:p-7',
      )}
    >
      {!embedded ? (
        <div className="mb-4 flex flex-col gap-1.5 sm:mb-5 sm:gap-2 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-200/90 sm:px-2.5 sm:text-[10px]">
              <span className="material-symbols-outlined text-[14px]">balance</span>
              {copy.badge}
            </div>
            <h2 className="text-base font-black tracking-tight text-white sm:text-lg md:text-xl">{copy.title}</h2>
            <p className="max-w-3xl text-[11px] leading-relaxed text-brand-muted sm:text-[13px] md:text-sm">{copy.lead}</p>
          </div>
        </div>
      ) : (
        <p className="mb-3 text-[10px] leading-relaxed text-brand-muted sm:mb-4 sm:text-[12px]">
          {L === 'EN'
            ? 'Compared to your income and current loan floors (model only).'
            : 'Орлого, одоогийн зээлийн суурь төлбөртой харьцуулна — загварын тоо.'}
        </p>
      )}

      <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 md:mb-6 md:gap-4">
        <label className="space-y-1.5">
          <span className="text-[11px] font-medium text-brand-muted sm:text-xs">{copy.amount}</span>
          <input
            type="text"
            inputMode="numeric"
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            placeholder={L === 'EN' ? 'e.g. 10000000' : 'жишээ нь 10000000'}
            className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 sm:py-2.5"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-[11px] font-medium text-brand-muted sm:text-xs">{copy.term}</span>
          <input
            type="text"
            inputMode="numeric"
            value={termStr}
            onChange={(e) => setTermStr(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 sm:py-2.5"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-[11px] font-medium text-brand-muted sm:text-xs">{copy.rate}</span>
          <input
            type="text"
            inputMode="decimal"
            value={rateStr}
            onChange={(e) => setRateStr(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 sm:py-2.5"
          />
        </label>
        <div className="space-y-1.5">
          <span className="block text-[11px] font-medium text-brand-muted sm:text-xs">
            {L === 'EN' ? 'Rate type' : 'Хүүний төрөл'}
          </span>
          <div className="flex rounded-xl border border-white/10 bg-black/25 p-0.5">
            <button
              type="button"
              onClick={() => setRange('yearly')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-colors sm:py-2 sm:text-xs',
                range === 'yearly' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-white',
              )}
            >
              {copy.yearly}
            </button>
            <button
              type="button"
              onClick={() => setRange('monthly')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-colors sm:py-2 sm:text-xs',
                range === 'monthly' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-white',
              )}
            >
              {copy.monthly}
            </button>
          </div>
        </div>
      </div>

      {!ready ? (
        <p className="rounded-2xl border border-dashed border-white/10 py-5 text-center text-[12px] text-brand-muted sm:py-6 sm:text-sm">
          {copy.needAmount}
        </p>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 md:mb-6 md:grid-cols-2 md:gap-4">
            <div className="space-y-3 rounded-2xl border border-white/5 bg-brand-bg/50 p-3 sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted sm:text-xs">{copy.baselineTitle}</p>
              <div className="space-y-2 text-[13px] sm:text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-brand-muted">{copy.income}</span>
                  <span className="font-mono tabular-nums text-white">
                    {formatCurrency(result.monthlyIncome, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-brand-muted">{copy.ceiling}</span>
                  <span className="font-mono tabular-nums text-emerald-300">
                    {formatCurrency(result.salaryCeiling, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-brand-muted">{copy.existing}</span>
                  <span className="font-mono tabular-nums text-white">
                    {formatCurrency(result.existingFloorTotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-brand-muted">{copy.newPmt}</span>
                  <span className="font-mono tabular-nums text-amber-200">
                    {Number.isFinite(result.newMonthlyPayment)
                      ? formatCurrency(result.newMonthlyPayment, currency)
                      : '—'}
                  </span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between gap-3">
                  <span className="font-medium text-white/90">{copy.total}</span>
                  <span className="font-mono tabular-nums font-bold text-white">
                    {formatCurrency(result.totalMonthlyAfter, currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-brand-muted">{copy.margin}</span>
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
                    <span className="text-brand-muted">{copy.dti}</span>
                    <span className="font-mono tabular-nums text-white/85">
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
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-muted sm:mb-2 sm:text-xs">
                {L === 'EN' ? 'Verdict' : 'Дүгнэлт'}
              </p>
              <p className="mb-1.5 text-base font-black text-white sm:mb-2 sm:text-lg">{explain.title}</p>
              <p className="mb-2.5 text-[13px] leading-relaxed text-white/80 sm:mb-3 sm:text-sm">{explain.body}</p>
              {explain.detail.length > 0 ? (
                <ul className="space-y-1.5 text-[11px] text-brand-muted sm:text-xs">
                  {explain.detail.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-0.5 text-brand-primary">•</span>
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
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <p className="bg-brand-bg/60 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-brand-muted sm:px-4 sm:py-3 sm:text-xs">
                {copy.schedule}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[10px] uppercase text-brand-muted sm:text-[11px]">
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
