'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildAmortizationSchedule, getLoanForAmortization } from '@/lib/loan-amortization';
import { buildLoanPaidHistory, getLoanJsonById } from '@/lib/loan-paid-history';
import { formatCurrency } from '@/lib/utils';

type Props = {
  loanId: string;
  currency: string;
};

const INTEREST = '#a78bfa';
const PRINCIPAL = '#34d399';

export function LoanPmtChart({ loanId, currency }: Props) {
  const { chartData, firstShare, lastShare } = useMemo(() => {
    const loanAm = getLoanForAmortization(loanId);
    const loanPaid = getLoanJsonById(loanId);
    if (!loanAm || !loanPaid) {
      return {
        chartData: [] as {
          x: string;
          dateLabel: string;
          interest: number;
          principal: number;
          total: number;
          interestPct: number;
        }[],
        firstShare: null as { interestPct: number } | null,
        lastShare: null as { interestPct: number } | null,
      };
    }

    const schedule = buildAmortizationSchedule(loanAm);
    const paidRows = [...buildLoanPaidHistory(loanPaid)].sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey),
    );
    const n = Math.min(paidRows.length, schedule.length);

    const data: {
      x: string;
      dateLabel: string;
      interest: number;
      principal: number;
      total: number;
      interestPct: number;
    }[] = [];

    for (let i = 0; i < n; i++) {
      const s = schedule[i];
      const p = paidRows[i];
      const total = s.interest + s.principal;
      const interestPct = total > 0 ? (s.interest / total) * 100 : 0;
      data.push({
        x: p.dateKey.slice(5),
        dateLabel: p.dateLabel,
        interest: s.interest,
        principal: s.principal,
        total,
        interestPct,
      });
    }

    let first: { interestPct: number } | null = null;
    let last: { interestPct: number } | null = null;
    if (data.length >= 1) {
      first = { interestPct: data[0].interestPct };
      last = { interestPct: data[data.length - 1].interestPct };
    }

    return { chartData: data, firstShare: first, lastShare: last };
  }, [loanId]);

  if (chartData.length === 0) {
    return null;
  }

  /** Wide enough so every bar stays visible (scroll horizontally if many). */
  const pxPerBar = 44;
  const chartWidth = Math.max(320, chartData.length * pxPerBar);
  const chartHeight = chartData.length > 24 ? 320 : 280;

  return (
    <div className="rounded-2xl border border-white/10 bg-brand-card/30 p-4 sm:p-5">
      <div className="mb-4 space-y-2">
        <div>
          <h3 className="text-sm font-bold text-white">Үндсэн зээлийн ба хүүгийн төлбөрийн харьцаа</h3>
        </div>
        {firstShare && lastShare && chartData.length >= 2 && (
          <p className="text-[11px] text-brand-muted/90 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
            Эхний төлбөр: хүү ~{firstShare.interestPct.toFixed(1)}% · Сүүлийн төлбөр: хүү ~
            {lastShare.interestPct.toFixed(1)}%
          </p>
        )}
      </div>

      <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-1">
        <div style={{ width: `max(100%, ${chartWidth}px)`, height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="x"
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }}
              interval={0}
              angle={chartData.length > 12 ? -35 : 0}
              textAnchor={chartData.length > 12 ? 'end' : 'middle'}
              height={chartData.length > 12 ? 52 : 28}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
              tickFormatter={(v) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`
              }
              width={44}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as (typeof chartData)[0];
                return (
                  <div className="rounded-xl border border-white/10 bg-[#0f0d1f]/95 px-3 py-2 shadow-xl backdrop-blur-md max-w-[220px]">
                    <p className="mb-1 text-[10px] font-semibold text-white/40">{d.dateLabel}</p>
                    <p className="text-[11px] text-violet-300 tabular-nums">
                      Хүү: {formatCurrency(d.interest, currency)}
                    </p>
                    <p className="text-[11px] text-emerald-300 tabular-nums">
                      Зээл: {formatCurrency(d.principal, currency)}
                    </p>
                    <p className="mt-1 text-[10px] text-white/50">
                      Нийт: {formatCurrency(d.total, currency)} · Хүү{' '}
                      {d.interestPct.toFixed(1)}%
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => (
                <span className="text-white/75">
                  {value === 'interest' ? 'Хүүгийн төлбөр' : 'Бодит зээлийн төлбөр'}
                </span>
              )}
            />
            <Bar
              dataKey="interest"
              stackId="split"
              fill={INTEREST}
              name="interest"
              radius={[0, 0, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="principal"
              stackId="split"
              fill={PRINCIPAL}
              name="principal"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
