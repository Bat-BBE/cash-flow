import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function SupportPage() {
  return (
    <DashboardShell>
        <div className="mx-auto w-full max-w-[1100px] space-y-8 p-4 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Support & Help Center
              </h1>
              <p className="text-sm text-brand-muted mt-1">
                Get help with CashFlow, troubleshoot issues, or talk to our team.
              </p>
            </div>
          </div>

          {/* Quick support cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-brand-card/70 border border-emerald-500/30 rounded-3xl p-5 space-y-3 shadow-lg shadow-emerald-500/15">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                <span className="material-symbols-outlined text-xl">chat</span>
              </div>
              <h2 className="text-sm font-semibold text-white">Chat with support</h2>
              <p className="text-xs text-brand-muted">
                Start a conversation with our team for personalized help.
              </p>
              <button className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200">
                Open chat
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </button>
            </div>

            <div className="bg-brand-card/70 border border-blue-500/30 rounded-3xl p-5 space-y-3 shadow-lg shadow-blue-500/15">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/40 text-blue-300">
                <span className="material-symbols-outlined text-xl">description</span>
              </div>
              <h2 className="text-sm font-semibold text-white">CashFlow guide</h2>
              <p className="text-xs text-brand-muted">
                Learn the best way to track accounts, budgets, and insights.
              </p>
              <button className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-300 hover:text-blue-200">
                View documentation
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </button>
            </div>

            <div className="bg-brand-card/70 border border-amber-400/30 rounded-3xl p-5 space-y-3 shadow-lg shadow-amber-500/20">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300">
                <span className="material-symbols-outlined text-xl">notifications_active</span>
              </div>
              <h2 className="text-sm font-semibold text-white">System status</h2>
              <p className="text-xs text-brand-muted">
                All systems operational. No known syncing delays.
              </p>
              <button className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200">
                View status history
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </button>
            </div>
          </section>

          {/* FAQs + contact */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
            <div className="bg-brand-card/60 border border-white/5 rounded-3xl p-6 md:p-7 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-white">
                    Common questions
                  </h2>
                  <p className="text-xs text-brand-muted mt-1">
                    Quick answers to the things users ask most.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/5 text-sm text-brand-muted">
                <details className="py-3 group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-medium text-white group-open:text-brand-primary">
                      How do I connect a new bank or card?
                    </span>
                    <span className="material-symbols-outlined text-sm text-brand-muted group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <p className="mt-2 text-xs text-brand-muted">
                    Go to the Accounts section, click “Connect institution”, and follow the encrypted
                    connection flow. We never store your banking password, and you can revoke access
                    from Settings &gt; Security at any time.
                  </p>
                </details>

                <details className="py-3 group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-medium text-white group-open:text-brand-primary">
                      Why don&apos;t my balances match my bank?
                    </span>
                    <span className="material-symbols-outlined text-sm text-brand-muted group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <p className="mt-2 text-xs text-brand-muted">
                    CashFlow updates balances on a secure schedule. Occasionally there can be a short
                    delay from your bank or card provider. Try refreshing in Accounts, or check our
                    status tile above for any known incidents.
                  </p>
                </details>

                <details className="py-3 group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-medium text-white group-open:text-brand-primary">
                      How are my data and privacy protected?
                    </span>
                    <span className="material-symbols-outlined text-sm text-brand-muted group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <p className="mt-2 text-xs text-brand-muted">
                    We use bank‑grade encryption in transit and at rest, strict access controls, and
                    audit logs for every data access. You can export or delete your data at any time
                    by contacting support.
                  </p>
                </details>
              </div>
            </div>

            <div className="bg-brand-card/60 border border-white/5 rounded-3xl p-6 md:p-7 space-y-5">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">
                  Contact support
                </h2>
                <p className="text-xs text-brand-muted mt-1">
                  Share a brief summary and we&apos;ll respond as soon as possible.
                </p>
              </div>

              <form className="space-y-4 text-sm text-brand-muted">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Issue with syncing accounts, billing, feedback..."
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-brand-primary/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2">
                    Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Include any relevant dates, account names, or screenshots to help us resolve this quickly."
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-brand-primary/60 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send message
                  </button>
                  <p className="text-[11px] text-brand-muted">
                    Typical response time: under 24 hours on business days.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
    </DashboardShell>
  );
}

