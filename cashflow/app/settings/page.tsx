'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

function Card({
  children,
  className,
  accentColor = 'rgba(251,191,36,0.4)',
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-sm sm:p-5 md:p-6',
        className,
      )}
    >
      {/* Left accent bar */}
      <div
        className="pointer-events-none absolute left-0 top-6 h-10 w-[2px] rounded-r-full opacity-70"
        style={{ background: accentColor }}
      />
      {children}
    </div>
  );
}

/** Section label */
function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4 space-y-0.5 sm:mb-5">
      <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[13px]">{title}</h2>
      <p className="text-[10px] leading-relaxed text-slate-500/90 sm:text-[11px]">{description}</p>
    </div>
  );
}

/** Styled text / email / select input */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-[13px] text-white/85 placeholder:text-white/25 transition-all duration-200 outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 hover:border-white/[0.12]';

/** Toggle pill button — on / off */
function TogglePill({
  active,
  onToggle,
  labelOn = 'Идэвхтэй',
  labelOff = 'Идэвхгүй',
}: {
  active: boolean;
  onToggle: () => void;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200',
        active
          ? 'border-emerald-500/35 bg-emerald-500/[0.1] text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.1)]'
          : 'border-white/[0.08] bg-white/[0.04] text-white/35 hover:border-white/15 hover:text-white/55',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full transition-colors',
          active ? 'bg-emerald-400' : 'bg-white/20',
        )}
      />
      {active ? labelOn : labelOff}
    </button>
  );
}

/** Simple action pill button */
function ActionPill({
  icon,
  label,
  variant = 'default',
  onClick,
}: {
  icon: string;
  label: string;
  variant?: 'default' | 'amber' | 'danger';
  onClick?: () => void;
}) {
  const variantCls = {
    default: 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:border-white/15 hover:text-white/70',
    amber:   'border-amber-500/30 bg-amber-500/[0.07] text-amber-300/80 hover:bg-amber-500/[0.12] hover:text-amber-200',
    danger:  'border-rose-500/30 bg-rose-500/[0.07] text-rose-300/80 hover:bg-rose-500/[0.12] hover:text-rose-200',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200',
        variantCls,
      )}
    >
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {label}
    </button>
  );
}

/** A single preference row with label + description on the left and a control on the right */
function PrefRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.07] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-white/85">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/* Divider */
function Divider() {
  return <div className="border-t border-white/[0.05]" />;
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function SettingsPage() {
  const { user } = useDashboard();

  // toggle states
  const [notifications, setNotifications] = useState(true);
  const [twoFactor,      setTwoFactor]     = useState(true);
  const [darkMode,       setDarkMode]      = useState(true);

  // entrance animation
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  return (
    <DashboardShell className="bg-brand-bg" mainClassName="bg-brand-bg">
      <div
        className={cn(
          'mx-auto w-full max-w-[1100px] space-y-4 px-3 pb-4 pt-2 transition-all duration-500 sm:space-y-5 sm:px-4 sm:pb-6 sm:pt-3 md:space-y-6 md:px-6 md:pb-10',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        )}
      >

        {/* ── Page header ── */}
        <header className="relative space-y-1 border-b border-white/[0.05] pb-4 sm:pb-5">
          {/* decorative glow */}
          <div
            className="pointer-events-none absolute -top-6 left-0 h-24 w-48 opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
          />
          <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Тохиргоо
          </h1>
          <p className="max-w-xl text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
            Хувийн мэдээлэл, хэрэглээний тохиргоо, нууцлалыг нэг дороос удирдана.
          </p>
        </header>

        {/* ══════════════════════════════════════════
            PROFILE SECTION
        ══════════════════════════════════════════ */}
        <Card accentColor="rgba(251,191,36,0.5)">
          <SectionHeading
            title="Профайлын тохиргоо"
            description="Нэр, имэйл, зураг таны CashFlow дээр хэрхэн харагдахыг тохируулна."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {/* left col */}
            <div className="space-y-4">
              <Field label="Бүтэн нэр">
                <input type="text" defaultValue={user.name} className={inputCls} />
              </Field>
              <Field label="Хэрэглэгчийн нэр">
                <input type="text" defaultValue={user.username} className={inputCls} />
              </Field>
            </div>
            {/* right col */}
            <div className="space-y-4">
              <Field label="И-мэйл хаяг">
                <input type="email" placeholder="жишээ@имэйл.mn" className={inputCls} />
              </Field>
              <Field label="Цагийн бүс">
                <select className={inputCls} defaultValue="asia_ulaanbaatar">
                  <option value="local">Төхөөрөмжийн цагийн бүс</option>
                  <option value="utc">UTC</option>
                  <option value="asia_ulaanbaatar">Ази / Улаанбаатар</option>
                </select>
              </Field>
            </div>
          </div>

          {/* footer row */}
          <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* membership badge */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08]">
                <span className="material-symbols-outlined text-base text-emerald-400">verified_user</span>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white/85">
                  {(user.membershipType || 'PREMIUM').toUpperCase()} гишүүн
                </p>
                <p className="text-[10px] text-slate-500">
                  Нэгдсэн: {user.joinedDate || 'саяхан'} · Профайл дүн шинжилгээнд нөлөөлнө
                </p>
              </div>
            </div>

            {/* action buttons */}
            <div className="flex gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/45 transition-all hover:border-white/15 hover:text-white/75"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Буцаах
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.1] px-3 py-2 text-[11px] font-semibold text-amber-200/95 shadow-[0_0_16px_rgba(245,158,11,0.1)] transition-all hover:border-amber-400/50 hover:bg-amber-500/[0.16] hover:text-amber-100"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                Хадгалах
              </button>
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════════
            APP SETTINGS + PRIVACY — side by side
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">

          {/* App settings */}
          <Card accentColor="rgba(99,102,241,0.5)">
            <SectionHeading
              title="Аппын тохиргоо"
              description="Энэ төхөөрөмж дээрх CashFlow-ийн ажиллагааг тохируулна."
            />

            <div className="space-y-4 sm:space-y-5">
              <PrefRow
                title="Хэл"
                description="Монгол, Англи хооронд шилжинэ."
                control={
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/35">
                    <span className="material-symbols-outlined text-[12px]">language</span>
                    Авто · профайлаас
                  </span>
                }
              />
              <Divider />
              <PrefRow
                title="Харанхуй горим"
                description="Урт хугацааны ашиглалтад тохирсон."
                control={
                  <TogglePill
                    active={darkMode}
                    onToggle={() => setDarkMode(v => !v)}
                    labelOn="Асаалттай"
                    labelOff="Унтраалттай"
                  />
                }
              />
              <Divider />
              <PrefRow
                title="Мэдэгдэл"
                description="Төсөв, урсгал өөрчлөгдөхөд сануулга авах."
                control={
                  <TogglePill
                    active={notifications}
                    onToggle={() => setNotifications(v => !v)}
                  />
                }
              />
            </div>
          </Card>

          {/* Privacy */}
          <Card accentColor="rgba(99,102,241,0.5)">
            <SectionHeading
              title="Нууцлал"
              description="Данс болон холбогдсон байгууллагыг хамгаална."
            />

            <div className="space-y-4 sm:space-y-5">
              <PrefRow
                title="Нууц үг"
                description="Сүүлд 90 өдрийн өмнө солигдсон. Тогтмол шинэчилж байгаарай."
                control={<ActionPill icon="lock_reset" label="Солих" />}
              />
              <Divider />
              <PrefRow
                title="Хоёр шаттай баталгаажуулалт"
                description="Нэвтрэхэд нэмэлт хамгаалалт нэмнэ."
                control={
                  <TogglePill
                    active={twoFactor}
                    onToggle={() => setTwoFactor(v => !v)}
                  />
                }
              />
              <Divider />
              <PrefRow
                title="Холбогдсон банк"
                description="Санхүүгийн байгууллагыг нэг товчоор салгах."
                control={<ActionPill icon="account_balance" label="Удирдах" />}
              />
            </div>
          </Card>

        </div>

        {/* ══════════════════════════════════════════
            DANGER ZONE
        ══════════════════════════════════════════ */}
        <Card
          accentColor="rgba(244,63,94,0.5)"
          className="border-rose-500/[0.08]"
        >
          <SectionHeading
            title="Аюултай бүс"
            description="Эдгээр үйлдлийг буцаах боломжгүй. Анхааралтай хийнэ үү."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-medium text-white/75">Бүртгэл устгах</p>
              <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
                Таны бүх өгөгдөл, тохиргоо бүрмөсөн устана.
              </p>
            </div>
            <ActionPill icon="delete_forever" label="Бүртгэл устгах" variant="danger" />
          </div>
        </Card>

      </div>
    </DashboardShell>
  );
}