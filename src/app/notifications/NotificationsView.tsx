'use client';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Illust } from '@/components/Illustrations';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { markNotificationsRead } from '@/lib/actions';
import { timeAgoShort } from '@/lib/format';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

type Item = { id: string; kind: string; payload: any; created_at: string; read_at: string | null; from?: Profile };

const KIND_ICON: Record<string, (c: string) => React.ReactNode> = {
  follow: c => <Icon.profile s={16} c={c} />,
  like: c => <Icon.heart s={16} c={c} filled />,
  comment: c => <Icon.comment s={16} c={c} />,
  contest: c => <Icon.trophy s={16} c={c} />,
};

const KIND_TEXT: Record<string, (n: Item) => string> = {
  follow: () => 'sizni kuzatishni boshladi',
  like: () => 'hikoyangizni yoqtirdi',
  comment: () => 'hikoyangizga sharh yozdi',
  contest: n => n.payload?.text || 'Tanlov yangiligi',
};

export function NotificationsView({ items: initial }: { items: Item[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [items, setItems] = useState<Item[]>(initial);
  const [, start] = useTransition();

  useEffect(() => { start(() => { markNotificationsRead(); }); }, []);

  // Realtime: prepend live inserts. Channel auto-closes on unmount.
  useEffect(() => {
    if (!supabaseEnabled) return;
    const sb = createClient();
    if (!sb) return;
    let active = true;

    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user || !active) return;
      const channel = sb.channel(`notif:${user.id}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const row = payload.new as any;
            setItems(prev => [{
              id: row.id,
              kind: row.kind,
              payload: row.payload,
              created_at: row.created_at,
              read_at: row.read_at,
            }, ...prev]);
          })
        .subscribe();

      return () => { sb.removeChannel(channel); };
    })();

    return () => { active = false; };
  }, []);

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 32, fontWeight: 700, color: ink,
          letterSpacing: -0.7, margin: 0 }}>Bildirishnomalar</h1>
        <span style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
          {items.length} ta
        </span>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div className="anim-float-illustration" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Illust.emptyBell size={180} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-geist)', fontSize: 22, fontWeight: 700, color: ink,
            letterSpacing: -0.4, margin: '0 0 6px' }}>Hammasini ko‘rdingiz.</h2>
          <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: 0, lineHeight: 1.5 }}>
            Kuzatayotganlaringizdan yangiliklar shu yerda paydo bo‘ladi.
          </p>
        </div>
      ) : (
        <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 18, overflow: 'hidden' }}>
          {items.map((n, i) => {
            const text = KIND_TEXT[n.kind]?.(n) || n.kind;
            const icon = KIND_ICON[n.kind]?.(tokens.orange);
            const slug = n.payload?.story_slug;
            const from = n.from;
            const target = slug ? `/story/${slug}` : from ? `/profile/${from.username}` : '#';
            return (
              <Link key={n.id} href={target} style={{
                display: 'flex', gap: 14, padding: '16px 18px',
                borderTop: i === 0 ? 'none' : `0.5px solid ${line}`,
                textDecoration: 'none', color: 'inherit',
                background: !n.read_at ? (dark ? 'rgba(255,87,34,0.05)' : 'rgba(255,87,34,0.04)') : 'transparent',
              }}>
                {from ? (
                  <Avatar name={from.display_name?.[0] ?? '?'} size={40} seed={from.avatar_seed ?? 0} />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: tokens.orangeGrad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{icon}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, marginBottom: 2 }}>
                    {from?.display_name && <span style={{ fontWeight: 600 }}>{from.display_name} </span>}
                    {text}
                  </div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
                    {timeAgoShort(n.created_at, 'uz')} oldin
                  </div>
                </div>
                {!n.read_at && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                    background: tokens.orange, alignSelf: 'center' }} />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
