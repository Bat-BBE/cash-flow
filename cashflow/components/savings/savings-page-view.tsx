'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { useTranslation } from '@/lib/translations';
import { DEMO_JARS, DEMO_MONTHLY_SAVED } from './demo-data';
import { useSavingsGoals } from './use-savings-goals';
import { SavingsHero } from './savings-hero';
import { SavingsStatsRow } from './savings-stats-row';
import { SavingsGoalsSection } from './savings-goals-section';
import { SavingsJarsSection } from './savings-jars-section';
import { SavingsHabitCard } from './savings-habit-card';
import { SavingsTipsSection } from './savings-tips-section';
import { SavingsAddGoalDialog } from './savings-add-goal-dialog';
import { SavingsAddGoalCta } from './savings-add-goal-cta';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SavingsPageView() {
  const { language } = useDashboard();
  const t = useTranslation(language);
  const lang = language;
  const { goals, addGoal } = useSavingsGoals();
  const [dialogOpen, setDialogOpen] = useState(false);

  const currency = 'MNT';

  const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.current, 0), [goals]);
  const combinedTarget = useMemo(() => goals.reduce((s, g) => s + g.target, 0), [goals]);

  const habitBullets = useMemo(
    () => [t('savingsHabitBullet1'), t('savingsHabitBullet2'), t('savingsHabitBullet3')],
    [t],
  );

  const tips = useMemo(() => [t('savingsTip1'), t('savingsTip2'), t('savingsTip3')], [t]);

  const dialogLabels = useMemo(
    () => ({
      title: t('savingsDialogTitle'),
      name: t('savingsDialogName'),
      target: t('savingsDialogTarget'),
      deadline: t('savingsDialogDeadline'),
      save: t('savingsDialogSave'),
      cancel: t('savingsDialogCancel'),
    }),
    [t],
  );

  return (
    <>
      <div
        className={cn(
          'relative mx-auto w-full max-w-[1400px] flex-1 space-y-3 px-3 pb-4 pt-2',
          'sm:space-y-4 sm:px-4 sm:pb-6 sm:pt-3 md:space-y-5 md:px-6 md:py-6 md:pb-8',
          'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-40',
          'before:bg-[radial-gradient(ellipse_70%_80%_at_50%_-20%,rgba(112,96,240,0.09),transparent_65%)]',
        )}
      >
        <div className="relative flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <header className="min-w-0 space-y-0.5">
            <h1 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
              {t('savingsNav')}
            </h1>
            <p className="max-w-md text-[10px] leading-relaxed text-slate-400/95 sm:max-w-xl sm:text-[11px]">{t('savingsPageSubtitle')}</p>
          </header>
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="h-9 shrink-0 rounded-xl border border-violet-400/25 bg-violet-500/[0.12] px-3 text-[11px] font-semibold text-violet-100 shadow-sm shadow-violet-900/20 transition-colors hover:bg-violet-500/[0.2] sm:inline-flex sm:px-3.5 sm:text-xs"
          >
            <span className="material-symbols-outlined mr-1 text-[16px] text-violet-300/90 sm:text-[17px]">add_circle</span>
            {t('savingsAddGoalCta')}
          </Button>
        </div>

        <SavingsHero
          totalSaved={totalSaved}
          currency={currency}
          title={t('savingsHeroTitle')}
          caption={t('savingsHeroCaption')}
        />

        <SavingsStatsRow
          monthSaved={DEMO_MONTHLY_SAVED}
          activeGoals={goals.length}
          combinedTarget={combinedTarget}
          currency={currency}
          lMonth={t('savingsStatMonthLabel')}
          lGoals={t('savingsStatGoalsLabel')}
          lTarget={t('savingsStatTargetLabel')}
        />

        <p className="text-[10px] leading-snug text-slate-500 sm:text-[11px]">
          <Link
            href="/scheduled"
            className="font-medium text-violet-400/90 underline decoration-violet-500/30 underline-offset-2 transition-colors hover:text-violet-300 hover:decoration-violet-400/50"
          >
            {t('savingsLinkScheduled')}
          </Link>
        </p>

        <SavingsGoalsSection
          goals={goals}
          currency={currency}
          lang={lang}
          sectionTitle={t('savingsGoalsSection')}
          ofLabel={t('savingsOf')}
          deadlinePrefix={t('savingsDeadlinePrefix')}
          emptyMessage={t('savingsGoalsEmpty')}
        />

        <SavingsJarsSection jars={DEMO_JARS} currency={currency} lang={lang} title={t('savingsJarsSection')} />

        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          <SavingsHabitCard title={t('savingsHabitTitle')} bullets={habitBullets} />
          <SavingsTipsSection title={t('savingsTipsTitle')} tips={tips} />
        </div>

        <SavingsAddGoalCta
          onClick={() => setDialogOpen(true)}
          title={t('savingsAddGoalCardTitle')}
          hint={t('savingsAddGoalCardHint')}
          ariaLabel={t('savingsFabAria')}
        />
      </div>

      <SavingsAddGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={addGoal} labels={dialogLabels} />
    </>
  );
}
