'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Icon } from '@/components/Icon';

export default function ResetPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) { setErr('Parollar mos kelmadi.'); return; }
    if (password.length < 6) { setErr('Kamida 6 belgidan iborat bo\'lsin.'); return; }
    if (!supabaseEnabled) { router.push('/feed'); return; }
    setLoading(true);
    const sb = createClient()!;
    const { error } = await sb.auth.updateUser({ password });
    setLoading(false);
    if (error) setErr(error.message); else router.push('/auth/confirmed');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
    border: `1px solid ${line}`, background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(255,255,255,0.7)',
    fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, outline: 'none',
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 24, fontWeight: 700, color: ink,
        letterSpacing: -0.5, margin: '0 0 6px' }}>Yangi parol o&apos;rnatish.</h1>
      <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: '0 0 22px' }}>
        Eslab qoladigan parolni tanlang.
      </p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="password" required minLength={6} placeholder="Yangi parol" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <input type="password" required minLength={6} placeholder="Parolni tasdiqlang" value={confirm}
          onChange={e => setConfirm(e.target.value)} style={inputStyle} />
        {err && (
          <div className="anim-fade-in" style={{
            fontFamily: 'var(--font-geist)', fontSize: 13, color: tokens.orangeDeep,
            background: 'rgba(255,87,34,0.08)', padding: '10px 12px', borderRadius: 8,
          }}>{err}</div>
        )}
        <button type="submit" disabled={loading} className="press" style={{
          height: 46, borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
          background: tokens.orangeGrad, color: '#fff', opacity: loading ? 0.7 : 1,
          fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
          boxShadow: '0 6px 16px rgba(255,87,34,0.28)', marginTop: 4,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? 'Saqlanmoqda…' : 'Saqlash va davom etish'} {!loading && <Icon.chev s={16} c="#fff" />}
        </button>
      </form>
      <div style={{ marginTop: 22, textAlign: 'center', fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        <Link href="/auth/login" style={{ color: tokens.orange, fontWeight: 600, textDecoration: 'none' }}>← Kirish sahifasi</Link>
      </div>
    </div>
  );
}
