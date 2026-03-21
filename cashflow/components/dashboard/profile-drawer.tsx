'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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

const TABS = ['Тойм', 'Статистик', 'Үйл ажиллагаа', 'Медал'] as const;
type Tab = typeof TABS[number];

/* ── Tier badge ── */
function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400">
      <span className="material-symbols-outlined text-[11px]">workspace_premium</span>
      {tier}
    </span>
  );
}

/* ── Stat card ── */
function StatCard({
  label, value, sub, subColor, bar, barColor, icon,
}: {
  label: string; value: string; sub?: string; subColor?: string;
  bar?: number; barColor?: string; icon?: string;
}) {
  return (
    <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/10 rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">{label}</span>
        {icon && (
          <span className="material-symbols-outlined text-sm text-white/20 group-hover:text-white/40 transition-colors">
            {icon}
          </span>
        )}
      </div>
      <span className="text-[22px] font-black text-white leading-none tracking-tight">{value}</span>
      {bar !== undefined && (
        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', barColor ?? 'bg-emerald-500')}
            style={{ width: `${Math.min(bar, 100)}%` }}
          />
        </div>
      )}
      {sub && (
        <span className={cn('text-[10px] font-bold', subColor ?? 'text-white/40')}>{sub}</span>
      )}
    </div>
  );
}

/* ── Main component ── */
export function ProfileDrawer({ isOpen, onClose, user }: ProfileDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Тойм');
  const [copied, setCopied] = useState(false);

  const u = {
    name:           user?.name           ?? 'Цэрэнчимэд',
    username:       user?.username       ?? 'tserenchim17',
    avatarUrl:      user?.avatarUrl      ?? '',
    membershipType: user?.membershipType ?? 'PREMIUM',
    joinedDate:     user?.joinedDate     ?? '2022 оны 10-р сар',
    score:          user?.score          ?? 782,
    goals:          user?.goals          ?? { completed: 4, total: 6 },
    wealthTier:     user?.wealthTier     ?? 'Tier 2',
    bio:            user?.bio            ?? 'Урт хугацааны өсөлт болон портфолио төрөлжүүлэлтэд чиглэсэн стратегийн хөрөнгө оруулагч.',
  };

  const scoreBar = (u.score / 1000) * 100;
  const goalsBar = (u.goals.completed / u.goals.total) * 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(u.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className={cn(
        'fixed top-0 left-0 h-screen p-0 gap-0 overflow-hidden flex flex-col',
        'w-full sm:w-[700px]',
        'bg-[#080E1A] border-r border-white/[0.06] border-l-0 border-t-0 border-b-0',
        'shadow-[8px_0_60px_rgba(0,0,0,0.7)] rounded-none',
        // Remove default DialogContent styles
        'translate-x-0 translate-y-0 data-[state=open]:animate-none data-[state=closed]:animate-none',
        // Slide animation
        'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* ── Hero banner ── */}
        <div className="relative h-32 shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f3d] via-[#111827] to-[#080E1A]" />
          <div className="absolute top-0 left-0 w-48 h-48 bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_65%)] -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 right-0 w-56 h-40 bg-[radial-gradient(circle,rgba(234,179,8,0.12)_0%,transparent_65%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute top-4 left-4">
            <TierBadge tier={u.membershipType} />
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
          >
            <span className="material-symbols-outlined text-[16px] text-white/50 group-hover:text-white transition-colors">close</span>
          </button>
        </div>

        {/* ── Avatar row ── */}
        <div className="relative px-5 pb-0 shrink-0">
          <div className="absolute -top-10 left-5">
            <div className="relative">
              <div className="w-[76px] h-[76px] rounded-2xl border-[3px] border-[#080E1A] overflow-hidden shadow-[0_0_24px_rgba(99,102,241,0.35)]">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={u.avatarUrl} alt={u.name} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-2xl font-black rounded-none">
                    {u.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[2.5px] border-[#080E1A]" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border',
                copied
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08]',
              )}
            >
              <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Хуулсан' : 'ID хуулах'}
            </button>
            <button
              onClick={() => { router.push('/profile'); onClose(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-all"
            >
              <span className="material-symbols-outlined text-[13px]">edit</span>
              Засах
            </button>
          </div>
        </div>

        {/* ── Name / username ── */}
        <div className="px-5 pt-10 pb-4 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-white tracking-tight leading-none">{u.name}</h2>
            <TierBadge tier={u.wealthTier} />
          </div>
          <p className="text-sm text-white/35 font-medium mt-1">@{u.username}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/25 font-medium">
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            <span>{u.joinedDate}-д нэгдсэн</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-5 shrink-0 border-b border-white/[0.06]">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'relative pb-3 px-2 text-[11px] font-bold transition-all',
                  activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60',
                )}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* ── Тойм ── */}
            {activeTab === 'Тойм' && (
              <>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                  <p className="text-[11px] font-black text-white/25 uppercase tracking-[0.12em] mb-2">Тухай</p>
                  <p className="text-[12px] text-white/60 leading-relaxed">{u.bio}</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <StatCard label="Оноо"         value={u.score.toString()}                bar={scoreBar} barColor="bg-emerald-500" icon="stars" />
                  <StatCard label="Зорилго"       value={`${u.goals.completed}/${u.goals.total}`} bar={goalsBar} barColor="bg-indigo-500"  icon="flag" />
                  <StatCard label="Баялгийн түвшин" value={u.wealthTier} sub="✦ Премиум" subColor="text-amber-400" icon="diamond" />
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-indigo-400">history</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.12em]">Гишүүн болсон</p>
                    <p className="text-[12px] font-bold text-white mt-0.5">{u.joinedDate}</p>
                  </div>
                </div>
              </>
            )}

            {/* ── Статистик ── */}
            {activeTab === 'Статистик' && (
              <div className="space-y-3">
                {[
                  { label: 'Нийт гүйлгээ',     value: '1,240',   icon: 'receipt_long',          color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20'     },
                  { label: 'Дундаж зарлага',    value: '₮320к',   icon: 'trending_down',         color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20'  },
                  { label: 'Хамгийн их орлого', value: '₮1.2сая', icon: 'trending_up',           color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                  { label: 'Идэвхтэй өдрүүд',  value: '218',     icon: 'local_fire_department', color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'    },
                ].map(item => (
                  <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', item.bg, item.border)}>
                      <span className={cn('material-symbols-outlined text-base', item.color)}>{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.12em]">{item.label}</p>
                      <p className="text-base font-black text-white mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Үйл ажиллагаа ── */}
            {activeTab === 'Үйл ажиллагаа' && (
              <div className="space-y-2">
                {[
                  { action: 'Шинэ зорилго нэмсэн',   time: '2 цагийн өмнө', icon: 'flag',       color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
                  { action: 'Гүйлгээ хийсэн',         time: '5 цагийн өмнө', icon: 'swap_horiz', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20'         },
                  { action: 'Профайл шинэчилсэн',     time: 'Өчигдөр',       icon: 'edit',       color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
                  { action: 'Системд нэгдсэн',        time: u.joinedDate,    icon: 'login',      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'   },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', item.color)}>
                      <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white/80 truncate">{item.action}</p>
                      <p className="text-[10px] text-white/25">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Медал ── */}
            {activeTab === 'Медал' && (
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { name: 'Анхдагч',      icon: 'rocket_launch',         earned: true,  color: 'from-amber-500 to-yellow-600'   },
                  { name: 'Тогтмол',      icon: 'local_fire_department', earned: true,  color: 'from-orange-500 to-red-600'    },
                  { name: 'Хөрөнгөлөгч', icon: 'trending_up',           earned: true,  color: 'from-sky-500 to-blue-600'      },
                  { name: 'Мастер',       icon: 'workspace_premium',     earned: false, color: 'from-violet-500 to-purple-600' },
                  { name: 'Тэргүүн',      icon: 'military_tech',         earned: false, color: 'from-rose-500 to-pink-600'     },
                ].map(badge => (
                  <div
                    key={badge.name}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all',
                      badge.earned ? 'bg-white/[0.04] border-white/10' : 'bg-white/[0.01] border-white/[0.04] opacity-40',
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', badge.earned ? `bg-gradient-to-br ${badge.color}` : 'bg-white/5')}>
                      <span className="material-symbols-outlined text-xl text-white">{badge.icon}</span>
                    </div>
                    <p className={cn('text-[10px] font-black text-center leading-tight', badge.earned ? 'text-white/80' : 'text-white/25')}>
                      {badge.name}
                    </p>
                    {!badge.earned && <span className="text-[8px] text-white/20 font-bold">Олдоогүй</span>}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}