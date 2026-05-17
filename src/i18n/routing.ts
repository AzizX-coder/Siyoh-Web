// Supported locales for Siyoh.
// Uzbek default; no URL prefix (we resolve via cookie/profile).
export const LOCALES = ['uz', 'en', 'ru'] as const;
export type AppLocale = typeof LOCALES[number];
export const DEFAULT_LOCALE: AppLocale = 'uz';

export const LOCALE_LABEL: Record<AppLocale, string> = {
  uz: "O'zbekcha",
  en: 'English',
  ru: 'Русский',
};

export function isLocale(s: string | undefined | null): s is AppLocale {
  return !!s && (LOCALES as readonly string[]).includes(s);
}
