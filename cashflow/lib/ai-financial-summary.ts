import type { RawTx } from '@/contexts/dashboard-data-context';
import { categorize } from '@/contexts/dashboard-data-context';
import {
  type TimeRange,
  filterTxsByRange,
  timeRangeLabelMn,
} from '@/lib/dashboard-time-range';

function fmtMn(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}сая₮`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}мян₮`;
  return `${Math.round(v)}₮`;
}

function filterMonth(txs: RawTx[], y: number, m: number) {
  return txs.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === y && d.getMonth() + 1 === m;
  });
}

function getMonthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}

function pct(cur: number, prev: number) {
  return prev === 0 ? 0 : Math.round(((cur - prev) / Math.abs(prev)) * 100);
}

/** AI prompt / чатад дамжуулах санхүүгийн товч */
export function buildFinancialSummary(txs: RawTx[], range: TimeRange): string {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const p1 = getMonthsAgo(1);

  const curTxs = filterMonth(txs, cy, cm);
  const prevTxs = filterMonth(txs, p1.y, p1.m);

  const inc = (arr: RawTx[]) => arr.reduce((s, t) => s + (t.credit ?? 0), 0);
  const exp = (arr: RawTx[]) => arr.reduce((s, t) => s + Math.abs(t.debit ?? 0), 0);

  const curInc = inc(curTxs);
  const curExp = exp(curTxs);
  const p1Inc = inc(prevTxs);
  const p1Exp = exp(prevTxs);

  const p2 = getMonthsAgo(2);
  const p3 = getMonthsAgo(3);
  const p2Exp = exp(filterMonth(txs, p2.y, p2.m));
  const p3Exp = exp(filterMonth(txs, p3.y, p3.m));

  const catExp: Record<string, number> = {};
  const catInc: Record<string, number> = {};
  const inRange = filterTxsByRange(txs, range);

  inRange.forEach((t) => {
    if (Math.abs(t.debit ?? 0) > 0) {
      const cat = categorize(t.description, true).category;
      catExp[cat] = (catExp[cat] ?? 0) + Math.abs(t.debit);
    }
    if ((t.credit ?? 0) > 0) {
      const cat = categorize(t.description, false).category;
      catInc[cat] = (catInc[cat] ?? 0) + t.credit;
    }
  });

  const topExpCats = Object.entries(catExp)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([k, v]) => `${k}: ${fmtMn(v)}`)
    .join(', ');
  const topIncCats = Object.entries(catInc)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${fmtMn(v)}`)
    .join(', ');

  const avg3Exp =
    [p1Exp, p2Exp, p3Exp].filter(Boolean).reduce((a, b) => a + b, 0) /
    ([p1Exp, p2Exp, p3Exp].filter(Boolean).length || 1);

  const latestBal =
    txs
      .filter((t) => t.closingBalance != null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.closingBalance ?? 0;

  const periodLabel = timeRangeLabelMn(range);

  return `
Сонгосон хугацаа (самбар): ${periodLabel}
Данс: Залуусын харилцах данс (MNT)

ЭНЭ САРЫН (${cy}/${cm}) МЭДЭЭЛЭЛ:
- Нийт орлого: ${fmtMn(curInc)}
- Нийт зарлага: ${fmtMn(curExp)}
- Цэвэр үр дүн: ${fmtMn(curInc - curExp)} (${curInc > curExp ? 'ашигтай' : 'алдагдалтай'})
- Зарлага/орлогын харьцаа: ${curInc > 0 ? Math.round((curExp / curInc) * 100) : 'n/a'}%

ӨМНӨХ САРУУДТАЙ ХАРЬЦУУЛАЛТ:
- 1 сарын өмнө: орлого ${fmtMn(p1Inc)}, зарлага ${fmtMn(p1Exp)}
- Орлогын өөрчлөлт: ${pct(curInc, p1Inc) > 0 ? '+' : ''}${pct(curInc, p1Inc)}%
- Зарлагын өөрчлөлт: ${pct(curExp, p1Exp) > 0 ? '+' : ''}${pct(curExp, p1Exp)}%
- 3 сарын дундаж зарлага: ${fmtMn(avg3Exp)}

ЗАРЛАГЫН АНГИЛЛАЛ (${periodLabel}):
${topExpCats || 'мэдээлэл байхгүй'}

ОРЛОГЫН АНГИЛЛАЛ (${periodLabel}):
${topIncCats || 'мэдээлэл байхгүй'}

ДАНСНЫ ҮЛДЭГДЭЛ (одоогийн): ${fmtMn(latestBal)}
  `.trim();
}
