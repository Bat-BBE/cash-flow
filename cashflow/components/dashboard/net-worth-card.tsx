'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, BarChart3, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';

const RANGE_DATA = {
  '3M': [
    { label: '10-р', value: 270 },
    { label: '11-р', value: 278 },
    { label: '12-р', value: 284.5 },
  ],
  '6M': [
    { label: '7-р',  value: 250 },
    { label: '8-р',  value: 258 },
    { label: '9-р',  value: 265 },
    { label: '10-р', value: 270 },
    { label: '11-р', value: 278 },
    { label: '12-р', value: 284.5 },
  ],
  '1Y': [
    { label: '1-р',  value: 210 },
    { label: '2-р',  value: 218 },
    { label: '3-р',  value: 225 },
    { label: '4-р',  value: 230 },
    { label: '5-р',  value: 238 },
    { label: '6-р',  value: 245 },
    { label: '7-р',  value: 250 },
    { label: '8-р',  value: 258 },
    { label: '9-р',  value: 265 },
    { label: '10-р', value: 170 },
    { label: '11-р', value: 178 },
    { label: '12-р', value: 190.5 },
  ],
};

const BREAKDOWN = [
  { label: 'Бэлэн / Хадгаламж', value: 42, color: '#34d399', icon: Wallet },
  { label: 'Хөрөнгө оруулалт',   value: 35, color: '#38bdf8', icon: BarChart3 },
  { label: 'Бусад хөрөнгө',       value: 23, color: '#a78bfa', icon: Layers },
];

type Range = '3M' | '6M' | '1Y';

/* ─── Custom tooltip ────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0d1f]/90 px-3 py-2 shadow-2xl backdrop-blur-md">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="text-sm font-bold text-white">
        {payload[0].value.toFixed(1)}
        <span className="ml-1 text-[10px] font-normal text-white/50">сая ₮</span>
      </p>
    </div>
  );
}

/* ─── Donut ring ────────────────────────────────────────────────── */
function DonutRing({ pct, color }: { pct: number; color: string }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="20" height="20" viewBox="0 0 36 36" className="shrink-0">
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx="18" cy="18" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function NetWorthCard() {
  const [range, setRange] = useState<Range>('6M');
  const pts = RANGE_DATA[range];
  const first = pts[0].value;
  const last  = pts[pts.length - 1].value;
  const isUp  = last >= first;
  const changePct = (((last - first) / first) * 100).toFixed(1);

  const trendColor = isUp ? '#34d399' : '#f87171';
  const TrendIcon  = isUp ? TrendingUp : TrendingDown;

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0a1e] shadow-[0_0_60px_rgba(88,50,220,0.15)] sm:rounded-3xl">
      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-700/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-600/10 blur-[60px]" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-cyan-500/8 blur-[50px]" />

      <CardContent className="relative z-10 flex flex-col gap-5 p-4 sm:p-6">

        {/* ── Top row ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* Left: title + value */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.22em] text-white/35 sm:text-[10px]">
              Нийт цэвэр хөрөнгө
            </p>
            <h2 className="mt-1 truncate text-2xl font-extrabold leading-none tracking-tight text-white sm:text-4xl">
              284.5<span className="ml-1 text-base font-semibold text-white/50 sm:text-xl">сая ₮</span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                  isUp
                    ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-400'
                    : 'border-red-500/25 bg-red-500/15 text-red-400'
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {isUp ? '+' : ''}{changePct}%
              </Badge>
              <span className="text-[10px] text-white/30">өмнөх сартай харьцуулахад</span>
            </div>
          </div>

          {/* Right: range pills */}
          <div className="flex items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.04] p-1">
            {(['3M', '6M', '1Y'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-full px-3 py-1 text-[10px] font-bold transition-all duration-200 sm:text-xs',
                  range === r
                    ? 'bg-violet-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.5)]'
                    : 'text-white/30 hover:text-white/60'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* ── Chart ── */}
        <div className="h-36 w-full sm:h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pts} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={trendColor} stopOpacity={0.3} />
                  <stop offset="85%"  stopColor={trendColor} stopOpacity={0.03} />
                  <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.replace('-р', '')}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.20)', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}`}
                width={36}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={trendColor}
                strokeWidth={2.2}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: trendColor,
                  stroke: '#0c0a1e',
                  strokeWidth: 2,
                  filter: 'url(#glow)',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* ── Breakdown ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {BREAKDOWN.map(({ label, value, color, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 sm:p-3 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${color}22` }}>
                  <Icon className="h-3 w-3" style={{ color }} />
                </div>
                <DonutRing pct={value} color={color} />
              </div>
              <div>
                <p
                  className="line-clamp-1 text-[9px] font-semibold text-white/40 sm:text-[10px]"
                  title={label}
                >
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-bold sm:text-base" style={{ color }}>
                  {value}%
                </p>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}