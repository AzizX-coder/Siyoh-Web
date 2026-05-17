'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { CoverUpload } from '@/components/CoverUpload';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import { updateProfile } from '@/lib/actions';
import type { Profile } from '@/lib/types';

export function EditProfileView({ profile }: { profile: Profile }) {
  const { dark } = useTheme();
  const { push } = useToast();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const [name, setName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [seed, setSeed] = useState(profile.avatar_seed);
  const [coverUrl, setCoverUrl] = useState<string | null>(profile.cover_url ?? null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateProfile({
        display_name: name, bio, avatar_seed: seed, cover_url: coverUrl,
      });
      if (res.ok) {
        push({ kind: 'success', title: 'Profil saqlandi' });
        router.push(`/profile/${profile.username}`);
      } else {
        push({ kind: 'error', title: 'Saqlab bo\'lmadi', body: res.error });
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1px solid ${line}`, background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(255,255,255,0.7)',
    fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, outline: 'none',
  };

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 720, margin: '0 auto' }}>
      <Link href={`/profile/${profile.username}`} style={{
        fontFamily: 'var(--font-geist)', fontSize: 13, color: mute, textDecoration: 'none',
        display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
      }}><Icon.back s={14} c={mute} /> Profilga qaytish</Link>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 32, fontWeight: 700,
        color: ink, letterSpacing: -0.7, margin: '0 0 28px' }}>Profilni tahrirlash</h1>

      <form onSubmit={submit} className="card" style={{
        padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div>
          <label style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
            letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
            display: 'block', marginBottom: 12 }}>Avatar uslubi</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 4].map(s => (
              <button key={s} type="button" onClick={() => setSeed(s)} className="press" style={{
                border: seed === s ? `2px solid ${tokens.orange}` : '2px solid transparent',
                borderRadius: '50%', padding: 2, background: 'transparent', cursor: 'pointer',
              }}>
                <Avatar name={name[0] || 'A'} size={48} seed={s} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
            letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
            display: 'block', marginBottom: 12 }}>Profil muqovasi</label>
          <CoverUpload
            userId={profile.id}
            bucket="covers"
            value={coverUrl}
            fallbackSeed={profile.avatar_seed}
            aspect="16 / 6"
            onChange={setCoverUrl}
          />
        </div>
        <div>
          <label style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
            letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
            display: 'block', marginBottom: 8 }}>Ko‘rinadigan ism</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
            letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
            display: 'block', marginBottom: 8 }}>Foydalanuvchi nomi</label>
          <input value={profile.username} disabled
            style={{ ...inputStyle, color: mute, cursor: 'not-allowed' }} />
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11.5, color: mute, marginTop: 4 }}>
            Foydalanuvchi nomini o‘zgartirib bo‘lmaydi.
          </div>
        </div>
        <div>
          <label style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
            letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
            display: 'block', marginBottom: 8 }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
            placeholder="O‘zingiz haqingizda bir-ikki jumla."
            style={{ ...inputStyle, fontSize: 15, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Link href={`/profile/${profile.username}`} className="press" style={{
            height: 42, padding: '0 18px', borderRadius: 10,
            border: `1px solid ${line}`, background: 'transparent', color: ink,
            fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>Bekor qilish</Link>
          <button type="submit" disabled={pending} className="press" style={{
            height: 42, padding: '0 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: tokens.orangeGrad, color: '#fff',
            fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
            boxShadow: '0 6px 16px rgba(255,87,34,0.28)',
            opacity: pending ? 0.7 : 1,
          }}>{pending ? 'Saqlanmoqda…' : 'O‘zgarishlarni saqlash'}</button>
        </div>
      </form>
    </div>
  );
}
