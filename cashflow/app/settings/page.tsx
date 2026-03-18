'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useDashboard } from '@/components/providers/dashboard-provider';

export default function SettingsPage() {
  const { user } = useDashboard();

  return (
    <div className="min-h-screen flex overflow-hidden bg-brand-bg">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-brand-bg custom-scrollbar flex flex-col">
        <Header />

        <div className="p-4 md:p-8 max-w-[1100px] mx-auto w-full space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Profile & Settings
              </h1>
              <p className="text-sm text-brand-muted mt-1">
                Manage your personal information, preferences, and security in one place.
              </p>
            </div>
          </div>

          {/* Profile settings */}
          <section className="bg-brand-card/60 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl shadow-black/20 backdrop-blur-lg space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-white">
                  Profile settings
                </h2>
                <p className="text-xs md:text-sm text-brand-muted mt-1">
                  Update how your name, email, and avatar appear across CashFlow.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-brand-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    defaultValue={user.username}
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-brand-primary/60"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-brand-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
                    Timezone
                  </label>
                  <select
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-brand-primary/60"
                    defaultValue="local"
                  >
                    <option value="local">Use device timezone</option>
                    <option value="utc">UTC</option>
                    <option value="asia_ulaanbaatar">Asia/Ulaanbaatar</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 text-xs text-brand-muted">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-base material-symbols-outlined">
                  verified_user
                </span>
                <div>
                  <p className="font-medium text-white/80">
                    {user.membershipType || 'Premium'} member
                  </p>
                  <p className="text-[11px] text-brand-muted">
                    Joined {user.joinedDate || 'recently'} · Your profile affects insights & reports.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-brand-muted hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Reset changes
                </button>
                <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save profile
                </button>
              </div>
            </div>
          </section>

          {/* Preferences & security */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-brand-card/60 border border-white/5 rounded-3xl p-6 md:p-7 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-white">
                    App preferences
                  </h2>
                  <p className="text-xs text-brand-muted mt-1">
                    Fine-tune how CashFlow behaves on this device.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-brand-muted">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">Language</p>
                    <p className="text-xs text-brand-muted">
                      Switch between English and Mongolian.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/30 border border-white/10 px-3 py-1 text-[11px] font-semibold text-brand-muted">
                    Auto · from profile
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">Dark mode</p>
                    <p className="text-xs text-brand-muted">
                      Optimized for long sessions and dashboards.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-black/30 border border-white/10 px-3 py-1 text-[11px] font-semibold text-brand-muted hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-sm text-amber-300">
                      dark_mode
                    </span>
                    Always on
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">Notifications</p>
                    <p className="text-xs text-brand-muted">
                      Get alerts when budgets or cash flow drift.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                    Enabled
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-brand-card/60 border border-white/5 rounded-3xl p-6 md:p-7 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-white">
                    Security
                  </h2>
                  <p className="text-xs text-brand-muted mt-1">
                    Keep your account and connected institutions protected.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-brand-muted">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">Password</p>
                    <p className="text-xs text-brand-muted">
                      Last changed 90 days ago. We recommend rotating regularly.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-black/30 border border-white/10 px-3 py-1 text-[11px] font-semibold text-brand-muted hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-sm">lock_reset</span>
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">Two‑factor authentication</p>
                    <p className="text-xs text-brand-muted">
                      Add an extra layer of security for sign-ins.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                    Enabled
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">Connected banks</p>
                    <p className="text-xs text-brand-muted">
                      Review and disconnect financial institutions in one click.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-black/30 border border-white/10 px-3 py-1 text-[11px] font-semibold text-brand-muted hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

