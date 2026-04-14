'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn }                          from '@/lib/utils';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { buildFinancialSummary } from '@/lib/ai-financial-summary';

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
    <div className="flex w-fit max-w-full items-center gap-1.5 rounded-[10px] bg-white/[0.06] px-2 py-1 sm:gap-2 sm:rounded-lg sm:px-3 sm:py-1.5">
      <span className="text-[9px] text-white/40 sm:text-[10px]">{label}</span>
      <span className={cn(
        'flex items-center gap-0.5 text-[10px] font-bold tabular-nums sm:text-[11px]',
        trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white',
      )}>
        {trend === 'up'   && <span className="material-symbols-outlined text-[10px] sm:text-[11px]">arrow_upward</span>}
        {trend === 'down' && <span className="material-symbols-outlined text-[10px] sm:text-[11px]">arrow_downward</span>}
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
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-[0.85rem] border px-2.5 py-2 text-left transition-all duration-200 sm:rounded-xl sm:px-3 sm:py-2.5',
        isActive
          ? cn(s.card, 'ring-1 ring-white/10')
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]',
      )}
    >
      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className={cn(
          'material-symbols-outlined shrink-0 rounded-lg p-1 text-[15px] leading-none sm:p-1.5 sm:text-base',
          isActive ? s.icon : 'bg-white/[0.06] text-white/40',
        )}>
          {insight.icon}
        </span>
        <p className={cn(
          'min-w-0 flex-1 truncate text-[10px] font-semibold transition-colors sm:text-[11px]',
          isActive ? 'text-white' : 'text-white/50',
        )}>
          {insight.title}
        </p>
        {insight.badge && isActive && (
          <span className={cn('shrink-0 rounded-full border px-1 py-0.5 text-[8px] font-bold sm:px-1.5 sm:py-0.5 sm:text-[9px]', s.badge)}>
            {insight.badge}
          </span>
        )}
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', isActive ? s.dot : 'bg-white/15')} />
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
  const { rawTxs, timeRange, loading } = useDashboardData();
  const { language }                = useDashboard();
  const t                           = useTranslation(language);

  const [insights,  setInsights]  = useState<AIInsightItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [showGeminiSetupHint, setShowGeminiSetupHint] = useState(false);

  const abortRef     = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<{ timeRange: string; txCount: number } | null>(null);

  /* ── fetchInsights ── */
  const fetchInsights = useCallback(async () => {
    if (!rawTxs.length) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setAiLoading(true);
    setInsights([]);
    setActiveIdx(0);
    setError(null);
    setShowGeminiSetupHint(false);

    const summary = buildFinancialSummary(rawTxs, timeRange);

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
      if (data.skipped) {
        setInsights([]);
        setError(null);
        setShowGeminiSetupHint(true);
        return;
      }

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
  }, [rawTxs, timeRange]);

  /* ── Auto-fetch — зөвхөн өгөгдөл үнэхээр өөрчлөгдөхөд ── */
  useEffect(() => {
    if (!loading && rawTxs.length) {
      const same = lastFetchRef.current?.timeRange === timeRange &&
                   lastFetchRef.current?.txCount === rawTxs.length;
      if (!same) {
        lastFetchRef.current = { timeRange, txCount: rawTxs.length };
        fetchInsights();
      }
    }
    return () => abortRef.current?.abort();
  }, [rawTxs, timeRange, loading]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="rounded-[1.15rem] border border-white/5 bg-brand-card p-3.5 sm:rounded-2xl sm:p-6">
        <div className="animate-pulse space-y-2.5 sm:space-y-3">
          <div className="h-3.5 w-24 rounded bg-white/5 sm:h-4 sm:w-28" />
          <div className="h-16 rounded-[0.85rem] bg-white/5 sm:h-20 sm:rounded-xl" />
          {[1,2,3].map(i => <div key={i} className="h-9 rounded-[0.85rem] bg-white/5 sm:h-10 sm:rounded-xl" />)}
        </div>
      </div>
    );
  }

  const safeIdx = Math.min(activeIdx, Math.max(insights.length - 1, 0));
  const active  = insights[safeIdx];
  const s       = active ? LEVEL_STYLES[active.level] : null;

  return (
    <div className="rounded-[1.15rem] border border-white/5 bg-brand-card p-3.5 sm:rounded-2xl sm:p-6">

      {/* ── Header ── */}
      <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span className="material-symbols-outlined shrink-0 text-[1.05rem] leading-none text-violet-400 sm:text-sm">psychology</span>
          <h3 className="text-[0.8125rem] font-semibold leading-snug tracking-tight text-white sm:text-sm sm:font-bold">{t('aiInsightTitle')}</h3>
        </div>
        <button
          type="button"
          onClick={fetchInsights}
          disabled={aiLoading}
          className="flex shrink-0 items-center gap-0.5 text-[9px] text-white/35 transition-colors hover:text-white/60 disabled:opacity-40 sm:gap-1 sm:text-[10px]"
        >
          <span className={cn('material-symbols-outlined text-[14px] sm:text-xs', aiLoading && 'animate-spin')}>
            refresh
          </span>
          Шинэчлэх
        </button>
      </div>

      {/* ── AI thinking state ── */}
      {aiLoading && (
        <div className="mb-3 rounded-[0.85rem] border border-violet-500/20 bg-violet-500/[0.05] p-3 sm:mb-4 sm:rounded-xl sm:p-4">
          <div className="mb-2 flex items-center gap-1.5 sm:mb-3 sm:gap-2">
            <span className="material-symbols-outlined animate-pulse text-[1.05rem] text-violet-400 sm:text-sm">psychology</span>
            <span className="text-[10px] font-medium leading-snug text-violet-300 sm:text-[11px]">AI дүн шинжилгээ хийж байна...</span>
          </div>
          <ThinkingDots />
        </div>
      )}

      {/* ── Error state ── */}
      {error && !aiLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-[0.85rem] border border-rose-500/20 bg-rose-500/[0.05] p-3 sm:mb-4 sm:gap-3 sm:rounded-xl sm:p-4">
          <span className="material-symbols-outlined shrink-0 text-[1.05rem] text-rose-400 sm:text-sm">error</span>
          <p className="min-w-0 flex-1 text-[10px] leading-relaxed text-rose-300 sm:text-[11px]">{error}</p>
          <button type="button" onClick={fetchInsights} className="shrink-0 text-[9px] font-bold text-rose-400 hover:text-rose-300 sm:text-[10px]">
            Дахин
          </button>
        </div>
      )}

      {/* ── Active insight detail ── */}
      {!aiLoading && active && s && (
        <div className={cn('mb-3 rounded-[0.85rem] border p-3 transition-all duration-200 sm:mb-4 sm:rounded-xl sm:p-4', s.card)}>
          <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 sm:gap-2">
            <span className={cn('material-symbols-outlined shrink-0 rounded-lg p-1 text-[1.05rem] leading-none sm:p-1.5 sm:text-base', s.icon)}>
              {active.icon}
            </span>
            <span className={cn('rounded-full border px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:px-1.5 sm:py-0.5 sm:text-[9px]', s.badge)}>
              {active.badge ?? LEVEL_LABELS[active.level]}
            </span>
          </div>

          <h4 className="mb-1 text-[12px] font-bold leading-snug text-white sm:mb-1.5 sm:text-[13px]">{active.title}</h4>
          <p className="mb-2.5 text-[10px] leading-relaxed text-white/55 sm:mb-3 sm:text-[11px]">{active.message}</p>

          {active.metric && (
            <div className="mb-2.5 sm:mb-3">
              <MetricBadge {...active.metric} />
            </div>
          )}

          {active.action && (
            <button type="button" className={cn(
              'flex items-center gap-1 text-[10px] font-semibold transition-colors sm:gap-1.5 sm:text-[11px]',
              active.level === 'success'  ? 'text-emerald-400 hover:text-emerald-300' :
              active.level === 'critical' ? 'text-rose-400 hover:text-rose-300'       :
              active.level === 'warning'  ? 'text-amber-400 hover:text-amber-300'     :
              active.level === 'info'     ? 'text-sky-400 hover:text-sky-300'         :
                                            'text-violet-400 hover:text-violet-300',
            )}>
              {active.action}
              <span className="material-symbols-outlined text-[1.05rem] leading-none sm:text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      )}

      {/* ── Insight nav list ── */}
      {!aiLoading && insights.length > 0 && (
        <div className="space-y-1 sm:space-y-1.5">
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
        <div className="flex items-start gap-2.5 py-1 sm:gap-3 sm:py-2">
          <span className="material-symbols-outlined shrink-0 rounded-[0.85rem] border border-white/10 bg-white/5 p-1.5 text-[1.05rem] text-white/30 sm:p-2 sm:text-sm">lightbulb</span>
          <p className="min-w-0 text-[11px] leading-relaxed text-white/35 sm:text-sm sm:text-white/30">
            Мэдэгдэл байхгүй байна.
            {showGeminiSetupHint && (
              <span className="mt-1 block text-[9px] leading-relaxed text-white/25 sm:text-[10px] sm:text-white/20">
                AI зөвлөмж ашиглахын тулд .env.local дээр GEMINI_API_KEY нэмнэ үү (Google AI Studio түлхүүр). Vercel дээр ч ижил нэрээр орчны хувьсагч нэмнэ.
              </span>
            )}
          </p>
        </div>
      )}

    </div>
  );
}