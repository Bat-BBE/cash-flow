/**
 * Зээл төлөх стратеги (Avalanche vs Snowball) — богино асуулга + оноолтын логик.
 * "Өртэй" гэсэн сэтгэлзүйг биш, хэв маягийг таньж зөвлөмж өгнө.
 */

export type PaydownStyle = 'avalanche' | 'snowball' | 'balanced';

export type QuizLanguage = 'MN' | 'EN';

export interface QuizOption {
  style: 'avalanche' | 'snowball';
  label: Record<QuizLanguage, string>;
  emoji: string;
}

export interface QuizQuestionDef {
  id: string;
  prompt: Record<QuizLanguage, string>;
  optionA: QuizOption;
  optionB: QuizOption;
}

export const PAYDOWN_STYLE_STORAGE_KEY = 'cashflow-loan-paydown-style-v1';

export interface StoredPaydownStyle {
  style: PaydownStyle;
  avalancheScore: number;
  snowballScore: number;
  answeredAt: string;
}

export const PAYDOWN_QUIZ_QUESTIONS: QuizQuestionDef[] = [
  {
    id: 'decision',
    prompt: {
      MN: 'Та ажлыг хийхдээ аль аргыг илүүд үздэг вэ?',
      EN: 'When you work through tasks, which approach do you prefer?',
    },
    optionA: {
      style: 'avalanche',
      emoji: '🟢',
      label: {
        MN: 'Том, чухал ажлыг эхэлж дуусгах',
        EN: 'Start with the big, important work first',
      },
    },
    optionB: {
      style: 'snowball',
      emoji: '🔵',
      label: {
        MN: 'Жижиг ажлуудаас эхэлж, дарааллаар дуусгах',
        EN: 'Start small and finish step by step',
      },
    },
  },
  {
    id: 'motivation',
    prompt: {
      MN: 'Юу таныг илүү урамшуулдаг вэ?',
      EN: 'What motivates you more?',
    },
    optionA: {
      style: 'avalanche',
      emoji: '🟢',
      label: {
        MN: 'Урт хугацаанд хамгийн ашигтай үр дүн',
        EN: 'The best long-term outcome',
      },
    },
    optionB: {
      style: 'snowball',
      emoji: '🔵',
      label: {
        MN: 'Хурдан ахиц, жижиг ялалтууд',
        EN: 'Quick progress and small wins',
      },
    },
  },
  {
    id: 'patience',
    prompt: {
      MN: 'Та аль төрлийн үр дүнд илүү дуртай вэ?',
      EN: 'Which kind of result do you prefer?',
    },
    optionA: {
      style: 'avalanche',
      emoji: '🟢',
      label: {
        MN: 'Удаан ч гэсэн хамгийн оновчтой үр дүн',
        EN: 'Slower but optimal results',
      },
    },
    optionB: {
      style: 'snowball',
      emoji: '🔵',
      label: {
        MN: 'Шууд харагдах, хурдан үр дүн',
        EN: 'Visible, fast results',
      },
    },
  },
  {
    id: 'overload',
    prompt: {
      MN: 'Хэрвээ танд олон ажил байвал…',
      EN: 'If you have many things to do…',
    },
    optionA: {
      style: 'avalanche',
      emoji: '🟢',
      label: {
        MN: 'Хамгийн чухлыг нь эхэлж хийнэ',
        EN: 'You start with the most important',
      },
    },
    optionB: {
      style: 'snowball',
      emoji: '🔵',
      label: {
        MN: 'Хамгийн амархан, жижгийг нь эхэлж дуусгана',
        EN: 'You finish the easiest / smallest first',
      },
    },
  },
];

export function scorePaydownStyle(choices: ('avalanche' | 'snowball')[]): {
  style: PaydownStyle;
  avalancheScore: number;
  snowballScore: number;
} {
  let a = 0;
  let s = 0;
  for (const c of choices) {
    if (c === 'avalanche') a += 1;
    else s += 1;
  }
  if (a > s) return { style: 'avalanche', avalancheScore: a, snowballScore: s };
  if (s > a) return { style: 'snowball', avalancheScore: a, snowballScore: s };
  return { style: 'balanced', avalancheScore: a, snowballScore: s };
}

export function loadStoredPaydownStyle(): StoredPaydownStyle | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PAYDOWN_STYLE_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredPaydownStyle;
    if (p && (p.style === 'avalanche' || p.style === 'snowball' || p.style === 'balanced'))
      return p;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveStoredPaydownStyle(data: StoredPaydownStyle): void {
  try {
    localStorage.setItem(PAYDOWN_STYLE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearStoredPaydownStyle(): void {
  try {
    localStorage.removeItem(PAYDOWN_STYLE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Үр дүнгийн гарчиг + тайлбар (Snowball/Avalanche гэж заавал нэрлэхгүй). */
export function getResultCopy(
  style: PaydownStyle,
  lang: QuizLanguage,
): { title: string; body: string; hint: string } {
  if (lang === 'EN') {
    switch (style) {
      case 'avalanche':
        return {
          title: 'Your style: long-term, strategic focus',
          body:
            'You tend to tackle what matters most first and optimize for the best overall outcome. ' +
            'For loans, focusing extra payments on the highest-interest debt first usually saves the most money — ' +
            'we’ll align tips on this page with that mindset.',
          hint:
            'You’re not “bad with debt” — you’re learning how you decide. That makes the plan easier to stick to.',
        };
      case 'snowball':
        return {
          title: 'Your style: momentum from quick wins',
          body:
            'You get energy from visible progress and steady wins. ' +
            'Paying off the smallest balances first can feel easier mentally even if it’s not always the cheapest mathematically — ' +
            'we’ll emphasize achievable milestones in your plan.',
          hint:
            'Naming your style builds confidence — use the strategy that keeps you consistent.',
        };
      default:
        return {
          title: 'Your style: balanced',
          body:
            'You mix long-term thinking with short-term motivation. ' +
            'You can alternate: sometimes hit the highest rate, sometimes clear a small loan for a morale boost.',
          hint: 'The best plan is the one you actually follow month to month.',
        };
    }
  }

  switch (style) {
    case 'avalanche':
      return {
        title: 'Таны хэв маяг: Урт хугацааны, стратегийн төвлөрөлт',
        body:
          'Та хамгийн чухал зүйлсээ эхлээд авч явж, нийтэдээ хамгийн оновчтой үр дүнг зорьдог хэв маягтай. ' +
          'Зээл төлөхөд илүү хүүтэй зээлээ эхлээд дарж, нийт төлөх хүүгээ багасгах нь ихэвчлэн хамгийн ашигтай — ' +
          'энэ хуудсын зөвлөмжийг таны энэ хэв маягтай нийцүүлэн санал болгоно.',
        hint:
          'Та “өртэй муу хүн” биш — өөрийгөө ойлгож байна гэдэг нь төлөвлөгөөгөө тогтмол дагахад тусална.',
      };
    case 'snowball':
      return {
        title: 'Таны хэв маяг: Жижиг ялалтаар урам авдаг',
        body:
          'Танд хурдан ахиц, тодорхой “амжилтууд” илүү урам өгдөг. ' +
          'Хамгийн бага үлдэгдэлтэй зээлээ эхлээд хаах нь математикаар үргэлж хамгийн хямд биш ч сэтгэл зүйн хувьд илүү амар байж болно — ' +
          'төлөвлөгөөндөө энэ маягаар алхам алхмаар урагшлахыг санал болгоно.',
        hint:
          'Өөрийн хэв маягаа таньснаар итгэл үзүүлж, санал болгосон аргыг илүү чин сэтгэлээсээ дагана.',
      };
    default:
      return {
        title: 'Таны хэв маяг: Хосолмол',
        body:
          'Та урт хугацааны оновчлол, товч хугацааны урам зориг хоёуланг нь хослуулж чаддаг. ' +
          'Заримдаа хамгийн өндөр хүүтэйг нь, заримдаа хамгийн хурдан хаагдах зээлээ эхлүүлээд урам зоригийг өсгөж болно.',
        hint: 'Хамгийн сайн төлөвлөгөө бол сар бүр үнэхээр дагаж чаддаг төлөвлөгөө.',
      };
  }
}
