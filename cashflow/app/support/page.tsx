'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Primitives
───────────────────────────────────────────── */

function Card({
  children,
  className,
  accentColor,
  glowColor,
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glowColor?: string;
}) {
  return (
    <div className={cn('group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.11] sm:p-5 md:p-6', className)}>
      {accentColor && (
        <div className="pointer-events-none absolute left-0 top-7 h-10 w-[2px] rounded-r-full" style={{ background: accentColor }} />
      )}
      {glowColor && (
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glowColor }}
        />
      )}
      {children}
    </div>
  );
}

/* Quick-action card */
function QuickCard({
  icon,
  title,
  description,
  actionLabel,
  borderColor,
  iconBg,
  iconBorder,
  iconColor,
  textColor,
  delay = 0,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  borderColor: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  textColor: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border p-4 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl sm:p-5',
        borderColor,
        'bg-white/[0.025] backdrop-blur-sm',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      )}
    >
      {/* subtle inner corner glow */}
      <div className="pointer-events-none absolute -top-6 -left-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `color-mix(in srgb, currentColor 30%, transparent)` }} />

      <div className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl border sm:h-10 sm:w-10', iconBg, iconBorder)}>
        <span className={cn('material-symbols-outlined text-lg sm:text-xl', iconColor)}>{icon}</span>
      </div>

      <h2 className="mt-3 text-[12px] font-semibold text-white sm:mt-4 sm:text-[13px]">{title}</h2>
      <p className="mt-1 flex-1 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">{description}</p>

      <button
        type="button"
        className={cn(
          'mt-3 inline-flex w-fit items-center gap-1 text-[10px] font-semibold transition-all duration-200 hover:gap-2 sm:mt-4 sm:text-[11px]',
          textColor,
        )}
      >
        {actionLabel}
        <span className="material-symbols-outlined text-[13px] sm:text-[14px]">arrow_outward</span>
      </button>
    </div>
  );
}

/* FAQ accordion item */
function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        'border-b border-white/[0.05] last:border-0',
        open ? 'pb-4' : '',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start justify-between gap-3 py-3 text-left sm:gap-4 sm:py-4"
      >
        <span className={cn('text-[11px] font-medium leading-snug transition-colors sm:text-[12px]', open ? 'text-amber-300' : 'text-white/75 hover:text-white')}>
          {question}
        </span>
        <span
          className={cn(
            'material-symbols-outlined mt-0.5 shrink-0 text-sm text-white/25 transition-all duration-300 sm:text-base',
            open ? 'rotate-180 text-amber-400/60' : '',
          )}
        >
          expand_more
        </span>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          open ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <p className="pb-1 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">{answer}</p>
      </div>
    </div>
  );
}

/* Status dot */
function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', ok ? 'bg-emerald-400' : 'bg-rose-400')} />
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', ok ? 'bg-emerald-400' : 'bg-rose-400')} />
    </span>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-[11px] text-white/80 placeholder:text-white/20 outline-none transition-all duration-200 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 hover:border-white/[0.13] resize-none sm:px-3.5 sm:py-2.5 sm:text-sm';

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function SupportPage() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1400);
  };

  const faqs = [
    {
      question: 'Шинэ банк эсвэл картыг хэрхэн холбох вэ?',
      answer: '«Данснууд» хэсэгт орж, «Байгууллага холбох»-ыг дарна уу. Дараа нь нууцлалттай холболтын алхмуудыг дагана. Банкны нууц үгийг бид хадгалдаггүй; холболтыг «Тохиргоо» → «Нууцлал»-аас хүссэн үедээ цуцалж болно.',
    },
    {
      question: 'Яагаад үлдэгдэл банктайгаа таарахгүй байна вэ?',
      answer: 'CashFlow үлдэгдлийг тогтмол хугацаанд шинэчилдэг. Заримдаа банкны талд богино саатал гарч болно. «Данснууд»-аас дахин ачаалах эсвэл дээрх системийн төлөвийг шалгаарай.',
    },
    {
      question: 'Миний өгөгдөл, нууцлал хэрхэн хамгаалагддаг вэ?',
      answer: 'Илгээлт болон хадгалалтад банкны түвшний шифрлэлт, хатуу хандах эрх, өгөгдөлд ханалтыг бүртгэдэг систем ашиглана. Өгөгдлөө экспортлох эсвэл устгахыг дэмжлэгээс хүсэж болно.',
    },
    {
      question: 'Төлбөрийн нөхцөл, захиалга өөрчлөх боломжтой юу?',
      answer: 'Тийм. «Тохиргоо» → «Гишүүнчлэл» хэсгээс захиалгаа шинэчлэх, доошлуулах, түр зогсоох боломжтой. Өөрчлөлт нь дараагийн төлбөрийн мөчлөгт хэрэгжинэ.',
    },
  ];

  return (
    <DashboardShell className="bg-brand-bg" mainClassName="bg-brand-bg">
      <div
        className={cn(
          'mx-auto w-full max-w-[1100px] space-y-4 px-3 pb-4 pt-2 transition-all duration-500 sm:space-y-5 sm:px-4 sm:pb-6 sm:pt-3 md:space-y-6 md:px-6 md:pb-10',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        )}
      >

        {/* ── Header ── */}
        <header className="relative space-y-1 border-b border-white/[0.05] pb-4 sm:pb-5">
          <div className="pointer-events-none absolute -top-4 left-0 h-20 w-56 opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
          <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Тусламж & Дэмжлэг
          </h1>
          <p className="max-w-xl text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
            CashFlow-тай холбоотой асуудал, алдаа засах, багтай холбогдох.
          </p>
        </header>

        {/* ── Quick cards ── */}
        <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4">
          <QuickCard
            delay={100}
            icon="chat"
            title="Чат дэмжлэг"
            description="Багийнхантай шууд ярилцаж, тусламж авах."
            actionLabel="Чат нээх"
            borderColor="border-emerald-500/20"
            iconBg="bg-emerald-500/[0.08]"
            iconBorder="border-emerald-500/25"
            iconColor="text-emerald-400"
            textColor="text-emerald-400 hover:text-emerald-300"
          />
          <QuickCard
            delay={180}
            icon="description"
            title="CashFlow заавар"
            description="Данс, төсөв, дүн шинжилгээг хэрхэн ашиглах вэ."
            actionLabel="Баримт бичиг үзэх"
            borderColor="border-blue-500/20"
            iconBg="bg-blue-500/[0.08]"
            iconBorder="border-blue-500/25"
            iconColor="text-blue-400"
            textColor="text-blue-400 hover:text-blue-300"
          />

          {/* Status card */}
          <div
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-white/[0.025] p-4 backdrop-blur-sm transition-all duration-500 hover:border-amber-500/35 sm:col-span-2 sm:p-5 md:col-span-1',
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
            style={{ transitionDelay: '260ms' }}
          >
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/[0.08] sm:h-10 sm:w-10">
              <span className="material-symbols-outlined text-lg text-amber-400 sm:text-xl">notifications_active</span>
            </div>
            <h2 className="mt-3 text-[12px] font-semibold text-white sm:mt-4 sm:text-[13px]">Системийн төлөв</h2>

            {/* live indicators */}
            <div className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
              {[
                { label: 'API холболт', ok: true },
                { label: 'Банкны синк', ok: true },
                { label: 'Мэдэгдэл', ok: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 sm:text-[11px]">{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <StatusDot ok={s.ok} />
                    <span className={cn('text-[10px] font-bold', s.ok ? 'text-emerald-400' : 'text-rose-400')}>
                      {s.ok ? 'Хэвийн' : 'Алдаа'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-3 inline-flex w-fit items-center gap-1 text-[10px] font-semibold text-amber-400 transition-all duration-200 hover:gap-2 hover:text-amber-300 sm:mt-4 sm:text-[11px]"
            >
              Түүх харах
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]">arrow_outward</span>
            </button>
          </div>
        </section>

        {/* ── FAQ + Contact ── */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr,1fr] lg:gap-5">

          {/* FAQ */}
          <Card accentColor="rgba(99,102,241,0.5)" glowColor="rgba(99,102,241,0.08)">
            <div className="mb-4 space-y-0.5 sm:mb-5 sm:space-y-1">
              <h2 className="text-[13px] font-semibold tracking-tight text-white sm:text-[14px]">Түгээмэл асуултууд</h2>
              <p className="text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">Хэрэглэгчид их асдаг зүйлсийн хурдан хариулт.</p>
            </div>
            <div>
              {faqs.map((faq, i) => (
                <FaqItem key={i} index={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </Card>

          {/* Contact form */}
          <Card accentColor="rgba(251,191,36,0.5)" glowColor="rgba(251,191,36,0.06)">
            <div className="mb-4 space-y-0.5 sm:mb-5 sm:space-y-1">
              <h2 className="text-[13px] font-semibold tracking-tight text-white sm:text-[14px]">Дэмжлэгт холбогдох</h2>
              <p className="text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">Товч тайлбар бичнэ үү — боломжит хугацаанд хариулна.</p>
            </div>

            {submitted ? (
              /* Success state */
              <div className="flex flex-col items-center gap-3 py-6 text-center sm:gap-4 sm:py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.1] shadow-[0_0_24px_rgba(52,211,153,0.12)] sm:h-14 sm:w-14">
                  <span className="material-symbols-outlined text-xl text-emerald-400 sm:text-2xl">check_circle</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white sm:text-[13px]">Амжилттай илгээгдлээ</p>
                  <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">Ажлын өдөр 24 цагийн дотор хариулна.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-[10px] font-medium text-white/35 underline underline-offset-2 hover:text-white/60 sm:text-[11px]"
                >
                  Дахин илгээх
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">Гарчиг</label>
                  <input
                    type="text"
                    required
                    placeholder="Данс синк алдаа, төлбөр, санал хүсэлт…"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">Дэлгэрэнгүй</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Огноо, дансны нэр, дэлгэцийн зураг зэргийг бичвэл илүү хурдан шийднэ."
                    className={inputCls}
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={sending}
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.1] px-3 py-2 text-[11px] font-semibold text-amber-200/95 shadow-[0_0_16px_rgba(245,158,11,0.08)] transition-all duration-200 sm:px-4 sm:py-2.5 sm:text-[12px]',
                      sending
                        ? 'cursor-wait opacity-60'
                        : 'hover:border-amber-400/50 hover:bg-amber-500/[0.16] hover:text-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.14)]',
                    )}
                  >
                    {sending ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Илгээж байна…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[15px]">send</span>
                        Илгээх
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[10px] text-slate-500 sm:mt-2.5 sm:text-[11px]">
                    Ихэнх тохиолдолд ажлын өдөр 24 цагийн дотор хариулна.
                  </p>
                </div>
              </form>
            )}
          </Card>
        </section>

      </div>
    </DashboardShell>
  );
}