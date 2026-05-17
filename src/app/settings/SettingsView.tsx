'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import { setLocale as setLocaleAction } from '@/lib/actions';
import { LOCALES, LOCALE_LABEL, type AppLocale } from '@/i18n/routing';

export function SettingsView() {
  const t = useTranslations('settings');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const { push } = useToast();
  const { dark, theme, toggle } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [pending, start] = useTransition();

  function changeLocale(next: AppLocale) {
    if (next === locale) return;
    start(async () => {
      const res = await setLocaleAction(next);
      if (res.ok) {
        push({ kind: 'success', title: LOCALE_LABEL[next] });
        router.refresh();
      } else {
        push({ kind: 'error', title: res.error || 'Failed' });
      }
    });
  }

  const sections = [
    { title: t('account'), items: [
      { label: t('email'),    value: '—' },
      { label: t('username'), value: '—' },
      { label: t('password'), value: t('change') },
    ]},
    { title: t('reading'), items: [
      { label: t('defaultFontSize'), value: t('medium') },
      { label: t('justify'),         value: t('off') },
      { label: t('autoplayAudio'),   value: t('on') },
    ]},
    { title: t('notifications'), items: [
      { label: t('newFollowers'),  value: t('on') },
      { label: t('commentsOn'),    value: t('on') },
      { label: t('weeklyDigest'),  value: t('sunday') },
    ]},
  ];

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 32, fontWeight: 700, color: ink,
        letterSpacing: -0.7, margin: '0 0 28px' }}>{t('title')}</h1>

      {/* Appearance */}
      <div className="card" style={{
        padding: '18px 22px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {theme === 'dark' ? <Icon.moon s={20} c={ink} /> : <Icon.sun s={20} c={ink} />}
          <div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 15, color: ink, fontWeight: 600 }}>
              {t('appearance')}
            </div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
              {theme === 'dark' ? t('currentlyDark') : t('currentlyLight')}
            </div>
          </div>
        </div>
        <button onClick={toggle} className="press" style={{
          width: 48, height: 28, borderRadius: 14, padding: 2, cursor: 'pointer', border: 'none',
          background: dark ? tokens.orange : 'rgba(26,22,19,0.15)',
          display: 'flex', justifyContent: dark ? 'flex-end' : 'flex-start',
          transition: 'all 0.2s',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </button>
      </div>

      {/* Language */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 15, color: ink, fontWeight: 600 }}>
              {t('language')}
            </div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute, marginTop: 2 }}>
              {t('languageHint')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {LOCALES.map(l => (
              <button
                key={l}
                onClick={() => changeLocale(l)}
                disabled={pending}
                className="press"
                style={{
                  height: 32, padding: '0 12px', borderRadius: 8,
                  border: 'none', cursor: pending ? 'wait' : 'pointer',
                  background: locale === l ? (dark ? tokens.darkInk : tokens.ink) : (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)'),
                  color: locale === l ? (dark ? tokens.darkBg : tokens.paper) : ink,
                  fontFamily: 'var(--font-geist)', fontSize: 12.5, fontWeight: 600,
                }}
              >
                {LOCALE_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sections.map(sec => (
        <div key={sec.title} style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, padding: '0 4px' }}>{sec.title}</h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            {sec.items.map((it, i) => (
              <div key={it.label} style={{
                padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: i === 0 ? 'none' : `1px solid ${line}`,
              }}>
                <span style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: ink }}>{it.label}</span>
                <span style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute,
                  display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {it.value} <Icon.chev s={14} c={mute} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <form action="/auth/signout" method="POST">
        <button type="submit" className="press" style={{
          width: '100%', height: 46, borderRadius: 12, border: `1px solid ${line}`,
          background: 'transparent', color: tokens.orangeDeep, cursor: 'pointer',
          fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600, marginTop: 12,
        }}>{t('signOut')}</button>
      </form>
    </div>
  );
}
