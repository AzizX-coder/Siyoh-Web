import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { createClient, supabaseEnabled } from '@/lib/supabase/server';
import { DEFAULT_LOCALE, isLocale, type AppLocale } from './routing';

// Server-side locale resolution.
// Priority: profiles.locale (logged-in) → NEXT_LOCALE cookie → Accept-Language → default.

async function resolveLocale(): Promise<AppLocale> {
  // 1) Authenticated user preference (when Supabase is configured).
  if (supabaseEnabled) {
    try {
      const sb = createClient();
      if (sb) {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const { data } = await sb.from('profiles').select('locale').eq('id', user.id).single();
          if (data?.locale && isLocale(data.locale)) return data.locale;
        }
      }
    } catch { /* fall through */ }
  }

  // 2) Cookie.
  const c = cookies().get('NEXT_LOCALE')?.value;
  if (isLocale(c)) return c;

  // 3) Accept-Language header.
  const al = headers().get('accept-language') || '';
  const first = al.split(',')[0]?.split('-')[0]?.toLowerCase();
  if (isLocale(first)) return first;

  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  // Load the matching message bundle; uz acts as the fallback for missing keys.
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages,
    // Format Date/Number/relative time with Uzbek/Russian/English conventions.
    timeZone: 'Asia/Tashkent',
  };
});
