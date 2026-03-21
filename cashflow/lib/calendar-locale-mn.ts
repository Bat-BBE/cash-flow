/**
 * Хуанлийн статик монгол бичиг (SSR/CSR ижил — Intl-аас тусгаар).
 * JS Date: Ням = 0 … Бямба = 6
 */
export const MN_WEEKDAY_LABELS = [
  'Ням',
  'Даваа',
  'Мягмар',
  'Лхагва',
  'Пүрэв',
  'Баасан',
  'Бямба',
] as const;

/** 1-р сар … 12-р сар */
export const MN_MONTH_NAMES = [
  '1-р сар',
  '2-р сар',
  '3-р сар',
  '4-р сар',
  '5-р сар',
  '6-р сар',
  '7-р сар',
  '8-р сар',
  '9-р сар',
  '10-р сар',
  '11-р сар',
  '12-р сар',
] as const;

/** Жишээ: 2026 оны 3-р сар */
export function formatMnMonthYear(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  return `${y} оны ${MN_MONTH_NAMES[m]}`;
}

/** Жишээ: 2026 оны 3-р сарын 18, Бямба */
export function formatMnFullDate(date: Date): string {
  const wd = MN_WEEKDAY_LABELS[date.getDay()];
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${y} оны ${m}-р сарын ${d}, ${wd}`;
}
