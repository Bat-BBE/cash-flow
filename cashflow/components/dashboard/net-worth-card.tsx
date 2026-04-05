'use client';

import React, { useId, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Badge }             from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator }         from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/contexts/dashboard-data-context';

const MONTH_OPTIONS = [1, 3, 6, 9, 12].map((n) => ({
  value: String(n), label: `Сүүлийн ${n} сар`,
}));

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0d1f]/90 px-3 py-2 shadow-2xl backdrop-blur-md">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
      <p className="text-sm font-bold text-white">
        {Number(payload[0].value).toLocaleString()}
        <span className="ml-1 text-[10px] font-normal text-white/50">₮</span>
      </p>
    </div>
  );
}

/** Сонгосон хугацааны орлого / зарлагын харьцаа — цэвэрхэн донат */
function BalanceFlowDonut({ income, expense, loading }: { income: number; expense: number; loading: boolean }) {
  const uid = useId().replace(/:/g, '');
  const idIncome = `dw-income-${uid}`;
  const idExpense = `dw-expense-${uid}`;
  const idNeutral = `dw-neutral-${uid}`;

  const data = useMemo(() => {
    const sum = income + expense;
    if (sum <= 0) {
      return [{ name: 'empty', value: 1, fill: `url(#${idNeutral})` }];
    }
    return [
      { name: 'Орлого', value: income, fill: `url(#${idIncome})` },
      { name: 'Зарлага', value: expense, fill: `url(#${idExpense})` },
    ];
  }, [income, expense, idIncome, idExpense, idNeutral]);

  const total = income + expense;
  const incomePct = total > 0 ? Math.round((income / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-[5.25rem] w-[5.25rem] shrink-0 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.06] sm:h-28 sm:w-28">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400/80" />
      </div>
    );
  }

  return (
    <div
      className="relative h-[5.25rem] w-[5.25rem] shrink-0 sm:h-28 sm:w-28"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/5 blur-[1px]" />
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={idIncome} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity={1} />
              <stop offset="45%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.92} />
            </linearGradient>
            <linearGradient id={idExpense} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca5a5" stopOpacity={1} />
              <stop offset="50%" stopColor="#f87171" stopOpacity={1} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id={idNeutral} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(148,163,184,0.2)" />
              <stop offset="100%" stopColor="rgba(148,163,184,0.06)" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="56%"
            outerRadius="92%"
            paddingAngle={total > 0 ? 1.25 : 0}
            stroke="rgb(43,53,80)"
            strokeWidth={total > 0 ? 2 : 0}
            cornerRadius={0}
            isAnimationActive
            animationDuration={750}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#1e2638]/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] ring-1 ring-white/[0.06] backdrop-blur-sm">
        {total > 0 ? (
          <>
            <span className="text-[1.1rem] font-black tabular-nums leading-none tracking-tight text-white sm:text-xl">
              {incomePct}
              <span className="text-[0.65em] font-bold text-white/45">%</span>
            </span>
            <span className="mt-0.5 max-w-[4.5rem] text-center text-[7px] font-semibold uppercase leading-tight tracking-wide text-emerald-400/85 sm:text-[8px]">
              орлого
            </span>
          </>
        ) : (
          <span className="text-[10px] font-medium text-white/25">—</span>
        )}
      </div>
    </div>
  );
}

export function NetWorthCard() {
  const areaFillId = `nw-area-fill-${useId().replace(/:/g, '')}`;
  // Context-оос авна → бүх dashboard component ижил months ашиглана
  const { chartData, rawTxs, loading, months, setMonths, totalIncome, totalExpenses } = useDashboardData();

  const latest = useMemo(() =>
    [...rawTxs].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())
      .find((t)=>t.closingBalance!=null)?.closingBalance??0,
    [rawTxs]
  );

  const first      = chartData[0]?.value ?? 0;
  const last       = chartData[chartData.length-1]?.value ?? 0;
  const isUp       = last >= first;
  const changePct  = first>0?(((last-first)/first)*100).toFixed(1):'0.0';
  const trendColor = isUp ? '#34d399' : '#f87171';
  const TrendIcon  = isUp ? TrendingUp : TrendingDown;

  return (
    <Card className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-brand-card shadow-[0_0_60px_rgba(88,50,220,0.15)] sm:rounded-3xl">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-700/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-600/10 blur-[60px]" />

      <CardContent className="relative z-10 flex flex-col gap-4 p-3.5 sm:gap-5 sm:p-6">

        <div className="flex flex-wrap items-start gap-3 sm:gap-4">
          <div className="min-w-0 flex-1 basis-[min(100%,11rem)] sm:basis-0">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-white/35 sm:text-[10px]">Нийт дансны үлдэгдэл</p>
            {loading ? (
              <div className="mt-2.5 flex items-center gap-2 text-white/40 sm:mt-3">
                <Loader2 className="h-4 w-4 animate-spin" /><span className="text-[11px] sm:text-xs">Татаж байна…</span>
              </div>
            ) : (
              <>
                <h2 className="mt-1 truncate text-[1.35rem] font-extrabold leading-tight tracking-tight text-white min-[380px]:text-[1.5rem] sm:text-4xl sm:leading-none">
                  {latest.toLocaleString()}
                  <span className="ml-0.5 text-sm font-semibold text-white/45 sm:ml-1 sm:text-xl">₮</span>
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
                  <Badge className={cn('flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold sm:gap-1 sm:px-2.5 sm:text-[10px]',
                    isUp?'border-emerald-500/25 bg-emerald-500/15 text-emerald-400':'border-red-500/25 bg-red-500/15 text-red-400')}>
                    <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{isUp?'+':''}{changePct}%
                  </Badge>
                  <span className="text-[9px] text-white/30 sm:text-[10px]">өмнөх сартай харьцуулахад</span>
                </div>
              </>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-start gap-2 sm:gap-3">
            <BalanceFlowDonut income={totalIncome} expense={totalExpenses} loading={loading} />

            {/* setMonths → context → бүх component шинэчлэгдэнэ */}
            <div className="flex w-fit min-w-0 flex-col items-end gap-0.5">
              <p className="text-right text-[8px] font-semibold uppercase tracking-widest text-white/25 sm:text-[9px]">Хугацаа</p>
              <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
                <SelectTrigger className="!h-8 !w-auto max-w-[min(100vw-8rem,16rem)] shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 text-[10px] font-semibold text-white/75 shadow-none ring-offset-0 transition-colors hover:bg-white/[0.09] focus:ring-0 focus:ring-offset-0 data-[state=open]:ring-0 sm:text-[11px]">
                  <SelectValue placeholder="Сар сонгох" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-white/10 bg-[#120f28] text-white shadow-2xl">
                  {MONTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[11px] font-medium text-white/70 focus:bg-violet-600/30 focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="relative h-[8rem] w-full overflow-hidden rounded-xl sm:h-[11rem]">
          {loading ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
          ) : chartData.length > 0 ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1a2033]/80 to-transparent" />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id={areaFillId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trendColor} stopOpacity={0.42} />
                      <stop offset="35%" stopColor={trendColor} stopOpacity={0.14} />
                      <stop offset="75%" stopColor={trendColor} stopOpacity={0.02} />
                      <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 6" stroke="rgba(255,255,255,0.045)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fill: 'rgba(255,255,255,0.38)',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    dy={4}
                  />
                  <YAxis
                    tick={{
                      fill: 'rgba(255,255,255,0.28)',
                      fontSize: 10,
                      fontWeight: 500,
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(1)}М`
                        : v >= 1_000
                          ? `${(v / 1_000).toFixed(0)}к`
                          : `${v}`
                    }
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{
                      stroke: 'rgba(255,255,255,0.12)',
                      strokeWidth: 1,
                      strokeDasharray: '4 4',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={trendColor}
                    strokeWidth={2.5}
                    fill={`url(#${areaFillId})`}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: trendColor,
                      stroke: 'rgb(26,32,56)',
                      strokeWidth: 2.5,
                      style: { filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.15))' },
                    }}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/30">Графикт хангалттай өгөгдөл алга</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}