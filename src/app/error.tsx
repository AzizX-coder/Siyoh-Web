'use client';
import { useEffect } from 'react';
import { SiyohLogo } from '@/components/Logo';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;

  useEffect(() => { if (typeof console !== 'undefined') console.error(error); }, [error]);

  return (
    <div className="app-bg" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
    }}>
      <div className="anim-fade-up" style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 36px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <SiyohLogo size={26} dark={dark} />
          </div>
          <div className="anim-float-illustration" style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Illust.error size={200} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-geist)', fontSize: 24, fontWeight: 700,
            color: ink, letterSpacing: -0.5, margin: '0 0 8px',
          }}>Nimadir buzildi.</h1>
          <p style={{
            fontFamily: 'var(--font-geist)', fontSize: 14, color: mute,
            lineHeight: 1.55, margin: '0 0 18px',
          }}>{error.message || 'Kutilmagan xato yuz berdi. Yana urinib ko\'ring.'}</p>
          {error.digest && (
            <div style={{
              fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: mute,
              background: dark ? 'rgba(255,237,213,0.05)' : 'rgba(26,22,19,0.04)',
              padding: '8px 12px', borderRadius: 8, marginBottom: 18,
            }}>{error.digest}</div>
          )}
          <button onClick={reset} className="press" style={{
            height: 42, padding: '0 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: tokens.orangeGrad, color: '#fff',
            fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
            boxShadow: '0 6px 16px rgba(255,87,34,0.28)',
          }}>Qayta urinish</button>
        </div>
      </div>
    </div>
  );
}
