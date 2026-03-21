'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn }                          from '@/lib/utils';
import { useDashboardData, RawTx, categorize } from '@/contexts/dashboard-data-context';
import { useDashboard }                from '@/components/providers/dashboard-provider';
import { useTranslation }              from '@/lib/translations';

/* ─── Types ──────────────────────────────────────────────────────── */
type InsightLevel = 'critical' | 'warning' | 'success' | 'tip' | 'info';

interface AIInsightItem {
  id:      string;
  level:   InsightLevel;
  icon:    string;
  title:   string;
  message: string;
  metric?: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' };
  action?: string;
  badge?:  string;
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const LEVEL_STYLES: Record<InsightLevel, { card: string; icon: string; badge: string; dot: string }> = {
  critical: { card: 'border-rose-500/25 bg-rose-500/[0.06]',       icon: 'bg-rose-500/15 text-rose-400',       badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20',       dot: 'bg-rose-500'    },
  warning:  { card: 'border-amber-500/25 bg-amber-500/[0.05]',     icon: 'bg-amber-500/15 text-amber-400',     badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',     dot: 'bg-amber-500'   },
  success:  { card: 'border-emerald-500/25 bg-emerald-500/[0.05]', icon: 'bg-emerald-500/15 text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  tip:      { card: 'border-violet-500/25 bg-violet-500/[0.05]',   icon: 'bg-violet-500/15 text-violet-400',   badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20',   dot: 'bg-violet-500'  },
  info:     { card: 'border-sky-500/25 bg-sky-500/[0.05]',         icon: 'bg-sky-500/15 text-sky-400',         badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',            dot: 'bg-sky-500'     },
};

const LEVEL_LABELS: Record<InsightLevel, string> = {
  critical: 'Анхаар', warning: 'Сэрэмжлүүлэг', success: 'Сайн', tip: 'Зөвлөгөө', info: 'Мэдээлэл',
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtMn(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}сая₮`;
  if (v >= 1_000)     return `${Math.round(v / 1_000)}мян₮`;
  return `${Math.round(v)}₮`;
}

function filterMonth(txs: RawTx[], y: number, m: number) {
  return txs.filter(t => { const d = new Date(t.date); return d.getFullYear() === y && d.getMonth() + 1 === m; });
}
function getMonthsAgo(n: number) {
  const d = new Date(); d.setMonth(d.getMonth() - n);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}
function pct(cur: number, prev: number) {
  return prev === 0 ? 0 : Math.round(((cur - prev) / Math.abs(prev)) * 100);
}

/* ─── Build financial summary ────────────────────────────────────── */
function buildFinancialSummary(txs: RawTx[], months: number): string {
  const now = new Date();
  const cy = now.getFullYear(), cm = now.getMonth() + 1;
  const p1 = getMonthsAgo(1), p2 = getMonthsAgo(2), p3 = getMonthsAgo(3);

  const curTxs  = filterMonth(txs, cy, cm);
  const prevTxs = filterMonth(txs, p1.y, p1.m);
  const p2Txs   = filterMonth(txs, p2.y, p2.m);
  const p3Txs   = filterMonth(txs, p3.y, p3.m);

  const inc = (arr: RawTx[]) => arr.reduce((s, t) => s + (t.credit ?? 0), 0);
  const exp = (arr: RawTx[]) => arr.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);

  const curInc = inc(curTxs), curExp = exp(curTxs);
  const p1Inc  = inc(prevTxs), p1Exp = exp(prevTxs);
  const p2Exp  = exp(p2Txs),   p3Exp = exp(p3Txs);

  const catExp: Record<string, number> = {};
  const catInc: Record<string, number> = {};
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  txs.filter(t => new Date(t.date) >= cutoff).forEach(t => {
    if (Math.abs(t.debit ?? 0) > 0) {
      const cat = categorize(t.description, true).category;
      catExp[cat] = (catExp[cat] ?? 0) + Math.abs(t.debit);
    }
    if ((t.credit ?? 0) > 0) {
      const cat = categorize(t.description, false).category;
      catInc[cat] = (catInc[cat] ?? 0) + t.credit;
    }
  });

  const topExpCats = Object.entries(catExp).sort(([,a],[,b]) => b-a).slice(0,5)
    .map(([k,v]) => `${k}: ${fmtMn(v)}`).join(', ');
  const topIncCats = Object.entries(catInc).sort(([,a],[,b]) => b-a).slice(0,3)
    .map(([k,v]) => `${k}: ${fmtMn(v)}`).join(', ');

  const avg3Exp = [p1Exp, p2Exp, p3Exp].filter(Boolean).reduce((a,b) => a+b, 0) /
                  ([p1Exp, p2Exp, p3Exp].filter(Boolean).length || 1);

  const latestBal = txs.filter(t => t.closingBalance != null)
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.closingBalance ?? 0;

  return `
Сонгосон хугацаа: ${months} сар
Данс: Залуусын харилцах данс (MNT)

ЭНЭ САРЫН (${cy}/${cm}) МЭДЭЭЛЭЛ:
- Нийт орлого: ${fmtMn(curInc)}
- Нийт зарлага: ${fmtMn(curExp)}
- Цэвэр үр дүн: ${fmtMn(curInc - curExp)} (${curInc > curExp ? 'ашигтай' : 'алдагдалтай'})
- Зарлага/орлогын харьцаа: ${curInc > 0 ? Math.round((curExp/curInc)*100) : 'n/a'}%

ӨМНӨХ САРУУДТАЙ ХАРЬЦУУЛАЛТ:
- 1 сарын өмнө: орлого ${fmtMn(p1Inc)}, зарлага ${fmtMn(p1Exp)}
- Орлогын өөрчлөлт: ${pct(curInc, p1Inc) > 0 ? '+' : ''}${pct(curInc, p1Inc)}%
- Зарлагын өөрчлөлт: ${pct(curExp, p1Exp) > 0 ? '+' : ''}${pct(curExp, p1Exp)}%
- 3 сарын дундаж зарлага: ${fmtMn(avg3Exp)}

ЗАРЛАГЫН АНГИЛЛАЛ (сүүлийн ${months} сар):
${topExpCats || 'мэдээлэл байхгүй'}

ОРЛОГЫН АНГИЛЛАЛ (сүүлийн ${months} сар):
${topIncCats || 'мэдээлэл байхгүй'}

ДАНСНЫ ҮЛДЭГДЭЛ (одоогийн): ${fmtMn(latestBal)}
  `.trim();
}

/* ─── Parse AI response ──────────────────────────────────────────── */
function parseAIInsights(text: string): AIInsightItem[] {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
    const jsonStr   = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : text;
    const parsed    = JSON.parse(jsonStr.trim());
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, i) => ({
      id:      item.id      ?? `ai-${i}`,
      level:   (['critical','warning','success','tip','info'].includes(item.level) ? item.level : 'tip') as InsightLevel,
      icon:    item.icon    ?? 'lightbulb',
      title:   item.title   ?? '',
      message: item.message ?? '',
      metric:  item.metric  ?? undefined,
      action:  item.action  ?? undefined,
      badge:   item.badge   ?? undefined,
    }));
  } catch {
    return [];
  }
}

/* ─── MetricBadge ────────────────────────────────────────────────── */
function MetricBadge({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.06] rounded-lg px-3 py-1.5 w-fit">
      <span className="text-[10px] text-white/40">{label}</span>
      <span className={cn(
        'text-[11px] font-bold flex items-center gap-0.5',
        trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white',
      )}>
        {trend === 'up'   && <span className="material-symbols-outlined text-[11px]">arrow_upward</span>}
        {trend === 'down' && <span className="material-symbols-outlined text-[11px]">arrow_downward</span>}
        {value}
      </span>
    </div>
  );
}

/* ─── InsightNavCard ─────────────────────────────────────────────── */
function InsightNavCard({ insight, isActive, onClick }: {
  insight: AIInsightItem; isActive: boolean; onClick: () => void;
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
        <p className={cn(
          'flex-1 min-w-0 text-[11px] font-semibold truncate transition-colors',
          isActive ? 'text-white' : 'text-white/50',
        )}>
          {insight.title}
        </p>
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

/* ─── ThinkingDots ───────────────────────────────────────────────── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0,1,2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function SmartInsight() {
  const { rawTxs, months, loading } = useDashboardData();
  const { language }                = useDashboard();
  const t                           = useTranslation(language);

  const [insights,  setInsights]  = useState<AIInsightItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const abortRef     = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<{ months: number; txCount: number } | null>(null);

  /* ── fetchInsights ── */
  const fetchInsights = useCallback(async () => {
    if (!rawTxs.length) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setAiLoading(true);
    setInsights([]);
    setActiveIdx(0);
    setError(null);

    const summary = buildFinancialSummary(rawTxs, months);

    const prompt = `Та санхүүгийн зөвлөх AI юм. Доорх хэрэглэгчийн банкны мэдээлэлд үндэслэн орлого болон зарлагатай холбоотой 4-5 зөвлөмж өг.

САНХҮҮГИЙН МЭДЭЭЛЭЛ:
${summary}

ЗААВРУУД:
- Зөвхөн ОРЛОГО болон ЗАРЛАГАТАЙ холбоотой зөвлөмж өг (хадгаламжийн тухай ОГТХОН биш)
- Зарлагын хэв маяг, категорийн өсөлт/бууралт, орлогын тогтвортой байдлыг дүн шинжилгээ хий
- Практик, тодорхой, монгол хэлээр бич
- level: "critical" | "warning" | "success" | "tip" | "info"
- Хамгийн чухлаас эхлэн эрэмбэл

Дараах JSON форматаар ЗӨВХӨН JSON array буцаа (Markdown, тайлбар огт хэрэггүй):
[
  {
    "id": "unique-id",
    "level": "warning",
    "icon": "material_icon_name",
    "title": "Богино гарчиг (15 тэмдэгтээс хэтрэхгүй)",
    "message": "Дэлгэрэнгүй тайлбар, тодорхой тоо баримт оруулсан (2-3 өгүүлбэр)",
    "metric": { "label": "Хэмжүүрийн нэр", "value": "утга", "trend": "up|down|neutral" },
    "action": "Үйлдлийн текст (заавал биш)",
    "badge": "Товч тэмдэглэгээ (заавал биш)"
  }
]`;

    try {
      const res = await fetch('/api/insights', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  abortRef.current.signal,
        body:    JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const text = data.text ?? '';

      const parsed = parseAIInsights(text);
      if (parsed.length) {
        setInsights(parsed);
      } else {
        setError('Зөвлөмж үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Холболтын алдаа гарлаа.');
      }
    } finally {
      setAiLoading(false);
    }
  }, [rawTxs, months]);

  /* ── Auto-fetch — зөвхөн өгөгдөл үнэхээр өөрчлөгдөхөд ── */
  useEffect(() => {
    if (!loading && rawTxs.length) {
      const same = lastFetchRef.current?.months   === months &&
                   lastFetchRef.current?.txCount  === rawTxs.length;
      if (!same) {
        lastFetchRef.current = { months, txCount: rawTxs.length };
        fetchInsights();
      }
    }
    return () => abortRef.current?.abort();
  }, [rawTxs, months, loading]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="bg-brand-card rounded-2xl border border-white/5 p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/5 rounded w-28" />
          <div className="h-20 bg-white/5 rounded-xl" />
          {[1,2,3].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const safeIdx = Math.min(activeIdx, Math.max(insights.length - 1, 0));
  const active  = insights[safeIdx];
  const s       = active ? LEVEL_STYLES[active.level] : null;

  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 p-4 sm:p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-violet-400 leading-none">psychology</span>
          <h3 className="text-sm font-bold text-white">{t('aiInsightTitle')}</h3>
        </div>
        <button
          onClick={fetchInsights}
          disabled={aiLoading}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
        >
          <span className={cn('material-symbols-outlined text-xs', aiLoading && 'animate-spin')}>
            refresh
          </span>
          Шинэчлэх
        </button>
      </div>

      {/* ── AI thinking state ── */}
      {aiLoading && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-sm text-violet-400 animate-pulse">psychology</span>
            <span className="text-[11px] text-violet-300 font-medium">AI дүн шинжилгээ хийж байна...</span>
          </div>
          <ThinkingDots />
        </div>
      )}

      {/* ── Error state ── */}
      {error && !aiLoading && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4 mb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-rose-400 text-sm">error</span>
          <p className="text-[11px] text-rose-300 flex-1">{error}</p>
          <button onClick={fetchInsights} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold">
            Дахин
          </button>
        </div>
      )}

      {/* ── Active insight detail ── */}
      {!aiLoading && active && s && (
        <div className={cn('rounded-xl border p-4 mb-4 transition-all duration-200', s.card)}>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('material-symbols-outlined text-base leading-none p-1.5 rounded-lg shrink-0', s.icon)}>
              {active.icon}
            </span>
            <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border', s.badge)}>
              {active.badge ?? LEVEL_LABELS[active.level]}
            </span>
          </div>

          <h4 className="text-[13px] font-bold text-white mb-1.5 leading-snug">{active.title}</h4>
          <p className="text-[11px] text-white/55 leading-relaxed mb-3">{active.message}</p>

          {active.metric && (
            <div className="mb-3">
              <MetricBadge {...active.metric} />
            </div>
          )}

          {active.action && (
            <button className={cn(
              'flex items-center gap-1.5 text-[11px] font-semibold transition-colors',
              active.level === 'success'  ? 'text-emerald-400 hover:text-emerald-300' :
              active.level === 'critical' ? 'text-rose-400 hover:text-rose-300'       :
              active.level === 'warning'  ? 'text-amber-400 hover:text-amber-300'     :
              active.level === 'info'     ? 'text-sky-400 hover:text-sky-300'         :
                                            'text-violet-400 hover:text-violet-300',
            )}>
              {active.action}
              <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
            </button>
          )}
        </div>
      )}

      {/* ── Insight nav list ── */}
      {!aiLoading && insights.length > 0 && (
        <div className="space-y-1.5">
          {insights.map((insight, i) => (
            <InsightNavCard
              key={insight.id}
              insight={insight}
              isActive={i === safeIdx}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!aiLoading && !error && insights.length === 0 && (
        <div className="flex items-center gap-3 py-2">
          <span className="material-symbols-outlined p-2 rounded-xl text-sm bg-white/5 text-white/30 border border-white/10">lightbulb</span>
          <p className="text-sm text-white/30">Мэдэгдэл байхгүй байна</p>
        </div>
      )}

    </div>
  );
}