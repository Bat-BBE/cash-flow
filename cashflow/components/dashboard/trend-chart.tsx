'use client';

import { useState, useMemo } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import { useDashboard }     from '@/components/providers/dashboard-provider';
import { useTranslation, TranslationKey } from '@/lib/translations';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ─── Сарын нэрийн map ───────────────────────────────────────────── */
const MONTH_TO_KEY: Record<string, TranslationKey> = {
  Jan:'january', Feb:'february', Mar:'march',   Apr:'april',
  May:'may',     Jun:'june',     Jul:'july',    Aug:'august',
  Sep:'september',Oct:'october', Nov:'november',Dec:'december',
};
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ─── Линейн регресс ─────────────────────────────────────────────── */
function linReg(ys: number[]): { slope: number; intercept: number } {
  const n  = ys.length;
  const xs = ys.map((_, i) => i);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const slope     = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  return { slope, intercept };
}

function forecast(reg: { slope: number; intercept: number }, idx: number): number {
  return Math.max(0, Math.round(reg.intercept + reg.slope * idx));
}

/* ─── Custom tooltip ─────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const isForecast = label?.endsWith('*');
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0d1f]/95 px-3 py-2.5 shadow-2xl backdrop-blur-md min-w-[160px]">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
        {isForecast && <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400" />}
        {label} {isForecast ? '(таамаглал)' : ''}
      </p>
      {payload.map((p: any) => (
        p.value != null && (
          <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-bold text-white">{Number(p.value).toLocaleString()}₮</span>
          </div>
        )
      ))}
    </div>
  );
}

/* ─── Metric card ────────────────────────────────────────────────── */
function MetricCard({
  label, value, sub, subUp,
}: { label: string; value: string; sub?: string; subUp?: boolean }) {
  return (
    <div className="bg-white/[0.04] rounded-xl p-3 flex flex-col gap-1">
      <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-base sm:text-lg font-bold text-white truncate">{value}</p>
      {sub && (
        <p className={cn('text-[10px] font-medium', subUp ? 'text-emerald-400' : 'text-rose-400')}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
type Metric = 'all' | 'income' | 'expenses' | 'savings';

export function TrendChart() {
  const { trendData, loading }  = useDashboardData();
  const { language }             = useDashboard();
  const t                        = useTranslation(language);
  const [metric, setMetric]      = useState<Metric>('all');

  /* ── Таамаглал тооцоолол ── */
  const { chartData, forecastStart, metrics } = useMemo(() => {
    if (!trendData.length) return { chartData: [], forecastStart: '', metrics: null };

    const incomes   = trendData.map(d => d.income);
    const expenses  = trendData.map(d => d.expenses);
    const savings   = trendData.map(d => d.savings);

    const regI = linReg(incomes);
    const regE = linReg(expenses);
    const regS = linReg(savings);

    // Сүүлийн сарыг олно
    const now       = new Date();
    const lastMonth = now.getMonth(); // 0-based
    const lastYear  = now.getFullYear();

    // Одоогийн trendData-ийн сарын дарааллыг тооцно
    const n = trendData.length;

    // Таамагласан 3 сар
    const foreMonths = Array.from({ length: 3 }, (_, i) => {
      const offset = i + 1;
      let m = lastMonth + offset;
      let y = lastYear;
      if (m > 11) { m -= 12; y++; }
      return {
        month:    MONTH_LABELS[m] + '*',
        income:   forecast(regI, n + i),
        expenses: forecast(regE, n + i),
        savings:  forecast(regS, n + i),
        isForecast: true,
      };
    });

    const combined = [
      ...trendData.map(d => ({ ...d, isForecast: false })),
      ...foreMonths,
    ];

    // Метрик карт утгууд
    const avgInc  = Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length);
    const avgExp  = Math.round(expenses.reduce((a, b) => a + b, 0) / expenses.length);
    const nextInc = foreMonths[0].income;
    const nextExp = foreMonths[0].expenses;
    const nextSav = foreMonths[0].savings;

    return {
      chartData:     combined,
      forecastStart: foreMonths[0].month,
      metrics:       { avgInc, avgExp, nextInc, nextExp, nextSav },
    };
  }, [trendData]);

  /* ── Харуулах шугам ── */
  const showIncome   = metric === 'all' || metric === 'income';
  const showExpenses = metric === 'all' || metric === 'expenses';
  const showSavings  = metric === 'all' || metric === 'savings';

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/5 rounded w-40" />
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
          </div>
          <div className="h-48 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 p-4 sm:p-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Орлого / Зарлага трэнд</h3>
          <p className="text-[10px] text-white/40 mt-0.5">
            {trendData.length} сарын бодит + дараагийн 3 сарын таамаглал
          </p>
        </div>
        {/* Forecast badge */}
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 whitespace-nowrap">
          * таамаглал
        </span>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <MetricCard
            label="Дундаж орлого"
            value={formatCurrency(metrics.avgInc, 'MNT')}
          />
          <MetricCard
            label="Дундаж зарлага"
            value={formatCurrency(metrics.avgExp, 'MNT')}
          />
          <MetricCard
            label="Дараагийн сар"
            value={formatCurrency(metrics.nextInc, 'MNT')}
            sub={metrics.nextInc >= metrics.avgInc ? '↑ өсөх' : '↓ буурах'}
            subUp={metrics.nextInc >= metrics.avgInc}
          />
        </div>
      )}

      {/* ── Metric filter tabs ── */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
        {([
          ['all',      'Бүгд'],
          ['income',   'Орлого'],
          ['expenses', 'Зарлага'],
          ['savings',  'Хуримтлал'],
        ] as [Metric, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMetric(id)}
            className={cn(
              'px-3 py-1.5 text-[11px] font-semibold rounded-full whitespace-nowrap border transition-all',
              metric === id
                ? 'bg-white text-[#0c0a1e] border-transparent'
                : 'bg-white/[0.04] text-white/50 border-white/10 hover:bg-white/[0.08] hover:text-white/70',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="h-[200px] sm:h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={36}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(1)}сая`
                  : v >= 1_000
                  ? `${Math.round(v / 1_000)}мян`
                  : `${v}`
              }
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }} />

            {/* Таамаглал эхлэх шугам */}
            <ReferenceLine
              x={forecastStart}
              stroke="rgba(139,92,246,0.4)"
              strokeDasharray="4 3"
              label={{ value: 'таамаглал', fill: 'rgba(139,92,246,0.7)', fontSize: 9, position: 'insideTopRight' }}
            />

            {/* Орлого — бодит */}
            {showIncome && (
              <Line
                name="Орлого"
                type="monotone"
                dataKey={(d) => d.isForecast ? undefined : d.income}
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#34d399', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
            {/* Орлого — таамаглал */}
            {showIncome && (
              <Line
                name="Орлого (таамаглал)"
                type="monotone"
                dataKey={(d) => d.isForecast ? d.income : undefined}
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: '#34d399', stroke: '#0c0a1e', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#34d399', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}

            {/* Зарлага — бодит */}
            {showExpenses && (
              <Line
                name="Зарлага"
                type="monotone"
                dataKey={(d) => d.isForecast ? undefined : d.expenses}
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f87171', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
            {/* Зарлага — таамаглал */}
            {showExpenses && (
              <Line
                name="Зарлага (таамаглал)"
                type="monotone"
                dataKey={(d) => d.isForecast ? d.expenses : undefined}
                stroke="#f87171"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: '#f87171', stroke: '#0c0a1e', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#f87171', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}

            {/* Хуримтлал — бодит */}
            {showSavings && (
              <Line
                name="Хуримтлал"
                type="monotone"
                dataKey={(d) => d.isForecast ? undefined : d.savings}
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#818cf8', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
            {/* Хуримтлал — таамаглал */}
            {showSavings && (
              <Line
                name="Хуримтлал (таамаглал)"
                type="monotone"
                dataKey={(d) => d.isForecast ? d.savings : undefined}
                stroke="#818cf8"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: '#818cf8', stroke: '#0c0a1e', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#818cf8', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-white/5">
        {showIncome && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />Орлого
          </div>
        )}
        {showExpenses && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />Зарлага
          </div>
        )}
        {showSavings && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />Хуримтлал
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-white/40 ml-auto">
          <div className="w-5 border-t-2 border-dashed border-white/30" />
          Таамаглал
        </div>
      </div>

      {/* ── Forecast insight ── */}
      {metrics && (
        <div className="mt-3 rounded-xl bg-violet-500/[0.08] border border-violet-500/20 px-3 py-2.5">
          <p className="text-[11px] text-white/60 leading-relaxed">
            <span className="text-violet-400 font-semibold">Дараагийн 3 сарын таамаглал: </span>
            Орлого дундажаар{' '}
            <span className="text-white font-semibold">
              {formatCurrency(
                Math.round([0,1,2].reduce((s,i) => {
                  const reg = linReg(trendData.map(d=>d.income));
                  return s + forecast(reg, trendData.length + i);
                }, 0) / 3),
                'MNT'
              )}
            </span>
            , зарлага{' '}
            <span className="text-white font-semibold">
              {formatCurrency(
                Math.round([0,1,2].reduce((s,i) => {
                  const reg = linReg(trendData.map(d=>d.expenses));
                  return s + forecast(reg, trendData.length + i);
                }, 0) / 3),
                'MNT'
              )}
            </span>{' '}
            байхаар тооцооллоо. Өнгөрсөн {trendData.length} сарын линейн трэнд дээр тулгуурласан.
          </p>
        </div>
      )}
    </div>
  );
}