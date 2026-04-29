'use client';
import { Icon } from '@/components/Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

const sections = [
  { title: 'Hisob', items: [
    { label: 'Email', value: '—' },
    { label: 'Foydalanuvchi nomi', value: '—' },
    { label: 'Parol', value: 'O‘zgartirish' },
  ]},
  { title: 'O‘qish', items: [
    { label: 'Standart shrift kattaligi', value: 'O‘rtacha' },
    { label: 'Matnni teng joylash', value: 'O‘chiq' },
    { label: 'Audio avtomatik o‘ynatish', value: 'Yoqilgan' },
  ]},
  { title: 'Bildirishnomalar', items: [
    { label: 'Yangi kuzatuvchilar', value: 'Yoqilgan' },
    { label: 'Hikoyangizga sharhlar', value: 'Yoqilgan' },
    { label: 'Haftalik xulosa', value: 'Yakshanba' },
  ]},
];

export function SettingsView() {
  const { dark, theme, toggle } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 32, fontWeight: 700, color: ink,
        letterSpacing: -0.7, margin: '0 0 28px' }}>Sozlamalar</h1>

      <div className="card" style={{
        padding: '18px 22px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {theme === 'dark' ? <Icon.moon s={20} c={ink} /> : <Icon.sun s={20} c={ink} />}
          <div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 15, color: ink, fontWeight: 600 }}>Ko‘rinish</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>Hozir: {theme === 'dark' ? 'tungi' : 'kunduzgi'}</div>
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
        }}>Hisobdan chiqish</button>
      </form>
    </div>
  );
}
