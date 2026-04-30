'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Icon } from '@/components/Icon';
import { GoogleLogo, GitHubLogo } from '@/components/OAuthIcons';

export default function LoginPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!supabaseEnabled) { router.push('/feed'); return; }
    setLoading(true);
    const sb = createClient()!;
    if (mode === 'password') {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setErr(error.message); else router.push('/feed');
    } else {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) setErr(error.message); else router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
  }

  async function oauth(provider: 'google' | 'github') {
    if (!supabaseEnabled) { router.push('/feed'); return; }
    const sb = createClient()!;
    await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
    border: `1px solid ${line}`, background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(255,255,255,0.7)',
    fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, outline: 'none',
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 26, fontWeight: 700, color: ink,
        letterSpacing: -0.5, margin: '0 0 6px' }}>Xush kelibsiz.</h1>
      <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute, margin: '0 0 22px' }}>
        Hikoyalarni davom ettirish uchun kiring.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <button onClick={() => oauth('google')} className="press" style={{
          flex: 1, height: 44, borderRadius: 12, border: `1px solid ${line}`,
          background: dark ? 'rgba(255,237,213,0.04)' : '#fff', color: ink,
          cursor: 'pointer', fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <GoogleLogo size={16} /> Google
        </button>
        <button onClick={() => oauth('github')} className="press" style={{
          flex: 1, height: 44, borderRadius: 12, border: `1px solid ${line}`,
          background: dark ? 'rgba(255,237,213,0.04)' : '#fff', color: ink,
          cursor: 'pointer', fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <GitHubLogo size={16} color={ink} /> GitHub
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px',
        fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
        textTransform: 'uppercase', fontWeight: 600 }}>
        <div style={{ flex: 1, height: 1, background: line }} />
        yoki email orqali
        <div style={{ flex: 1, height: 1, background: line }} />
      </div>

      <div style={{ display: 'flex', padding: 4, borderRadius: 12,
        background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(26,22,19,0.04)', marginBottom: 14 }}>
        {([['password', 'Parol'], ['magic', 'Sehrli havola']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            flex: 1, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer',
            background: mode === k ? (dark ? tokens.darkInk : tokens.ink) : 'transparent',
            color: mode === k ? (dark ? tokens.darkBg : tokens.paper) : ink,
            fontFamily: 'var(--font-geist)', fontSize: 12.5, fontWeight: 500,
          }}>{label}</button>
        ))}
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input type="email" required placeholder="siz@siyoh.app" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />
        {mode === 'password' && (
          <input type="password" required placeholder="Parol" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle} />
        )}
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
          {loading ? 'Yuborilmoqda…' : mode === 'password' ? 'Kirish' : 'Sehrli havola yuborish'}
          {!loading && <Icon.chev s={16} c="#fff" />}
        </button>
        {mode === 'password' && (
          <Link href="/auth/forgot" style={{
            textAlign: 'center', marginTop: 4,
            fontFamily: 'var(--font-geist)', fontSize: 13, color: mute, textDecoration: 'none',
          }}>Parolni unutdingizmi?</Link>
        )}
      </form>
      {!supabaseEnabled && (
        <div style={{ marginTop: 14, fontFamily: 'var(--font-geist)', fontSize: 12, color: mute, textAlign: 'center' }}>
          Demo rejim — Supabase sozlanmagan. Yuborish lentaga olib boradi.
        </div>
      )}
      <div style={{ marginTop: 22, textAlign: 'center', fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        Yangi keldingizmi? <Link href="/auth/signup" style={{ color: tokens.orange, fontWeight: 600, textDecoration: 'none' }}>Hisob yarating</Link>
      </div>
    </div>
  );
}
