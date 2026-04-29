'use client';
import { Icon } from '@/components/Icon';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Contest } from '@/lib/types';

const STATUS_LABEL: Record<Contest['status'], string> = {
  open: 'ochiq', upcoming: 'rejada', judging: 'baholanmoqda', closed: 'yopilgan',
};

const statusBg: Record<Contest['status'], string> = {
  open: 'rgba(76,175,80,0.12)',
  upcoming: 'rgba(255,87,34,0.12)',
  judging: 'rgba(255,200,150,0.30)',
  closed: 'rgba(26,22,19,0.06)',
};
const statusFg: Record<Contest['status'], string> = {
  open: '#2E7D32', upcoming: tokens.orangeDeep, judging: tokens.ink, closed: tokens.mute,
};

export function AdminContestsView({ contests }: { contests: Contest[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Dasturlar</div>
          <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 30, fontWeight: 700, color: ink,
            letterSpacing: -0.6, margin: 0 }}>Tanlovlar</h1>
        </div>
        <button className="press" style={{
          height: 40, padding: '0 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: tokens.orangeGrad, color: '#fff',
          fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
          boxShadow: '0 6px 16px rgba(255,87,34,0.28)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}><Icon.create s={16} c="#fff" /> Yangi tanlov</button>
      </div>

      {contests.length === 0 ? (
        <div className="card anim-fade-up" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Illust.writing size={180} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 20, fontWeight: 600, color: ink, margin: '0 0 6px' }}>
            Hali tanlovlar yo‘q
          </h3>
          <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: 0, lineHeight: 1.5 }}>
            Birinchi oylik tanlovni e‘lon qiling va yozuvchilarni rag‘batlantiring.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {contests.map(c => (
            <div key={c.id} className="card anim-fade-up" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 18, color: ink, fontWeight: 600,
                  margin: 0, letterSpacing: -0.3 }}>{c.title}</h3>
                <span style={{
                  padding: '3px 10px', borderRadius: 999, background: statusBg[c.status],
                  color: statusFg[c.status],
                  fontFamily: 'var(--font-geist)', fontSize: 11, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 0.3,
                }}>{STATUS_LABEL[c.status]}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute,
                margin: '0 0 14px', lineHeight: 1.55 }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 18, fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
                <span><strong style={{ color: ink, fontWeight: 600 }}>Davr:</strong> {c.starts_at} → {c.ends_at}</span>
                <span><strong style={{ color: ink, fontWeight: 600 }}>Mukofot:</strong> {c.prize}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
