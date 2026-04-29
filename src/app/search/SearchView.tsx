'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { StoryRow } from '@/components/StoryRow';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story } from '@/lib/types';

export function SearchView({ stories }: { stories: Story[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [q, setQ] = useState('');
  const filtered = q
    ? stories.filter(s =>
        s.title.toLowerCase().includes(q.toLowerCase()) ||
        s.author?.display_name?.toLowerCase().includes(q.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
      )
    : stories;

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 32, fontWeight: 700, color: ink,
        letterSpacing: -0.7, margin: '0 0 18px' }}>Qidiruv</h1>
      <div className="card" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 52, borderRadius: 14, padding: '0 18px', marginBottom: 24,
      }}>
        <Icon.search s={18} c={mute} />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Sarlavha, muallif, teg…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
            color: ink, fontFamily: 'var(--font-geist)', fontSize: 15 }}
        />
        <kbd style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: mute,
          padding: '3px 8px', borderRadius: 4,
          background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)' }}>esc</kbd>
      </div>
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div className="anim-float-illustration" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Illust.emptyFeed size={180} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 20, fontWeight: 600, color: ink, margin: '0 0 6px' }}>
            Hech narsa topilmadi
          </h3>
          <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: 0 }}>
            Boshqa kalit so&apos;z bilan urinib ko&apos;ring.
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute,
            textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, marginBottom: 6 }}>
            {filtered.length} natija
          </div>
          {filtered.map((s, i) => <StoryRow key={s.id} story={s} seed={i} />)}
        </>
      )}
    </div>
  );
}
