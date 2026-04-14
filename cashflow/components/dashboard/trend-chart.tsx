'use client';

import { useState, useMemo } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import { useIsNarrow }      from '@/hook/use-is-mobile';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ─── Compact currency formatter ─────────────────────────────────── */
function fmtCompact(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}сая`;
  if (v >= 1_000)     return `${Math.round(v / 1_000)}мян`;
  return `${v}`;
}

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
const MASK = '••••••••';

function ChartTooltip({ active, payload, label, masked }: any) {
  if (!active || !payload?.length) return null;
  const isForecast = label?.endsWith('*');
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0d1f]/95 px-3 py-2.5 shadow-2xl backdrop-blur-md min-w-[150px]">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
        {isForecast && <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400" />}
        {label} {isForecast ? '(таамаглал)' : ''}
      </p>
      {payload.map((p: any) =>
        p.value != null ? (
          <div key={p.name} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="inline-block w-2 h-2 rounded-sm shrink-0" style={{ background: p.color }} />
              <span className="truncate max-w-[80px]">{p.name}</span>
            </span>
            <span className="font-bold text-white tabular-nums">{masked ? MASK : `${fmtCompact(Number(p.value))}₮`}</span>
          </div>
        ) : null
      )}
    </div>
  );
}

function MetricCard({
  label, value, sub, subUp, masked,
}: { label: string; value: string; sub?: string; subUp?: boolean; masked?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[10px] bg-white/[0.04] px-2 py-2 sm:rounded-xl sm:px-3 sm:py-2.5">
      <p className="text-[8px] font-semibold uppercase leading-snug tracking-wider text-white/40 sm:text-[9px]">{label}</p>
      <p className="text-[11px] font-bold leading-tight tabular-nums text-white sm:text-[13px]">{masked ? MASK : value}</p>
      {sub && !masked && (
        <p className={cn('text-[9px] font-semibold sm:text-[10px]', subUp ? 'text-emerald-400' : 'text-rose-400')}>
          {sub}
        </p>
      )}
    </div>
  );
}

type Metric = 'all' | 'income' | 'expenses' | 'savings';

export function TrendChart() {
  const { trendData, loading, timeRange, privacyMasked }  = useDashboardData();
  const narrow                   = useIsNarrow();
  const [metric, setMetric]      = useState<Metric>('all');

  const { chartData, forecastStart, metrics, showForecast } = useMemo(() => {
    if (!trendData.length) return { chartData: [], forecastStart: '', metrics: null, showForecast: false };

    const incomes   = trendData.map(d => d.income);
    const expenses  = trendData.map(d => d.expenses);
    const savings   = trendData.map(d => d.savings);

    const avgInc  = Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length);
    const avgExp  = Math.round(expenses.reduce((a, b) => a + b, 0) / expenses.length);
    const skipForecast = timeRange === '7d' || trendData.length < 4;

    if (skipForecast) {
      const totalSav = Math.round(savings.reduce((a, b) => a + b, 0));
      return {
        chartData: trendData.map(d => ({ ...d, isForecast: false })),
        forecastStart: '',
        showForecast: false,
        metrics: { avgInc, avgExp, nextInc: totalSav, nextExp: 0, nextSav: totalSav, mode: 'short' as const },
      };
    }

    const regI = linReg(incomes);
    const regE = linReg(expenses);
    const regS = linReg(savings);

    const now       = new Date();
    const lastMonth = now.getMonth();
    const lastYear  = now.getFullYear();
    const n = trendData.length;

    const foreMonths = Array.from({ length: 3 }, (_, i) => {
      const offset = i + 1;
      let m = lastMonth + offset;
      let y = lastYear;
      if (m > 11) { m -= 12; y++; }
      return {
        month:      MONTH_LABELS[m] + '*',
        income:     forecast(regI, n + i),
        expenses:   forecast(regE, n + i),
        savings:    forecast(regS, n + i),
        isForecast: true,
      };
    });

    const combined = [
      ...trendData.map(d => ({ ...d, isForecast: false })),
      ...foreMonths,
    ];

    const nextInc = foreMonths[0].income;
    const nextExp = foreMonths[0].expenses;
    const nextSav = foreMonths[0].savings;

    return {
      chartData:     combined,
      forecastStart: foreMonths[0].month,
      showForecast: true,
      metrics:       { avgInc, avgExp, nextInc, nextExp, nextSav, mode: 'full' as const },
    };
  }, [trendData, timeRange]);

  const forecastInsight = useMemo(() => {
    if (!trendData.length || timeRange === '7d' || trendData.length < 4) return null;
    const regI = linReg(trendData.map((d) => d.income));
    const regE = linReg(trendData.map((d) => d.expenses));
    const n = trendData.length;
    const avg3 = (reg: { slope: number; intercept: number }) =>
      Math.round([0, 1, 2].reduce((s, i) => s + forecast(reg, n + i), 0) / 3);
    return { incAvg: avg3(regI), expAvg: avg3(regE) };
  }, [trendData, timeRange]);

  const showIncome   = metric === 'all' || metric === 'income';
  const showExpenses = metric === 'all' || metric === 'expenses';
  const showSavings  = metric === 'all' || metric === 'savings';

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="rounded-[1.15rem] border border-white/5 bg-brand-card p-3.5 sm:rounded-2xl sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/5 rounded w-40" />
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl" />)}
          </div>
          <div className="h-48 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  const yAxisWidth = narrow ? 42 : 52;

  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-white/5 bg-brand-card p-3.5 sm:rounded-2xl sm:p-6 mb-8">

      {/* ── Header ── */}
      <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
        <div className="min-w-0">
          <h3 className="text-[0.8125rem] font-semibold leading-snug tracking-tight text-white sm:text-sm sm:font-bold">Орлого / Зарлага трэнд</h3>
          <p className="mt-0.5 text-[9px] leading-relaxed text-white/40 sm:text-[10px]">
            {showForecast
              ? `${trendData.length} цэгийн бодит + дараагийн 3 сарын таамаглал`
              : timeRange === '7d'
                ? 'Сүүлийн 7 хоногийн бодит (таамаглалгүй)'
                : timeRange === '1q'
                  ? 'Энэ улирлын 3 сар (таамаглалгүй)'
                  : 'Таамаглал харуулахад хангалттай цэг байхгүй'}
          </p>
        </div>
        {showForecast && (
        <span className="shrink-0 rounded-full border border-violet-500/20 bg-violet-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-violet-400 sm:px-2 sm:py-1 sm:text-[9px]">
          * таамаглал
        </span>
        )}
      </div>

      {/* ── Metric cards — always 3 columns ── */}
      {metrics && (
        <div className="mb-3 grid grid-cols-3 gap-1 sm:gap-1.5 sm:mb-4">
          <MetricCard
            label="Дундаж орлого"
            value={fmtCompact(metrics.avgInc) + '₮'}
            masked={privacyMasked}
          />
          <MetricCard
            label="Дундаж зарлага"
            value={fmtCompact(metrics.avgExp) + '₮'}
            masked={privacyMasked}
          />
          <MetricCard
            label={metrics.mode === 'short' ? 'Нийт хуримтлал' : 'Дараагийн сар'}
            value={fmtCompact(metrics.mode === 'short' ? metrics.nextSav : metrics.nextInc) + '₮'}
            sub={metrics.mode === 'short' ? undefined : (metrics.nextInc >= metrics.avgInc ? '↑ өсөх' : '↓ буурах')}
            subUp={metrics.mode === 'short' ? undefined : metrics.nextInc >= metrics.avgInc}
            masked={privacyMasked}
          />
        </div>
      )}

      {/* ── Metric filter tabs ── */}
      <div className="-mx-0.5 mb-3 flex gap-1 overflow-x-auto pb-0.5 px-0.5 sm:mb-4 sm:gap-1.5 [&::-webkit-scrollbar]:hidden">
        {([
          ['all',      'Бүгд'],
          ['income',   'Орлого'],
          ['expenses', 'Зарлага'],
          ['savings',  'Хуримтлал'],
        ] as [Metric, string][]).map(([id, label]) => (
          <button
            type="button"
            key={id}
            onClick={() => setMetric(id)}
            className={cn(
              'min-h-[34px] shrink-0 touch-manipulation rounded-full border px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap transition-all sm:min-h-0 sm:px-3 sm:text-[11px]',
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
      <div className="h-[175px] w-full sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 6, left: 0, bottom: narrow ? 28 : 24 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: narrow ? 9 : 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={narrow ? 30 : 14}
              angle={-35}
              textAnchor="end"
              height={narrow ? 36 : 32}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: narrow ? 8 : 9 }}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              tickFormatter={fmtCompact}
            />
            <Tooltip
              content={<ChartTooltip masked={privacyMasked} />}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            {/* Таамаглал эхлэх шугам */}
            {showForecast && forecastStart && (
            <ReferenceLine
              x={forecastStart}
              stroke="rgba(139,92,246,0.45)"
              strokeDasharray="4 3"
              label={
                narrow ? undefined : {
                  value: 'таамаглал →',
                  fill: 'rgba(167,139,250,0.7)',
                  fontSize: 9,
                  position: 'insideTopRight',
                }
              }
            />
            )}

            {/* Орлого */}
            {showIncome && (
              <Line name="Орлого" type="monotone"
                dataKey={(d) => d.isForecast ? undefined : d.income}
                stroke="#34d399" strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#34d399', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
            {showForecast && showIncome && (
              <Line name="Орлого*" type="monotone"
                dataKey={(d) => d.isForecast ? d.income : undefined}
                stroke="#34d399" strokeWidth={2} strokeDasharray="5 4"
                dot={{ r: 3, fill: '#34d399', stroke: '#0c0a1e', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#34d399', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}

            {/* Зарлага */}
            {showExpenses && (
              <Line name="Зарлага" type="monotone"
                dataKey={(d) => d.isForecast ? undefined : d.expenses}
                stroke="#f87171" strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f87171', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
            {showForecast && showExpenses && (
              <Line name="Зарлага*" type="monotone"
                dataKey={(d) => d.isForecast ? d.expenses : undefined}
                stroke="#f87171" strokeWidth={2} strokeDasharray="5 4"
                dot={{ r: 3, fill: '#f87171', stroke: '#0c0a1e', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#f87171', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}

            {/* Хуримтлал */}
            {showSavings && (
              <Line name="Хуримтлал" type="monotone"
                dataKey={(d) => d.isForecast ? undefined : d.savings}
                stroke="#818cf8" strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#818cf8', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
            {showForecast && showSavings && (
              <Line name="Хуримтлал*" type="monotone"
                dataKey={(d) => d.isForecast ? d.savings : undefined}
                stroke="#818cf8" strokeWidth={2} strokeDasharray="5 4"
                dot={{ r: 3, fill: '#818cf8', stroke: '#0c0a1e', strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: '#818cf8', stroke: '#0c0a1e', strokeWidth: 2 }}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ── */}
      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-white/5 pt-2.5 sm:mt-3 sm:gap-x-3 sm:gap-y-1.5 sm:pt-3">
        {showIncome && (
          <div className="flex items-center gap-1 text-[9px] text-white/50 sm:gap-1.5 sm:text-[10px]">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shrink-0" />Орлого
          </div>
        )}
        {showExpenses && (
          <div className="flex items-center gap-1 text-[9px] text-white/50 sm:gap-1.5 sm:text-[10px]">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400 shrink-0" />Зарлага
          </div>
        )}
        {showSavings && (
          <div className="flex items-center gap-1 text-[9px] text-white/50 sm:gap-1.5 sm:text-[10px]">
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 shrink-0" />Хуримтлал
          </div>
        )}
        {showForecast && (
        <div className="ml-auto flex items-center gap-1 text-[9px] text-white/35 sm:gap-1.5 sm:text-[10px]">
          <div className="w-5 border-t-2 border-dashed border-white/25" />
          Таамаглал
        </div>
        )}
      </div>

      {/* ── Forecast insight ── */}
      {metrics && forecastInsight && showForecast && (
        <div className="mt-2.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-2.5 py-2 sm:mt-3 sm:px-3 sm:py-2.5">
          <p className="text-[10px] leading-relaxed text-white/60 sm:text-[11px]">
            <span className="text-violet-400 font-semibold">Дараагийн 3 сарын таамаглал: </span>
            Орлого дундажаар{' '}
            <span className="text-white font-semibold">{privacyMasked ? MASK : `${fmtCompact(forecastInsight.incAvg)}₮`}</span>
            , зарлага{' '}
            <span className="text-white font-semibold">{privacyMasked ? MASK : `${fmtCompact(forecastInsight.expAvg)}₮`}</span>{' '}
            байхаар тооцооллоо.
          </p>
        </div>
      )}
    </div>
  );
}