// Time/date formatters. Locale-aware where applicable.

type Locale = 'uz' | 'en' | 'ru';

const UNITS: Record<Locale, { s: string; m: string; h: string; d: string; ago: string }> = {
  uz: { s: 'soniya', m: 'daqiqa', h: 'soat', d: 'kun', ago: 'oldin' },
  en: { s: 'sec',    m: 'min',    h: 'h',    d: 'd',   ago: 'ago' },
  ru: { s: 'сек',    m: 'мин',    h: 'ч',    d: 'дн',  ago: 'назад' },
};

export function timeAgo(input: string | Date, locale: Locale = 'uz'): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const ms = Date.now() - d.getTime();
  const s = Math.max(1, Math.round(ms / 1000));
  const u = UNITS[locale];
  if (s < 60) return `${s} ${u.s} ${u.ago}`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} ${u.m} ${u.ago}`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${u.h} ${u.ago}`;
  const dy = Math.round(h / 24);
  return `${dy} ${u.d} ${u.ago}`;
}

// Short variant for tight spaces (notification list).
export function timeAgoShort(input: string | Date, locale: Locale = 'uz'): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const ms = Date.now() - d.getTime();
  const s = Math.max(1, Math.round(ms / 1000));
  if (s < 60) return locale === 'uz' ? `${s} son` : locale === 'ru' ? `${s} сек` : `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return locale === 'uz' ? `${m} daq` : locale === 'ru' ? `${m} мин` : `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return locale === 'uz' ? `${h} soat` : locale === 'ru' ? `${h} ч` : `${h}h`;
  const dy = Math.round(h / 24);
  return locale === 'uz' ? `${dy} kun` : locale === 'ru' ? `${dy} дн` : `${dy}d`;
}
