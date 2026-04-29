'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Illust } from '@/components/Illustrations';

export default function VerifyPage() {
  const { dark } = useTheme();
  const params = useSearchParams();
  const email = params.get('email') || 'pochta qutingiz';
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!supabaseEnabled || !params.get('email')) { setResent(true); return; }
    setLoading(true);
    const sb = createClient()!;
    await sb.auth.resend({ type: 'signup', email: params.get('email')! });
    setLoading(false);
    setResent(true);
  }

  return (
    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
      <div className="anim-float-illustration" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <Illust.emptyBell size={160} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 24, fontWeight: 700, color: ink,
        letterSpacing: -0.5, margin: '0 0 8px' }}>Pochtangizni tekshiring.</h1>
      <p style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: mute,
        lineHeight: 1.6, margin: '0 0 22px' }}>
        Tasdiqlash havolasini <strong style={{ color: ink }}>{email}</strong> manziliga yubordik.
        Hisobingizni faollashtirish uchun ustiga bosing.
      </p>
      <button onClick={resend} disabled={loading || resent} className="press" style={{
        height: 42, padding: '0 22px', borderRadius: 10,
        border: `1px solid ${line}`,
        background: 'transparent', color: ink,
        cursor: resent || loading ? 'default' : 'pointer',
        fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
        opacity: resent || loading ? 0.6 : 1,
      }}>{resent ? 'Yana yuborildi' : loading ? 'Yuborilmoqda…' : 'Qayta yuborish'}</button>
      <div style={{ marginTop: 22, fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        Boshqa manzilmi? <Link href="/auth/signup" style={{ color: tokens.orange, fontWeight: 600, textDecoration: 'none' }}>Yangidan boshlang</Link>
      </div>
    </div>
  );
}
