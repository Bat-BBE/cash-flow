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
        'relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm md:p-8',
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
    <div className="mb-6 space-y-1">
      <h2 className="text-[15px] font-bold tracking-tight text-white">{title}</h2>
      <p className="text-[12px] leading-relaxed text-white/35">{description}</p>
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
      <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-2.5 text-sm text-white/80 placeholder:text-white/20 transition-all duration-200 outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 hover:border-white/[0.12]';

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
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all duration-200',
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
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all duration-200',
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
    <div className="flex flex-col gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5 transition-colors hover:border-white/[0.07] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-white/80">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/30">{description}</p>
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
    <DashboardShell>
      <div
        className={cn(
          'mx-auto w-full max-w-[1100px] space-y-6 px-3 pb-12 pt-3 transition-all duration-700 sm:px-5 sm:pt-2 md:space-y-8 md:px-8 md:pb-14',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        )}
      >

        {/* ── Page header ── */}
        <header className="relative space-y-1.5 border-b border-white/[0.05] pb-6">
          {/* decorative glow */}
          <div
            className="pointer-events-none absolute -top-6 left-0 h-24 w-48 opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
          />
          {/* <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400/60">CashFlow</p> */}
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Тохиргоо
          </h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-white/35">
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

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
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
                <p className="text-[13px] font-bold text-white/80">
                  {(user.membershipType || 'PREMIUM').toUpperCase()} гишүүн
                </p>
                <p className="text-[11px] text-white/30">
                  Нэгдсэн: {user.joinedDate || 'саяхан'} · Профайл дүн шинжилгээнд нөлөөлнө
                </p>
              </div>
            </div>

            {/* action buttons */}
            <div className="flex gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[12px] font-bold text-white/40 transition-all hover:border-white/15 hover:text-white/70"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Буцаах
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.1] px-4 py-2.5 text-[12px] font-bold text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.1)] transition-all hover:border-amber-400/50 hover:bg-amber-500/[0.16] hover:text-amber-200"
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
              <p className="text-[13px] font-semibold text-white/70">Бүртгэл устгах</p>
              <p className="mt-0.5 text-[11px] text-white/30">
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