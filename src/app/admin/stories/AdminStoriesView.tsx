'use client';
import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Chip } from '@/components/Chip';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story } from '@/lib/types';

const STATUS_LABEL: Record<string, string> = {
  published: 'nashrda', draft: 'qoralama', archived: 'arxivda',
};

export function AdminStoriesView({ stories }: { stories: Story[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'text' | 'audio'>('all');

  const filtered = stories.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false;
    if (q && !(s.title.toLowerCase().includes(q.toLowerCase()) || s.author?.display_name?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const FILTERS: { k: typeof filter; label: string }[] = [
    { k: 'all', label: 'Hammasi' }, { k: 'text', label: 'Matn' }, { k: 'audio', label: 'Audio' },
  ];

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div className="anim-fade-up" style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Kutubxona</div>
          <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 30, fontWeight: 700, color: ink,
            letterSpacing: -0.6, margin: 0 }}>Hikoyalar</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 14px', height: 40 }}>
            <Icon.search s={15} c={mute} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Sarlavha yoki muallif"
              style={{ border: 'none', outline: 'none', background: 'transparent', color: ink,
                fontFamily: 'var(--font-geist)', fontSize: 13, width: 240 }} />
          </div>
          {FILTERS.map(f => (
            <Chip key={f.k} active={filter === f.k} dark={dark} onClick={() => setFilter(f.k)}>{f.label}</Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card anim-fade-up" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Illust.emptyBooks size={180} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 20, fontWeight: 600, color: ink, margin: '0 0 6px' }}>
            Hali hikoyalar yo‘q
          </h3>
          <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: 0 }}>
            Yozuvchilar nashr qilganda bu yerda paydo bo‘ladi.
          </p>
        </div>
      ) : (
        <div className="card anim-fade-up" style={{ padding: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-geist)' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Sarlavha</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Muallif</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Tur</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Teglar</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>O‘qildi</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Holat</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderTop: `1px solid ${line}`, fontSize: 13, color: ink }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>{s.title}</td>
                  <td style={{ padding: '12px 10px', color: mute }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={s.author?.display_name?.[0] || 'A'} size={22} seed={s.cover_seed} />
                      {s.author?.display_name}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: mute, textTransform: 'capitalize' }}>{s.type}</td>
                  <td style={{ padding: '12px 10px', color: mute }}>{s.tags.join(', ')}</td>
                  <td style={{ padding: '12px 10px', color: mute }}>{s.plays.toLocaleString()}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999,
                      background: s.status === 'published' ? 'rgba(76,175,80,0.10)' : 'rgba(26,22,19,0.06)',
                      color: s.status === 'published' ? '#2E7D32' : mute,
                      fontSize: 11, fontWeight: 600,
                    }}>{STATUS_LABEL[s.status] || s.status}</span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button aria-label="More" className="press" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      <Icon.more s={16} c={mute} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
