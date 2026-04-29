'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/Icon';

export default function ConfirmedPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  useEffect(() => {
    const t = setTimeout(() => router.push('/feed'), 2400);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
      <div className="anim-scale-in" style={{
        width: 84, height: 84, borderRadius: '50%', margin: '0 auto 20px',
        background: tokens.orangeGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 18px 36px rgba(255,87,34,0.36)',
      }}>
        <Icon.check s={42} c="#fff" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-geist)', fontSize: 28, fontWeight: 700, color: ink,
        letterSpacing: -0.6, margin: '0 0 8px' }}>Hammasi tayyor.</h1>
      <p style={{ fontFamily: 'var(--font-geist)', fontSize: 15, color: mute,
        lineHeight: 1.55, margin: '0 0 24px' }}>
        Siyohga xush kelibsiz. Lentaga olib boryapmiz…
      </p>
      <Link href="/feed" className="press" style={{
        height: 44, padding: '0 22px', borderRadius: 10,
        background: tokens.orangeGrad, color: '#fff',
        fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 6px 16px rgba(255,87,34,0.28)',
      }}>Hozir o‘tish <Icon.chev s={15} c="#fff" /></Link>
    </div>
  );
}
