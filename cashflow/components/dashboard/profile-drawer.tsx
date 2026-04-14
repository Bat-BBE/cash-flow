"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface ProfileDrawerUser {
  name?: string;
  username?: string;
  avatarUrl?: string;
  membershipType?: string;
  joinedDate?: string;
  score?: number;
  goals?: { completed: number; total: number };
  wealthTier?: string;
  bio?: string;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: ProfileDrawerUser;
}

const TABS = ["Тойм", "Статистик", "Үйл ажиллагаа", "Медал"] as const;
type Tab = (typeof TABS)[number];

/* ── Animated number ── */
function AnimatedNumber({
  value,
  duration = 1200,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    start.current = null;
    const animate = (ts: number) => {
      if (start.current === null) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

function TierBadge({
  tier,
  size = "sm",
}: {
  tier: string;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-black uppercase tracking-widest",
        "bg-gradient-to-r from-amber-500/15 to-yellow-400/15",
        "border border-amber-400/25 text-amber-300",
        "shadow-[inset_0_1px_0_rgba(255,200,50,0.1)]",
        size === "xs" ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-1 text-[9px]",
      )}
    >
      <svg
        className={size === "xs" ? "w-2 h-2" : "w-2.5 h-2.5"}
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <path d="M6 0L7.5 4.5H12L8.5 7L10 11.5L6 9L2 11.5L3.5 7L0 4.5H4.5L6 0Z" />
      </svg>
      {tier}
    </span>
  );
}

/* ── Progress ring ── */
function ProgressRing({
  value,
  max,
  color,
  size = 56,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={3}
        stroke="rgba(255,255,255,0.06)"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={3}
        stroke={color}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </svg>
  );
}

/* ── Stat card ── */
function StatCard({
  label,
  value,
  sub,
  subColor,
  bar,
  barColor,
  icon,
  ring,
  ringMax,
  ringColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  bar?: number;
  barColor?: string;
  icon?: string;
  ring?: number;
  ringMax?: number;
  ringColor?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]">
      {/* subtle inner glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(251,191,36,0.04), transparent 60%)",
        }}
      />

      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
          {label}
        </span>
        {ring !== undefined ? (
          <ProgressRing
            value={mounted ? ring : 0}
            max={ringMax ?? 100}
            color={ringColor ?? "#10b981"}
            size={44}
          />
        ) : (
          icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-white/[0.08]">
              <span className="material-symbols-outlined text-sm text-white/30 group-hover:text-white/50">
                {icon}
              </span>
            </div>
          )
        )}
      </div>

      <div className="text-[26px] font-black leading-none tracking-tight text-white">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>

      {bar !== undefined && (
        <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              barColor ?? "bg-emerald-500",
            )}
            style={{ width: mounted ? `${Math.min(bar, 100)}%` : "0%" }}
          />
        </div>
      )}

      {sub && (
        <p
          className={cn(
            "mt-1.5 text-[10px] font-bold",
            subColor ?? "text-white/35",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Badge item ── */
function BadgeCard({
  name,
  icon,
  earned,
  color,
}: {
  name: string;
  icon: string;
  earned: boolean;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border transition-all duration-300",
        earned
          ? "bg-white/[0.04] border-white/[0.09] hover:border-white/20 hover:bg-white/[0.07] cursor-default"
          : "bg-transparent border-white/[0.03] opacity-35",
      )}
    >
      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
          earned ? `bg-gradient-to-br ${color} shadow-lg` : "bg-white/[0.04]",
        )}
        style={
          earned && hovered ? { boxShadow: "0 8px 24px rgba(0,0,0,0.4)" } : {}
        }
      >
        {earned && (
          <div
            className="absolute inset-0 rounded-2xl opacity-40"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25), transparent 65%)",
            }}
          />
        )}
        <span className="material-symbols-outlined text-xl text-white relative z-10">
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "text-[10px] font-black text-center leading-tight",
          earned ? "text-white/80" : "text-white/20",
        )}
      >
        {name}
      </p>
      {!earned && (
        <span className="text-[8px] font-bold text-white/20 tracking-wide">
          ОЛДООГҮЙ
        </span>
      )}
    </div>
  );
}

/* ── Activity item ── */
function ActivityItem({
  action,
  time,
  icon,
  colorClass,
  index,
}: {
  action: string;
  time: string;
  icon: string;
  colorClass: string;
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 transition-all duration-500 hover:bg-white/[0.04]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      )}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          colorClass,
        )}
      >
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-white/75">
          {action}
        </p>
        <p className="text-[10px] text-white/25">{time}</p>
      </div>
      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/10" />
    </div>
  );
}

/* ── Stat row ── */
function StatRow({
  label,
  value,
  icon,
  color,
  bg,
  border,
  index,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.05]",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
          bg,
          border,
        )}
      >
        <span className={cn("material-symbols-outlined text-base", color)}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-black text-white">{value}</p>
      </div>
      <span className={cn("material-symbols-outlined text-sm", color)}>
        chevron_right
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export function ProfileDrawer({ isOpen, onClose, user }: ProfileDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Тойм");
  const [copied, setCopied] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setEntered(true), 50);
      return () => clearTimeout(t);
    } else {
      setEntered(false);
    }
  }, [isOpen]);

  const u = {
    name: user?.name ?? "Цэрэнчимэд",
    username: user?.username ?? "tserenchim17",
    avatarUrl: user?.avatarUrl ?? "",
    membershipType: user?.membershipType ?? "PREMIUM",
    joinedDate: user?.joinedDate ?? "2022 оны 10-р сар",
    score: user?.score ?? 782,
    goals: user?.goals ?? { completed: 4, total: 6 },
    wealthTier: user?.wealthTier ?? "Tier 2",
    bio:
      user?.bio ??
      "Урт хугацааны өсөлт болон портфолио төрөлжүүлэлтэд чиглэсэн стратегийн хөрөнгө оруулагч.",
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = u.username;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        /* Эхний даралт Radix-ийн auto-focus-д зориулагдахгүй — ID хуулах нэг даралтаар ажиллана */
        onOpenAutoFocus={(ev) => ev.preventDefault()}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 max-md:max-w-none",
          /* Mobile: header-ийн доор бүтэн өргөн sheet, хажуугийн илүү зайгүй */
          "max-md:fixed max-md:inset-x-0 max-md:left-0 max-md:right-0 max-md:top-16 max-md:bottom-0 max-md:h-auto",
          "max-md:max-h-[calc(100dvh-4.25rem)] max-md:w-full",
          "max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none",
          "max-md:border max-md:border-white/[0.06] max-md:border-x-0 max-md:border-t-0",
          "max-md:bg-[#080612] max-md:shadow-[8px_0_40px_rgba(0,0,0,0.45)]",
          "max-md:data-[state=open]:slide-in-from-left max-md:data-[state=closed]:slide-out-to-left",
          /* Desktop: centered dialog */
          "md:max-h-[min(92dvh,54rem)] md:w-[calc(100%-2rem)] md:max-w-[640px]",
          "md:rounded-[28px] md:border md:border-white/[0.07]",
          "md:bg-[#09070f]",
          "md:shadow-[0_0_0_1px_rgba(251,191,36,0.06),0_40px_120px_rgba(0,0,0,0.7),0_0_80px_rgba(139,92,246,0.04)]",
        )}
      >
        <DialogTitle className="sr-only">Профайл</DialogTitle>

        {/* ══ Hero ══ */}
        <div className="relative h-28 shrink-0 overflow-hidden sm:h-32 md:h-[8.5rem]">
          {/* deep background */}
          <div className="absolute inset-0 bg-[#09070f]" />
          {/* top golden bloom */}
          <div
            className="absolute -top-8 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
            }}
          />
          {/* bottom violet */}
          <div
            className="absolute bottom-0 right-0 h-32 w-48 rounded-full opacity-20 blur-2xl"
            style={{
              background:
                "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            }}
          />
          {/* subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: [
                "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px)",
                "linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              ].join(","),
              backgroundSize: "28px 28px",
            }}
          />
          {/* horizontal fade line at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#09070f] to-transparent" />

          {/* membership badge top-left / centered */}
          <div className="absolute left-5 top-5 md:left-1/2 md:-translate-x-1/2">
            <TierBadge tier={u.membershipType} />
          </div>

          {/* close button */}
          <button
            type="button"
            onClick={onClose}
            className="group absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.1] md:right-5 md:top-5"
          >
            <span className="material-symbols-outlined text-[16px] text-white/40 transition-colors group-hover:text-white/80">
              close
            </span>
          </button>
        </div>

        {/* ══ Avatar + Actions ══ */}
        <div className="relative z-20 shrink-0 px-4 max-md:px-4 md:px-8">
          {/* avatar: desktop дээр илүү дээш — hero-той давхцаалт ихсэнэ */}
          <div className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 max-md:left-5 max-md:translate-x-0 md:-top-[4.75rem]">
            <div className="relative">
              {/* glow ring */}
              <div
                className="absolute -inset-[3px] rounded-[22px] opacity-60 blur-md"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(251,191,36,0.5), rgba(124,58,237,0.3))",
                }}
              />
              <div className="relative h-[76px] w-[76px] overflow-hidden rounded-[20px] border-[2.5px] border-white/[0.08] md:h-[92px] md:w-[92px] md:rounded-[22px]">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage
                    src={u.avatarUrl}
                    alt={u.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-none bg-gradient-to-br from-amber-500 via-amber-700 to-violet-800 text-2xl font-black text-white md:text-3xl">
                    {u.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* online dot */}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[2.5px] border-[#09070f] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
          </div>

          {/* action buttons */}
          <div className="flex justify-center gap-2 pt-2 max-md:flex-wrap md:pt-2 mt-5">
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-all duration-200 sm:flex-none sm:px-3.5 sm:py-1.5",
                copied
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                  : "border-white/[0.08] bg-white/[0.04] text-white/45 hover:border-white/15 hover:bg-white/[0.07] hover:text-white/70 active:scale-[0.98]",
              )}
            >
              <span className="material-symbols-outlined text-[13px]">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Хуулагдлаа" : "ID хуулах"}
            </button>
            <button
              type="button"
              onClick={() => {
                router.push("/profile");
                onClose();
              }}
              className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-3 py-2 text-[11px] font-bold text-amber-300/90 transition-all duration-200 hover:border-amber-400/50 hover:bg-amber-500/[0.14] hover:text-amber-200 active:scale-[0.98] sm:flex-none sm:px-3.5 sm:py-1.5"
            >
              <span className="material-symbols-outlined text-[13px]">
                edit
              </span>
              Засах
            </button>
          </div>
        </div>

        {/* ══ Name / meta ══ */}
        <div
          className={cn(
            "shrink-0 px-4 pb-4 pt-11 text-left transition-all duration-500 max-md:pt-[3.25rem] md:px-8 md:pb-5 md:pt-[3.75rem] md:text-center",
            entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          <div className="flex flex-wrap items-center gap-2.5 md:justify-center">
            <h2 className="text-[22px] font-black leading-none tracking-tight text-white md:text-[26px]">
              {u.name}
            </h2>
            <TierBadge tier={u.wealthTier} size="xs" />
          </div>
          <p className="mt-1.5 text-sm font-medium text-white/30">
            @{u.username}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-white/20 md:justify-center">
            <span className="material-symbols-outlined text-[13px] text-white/20">
              calendar_today
            </span>
            <span>{u.joinedDate}-д нэгдсэн</span>
          </div>
        </div>

        {/* ══ Tabs ══ */}
        <div className="shrink-0 border-b border-white/[0.05] px-4 md:px-8">
          <div className="-mb-px flex gap-0 overflow-x-auto scrollbar-none md:justify-center">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative whitespace-nowrap px-3 pb-3 pt-1 text-[11px] font-bold tracking-wide transition-all duration-200",
                  activeTab === tab
                    ? "text-white"
                    : "text-white/25 hover:text-white/50",
                )}
              >
                {tab}
                <span
                  className={cn(
                    "absolute bottom-0 inset-x-2 h-[2px] rounded-full transition-all duration-300",
                    activeTab === tab ? "opacity-100" : "opacity-0",
                  )}
                  style={{
                    background: "linear-gradient(90deg, #f59e0b, #8b5cf6)",
                    boxShadow: "0 0 8px rgba(245,158,11,0.4)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ══ Tab content ══ */}
        <div
          className="min-h-0 flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.08) transparent",
          }}
        >
          <div className="space-y-3 p-4 md:space-y-4 md:px-8 md:pb-8">
            {/* ── Тойм ── */}
            {activeTab === "Тойм" && (
              <>
                {/* Bio */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/20">
                    Тухай
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-white/55">
                    {u.bio}
                  </p>
                </div>

                {/* Stat grid */}
                <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                  <StatCard
                    label="Нийт оноо"
                    value={u.score}
                    bar={(u.score / 1000) * 100}
                    barColor="bg-gradient-to-r from-emerald-500 to-teal-400"
                    sub={`${u.score} / 1000 оноо`}
                    subColor="text-emerald-400/70"
                    icon="stars"
                  />
                  <StatCard
                    label="Зорилго"
                    value={`${u.goals.completed}/${u.goals.total}`}
                    ring={u.goals.completed}
                    ringMax={u.goals.total}
                    ringColor="#6366f1"
                    sub={`${u.goals.total - u.goals.completed} үлдсэн`}
                    subColor="text-indigo-400/70"
                  />
                  <StatCard
                    label="Баялгийн түвшин"
                    value={u.wealthTier}
                    sub="✦ Идэвхтэй"
                    subColor="text-amber-400/80"
                    icon="diamond"
                  />
                  <StatCard
                    label="Гишүүнчлэл"
                    value={u.membershipType}
                    sub="Тэргүүлэх эрх"
                    subColor="text-violet-400/70"
                    icon="workspace_premium"
                  />
                </div>

                {/* Joined card */}
                <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08]">
                    <span className="material-symbols-outlined text-sm text-indigo-400">
                      history
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">
                      Гишүүн болсон
                    </p>
                    <p className="mt-0.5 text-[13px] font-bold text-white/75">
                      {u.joinedDate}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ── Статистик ── */}
            {activeTab === "Статистик" && (
              <div className="space-y-2.5">
                {[
                  {
                    label: "Нийт гүйлгээ",
                    value: "1,240",
                    icon: "receipt_long",
                    color: "text-sky-400",
                    bg: "bg-sky-500/[0.08]",
                    border: "border-sky-500/20",
                  },
                  {
                    label: "Дундаж зарлага",
                    value: "₮320к",
                    icon: "trending_down",
                    color: "text-orange-400",
                    bg: "bg-orange-500/[0.08]",
                    border: "border-orange-500/20",
                  },
                  {
                    label: "Хамгийн их орлого",
                    value: "₮1.2сая",
                    icon: "trending_up",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/[0.08]",
                    border: "border-emerald-500/20",
                  },
                  {
                    label: "Идэвхтэй өдрүүд",
                    value: "218",
                    icon: "local_fire_department",
                    color: "text-rose-400",
                    bg: "bg-rose-500/[0.08]",
                    border: "border-rose-500/20",
                  },
                ].map((item, i) => (
                  <StatRow key={item.label} {...item} index={i} />
                ))}
              </div>
            )}

            {/* ── Үйл ажиллагаа ── */}
            {activeTab === "Үйл ажиллагаа" && (
              <div className="space-y-0.5">
                {[
                  {
                    action: "Шинэ зорилго нэмсэн",
                    time: "2 цагийн өмнө",
                    icon: "flag",
                    colorClass:
                      "text-indigo-400 bg-indigo-500/[0.08] border-indigo-500/20",
                  },
                  {
                    action: "Гүйлгээ хийсэн",
                    time: "5 цагийн өмнө",
                    icon: "swap_horiz",
                    colorClass:
                      "text-sky-400 bg-sky-500/[0.08] border-sky-500/20",
                  },
                  {
                    action: "Профайл шинэчилсэн",
                    time: "Өчигдөр",
                    icon: "edit",
                    colorClass:
                      "text-violet-400 bg-violet-500/[0.08] border-violet-500/20",
                  },
                  {
                    action: "Системд нэгдсэн",
                    time: u.joinedDate,
                    icon: "login",
                    colorClass:
                      "text-amber-400 bg-amber-500/[0.08] border-amber-500/20",
                  },
                ].map((item, i) => (
                  <ActivityItem key={i} {...item} index={i} />
                ))}
              </div>
            )}

            {/* ── Медал ── */}
            {activeTab === "Медал" && (
              <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                {[
                  {
                    name: "Анхдагч",
                    icon: "rocket_launch",
                    earned: true,
                    color: "from-amber-500 to-yellow-600",
                  },
                  {
                    name: "Тогтмол",
                    icon: "local_fire_department",
                    earned: true,
                    color: "from-orange-500 to-red-600",
                  },
                  {
                    name: "Хөрөнгөлөгч",
                    icon: "trending_up",
                    earned: true,
                    color: "from-sky-500 to-blue-600",
                  },
                  {
                    name: "Мастер",
                    icon: "workspace_premium",
                    earned: false,
                    color: "from-violet-500 to-purple-600",
                  },
                  {
                    name: "Тэргүүн",
                    icon: "military_tech",
                    earned: false,
                    color: "from-rose-500 to-pink-600",
                  },
                ].map((badge) => (
                  <BadgeCard key={badge.name} {...badge} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
