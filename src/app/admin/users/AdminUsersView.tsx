'use client';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Profile } from '@/lib/types';

const ROLE_LABEL: Record<string, string> = {
  reader: 'kitobxon', writer: 'yozuvchi', admin: 'admin',
};

export function AdminUsersView({ writers }: { writers: Profile[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div className="anim-fade-up" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Hamjamiyat</div>
        <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 30, fontWeight: 700, color: ink,
          letterSpacing: -0.6, margin: 0 }}>Foydalanuvchilar</h1>
      </div>

      {writers.length === 0 ? (
        <div className="card anim-fade-up" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Illust.emptyFeed size={180} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 20, fontWeight: 600, color: ink, margin: '0 0 6px' }}>
            Hali ro‘yxatdan o‘tganlar yo‘q
          </h3>
          <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: 0 }}>
            Yozuvchilar va kitobxonlar bu yerda paydo bo‘ladi.
          </p>
        </div>
      ) : (
        <div className="card anim-fade-up" style={{ padding: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-geist)' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Ism</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Foydalanuvchi nomi</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Rol</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Qo‘shilgan</th>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}></th>
              </tr>
            </thead>
            <tbody>
              {writers.map(w => (
                <tr key={w.id} style={{ borderTop: `1px solid ${line}`, fontSize: 13, color: ink }}>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={w.display_name[0]} size={28} seed={w.avatar_seed} />
                      <span style={{ fontWeight: 600 }}>{w.display_name}</span>
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: mute }}>@{w.username}</td>
                  <td style={{ padding: '12px 10px', color: mute }}>{ROLE_LABEL[w.role] || w.role}</td>
                  <td style={{ padding: '12px 10px', color: mute }}>{w.created_at?.slice(0, 10)}</td>
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
