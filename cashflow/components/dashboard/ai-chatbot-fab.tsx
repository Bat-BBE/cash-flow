'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/contexts/dashboard-data-context';
import { buildFinancialSummary } from '@/lib/ai-financial-summary';

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string };

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/60"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  );
}

export function AiChatbotFab() {
  const { rawTxs, timeRange, loading } = useDashboardData();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending, open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!rawTxs.length) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: 'Эхлээд банкны гүйлгээний өгөгдөл ачаалагдана уу.',
        },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const summary = buildFinancialSummary(rawTxs, timeRange);
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: summary, userMessage: text }),
      });
      const data = await res.json();
      if (data.skipped) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: 'AI түлхүүр тохируулаагүй байна (.env.local → GEMINI_API_KEY).',
          },
        ]);
      } else {
        const reply = typeof data.text === 'string' ? data.text.trim() : '';
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', text: reply || 'Хариулт ирээгүй.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: 'Холболтын алдаа гарлаа.' },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, rawTxs, timeRange, sending]);

  if (typeof document === 'undefined') return null;

  const panel =
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px]"
          aria-label="Чат хаах"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            'fixed z-[101] flex max-h-[min(520px,78dvh)] w-[min(100vw-1rem,22rem)] flex-col overflow-hidden',
            'rounded-2xl border border-white/[0.1] bg-[#12151f]/98 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl',
            'bottom-[calc(4.85rem+env(safe-area-inset-bottom))] right-3 sm:right-5',
            'md:bottom-8 md:right-8 md:max-h-[min(560px,80vh)] md:w-[24rem]',
          )}
          role="dialog"
          aria-label="AI туслах чат"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-white">AI туслах</p>
                <p className="truncate text-[9px] text-white/40">Орлого, зарлагын талаас асуух</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80"
              aria-label="Хаах"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2.5">
            {loading && (
              <p className="text-[10px] text-white/35">Өгөгдөл ачаалж байна…</p>
            )}
            {!loading && messages.length === 0 && (
              <p className="text-[10px] leading-relaxed text-white/40">
                Санхүүгийн асуултаа бичнэ үү. Таны нэвтрүүлсэн өгөгдөлд үндэслэн хариулна.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'rounded-xl px-2.5 py-2 text-[11px] leading-relaxed',
                  m.role === 'user'
                    ? 'ml-3 bg-violet-600/25 text-white/95'
                    : 'mr-2 border border-white/[0.06] bg-white/[0.04] text-white/75',
                )}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="mr-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-2.5 py-2">
                <ThinkingDots />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-white/[0.08] p-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Асуулт бичих…"
                disabled={sending || loading}
                className="min-h-10 min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-black/35 px-3 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-violet-500/40"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!input.trim() || sending || loading}
                className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-35"
              >
                Илгээх
              </button>
            </div>
          </div>
        </div>
      </>,
      document.body,
    );

  return (
    <>
      {panel}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed z-[99] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 md:h-[3.75rem] md:w-[3.75rem]',
          'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-900/40 ring-2 ring-white/10',
          'bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-3 sm:right-4',
          'md:bottom-8 md:right-8',
          open && 'ring-violet-400/50',
        )}
        aria-label={open ? 'Чат хаах' : 'AI туслах нээх'}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[26px] md:text-[28px]">
          {open ? 'close' : 'chat_bubble'}
        </span>
      </button>
    </>
  );
}
