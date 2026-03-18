'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const RANGE_DATA = {
  '3M': {
    labels: ['10-р', '11-р', '12-р'],
    data: [270, 278, 284.5],
  },
  '6M': {
    labels: ['7-р', '8-р', '9-р', '10-р', '11-р', '12-р'],
    data: [250, 258, 265, 270, 278, 284.5],
  },
  '1Y': {
    labels: ['1-р','2-р','3-р','4-р','5-р','6-р','7-р','8-р','9-р','10-р','11-р','12-р'],
    data: [210, 218, 225, 230, 238, 245, 250, 258, 265, 170, 178, 190.5],
  },
};

export function NetWorthCard() {
  const { data, currency, language } = useDashboard();
  const t = useTranslation(language);
  const [range, setRange] = useState<'3M' | '6M' | '1Y'>('6M');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pts = RANGE_DATA[range].data;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const isUp = last >= first;
    const min = Math.min(...pts) * 0.995;
    const max = Math.max(...pts) * 1.002;
    const padX = 8;
    const padY = 10;

    const toX = (i: number) => padX + (i / (pts.length - 1)) * (W - padX * 2);
    const toY = (v: number) => padY + (1 - (v - min) / (max - min)) * (H - padY * 2);

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(120,110,200,0.12)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = padY + (i / 3) * (H - padY * 2);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Area fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    if (isUp) {
      grad.addColorStop(0, 'rgba(34,197,94,0.25)');   // emerald
      grad.addColorStop(1, 'rgba(34,197,94,0)');
    } else {
      grad.addColorStop(0, 'rgba(248,113,113,0.28)'); // red
      grad.addColorStop(1, 'rgba(248,113,113,0)');
    }
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0]));
    for (let i = 1; i < pts.length; i++) {
      const cx = (toX(i - 1) + toX(i)) / 2;
      ctx.bezierCurveTo(cx, toY(pts[i - 1]), cx, toY(pts[i]), toX(i), toY(pts[i]));
    }
    ctx.lineTo(toX(pts.length - 1), H);
    ctx.lineTo(toX(0), H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0]));
    for (let i = 1; i < pts.length; i++) {
      const cx = (toX(i - 1) + toX(i)) / 2;
      ctx.bezierCurveTo(cx, toY(pts[i - 1]), cx, toY(pts[i]), toX(i), toY(pts[i]));
    }
    ctx.strokeStyle = isUp ? '#22c55e' : '#f97373';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    const dotColor = isUp ? '#4ade80' : '#fb7185';
    pts.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(toX(i), toY(v), 3, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.strokeStyle = '#1a1730';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Last dot accent
    const lx = toX(pts.length - 1);
    const ly = toY(pts[pts.length - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, 5, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? '#22c55e' : '#f97373';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [range]);

  const labels = RANGE_DATA[range].labels;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-brand-card px-5 py-5 sm:px-6 sm:py-6 flex flex-col gap-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/8 blur-2xl" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
            {t('totalNetWorth')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {formatCurrency(data.netWorth, 'MNT')}
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              ▲ {data.netWorthChange}
            </span>
            <span className="text-[10px] text-brand-muted">{t('vsLastMonth')}</span>
          </div>
        </div>

        {/* Range pills */}
        <div className="flex items-center gap-1 rounded-full border border-white/8 bg-white/4 p-1 text-[10px] sm:text-xs">
          {(['3M', '6M', '1Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-full px-3 py-1 font-semibold transition-all duration-200',
                range === r
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(112,96,240,0.4)]'
                  : 'text-white/35 hover:text-white/70'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart + donut overview */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch gap-4">
        {/* Main line chart */}
        <div className="flex-1">
          <div className="h-32 w-full sm:h-36">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
          <div className="mt-2 flex justify-between px-1">
            {labels.map((l) => (
              <span
                key={l}
                className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-brand-muted"
              >
                {l.replace('-р', '')}
              </span>
            ))}
          </div>
        </div>

        {/* Donut summary */}
        <div className="flex w-full max-w-[120px] flex-col items-center justify-center gap-2">
          <svg viewBox="0 0 36 36" className="h-16 w-16">
            <defs>
              <linearGradient id="netWorthDonut" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle
              className="text-white/10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              cx="18"
              cy="18"
              r="14"
            />
            <circle
              stroke="url(#netWorthDonut)"
              strokeWidth="3"
              strokeDasharray="60 40"
              strokeDashoffset="10"
              strokeLinecap="round"
              fill="none"
              cx="18"
              cy="18"
              r="14"
            />
            <circle cx="18" cy="18" r="8" fill="#020617" />
            <text
              x="18"
              y="18"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[7px] fill-white font-semibold"
            >
              {labels.length}
              M
            </text>
          </svg>
          <div className="space-y-1 text-[9px] text-brand-muted">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Cash / Deposit</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Investments</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom quick stats */}
      {/* <div className="mt-4 grid grid-cols-3 gap-3 text-[10px] sm:text-xs text-brand-muted">
        <div className="flex flex-col gap-0.5">
          <span className="uppercase tracking-[0.16em]">Income</span>
          <span className="font-semibold text-emerald-400">
            {formatCurrency(data.incomeTotal ?? 0, 'MNT')}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="uppercase tracking-[0.16em]">Expenses</span>
          <span className="font-semibold text-red-400">
            {formatCurrency(data.expenseTotal ?? 0, 'MNT')}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="uppercase tracking-[0.16em]">Savings</span>
          <span className="font-semibold text-sky-400">
            {formatCurrency(data.savingsTotal ?? 0, 'MNT')}
          </span>
        </div>
      </div> */}
    </div>
  );
}