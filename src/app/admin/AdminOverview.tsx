'use client';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story } from '@/lib/types';

function Sparkline({ data, color = tokens.orange, height = 38 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) {
    return <div style={{ height, display: 'flex', alignItems: 'center', color: 'rgba(26,22,19,0.3)', fontSize: 11 }}>—</div>;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const w = 120, h = height;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={color} />
    </svg>
  );
}

function buildSeries(seed: number, len = 10) {
  // deterministic pseudo-random series for visual rhythm
  const out: number[] = [];
  let v = seed;
  for (let i = 0; i < len; i++) {
    v = (v * 9301 + 49297) % 233280;
    out.push(v % 100);
  }
  return out;
}

export function AdminOverview({
  stories, writerCount, contestCount,
}: { stories: Story[]; writerCount: number; contestCount: number }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const totalPlays = stories.reduce((a, s) => a + s.plays, 0);
  const totalLikes = stories.reduce((a, s) => a + s.likes, 0);

  const stats = [
    { label: 'Hikoyalar', value: stories.length, hint: 'nashr qilingan', series: buildSeries(stories.length || 7), icon: <Icon.books s={18} c={tokens.orangeDeep} /> },
    { label: 'Yozuvchilar', value: writerCount, hint: 'faol', series: buildSeries((writerCount || 5) + 13), icon: <Icon.profile s={18} c={tokens.orangeDeep} /> },
    { label: "O'qishlar", value: totalPlays.toLocaleString(), hint: 'jami', series: buildSeries(totalPlays || 23), icon: <Icon.headphones s={18} c={tokens.orangeDeep} /> },
    { label: 'Yoqtirishlar', value: totalLikes.toLocaleString(), hint: 'jami', series: buildSeries(totalLikes || 19), icon: <Icon.heart s={18} c={tokens.orangeDeep} /> },
  ];

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div className="anim-fade-up" style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Umumiy ko‘rinish</div>
          <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 30, fontWeight: 700, color: ink,
            letterSpacing: -0.6, margin: 0 }}>Boshqaruv paneli</h1>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 999,
          background: 'rgba(76,175,80,0.10)', color: '#2E7D32',
          fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 600,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32' }} className="anim-pulse-ring" />
          Tizim faol
        </div>
      </div>

      <div className="anim-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
                textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>{s.label}</div>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(255,87,34,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.icon}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 28, color: ink, fontWeight: 700,
              letterSpacing: -0.5, marginTop: 4 }}>{s.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute }}>{s.hint}</div>
              <Sparkline data={s.series} />
            </div>
          </div>
        ))}
      </div>

      <div className="anim-fade-up delay-200" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 17, color: ink, fontWeight: 600, margin: 0 }}>So‘nggi hikoyalar</h3>
            <Link href="/admin/stories" style={{ fontFamily: 'var(--font-geist)', fontSize: 12.5,
              color: tokens.orange, fontWeight: 600, textDecoration: 'none' }}>Hammasi &rarr;</Link>
          </div>
          {stories.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <Illust.emptyFeed size={140} />
              </div>
              <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: 0, lineHeight: 1.5 }}>
                Hali nashr qilingan hikoyalar yo‘q.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-geist)' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Sarlavha</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Muallif</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Tur</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>O‘qildi</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Holat</th>
                </tr>
              </thead>
              <tbody>
                {stories.slice(0, 6).map(s => (
                  <tr key={s.id} style={{ borderTop: `1px solid ${line}`, fontSize: 13, color: ink }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{s.title}</td>
                    <td style={{ padding: '12px 10px', color: mute }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={s.author?.display_name?.[0] || 'A'} size={22} seed={s.cover_seed} />
                        {s.author?.display_name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: mute, textTransform: 'capitalize' }}>{s.type}</td>
                    <td style={{ padding: '12px 10px', color: mute }}>{s.plays.toLocaleString()}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999,
                        background: 'rgba(76,175,80,0.10)', color: '#2E7D32',
                        fontSize: 11, fontWeight: 600,
                      }}>{s.status === 'published' ? 'nashrda' : s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 17, color: ink, fontWeight: 600, margin: '0 0 14px' }}>Tezkor amallar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { href: '/admin/stories', icon: <Icon.books s={16} c={ink} />, label: 'Hikoyalarni boshqarish' },
              { href: '/admin/users', icon: <Icon.profile s={16} c={ink} />, label: 'Foydalanuvchilar' },
              { href: '/admin/contests', icon: <Icon.trophy s={16} c={ink} />, label: 'Tanlovlar' },
              { href: '/admin/moderation', icon: <Icon.shield s={16} c={ink} />, label: 'Moderatsiya' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{
                height: 42, padding: '0 14px', borderRadius: 10,
                background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(26,22,19,0.03)',
                color: ink, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
              }}>{a.icon} {a.label} <Icon.chev s={14} c={mute} /></Link>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 14, borderRadius: 12,
            background: 'rgba(255,87,34,0.08)' }}>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: tokens.orangeDeep,
              fontWeight: 700, marginBottom: 4 }}>Eslatma</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: ink, lineHeight: 1.5 }}>
              Faqat <code style={{ background: 'rgba(255,255,255,0.6)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>role = &apos;admin&apos;</code> bo‘lgan foydalanuvchilar bu panelni ko‘ra oladi.
            </div>
          </div>
        </div>
      </div>

      <div className="anim-fade-up delay-300" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <div className="card" style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Illust.writing size={140} />
          <div>
            <h4 style={{ fontFamily: 'var(--font-geist)', fontSize: 16, color: ink, fontWeight: 600, margin: '0 0 4px' }}>
              Tahririy yo‘riqnoma
            </h4>
            <p style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute, margin: 0, lineHeight: 1.55 }}>
              Hamjamiyat me‘yorlari, tarjima va saralash yo‘riqnomasi bilan tanishing.
            </p>
          </div>
        </div>
        <div className="card" style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Illust.listening size={140} />
          <div>
            <h4 style={{ fontFamily: 'var(--font-geist)', fontSize: 16, color: ink, fontWeight: 600, margin: '0 0 4px' }}>
              {contestCount} ta tanlov
            </h4>
            <p style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute, margin: 0, lineHeight: 1.55 }}>
              Faol va rejalashtirilgan tanlovlarni ko‘ring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
