'use client';
import Link from 'next/link';
import { SiyohLogo } from '@/components/Logo';
import { Icon } from '@/components/Icon';
import { Illust } from '@/components/Illustrations';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

export default function NotFound() {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div className="app-bg" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div className="anim-fade-up" style={{
        position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 520, width: '100%',
      }}>
        <div className="card" style={{ padding: '40px 36px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <SiyohLogo size={28} dark={dark} />
          </div>
          <div className="anim-float-illustration" style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Illust.notFound size={240} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-geist)', fontSize: 26, fontWeight: 700,
            color: ink, letterSpacing: -0.5, margin: '0 0 8px',
          }}>Bu sahifa adashib qolgan.</h1>
          <p style={{
            fontFamily: 'var(--font-geist)', fontSize: 14.5, color: mute,
            lineHeight: 1.55, margin: '0 0 22px',
          }}>
            Qidirayotgan hikoya ko‘chirilgan yoki hech qachon yozilmagan bo‘lishi mumkin.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/" className="press" style={{
              height: 42, padding: '0 20px', borderRadius: 10,
              background: tokens.orangeGrad, color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 6px 16px rgba(255,87,34,0.28)',
            }}><Icon.home s={15} c="#fff" /> Bosh sahifa</Link>
            <Link href="/feed" className="press" style={{
              height: 42, padding: '0 20px', borderRadius: 10,
              background: 'transparent', color: ink,
              border: `1px solid ${line}`,
              fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            }}>Hikoyalar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
