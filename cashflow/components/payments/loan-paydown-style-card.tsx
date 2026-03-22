'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/components/providers/dashboard-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { QuizLanguage } from '@/lib/loan-paydown-style-quiz';
import {
  PAYDOWN_QUIZ_QUESTIONS,
  scorePaydownStyle,
  loadStoredPaydownStyle,
  saveStoredPaydownStyle,
  getResultCopy,
  type PaydownStyle,
} from '@/lib/loan-paydown-style-quiz';

function toQuizLang(language: Language): QuizLanguage {
  return language === 'EN' ? 'EN' : 'MN';
}

export function LoanPaydownStyleCard() {
  const { language } = useDashboard();
  const L = toQuizLang(language);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<('avalanche' | 'snowball')[]>([]);
  const [stored, setStored] = useState<ReturnType<typeof loadStoredPaydownStyle>>(null);
  const [resultStyle, setResultStyle] = useState<PaydownStyle | null>(null);

  const refreshStored = useCallback(() => {
    setStored(loadStoredPaydownStyle());
  }, []);

  useEffect(() => {
    refreshStored();
  }, [refreshStored]);

  const intro = useMemo(
    () =>
      L === 'EN'
        ? {
            title: 'How do you like to tackle loans?',
            lead:
              'A few questions map your decision style — not to label you, but to frame tips on this page in a way that fits you.',
            bullets: [
              'You are not “bad with money” — this is about habits.',
              'Knowing your style builds confidence.',
              'You can follow a plan that matches how you stay motivated.',
            ],
            cta: 'Discover my style',
            ctaAgain: 'Retake the quiz',
          }
        : {
            title: 'Зээл төлөхөд таны хэв маяг',
            lead:
              'Хэдхэн асуултаар шийдвэр гаргалтын хэвийг таньж, энэ хуудсын зөвлөмжийг танд илүү ойрхон болгоно. Энэ нь таныг “өртэй” гэж тодорхойлох биш.',
            bullets: [
              'Өөрийгөө ойлгож байна гэдэг нь итгэл өгнө.',
              'Танд тохирсон аргаар төлөвлөгөөгөө тогтмол дагахад амар.',
              'Санал болгосон стратегид илүү итгэлтэй болно.',
            ],
            cta: 'Зан төлөвөө тодорхойлох',
            ctaAgain: 'Дахин асуулга өгөх',
          },
    [L],
  );

  const question = PAYDOWN_QUIZ_QUESTIONS[step];
  const total = PAYDOWN_QUIZ_QUESTIONS.length;
  const showingResult = resultStyle !== null;

  const openFresh = () => {
    setStep(0);
    setChoices([]);
    setResultStyle(null);
    setOpen(true);
  };

  const pick = (style: 'avalanche' | 'snowball') => {
    const next = [...choices, style];
    setChoices(next);
    if (next.length >= total) {
      const scored = scorePaydownStyle(next);
      const payload = {
        style: scored.style,
        avalancheScore: scored.avalancheScore,
        snowballScore: scored.snowballScore,
        answeredAt: new Date().toISOString(),
      };
      saveStoredPaydownStyle(payload);
      setResultStyle(scored.style);
      refreshStored();
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
    setChoices((c) => c.slice(0, -1));
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setStep(0);
      setChoices([]);
      setResultStyle(null);
    }
  };

  const resultCopy = resultStyle ? getResultCopy(resultStyle, L) : null;
  const storedCopy = stored ? getResultCopy(stored.style, L) : null;

  return (
    <>
      <section
        className={cn(
          'relative overflow-hidden rounded-3xl border border-white/[0.08]',
          'bg-gradient-to-br from-violet-500/[0.07] via-brand-card/80 to-sky-500/[0.06]',
          'p-6 md:p-8 shadow-xl shadow-black/20 backdrop-blur-lg',
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-40 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="min-w-0 space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
              {L === 'EN' ? 'Loan payoff style' : 'Зээл төлөх зан төлөв'}
            </div>
            <h2 className="text-xl font-black tracking-tight text-white md:text-2xl">{intro.title}</h2>
            <p className="text-sm leading-relaxed text-slate-400">{intro.lead}</p>
            <ul className="space-y-2 text-sm text-slate-500">
              {intro.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/80" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-3 md:w-[min(100%,280px)]">
            {stored && storedCopy ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {L === 'EN' ? 'Saved result' : 'Хадгалсан үр дүн'}
                </p>
                <p className="mt-2 text-sm font-bold leading-snug text-white">{storedCopy.title}</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={openFresh}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold',
                'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
                'hover:opacity-95 active:scale-[0.99] transition-all',
              )}
            >
              <span className="material-symbols-outlined text-[20px]">quiz</span>
              {stored ? intro.ctaAgain : intro.cta}
            </button>
          </div>
        </div>
      </section>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            'max-h-[min(92dvh,720px)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto border-white/10 bg-brand-card p-0 gap-0',
            'sm:rounded-3xl',
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b border-white/10 px-5 py-4 md:px-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-lg font-black text-white md:text-xl">
                {showingResult
                  ? L === 'EN'
                    ? 'Your result'
                    : 'Таны үр дүн'
                  : L === 'EN'
                    ? `Question ${step + 1} of ${total}`
                    : `Асуулт ${step + 1} / ${total}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {showingResult
                  ? L === 'EN'
                    ? 'Use this as a guide — you can always retake the quiz.'
                    : 'Зөвлөмж болгон ашиглана уу — хүссэн үедээ дахин өгч болно.'
                  : L === 'EN'
                    ? 'Pick the answer that feels most like you — there are no wrong choices.'
                    : 'Өөртөө хамгийн ойр санагдахыг сонгоно уу — буруу хариулт гэж байхгүй.'}
              </DialogDescription>
            </DialogHeader>

            {!showingResult ? (
              <div className="mt-4 flex gap-1.5">
                {PAYDOWN_QUIZ_QUESTIONS.map((q, i) => (
                  <div
                    key={q.id}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i < step ? 'bg-primary' : i === step ? 'bg-primary/50' : 'bg-white/10',
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="px-5 py-5 md:px-6 md:py-6">
            {!showingResult && question ? (
              <div className="space-y-5">
                <p className="text-base font-semibold leading-snug text-white md:text-[1.05rem]">
                  {question.prompt[L]}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => pick(question.optionA.style)}
                    className={cn(
                      'group flex w-full items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 text-left',
                      'transition-colors hover:bg-emerald-500/10 hover:border-emerald-500/40',
                    )}
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      {question.optionA.emoji}
                    </span>
                    <span className="text-sm font-medium leading-snug text-slate-100">
                      {question.optionA.label[L]}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => pick(question.optionB.style)}
                    className={cn(
                      'group flex w-full items-start gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/[0.06] p-4 text-left',
                      'transition-colors hover:bg-sky-500/10 hover:border-sky-500/40',
                    )}
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      {question.optionB.emoji}
                    </span>
                    <span className="text-sm font-medium leading-snug text-slate-100">
                      {question.optionB.label[L]}
                    </span>
                  </button>
                </div>
                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0}
                    className={cn(
                      'text-sm font-medium text-slate-500 hover:text-slate-300',
                      step === 0 && 'invisible pointer-events-none',
                    )}
                  >
                    {L === 'EN' ? 'Back' : 'Буцах'}
                  </button>
                </div>
              </div>
            ) : null}

            {showingResult && resultCopy ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5">
                  <p className="text-base font-black leading-snug text-white md:text-lg">{resultCopy.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{resultCopy.body}</p>
                </div>
                <p className="text-xs leading-relaxed text-slate-500 border-l-2 border-white/15 pl-3">
                  {resultCopy.hint}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResultStyle(null);
                    setStep(0);
                    setChoices([]);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-white hover:bg-white/[0.07]"
                >
                  {L === 'EN' ? 'Retake quiz' : 'Дахин асуулга өгөх'}
                </button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
