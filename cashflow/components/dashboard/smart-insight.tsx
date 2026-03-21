'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn, formatCurrency }           from '@/lib/utils';
import { useDashboardData, RawTx, categorize } from '@/contexts/dashboard-data-context';
import { useDashboard }                 from '@/components/providers/dashboard-provider';
import { useTranslation }               from '@/lib/translations';

/* ─── Types ──────────────────────────────────────────────────────── */
type InsightLevel = 'critical' | 'warning' | 'success' | 'tip' | 'info';

interface SmartInsightItem {
  id:       string;
  level:    InsightLevel;
  icon:     string;
  title:    string;
  message:  string;
  metric?:  { label: string; value: string; trend?: 'up' | 'down' | 'neutral' };
  action?:  string;
  badge?:   string;
}

/* ─── Style maps ─────────────────────────────────────────────────── */
const LEVEL_STYLES: Record<InsightLevel, {
  card:   string; icon:  string; badge: string;
  bar:    string; dot:   string;
}> = {
  critical: {
    card:  'border-rose-500/25 bg-rose-500/[0.06]',
    icon:  'bg-rose-500/15 text-rose-400',
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    bar:   'bg-rose-500',
    dot:   'bg-rose-500',
  },
  warning: {
    card:  'border-amber-500/25 bg-amber-500/[0.05]',
    icon:  'bg-amber-500/15 text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    bar:   'bg-amber-500',
    dot:   'bg-amber-500',
  },
  success: {
    card:  'border-emerald-500/25 bg-emerald-500/[0.05]',
    icon:  'bg-emerald-500/15 text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    bar:   'bg-emerald-500',
    dot:   'bg-emerald-500',
  },
  tip: {
    card:  'border-violet-500/25 bg-violet-500/[0.05]',
    icon:  'bg-violet-500/15 text-violet-400',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    bar:   'bg-violet-500',
    dot:   'bg-violet-500',
  },
  info: {
    card:  'border-sky-500/25 bg-sky-500/[0.05]',
    icon:  'bg-sky-500/15 text-sky-400',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    bar:   'bg-sky-500',
    dot:   'bg-sky-500',
  },
};

const LEVEL_LABELS: Record<InsightLevel, string> = {
  critical: 'Анхаар',
  warning:  'Сэрэмжлүүлэг',
  success:  'Сайн',
  tip:      'Зөвлөгөө',
  info:     'Мэдээлэл',
};

/* ─── Data helpers ───────────────────────────────────────────────── */
function fmtMn(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}сая₮`;
  if (v >= 1_000)     return `${Math.round(v / 1_000)}мян₮`;
  return `${Math.round(v)}₮`;
}

function filterMonth(txs: RawTx[], y: number, m: number): RawTx[] {
  return txs.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === y && d.getMonth() + 1 === m;
  });
}

function getMonthsAgo(n: number): { y: number; m: number } {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}

function pct(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((cur - prev) / Math.abs(prev)) * 100);
}

/* ─── Insight engine ─────────────────────────────────────────────── */
function buildSmartInsights(txs: RawTx[], months: number): SmartInsightItem[] {
  if (!txs.length) return [];

  const now   = new Date();
  const cy    = now.getFullYear();
  const cm    = now.getMonth() + 1;
  const prev1 = getMonthsAgo(1);
  const prev2 = getMonthsAgo(2);
  const prev3 = getMonthsAgo(3);

  const curTxs   = filterMonth(txs, cy, cm);
  const prevTxs  = filterMonth(txs, prev1.y, prev1.m);
  const prev2Txs = filterMonth(txs, prev2.y, prev2.m);
  const prev3Txs = filterMonth(txs, prev3.y, prev3.m);

  // Орлого / зарлага
  const curInc  = curTxs.reduce((s, t) => s + (t.credit ?? 0), 0);
  const curExp  = curTxs.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);
  const prevInc = prevTxs.reduce((s, t) => s + (t.credit ?? 0), 0);
  const prevExp = prevTxs.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);
  const p2Exp   = prev2Txs.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);
  const p3Exp   = prev3Txs.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);

  const savRate  = curInc > 0 ? (curInc - curExp) / curInc : 0;
  const expChg   = pct(curExp, prevExp);
  const incChg   = pct(curInc, prevInc);
  const list: SmartInsightItem[] = [];

  // ─── 1. Хадгаламжийн хувийн дүн шинжилгээ ───
  if (savRate >= 0.3) {
    list.push({
      id: 'sav-great', level: 'success', icon: 'savings',
      title: 'Хадгаламж маш сайн байна!',
      message: `Орлогынхоо ${Math.round(savRate * 100)}%-ийг хадгалж байна. Санхүүгийн зорилго тогтоох хамгийн тохиромжтой үе.`,
      metric: { label: 'Хадгаламжийн хувь', value: `${Math.round(savRate * 100)}%`, trend: 'up' },
      badge: 'Шилдэг',
    });
  } else if (savRate >= 0.1 && savRate < 0.2) {
    list.push({
      id: 'sav-low', level: 'warning', icon: 'savings',
      title: 'Хадгаламжийн хувь бага байна',
      message: `Одоо ${Math.round(savRate * 100)}% хадгалж байгаа ч санхүүгийн аюулгүй байдлын хэмжээ 20% юм. Сарын ${fmtMn((curInc * 0.2) - (curInc - curExp))} нэмж хадгалах боломжтой.`,
      metric: { label: 'Одоогийн хувь', value: `${Math.round(savRate * 100)}%`, trend: 'down' },
      action: 'Хэрхэн нэмэгдүүлэх вэ?',
    });
  } else if (savRate < 0.1 && curInc > 0) {
    list.push({
      id: 'sav-critical', level: 'critical', icon: 'warning',
      title: 'Хадгаламж маш бага — анхааруулга',
      message: `Зарлага орлогын ${Math.round((curExp / curInc) * 100)}%-д хүрч байна. Шаардлагатай бус зарлагаа тодорхойлж, хэмнэх боломжийг эрэлхийл.`,
      metric: { label: 'Зарлагын харьцаа', value: `${Math.round((curExp / curInc) * 100)}%`, trend: 'down' },
      action: 'Зарлагаа шалгах',
      badge: 'Яаралтай',
    });
  }

  // ─── 2. Зарлагын хандлага (3 сарын трэнд) ───
  const avgPrevExp = [prevExp, p2Exp, p3Exp].filter(Boolean);
  const avg3mo     = avgPrevExp.length ? avgPrevExp.reduce((a, b) => a + b, 0) / avgPrevExp.length : 0;

  if (avg3mo > 0 && curExp > avg3mo * 1.25) {
    list.push({
      id: 'exp-spike', level: 'critical', icon: 'trending_up',
      title: `Зарлага 3 сарын дунджаас ${Math.round(((curExp - avg3mo) / avg3mo) * 100)}% өндөр`,
      message: `Энэ сар ${fmtMn(curExp)} зарцуулсан ба сүүлийн 3 сарын дундаж ${fmtMn(avg3mo)}. Ер бусын том зардал гарсан байж болзошгүй.`,
      metric: { label: 'Зарлагын өсөлт', value: `+${Math.round(((curExp - avg3mo) / avg3mo) * 100)}%`, trend: 'down' },
      action: 'Гүйлгээг харах',
      badge: 'Анхаар',
    });
  } else if (avg3mo > 0 && curExp < avg3mo * 0.8) {
    list.push({
      id: 'exp-drop', level: 'success', icon: 'trending_down',
      title: 'Зарлага буурсан — сайн хяналт!',
      message: `Энэ сарын зарлага 3 сарын дунджаас ${Math.round(((avg3mo - curExp) / avg3mo) * 100)}% буурсан. ${fmtMn(avg3mo - curExp)} илүү хэмнэлт гарлаа.`,
      metric: { label: 'Хэмнэлт', value: fmtMn(avg3mo - curExp), trend: 'up' },
    });
  }

  // ─── 3. Ангиллын шинжилгээ ───
  const catExp: Record<string, { cur: number; prev: number }> = {};
  curTxs.forEach((t) => {
    if (Math.abs(t.debit ?? 0) === 0) return;
    const cat = categorize(t.description, true).category;
    if (!catExp[cat]) catExp[cat] = { cur: 0, prev: 0 };
    catExp[cat].cur += Math.abs(t.debit);
  });
  prevTxs.forEach((t) => {
    if (Math.abs(t.debit ?? 0) === 0) return;
    const cat = categorize(t.description, true).category;
    if (!catExp[cat]) catExp[cat] = { cur: 0, prev: 0 };
    catExp[cat].prev += Math.abs(t.debit);
  });

  // Хамгийн их өссөн ангилал
  const topRising = Object.entries(catExp)
    .filter(([, v]) => v.prev > 0 && v.cur > 10_000)
    .map(([cat, v]) => ({ cat, chg: pct(v.cur, v.prev), cur: v.cur, prev: v.prev }))
    .sort((a, b) => b.chg - a.chg)[0];

  if (topRising && topRising.chg > 30) {
    list.push({
      id: 'cat-rising', level: 'warning', icon: 'category',
      title: `"${topRising.cat}" зарлага ${topRising.chg}% өслөө`,
      message: `Өмнөх сар ${fmtMn(topRising.prev)} байснаас энэ сар ${fmtMn(topRising.cur)} болж өслөө. Шалтгааныг нь судлах нь зүйтэй.`,
      metric: { label: 'Өсөлт', value: `+${topRising.chg}%`, trend: 'down' },
    });
  }

  // Хамгийн их зарцуулж буй ангилал (% of total)
  const topCat = Object.entries(catExp)
    .sort(([, a], [, b]) => b.cur - a.cur)[0];

  if (topCat && curExp > 0) {
    const topPct = Math.round((topCat[1].cur / curExp) * 100);
    if (topPct >= 30) {
      list.push({
        id: 'cat-dominant', level: 'tip', icon: 'pie_chart',
        title: `Зарлагын ${topPct}% нэг ангилалд`,
        message: `"${topCat[0]}" ангилал бусдаас хамаагүй давамгайлж байна (${fmtMn(topCat[1].cur)}). Энэ ангилалд лимит тогтоох нь санхүүгийн тэнцвэрт тусална.`,
        metric: { label: topCat[0], value: fmtMn(topCat[1].cur), trend: 'neutral' },
        action: 'Лимит тогтоох',
      });
    }
  }

  // ─── 4. Орлогын тогтвортой байдал ───
  const incomes = [curInc, prevInc,
    filterMonth(txs, prev2.y, prev2.m).reduce((s, t) => s + (t.credit ?? 0), 0),
  ].filter(Boolean);

  if (incomes.length >= 2) {
    const avgInc = incomes.reduce((a, b) => a + b, 0) / incomes.length;
    const maxInc = Math.max(...incomes);
    const minInc = Math.min(...incomes);
    const volatility = avgInc > 0 ? ((maxInc - minInc) / avgInc) * 100 : 0;

    if (volatility > 40) {
      list.push({
        id: 'inc-volatile', level: 'warning', icon: 'show_chart',
        title: 'Орлого тогтворгүй байна',
        message: `Сарын орлого ${fmtMn(minInc)}–${fmtMn(maxInc)} хооронд хэлбэлзэж байна. Тогтмол орлогын эх үүсвэр бий болгох нь санхүүгийн аюулгүй байдалд чухал.`,
        metric: { label: 'Хэлбэлзэл', value: `${Math.round(volatility)}%`, trend: 'down' },
      });
    } else if (incChg > 10) {
      list.push({
        id: 'inc-up', level: 'success', icon: 'trending_up',
        title: `Орлого ${incChg}% өслөө`,
        message: `Өмнөх сартай харьцуулахад орлого ${fmtMn(curInc - prevInc)}-аар нэмэгдсэн. Энэ нэмэлт орлогоо хадгаламж эсвэл хөрөнгө оруулалтад зарцуулах боломжтой.`,
        metric: { label: 'Нэмэлт орлого', value: fmtMn(curInc - prevInc), trend: 'up' },
        action: 'Хаана хадгалах вэ?',
      });
    }
  }

  // ─── 5. Гүйлгээний давтамж (ATM / бэлэн мөнгө) ───
  const atmTxs = curTxs.filter((t) => {
    if (Math.abs(t.debit ?? 0) <= 0) return false;
    const cat = categorize(t.description, true).category;
    return cat === 'ATM авалт' || (t.description || '').toLowerCase().includes('atm');
  });
  const atmTotal = atmTxs.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);

  if (atmTxs.length >= 3 || (curExp > 0 && atmTotal / curExp > 0.15)) {
    list.push({
      id: 'atm-frequent', level: 'tip', icon: 'atm',
      title: `Бэлэн мөнгоны зарлага өндөр (${atmTxs.length} удаа)`,
      message: `Энэ сар ATM-ээс ${fmtMn(atmTotal)} авсан нь нийт зарлагын ${Math.round((atmTotal / curExp) * 100)}%. Дижитал төлбөрт шилжих нь зарлагын хяналтад тусална.`,
      metric: { label: 'ATM авалт', value: fmtMn(atmTotal), trend: 'down' },
    });
  }

  // ─── 6. Тогтмол зарлагын дүн шинжилгээ (recurring) ───
  const recurringKeywords = ['openai', '81742', 'мобиком', 'starlink', 'убдс', 'убцтс', 'unitel'];
  const recurring = curTxs.filter((t) => {
    const d = (t.description || '').toLowerCase();
    return recurringKeywords.some((k) => d.includes(k)) && Math.abs(t.debit ?? 0) > 0;
  });
  const recurringTotal = recurring.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);

  if (recurringTotal > 0 && curExp > 0) {
    const recPct = Math.round((recurringTotal / curExp) * 100);
    list.push({
      id: 'recurring', level: 'info', icon: 'autorenew',
      title: `Тогтмол зардал: ${fmtMn(recurringTotal)} (${recPct}%)`,
      message: `Интернет, гар утас, дижитал үйлчилгээ зэрэг ${recurring.length} тогтмол зардал илрүүлэгдлэ. Эдгээрийг жилийн урьдчилсан тооцоонд оруулах нь зүйтэй.`,
      metric: { label: 'Тогтмол зардал', value: fmtMn(recurringTotal), trend: 'neutral' },
    });
  }

  // ─── 7. Сарын эцсийн үлдэгдэл хандлага ───
  const lastBalances = txs
    .filter((t) => t.closingBalance != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  if (lastBalances.length >= 2) {
    const first = lastBalances[0].closingBalance!;
    const last  = lastBalances[lastBalances.length - 1].closingBalance!;
    const balChg = pct(last, first);

    if (last < 0) {
      list.push({
        id: 'bal-negative', level: 'critical', icon: 'account_balance_wallet',
        title: 'Дансны үлдэгдэл сөрөг байна',
        message: `Одоогийн дансны үлдэгдэл ${fmtMn(Math.abs(last))} сөрөг. Шуурхай арга хэмжээ авахгүй бол зээлийн хүү нэмэгдэж болзошгүй.`,
        metric: { label: 'Үлдэгдэл', value: fmtMn(last), trend: 'down' },
        badge: 'Яаралтай',
      });
    } else if (balChg < -20 && lastBalances.length >= 10) {
      list.push({
        id: 'bal-declining', level: 'warning', icon: 'account_balance_wallet',
        title: 'Дансны үлдэгдэл буурах хандлагатай',
        message: `Сүүлийн үеийн гүйлгээнд үндэслэхэд үлдэгдэл ${Math.abs(balChg)}%-иар буурсан байна. Зарлагыг хянах шаардлагатай байна.`,
        metric: { label: 'Өөрчлөлт', value: `${balChg}%`, trend: 'down' },
      });
    }
  }

  // Хамгийн чухлаас эхлэн эрэмбэлнэ
  const ORDER: InsightLevel[] = ['critical', 'warning', 'success', 'tip', 'info'];
  return list
    .sort((a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level))
    .slice(0, 5); // хамгийн чухал 5-г харуулна
}

/* ─── Metric badge ───────────────────────────────────────────────── */
function MetricBadge({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.06] rounded-lg px-3 py-1.5">
      <span className="text-[10px] text-white/40">{label}</span>
      <span className={cn(
        'text-[11px] font-bold flex items-center gap-0.5',
        trend === 'up'   ? 'text-emerald-400' :
        trend === 'down' ? 'text-rose-400'    : 'text-white',
      )}>
        {trend === 'up'   && <span className="material-symbols-outlined text-[11px]">arrow_upward</span>}
        {trend === 'down' && <span className="material-symbols-outlined text-[11px]">arrow_downward</span>}
        {value}
      </span>
    </div>
  );
}

/* ─── Single insight card ────────────────────────────────────────── */
function InsightCard({
  insight, isActive, onClick,
}: {
  insight: SmartInsightItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const s = LEVEL_STYLES[insight.level];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border px-3 py-2.5 transition-all duration-200',
        isActive
          ? cn(s.card, 'ring-1 ring-white/10')
          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10',
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn(
          'material-symbols-outlined text-base leading-none p-1.5 rounded-lg shrink-0',
          isActive ? s.icon : 'bg-white/[0.06] text-white/40',
        )}>
          {insight.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-[11px] font-semibold truncate transition-colors',
            isActive ? 'text-white' : 'text-white/50',
          )}>
            {insight.title}
          </p>
        </div>
        {insight.badge && isActive && (
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0', s.badge)}>
            {insight.badge}
          </span>
        )}
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isActive ? s.dot : 'bg-white/15')} />
      </div>
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function SmartInsight() {
  const { rawTxs, months, loading } = useDashboardData();
  const { language }                = useDashboard();
  const t                           = useTranslation(language);
  const [activeIdx, setActiveIdx]   = useState(0);

  const insights = useMemo(
    () => buildSmartInsights(rawTxs, months),
    [rawTxs, months],
  );

  // months өөрчлөгдөхөд reset
  useEffect(() => { setActiveIdx(0); }, [insights]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/5 rounded w-28" />
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!insights.length) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 p-6 flex items-center gap-3">
        <span className="material-symbols-outlined p-2 rounded-xl text-sm bg-white/5 text-white/30 border border-white/10">
          lightbulb
        </span>
        <p className="text-sm text-white/30">Мэдэгдэл байхгүй байна</p>
      </div>
    );
  }

  const safeIdx = Math.min(activeIdx, insights.length - 1);
  const active  = insights[safeIdx];
  const s       = LEVEL_STYLES[active.level];

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 p-4 sm:p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-violet-400 leading-none">psychology</span>
          <h3 className="text-sm font-bold text-white">{t('aiInsightTitle')}</h3>
        </div>
        <span className="text-[10px] text-white/30 font-medium">
          {insights.length} дүн шинжилгээ
        </span>
      </div>

      {/* ── Active insight detail ── */}
      <div className={cn(
        'rounded-xl border p-4 mb-4 transition-all duration-200',
        s.card,
      )}>
        {/* Type badge + title */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              'material-symbols-outlined text-base leading-none p-1.5 rounded-lg shrink-0',
              s.icon,
            )}>
              {active.icon}
            </span>
            <div>
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border',
                s.badge,
              )}>
                {active.badge ?? LEVEL_LABELS[active.level]}
              </span>
            </div>
          </div>
        </div>

        <h4 className="text-[13px] font-bold text-white mb-1.5 leading-snug">
          {active.title}
        </h4>

        <p className="text-[11px] text-white/55 leading-relaxed mb-3">
          {active.message}
        </p>

        {/* Metric badge */}
        {active.metric && (
          <div className="mb-3">
            <MetricBadge {...active.metric} />
          </div>
        )}

        {/* Action */}
        {active.action && (
          <button className={cn(
            'flex items-center gap-1.5 text-[11px] font-semibold transition-colors',
            active.level === 'success' ? 'text-emerald-400 hover:text-emerald-300' :
            active.level === 'critical'? 'text-rose-400 hover:text-rose-300'       :
            active.level === 'warning' ? 'text-amber-400 hover:text-amber-300'     :
            active.level === 'info'    ? 'text-sky-400 hover:text-sky-300'         :
                                         'text-violet-400 hover:text-violet-300',
          )}>
            {active.action}
            <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
          </button>
        )}
      </div>

      {/* ── Insight list (compact nav) ── */}
      <div className="space-y-1.5">
        {insights.map((insight, i) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            isActive={i === safeIdx}
            onClick={() => setActiveIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}