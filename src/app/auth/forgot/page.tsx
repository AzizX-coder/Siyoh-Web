'use client';
import Link from 'next/link';
import { useState } from 'react';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Icon } from '@/components/Icon';

export default function ForgotPage() {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!supabaseEnabled) { setSent(true); return; }
    setLoading(true);
    const sb = createClient()!;
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);
    if (error) setErr(error.message); else setSent(true);
  }

  if (sent) {
    return (
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
          background: tokens.orangeGrad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon.bell s={24} c="#fff" /></div>
        <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 22, fontWeight: 700, color: ink,
          letterSpacing: -0.4, margin: '0 0 8px' }}>Tiklash havolasi yuborildi.</h1>
        <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute,
          lineHeight: 1.55, margin: '0 0 18px' }}>
          Agar <strong style={{ color: ink }}>{email}</strong> hisobga mos kelsa, havola yo&apos;lda.
        </p>
        <Link href="/auth/login" style={{ color: tokens.orange, fontFamily: 'var(--font-geist)',
          fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Kirish sahifasi</Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
    border: `1px solid ${line}`, background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(255,255,255,0.7)',
    fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, outline: 'none',
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 24, fontWeight: 700, color: ink,
        letterSpacing: -0.5, margin: '0 0 6px' }}>Parolni unutdingizmi?</h1>
      <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: '0 0 22px' }}>
        Email kiriting — tiklash havolasini yuboramiz.
      </p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="email" required placeholder="siz@siyoh.app" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />
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
        }}>{loading ? 'Yuborilmoqda…' : 'Tiklash havolasi yuborish'}</button>
      </form>
      <div style={{ marginTop: 22, textAlign: 'center', fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        Esladingizmi? <Link href="/auth/login" style={{ color: tokens.orange, fontWeight: 600, textDecoration: 'none' }}>Kirish</Link>
      </div>
    </div>
  );
}
