'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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

function TransactionList({ txs, loading }: { txs: any[]; loading: boolean }) {
  if (loading) return <div className="flex h-24 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-violet-400" /></div>;
  if (!txs.length) return <p className="py-6 text-center text-xs text-white/30">Сүүлийн 30 хоногт гүйлгээ байхгүй байна</p>;
  return (
    <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
      {txs.map((tx, i) => {
        const isCredit = tx.credit > 0;
        const amount   = isCredit ? tx.credit : Math.abs(tx.debit);
        const color    = isCredit ? '#34d399' : '#f87171';
        const Icon     = isCredit ? ArrowDownLeft : ArrowUpRight;
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2.5 transition-colors hover:bg-white/[0.05]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background:`${color}22` }}>
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-white/80" title={tx.description}>{tx.description||'—'}</p>
              <p className="text-[9px] text-white/30">{new Date(tx.date).getMonth()+1}/{new Date(tx.date).getDate()}</p>
            </div>
            <p className="shrink-0 text-xs font-bold" style={{ color }}>
              {isCredit?'+':'−'}{amount.toLocaleString()}
              <span className="ml-0.5 text-[9px] font-normal" style={{ color:`${color}88` }}>₮</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function NetWorthCard() {
  // Context-оос авна → бүх dashboard component ижил months ашиглана
  const { chartData, rawTxs, loading, months, setMonths } = useDashboardData();

  const latest = useMemo(() =>
    [...rawTxs].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())
      .find((t)=>t.closingBalance!=null)?.closingBalance??0,
    [rawTxs]
  );

  const recentTxs = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-30);
    return [...rawTxs].filter((tx)=>new Date(tx.date)>=cutoff)
      .sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
  }, [rawTxs]);

  const first      = chartData[0]?.value ?? 0;
  const last       = chartData[chartData.length-1]?.value ?? 0;
  const isUp       = last >= first;
  const changePct  = first>0?(((last-first)/first)*100).toFixed(1):'0.0';
  const trendColor = isUp ? '#34d399' : '#f87171';
  const TrendIcon  = isUp ? TrendingUp : TrendingDown;

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-brand-card shadow-[0_0_60px_rgba(88,50,220,0.15)] sm:rounded-3xl">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-700/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-600/10 blur-[60px]" />

      <CardContent className="relative z-10 flex flex-col gap-5 p-4 sm:p-6">

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.22em] text-white/35 sm:text-[10px]">Нийт дансны үлдэгдэл</p>
            {loading ? (
              <div className="mt-3 flex items-center gap-2 text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Татаж байна…</span>
              </div>
            ) : (
              <>
                <h2 className="mt-1 truncate text-2xl font-extrabold leading-none tracking-tight text-white sm:text-4xl">
                  {latest.toLocaleString()}
                  <span className="ml-1 text-base font-semibold text-white/50 sm:text-xl">₮</span>
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={cn('flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    isUp?'border-emerald-500/25 bg-emerald-500/15 text-emerald-400':'border-red-500/25 bg-red-500/15 text-red-400')}>
                    <TrendIcon className="h-3 w-3" />{isUp?'+':''}{changePct}%
                  </Badge>
                  <span className="text-[10px] text-white/30">өмнөх сартай харьцуулахад</span>
                </div>
              </>
            )}
          </div>

          {/* ✅ setMonths → context → бүх component шинэчлэгдэнэ */}
          <div className="flex flex-col items-end gap-1">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25">Хугацаа</p>
            <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
              <SelectTrigger className="h-8 w-[148px] rounded-full border border-white/10 bg-white/[0.05] text-[11px] font-semibold text-white/70 focus:ring-0 focus:ring-offset-0 hover:bg-white/[0.09] transition-colors">
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

        <Separator className="bg-white/[0.06]" />

        <div className="h-36 w-full sm:h-44">
          {loading ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={trendColor} stopOpacity={0.3} />
                    <stop offset="85%"  stopColor={trendColor} stopOpacity={0.03} />
                    <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill:'rgba(255,255,255,0.28)',fontSize:9,fontWeight:600 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill:'rgba(255,255,255,0.20)',fontSize:9 }} tickLine={false} axisLine={false} width={36}
                  tickFormatter={(v:number)=>v>=1_000_000?`${(v/1_000_000).toFixed(1)}М`:v>=1_000?`${(v/1_000).toFixed(0)}к`:`${v}`} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke:'rgba(255,255,255,0.1)',strokeWidth:1,strokeDasharray:'4 4' }} />
                <Area type="monotone" dataKey="value" stroke={trendColor} strokeWidth={2.2} fill="url(#areaGrad)" dot={false}
                  activeDot={{ r:5,fill:trendColor,stroke:'#0c0a1e',strokeWidth:2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/30">Графикт хангалттай өгөгдөл алга</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}