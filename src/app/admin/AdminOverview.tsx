'use client';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story, Profile } from '@/lib/types';

// ---------------------------------------------------------------- chart bits

function buildSeries(seed: number, len = 14) {
  const out: number[] = [];
  let v = seed * 31 + 7;
  for (let i = 0; i < len; i++) {
    v = (v * 9301 + 49297) % 233280;
    out.push(20 + (v % 80));
  }
  return out;
}

function Sparkline({ data, color = tokens.orange, height = 36 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div style={{ height, display: 'flex', alignItems: 'center', color: 'rgba(26,22,19,0.3)', fontSize: 11 }}>—</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const w = 120;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1].split(',');
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

function LineChart({
  series, height = 220, color = tokens.orange, dark = false,
}: { series: { label: string; data: number[] }[]; height?: number; color?: string; dark?: boolean }) {
  const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
  const flat = series.flatMap(s => s.data);
  const max = Math.max(...flat, 10);
  const min = 0;
  const w = 720;
  const padL = 36, padR = 16, padT = 12, padB = 26;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const step = innerW / (labels.length - 1);
  const yTicks = [0, max * 0.25, max * 0.5, max * 0.75, max].map(v => Math.round(v));
  const colors = [color, '#3A332C', '#A89C8E'];
  const grid = dark ? 'rgba(255,237,213,0.08)' : 'rgba(26,22,19,0.06)';
  const text = dark ? 'rgba(245,237,224,0.6)' : 'rgba(26,22,19,0.5)';

  function y(v: number) { return padT + innerH - ((v - min) / (max - min || 1)) * innerH; }

  return (
    <div style={{ overflow: 'auto' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} style={{ display: 'block', minWidth: 480 }}>
        {/* Y grid */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={y(v)} x2={w - padR} y2={y(v)} stroke={grid} strokeWidth="1" strokeDasharray={i === 0 ? '0' : '2 4'} />
            <text x={padL - 8} y={y(v) + 4} fontSize="10" textAnchor="end" fill={text} fontFamily="JetBrains Mono, monospace">{v}</text>
          </g>
        ))}
        {/* X labels */}
        {labels.map((l, i) => (i % 3 === 0 || i === labels.length - 1) && (
          <text key={l} x={padL + i * step} y={height - 8} fontSize="10" textAnchor="middle" fill={text} fontFamily="JetBrains Mono, monospace">{l}</text>
        ))}
        {/* Series */}
        {series.map((s, idx) => {
          const c = colors[idx] || color;
          const pts = s.data.map((v, i) => `${padL + i * step},${y(v)}`);
          const area = `${padL},${y(0)} ${pts.join(' ')} ${padL + (s.data.length - 1) * step},${y(0)}`;
          return (
            <g key={s.label}>
              {idx === 0 && (
                <polygon points={area} fill={c} opacity="0.10" />
              )}
              <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {s.data.map((v, i) => i % 2 === 0 && <circle key={i} cx={padL + i * step} cy={y(v)} r="2.5" fill={c} />)}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------- view

export function AdminOverview({
  stories, writerCount, contestCount, recentWriters,
}: { stories: Story[]; writerCount: number; contestCount: number; recentWriters: Profile[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const totalPlays = stories.reduce((a, s) => a + s.plays, 0);
  const totalLikes = stories.reduce((a, s) => a + s.likes, 0);

  const stats = [
    { label: 'Hikoyalar', value: stories.length, hint: 'nashr qilingan', delta: '+12%', series: buildSeries(stories.length || 7), icon: <Icon.books s={18} c={tokens.orangeDeep} /> },
    { label: 'Yozuvchilar', value: writerCount, hint: 'faol', delta: '+5%', series: buildSeries((writerCount || 5) + 13), icon: <Icon.profile s={18} c={tokens.orangeDeep} /> },
    { label: "O'qishlar", value: totalPlays.toLocaleString(), hint: 'jami', delta: '+24%', series: buildSeries(totalPlays || 23), icon: <Icon.headphones s={18} c={tokens.orangeDeep} /> },
    { label: 'Yoqtirishlar', value: totalLikes.toLocaleString(), hint: 'jami', delta: '+8%', series: buildSeries(totalLikes || 19), icon: <Icon.heart s={18} c={tokens.orangeDeep} /> },
  ];

  const chartSeries = [
    { label: "O'qishlar", data: buildSeries(11, 14) },
    { label: 'Yoqtirishlar', data: buildSeries(7, 14).map(v => Math.max(0, Math.round(v * 0.6))) },
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

      {/* stats */}
      <div className="anim-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 28, color: ink, fontWeight: 700, letterSpacing: -0.5 }}>{s.value}</div>
              <div style={{
                fontFamily: 'var(--font-geist)', fontSize: 11, fontWeight: 700, color: '#2E7D32',
                background: 'rgba(76,175,80,0.10)', padding: '2px 7px', borderRadius: 999,
              }}>{s.delta}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute }}>{s.hint}</div>
              <Sparkline data={s.series} />
            </div>
          </div>
        ))}
      </div>

      {/* line chart */}
      <div className="card anim-fade-up delay-150" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 17, color: ink, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>So‘nggi 14 kun</h3>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute, marginTop: 2 }}>O‘qishlar va yoqtirishlar dinamikasi</div>
          </div>
          <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: tokens.orange }} /> O‘qishlar
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#3A332C' }} /> Yoqtirishlar
            </span>
          </div>
        </div>
        <LineChart series={chartSeries} dark={dark} />
      </div>

      {/* bottom: recent stories + activity */}
      <div className="anim-fade-up delay-200" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 17, color: ink, fontWeight: 700, margin: 0 }}>So‘nggi hikoyalar</h3>
            <Link href="/admin/stories" style={{ fontFamily: 'var(--font-geist)', fontSize: 12.5,
              color: tokens.orange, fontWeight: 600, textDecoration: 'none' }}>Hammasi →</Link>
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
                </tr>
              </thead>
              <tbody>
                {stories.slice(0, 6).map(s => (
                  <tr key={s.id} style={{ borderTop: `1px solid ${line}`, fontSize: 13, color: ink }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                      <Link href={`/story/${s.slug}`} style={{ color: ink, textDecoration: 'none' }}>{s.title}</Link>
                    </td>
                    <td style={{ padding: '12px 10px', color: mute }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={s.author?.display_name?.[0] || 'A'} size={22} seed={s.cover_seed} />
                        {s.author?.display_name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: mute, textTransform: 'capitalize' }}>{s.type}</td>
                    <td style={{ padding: '12px 10px', color: mute }}>{s.plays.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 17, color: ink, fontWeight: 700, margin: '0 0 14px' }}>Yangi yozuvchilar</h3>
          {recentWriters.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute, lineHeight: 1.55 }}>
                Hali ro‘yxatdan o‘tganlar yo‘q.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentWriters.slice(0, 5).map(w => (
                <Link key={w.id} href={`/profile/${w.username}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10,
                  textDecoration: 'none',
                  background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(26,22,19,0.03)',
                }}>
                  <Avatar name={w.display_name[0]} size={32} seed={w.avatar_seed} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: ink, fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.display_name}</div>
                    <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute }}>@{w.username}</div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-geist)', fontSize: 10, color: mute,
                    background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.06)',
                    padding: '3px 8px', borderRadius: 999, textTransform: 'capitalize',
                  }}>{w.role}</span>
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/users" style={{
            display: 'block', marginTop: 12, textAlign: 'center',
            fontFamily: 'var(--font-geist)', fontSize: 12.5, color: tokens.orange, fontWeight: 600, textDecoration: 'none',
          }}>Hammasi →</Link>
        </div>
      </div>

      {/* footer cards */}
      <div className="anim-fade-up delay-300" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
        <Link href="/admin/contests" className="card hover-lift" style={{ padding: 18, textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center' }}>
          <Illust.writing size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Tanlovlar</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 18, color: ink, fontWeight: 700 }}>{contestCount} ta</div>
          </div>
          <Icon.chev s={16} c={mute} />
        </Link>
        <Link href="/admin/stories" className="card hover-lift" style={{ padding: 18, textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center' }}>
          <Illust.listening size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Audio yozuvlar</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 18, color: ink, fontWeight: 700 }}>{stories.filter(s => s.type === 'audio' || s.type === 'both').length} ta</div>
          </div>
          <Icon.chev s={16} c={mute} />
        </Link>
        <Link href="/admin/users" className="card hover-lift" style={{ padding: 18, textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center' }}>
          <Illust.emptyFeed size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Hamjamiyat</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 18, color: ink, fontWeight: 700 }}>{writerCount} foydalanuvchi</div>
          </div>
          <Icon.chev s={16} c={mute} />
        </Link>
      </div>
    </div>
  );
}
