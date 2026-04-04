'use client';

import { useState, type ReactNode } from 'react';
import { useIsNarrow } from '@/hook/use-is-mobile';
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
  type SankeyLinkProps,
  type SankeyNodeProps,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  formatCompactMnt,
  formatPctOneDecimal,
  pctOfTotalInflow,
  type CashflowSankeySummary,
  type SankeyDisplayMode,
  type SankeyLinkKind,
} from '@/lib/analytics/cashflow-sankey-data';

export type CashflowSankeyChartData = {
  nodes: Array<Record<string, unknown>>;
  links: Array<{ source: number; target: number; value: number; linkKind: SankeyLinkKind }>;
};

const LINK_STROKE: Record<SankeyLinkKind, string> = {
  inflow: '#38bdf8',
  incomeAggregate: '#67e8f9',
  hub: '#a78bfa',
  expense: '#fb923c',
  loan: '#e879f9',
  remaining: '#2dd4bf',
};

/** Босоо anchor block — ribbon-оос бараан, бат (CashFlow palette) */
const NODE_ANCHOR_FILL: Record<string, string> = {
  incomeLeaf: '#062c44',
  incomeGroup: '#0a5c6f',
  totalIncome: '#4c1d95',
  mainTrunk: '#5b21b6',
  expenseGroupFixed: '#7c2d12',
  expenseGroupVar: '#9a3412',
  loanGroup: '#701a75',
  savingsGroup: '#115e59',
  expenseLeaf: '#7c2d12',
  loanLeaf: '#86198f',
  remainingLeaf: '#0f766e',
};

/** Урсгалын бөглөсөн ribbon — `linkWidth` нь утгатай пропорционал */
const RIBBON_FILL: Record<SankeyLinkKind, string> = {
  inflow: 'url(#ribbon-fill-inflow)',
  incomeAggregate: 'url(#ribbon-fill-income-agg)',
  hub: 'url(#ribbon-fill-hub)',
  expense: 'url(#ribbon-fill-expense)',
  loan: 'url(#ribbon-fill-loan)',
  remaining: 'url(#ribbon-fill-remaining)',
};

function cubicBezier(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function cubicBezierDerivative(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const u = 1 - t;
  return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

/**
 * Төвийн cubic Bézier-ийн дагуу нормалын offset → хаалттай бөглөсөн ribbon polygon.
 * Өргөн нь Recharts-ийн `linkWidth` (утга → layout-ийн нягтралтай холбоотой).
 */
function buildFilledRibbonPath(
  sourceX: number,
  sourceY: number,
  sourceControlX: number,
  targetControlX: number,
  targetX: number,
  targetY: number,
  linkWidthPx: number,
  samples = 88
): string {
  const x0 = sourceX;
  const y0 = sourceY;
  const x1 = sourceControlX;
  const y1 = sourceY;
  const x2 = targetControlX;
  const y2 = targetY;
  const x3 = targetX;
  const y3 = targetY;

  const half = Math.max(linkWidthPx / 2, 0.85);

  const topX: number[] = [];
  const topY: number[] = [];
  const botX: number[] = [];
  const botY: number[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const cx = cubicBezier(t, x0, x1, x2, x3);
    const cy = cubicBezier(t, y0, y1, y2, y3);
    const dx = cubicBezierDerivative(t, x0, x1, x2, x3);
    const dy = cubicBezierDerivative(t, y0, y1, y2, y3);
    const len = Math.hypot(dx, dy) || 1e-9;
    const nx = -dy / len;
    const ny = dx / len;
    topX.push(cx + nx * half);
    topY.push(cy + ny * half);
    botX.push(cx - nx * half);
    botY.push(cy - ny * half);
  }

  let d = `M ${topX[0].toFixed(2)} ${topY[0].toFixed(2)}`;
  for (let i = 1; i < topX.length; i++) {
    d += ` L ${topX[i].toFixed(2)} ${topY[i].toFixed(2)}`;
  }
  for (let i = botX.length - 1; i >= 0; i--) {
    d += ` L ${botX[i].toFixed(2)} ${botY[i].toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

function CashflowSankeyLink(props: SankeyLinkProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    payload,
    className,
    ...rest
  } = props;

  const kind = (payload as { linkKind?: SankeyLinkKind }).linkKind ?? 'inflow';
  const fill = RIBBON_FILL[kind] ?? 'url(#ribbon-fill-hub)';

  const ribbonW = Math.max(linkWidth, 1.65);

  const d = buildFilledRibbonPath(
    sourceX,
    sourceY,
    sourceControlX,
    targetControlX,
    targetX,
    targetY,
    ribbonW
  );

  return (
    <path
      {...rest}
      d={d}
      fill={fill}
      stroke="rgba(15,23,42,0.28)"
      strokeWidth={0.3}
      shapeRendering="geometricPrecision"
      className={cn(
        'recharts-sankey-link transition-[opacity] hover:opacity-[0.97]',
        className
      )}
    />
  );
}

function SankeyDefs() {
  return (
    <defs>
      <linearGradient id="ribbon-fill-inflow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.68} />
        <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.74} />
        <stop offset="100%" stopColor="#0284c7" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="ribbon-fill-income-agg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.62} />
        <stop offset="50%" stopColor="#818cf8" stopOpacity={0.68} />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.64} />
      </linearGradient>
      <linearGradient id="ribbon-fill-hub" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.64} />
        <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.7} />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.66} />
      </linearGradient>
      <linearGradient id="ribbon-fill-expense" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fb923c" stopOpacity={0.62} />
        <stop offset="50%" stopColor="#f97316" stopOpacity={0.68} />
        <stop offset="100%" stopColor="#ea580c" stopOpacity={0.64} />
      </linearGradient>
      <linearGradient id="ribbon-fill-loan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e879f9" stopOpacity={0.6} />
        <stop offset="50%" stopColor="#d946ef" stopOpacity={0.66} />
        <stop offset="100%" stopColor="#c026d3" stopOpacity={0.62} />
      </linearGradient>
      <linearGradient id="ribbon-fill-remaining" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.62} />
        <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.68} />
        <stop offset="100%" stopColor="#0d9488" stopOpacity={0.64} />
      </linearGradient>
    </defs>
  );
}

type NodeExtraProps = {
  displayMode: SankeyDisplayMode;
  totalInflow: number;
  /** Mobile — жижиг SVG текст */
  compact?: boolean;
};

function formatNodeMetric(
  displayMode: SankeyDisplayMode,
  value: number,
  totalInflow: number
): string {
  if (displayMode === 'amount') {
    return formatCompactMnt(value);
  }
  return formatPctOneDecimal(pctOfTotalInflow(value, totalInflow));
}

function nodeLabelPlacement(nodeKind: string): 'left' | 'right' | 'top' {
  switch (nodeKind) {
    case 'incomeLeaf':
    case 'incomeGroup':
      return 'left';
    case 'totalIncome':
    case 'mainTrunk':
    case 'expenseGroupFixed':
    case 'expenseGroupVar':
    case 'loanGroup':
    case 'savingsGroup':
      return 'top';
    case 'expenseLeaf':
    case 'loanLeaf':
    case 'remainingLeaf':
      return 'right';
    default:
      return 'right';
  }
}

function CashflowSankeyNode(props: SankeyNodeProps & NodeExtraProps) {
  const { x, y, width, height, payload, displayMode, totalInflow, compact } = props;
  const p = payload as {
    name?: string;
    nodeKind?: string;
    value?: number;
  };
  const name = p.name ?? '';
  const nodeKind = p.nodeKind ?? 'expenseLeaf';
  const fill: string = NODE_ANCHOR_FILL[nodeKind] ?? '#334155';

  const v = Number(p.value ?? 0);
  const metric = formatNodeMetric(displayMode, v, totalInflow);

  const cx = x + width / 2;
  const cy = y + height / 2;
  const barRx = 1.5;
  const placement = nodeLabelPlacement(nodeKind);

  const emphasis =
    nodeKind === 'totalIncome' || nodeKind === 'mainTrunk';
  const nameSize = emphasis ? (compact ? 8.5 : 10) : compact ? 7.5 : 9;
  const metricSize = emphasis ? (compact ? 9.5 : 11.5) : compact ? 8.5 : 10.5;
  const labelShadow = emphasis
    ? '0 1px 3px rgba(0,0,0,0.65)'
    : '0 2px 8px rgba(0,0,0,0.75)';
  const metricShadow = emphasis
    ? '0 1px 2px rgba(0,0,0,0.55)'
    : '0 1px 8px rgba(0,0,0,0.85)';

  const shortName =
    name.length > 26 ? `${name.slice(0, 24)}…` : name;

  const nameEl = (nx: number, ny: number, anchor: 'start' | 'middle' | 'end') => (
    <text
      x={nx}
      y={ny}
      textAnchor={anchor}
      dominantBaseline="middle"
      fill={emphasis ? '#f8fafc' : '#f1f5f9'}
      fontSize={nameSize}
      fontWeight={emphasis ? 700 : 600}
      className="pointer-events-none select-none"
      style={{ textShadow: labelShadow }}
    >
      {shortName}
    </text>
  );

  const metricEl = (nx: number, ny: number, anchor: 'start' | 'middle' | 'end') => (
    <text
      x={nx}
      y={ny}
      textAnchor={anchor}
      dominantBaseline="middle"
      fill={displayMode === 'amount' ? '#e0f2fe' : '#ddd6fe'}
      fontSize={metricSize}
      fontWeight={800}
      className="pointer-events-none select-none tabular-nums"
      style={{ textShadow: metricShadow }}
    >
      {metric}
    </text>
  );

  let label: ReactNode = null;
  const pad = 11;

  if (placement === 'left') {
    label = (
      <g>
        {nameEl(x - pad, cy - 12, 'end')}
        {metricEl(x - pad, cy + 10, 'end')}
      </g>
    );
  } else if (placement === 'right') {
    label = (
      <g>
        {nameEl(x + width + pad, cy - 12, 'start')}
        {metricEl(x + width + pad, cy + 10, 'start')}
      </g>
    );
  } else {
    label = (
      <g>
        {nameEl(cx, y - 13, 'middle')}
        {metricEl(cx, y + height + 13, 'middle')}
      </g>
    );
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={barRx}
        fill={fill}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={0.65}
        className="pointer-events-auto"
      />
      {label}
    </g>
  );
}

type TooltipPayloadItem = {
  name?: string;
  value?: number;
  payload?: {
    value?: number;
    source?: { name?: string; nodeKind?: string };
    target?: { name?: string; nodeKind?: string };
    linkKind?: SankeyLinkKind;
  };
};

function SankeyTooltipContent({
  active,
  payload,
  displayMode,
  totalInflow,
}: {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  displayMode: SankeyDisplayMode;
  totalInflow: number;
}) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const raw = entry.payload;
  const value = Number(entry.value ?? raw?.value ?? 0);
  const pctIn = pctOfTotalInflow(value, totalInflow);

  const isLink =
    raw?.source &&
    raw?.target &&
    typeof raw.source === 'object' &&
    typeof raw.target === 'object';

  const title = isLink
    ? `${raw.source?.name ?? ''} → ${raw.target?.name ?? ''}`
    : (entry.name ?? '');

  const kind = raw?.linkKind;
  const accent = kind ? LINK_STROKE[kind] : '#a78bfa';

  const main =
    displayMode === 'amount'
      ? formatCurrency(value, 'MNT')
      : formatPctOneDecimal(pctIn);

  return (
    <div
      className={cn(
        'max-w-[min(92vw,280px)] rounded-[0.85rem] border border-white/[0.12]',
        'bg-[#121826]/[0.97] px-3 py-2.5 shadow-[0_24px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:min-w-[200px] sm:max-w-[280px] sm:rounded-xl sm:px-3.5 sm:py-3'
      )}
    >
      <div
        className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-500 sm:mb-1.5 sm:text-[10px] sm:tracking-[0.2em]"
        style={{ color: accent }}
      >
        {isLink ? 'Урсгал' : 'Зангилаа'}
      </div>
      <div className="text-[11px] font-bold leading-snug text-white sm:text-[13px]">{title}</div>

      <div className="mt-2 border-t border-white/10 pt-2 sm:mt-3 sm:pt-3">
        <p className="font-mono text-[0.95rem] font-black leading-none tracking-tight text-white tabular-nums sm:text-lg">
          {main}
        </p>
      </div>
    </div>
  );
}

function DisplayModeToggle({
  mode,
  onChange,
}: {
  mode: SankeyDisplayMode;
  onChange: (m: SankeyDisplayMode) => void;
}) {
  return (
    <div
      className="inline-flex w-full max-w-full rounded-[1rem] border border-white/5 bg-brand-bg/90 p-0.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:w-auto sm:rounded-2xl sm:p-1"
      role="group"
      aria-label="Харуулах горим"
    >
      {(
        [
          { id: 'amount' as const, label: 'Мөнгөн дүнгээр' },
          { id: 'percentage' as const, label: 'Эзлэх хувиар' },
        ] as const
      ).map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'relative min-h-[36px] flex-1 rounded-[0.65rem] px-2.5 py-1.5 text-[10px] font-bold transition-all sm:min-h-[40px] sm:flex-none sm:rounded-xl sm:px-5 sm:py-2 sm:text-sm',
            mode === id
              ? 'text-white shadow-[0_0_24px_rgba(112,96,240,0.35)]'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          {mode === id && (
            <span
              className="absolute inset-0 rounded-[0.65rem] bg-gradient-to-r from-brand-primary/90 to-fuchsia-500/75 opacity-100 sm:rounded-xl"
              aria-hidden
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}

function SummaryChip({
  label,
  amount,
  displayMode,
  totalInflow,
  accentClass,
}: {
  label: string;
  amount: number;
  displayMode: SankeyDisplayMode;
  totalInflow: number;
  accentClass: string;
}) {
  const pct = pctOfTotalInflow(amount, totalInflow);
  const value =
    displayMode === 'amount' ? formatCurrency(amount, 'MNT') : formatPctOneDecimal(pct);

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-0.5 rounded-[1rem] border border-white/5 sm:min-w-[140px] sm:gap-1 sm:rounded-2xl',
        'bg-brand-card/90 bg-gradient-to-b from-white/[0.04] to-transparent px-2.5 py-2 sm:px-4 sm:py-2.5',
        'shadow-[0_0_40px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.05)]'
      )}
    >
      <span className="text-[8px] font-bold uppercase tracking-wider text-brand-muted sm:text-[10px]">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-sm font-black tabular-nums tracking-tight sm:text-base md:text-lg',
          accentClass
        )}
      >
        {value}
      </span>
    </div>
  );
}

type CashflowSankeySectionProps = {
  sankeyData: CashflowSankeyChartData;
  summary: CashflowSankeySummary;
};

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.55;
const ZOOM_STEP = 0.1;
function clampZoom(z: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
}

export function CashflowSankeySection({ sankeyData, summary }: CashflowSankeySectionProps) {
  const [displayMode, setDisplayMode] = useState<SankeyDisplayMode>('amount');
  const [chartZoom, setChartZoom] = useState(1);
  const narrow = useIsNarrow();
  const data = sankeyData;
  const s = summary;
  const totalInflow = s.totalInflow || 1;
  const baseChartH = narrow ? 440 : 560;
  const chartHeight = Math.round(baseChartH * chartZoom);
  const sankeyMargin = narrow
    ? { top: 6, right: 88, bottom: 10, left: 88 }
    : { top: 12, right: 175, bottom: 16, left: 175 };
  const chartMinWidthPx = Math.round(920 * chartZoom);

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-[1.0625rem] font-bold leading-snug tracking-tight text-white sm:text-2xl md:text-3xl md:font-black">
            Мөнгөн урсгалын шинжилгээ
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-brand-muted sm:text-sm md:text-base">
            Орлого, зардал, зээлийн урсгалыг нэг дор харуулна
          </p>
        </div>
        <div className="shrink-0 lg:pl-4">
          <DisplayModeToggle mode={displayMode} onChange={setDisplayMode} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2.5 lg:grid-cols-none">
        <SummaryChip
          label="Нийт орлого"
          amount={s.totalInflow}
          displayMode={displayMode}
          totalInflow={totalInflow}
          accentClass="text-sky-300"
        />
        <SummaryChip
          label="Нийт зардал"
          amount={s.totalExpense}
          displayMode={displayMode}
          totalInflow={totalInflow}
          accentClass="text-amber-300"
        />
        <SummaryChip
          label="Зээлийн төлөлт"
          amount={s.totalLoanPayments}
          displayMode={displayMode}
          totalInflow={totalInflow}
          accentClass="text-fuchsia-300"
        />
        <SummaryChip
          label="Үлдэгдэл"
          amount={s.remainingCash}
          displayMode={displayMode}
          totalInflow={totalInflow}
          accentClass="text-teal-300"
        />
      </div>

      <div
        className={cn(
          'relative overflow-x-auto overflow-y-hidden rounded-[1.15rem] border border-white/5 sm:rounded-2xl',
          'bg-brand-card/95 shadow-[0_0_48px_rgba(0,0,0,0.35)] backdrop-blur-md'
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.15rem] bg-gradient-to-br from-brand-primary/[0.06] via-transparent to-amber-500/[0.04] sm:rounded-2xl"
          aria-hidden
        />
        <div className="flex flex-wrap items-center justify-end gap-1.5 border-b border-white/[0.06] px-2 py-2 sm:px-4">
          <span className="mr-auto text-[9px] font-semibold uppercase tracking-wider text-brand-muted sm:text-[10px]">
            Харагдац
          </span>
          <button
            type="button"
            aria-label="Жижигрүүлэх"
            disabled={chartZoom <= ZOOM_MIN + 0.01}
            onClick={() => setChartZoom((z) => clampZoom(z - ZOOM_STEP))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>
          <span className="min-w-[2.75rem] text-center font-mono text-[10px] tabular-nums text-white/80 sm:text-[11px]">
            {Math.round(chartZoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Томруулах"
            disabled={chartZoom >= ZOOM_MAX - 0.01}
            onClick={() => setChartZoom((z) => clampZoom(z + ZOOM_STEP))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setChartZoom(1)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-brand-muted transition hover:bg-white/10 hover:text-white sm:px-3 sm:text-[10px]"
          >
            100%
          </button>
        </div>
        <div
          className="relative px-2 pb-1 pt-1.5 sm:min-h-[300px] sm:px-6 sm:pb-2 sm:pt-3"
          style={{ width: chartMinWidthPx, minHeight: chartHeight + 36 }}
        >
          <div className="mb-2 grid grid-cols-3 items-end gap-1 border-b border-white/[0.06] px-1 pb-1.5 sm:mb-2.5 sm:gap-2 sm:px-2 sm:pb-2 md:px-3">
            <span className="text-left text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.22em]">
              Орлого
            </span>
            <span className="text-center text-[8px] font-bold uppercase tracking-[0.12em] text-violet-200/95 sm:text-[10px] sm:tracking-[0.28em]">
              Төвийн урсгал
            </span>
            <span className="text-right text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.22em]">
              Гаралт
            </span>
          </div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <Sankey
              data={data}
              nodePadding={narrow ? 26 : 36}
              nodeWidth={narrow ? 10 : 12}
              linkCurvature={0.54}
              iterations={240}
              sort
              verticalAlign="justify"
              align="justify"
              margin={sankeyMargin}
              node={(nodeProps) => (
                <CashflowSankeyNode
                  {...nodeProps}
                  displayMode={displayMode}
                  totalInflow={totalInflow}
                  compact={narrow}
                />
              )}
              link={(linkProps) => <CashflowSankeyLink {...linkProps} />}
            >
              <SankeyDefs />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }}
                content={(tooltipProps) => (
                  <SankeyTooltipContent
                    active={tooltipProps.active}
                    payload={tooltipProps.payload as readonly TooltipPayloadItem[] | undefined}
                    displayMode={displayMode}
                    totalInflow={totalInflow}
                  />
                )}
              />
            </Sankey>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-white/[0.06] px-3 py-2 sm:gap-x-5 sm:gap-y-2 sm:px-6 sm:py-2.5">
          <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[10px]">
            <span className="size-2.5 rounded-sm bg-sky-400/85 ring-1 ring-white/10" />
            Орлого
          </span>
          <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[10px]">
            <span className="size-2.5 rounded-sm bg-violet-400/80 ring-1 ring-white/10" />
            Төвлөрөл
          </span>
          <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[10px]">
            <span className="size-2.5 rounded-sm bg-amber-400/85 ring-1 ring-white/10" />
            Зардал
          </span>
          <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[10px]">
            <span className="size-2.5 rounded-sm bg-fuchsia-400/85 ring-1 ring-white/10" />
            Зээл
          </span>
          <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:gap-2 sm:text-[10px]">
            <span className="size-2.5 rounded-sm bg-teal-400/85 ring-1 ring-white/10" />
            Үлдэгдэл
          </span>
        </div>
      </div>

      <p className="mt-0 px-1 text-center text-[9px] leading-snug text-brand-muted sm:px-0 sm:text-left sm:text-[10px]">
        {displayMode === 'percentage'
          ? 'Хувь: нийт орлого (Нийт мөнгөн урсгал)-ын суурьтай.'
          : 'Дүн: бүгдийг ₮-ээр харуулна.'}
      </p>
    </section>
  );
}
