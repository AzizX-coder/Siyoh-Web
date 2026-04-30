import { ImageResponse } from 'next/og';

// Render at request time (Windows path workaround for @vercel/og prerender bug).
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Siyoh — Sekinlashishga arziydigan hikoyalar';

export default function OG() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        background: 'linear-gradient(135deg,#FFE1D0 0%,#FFD0B0 60%,#FF8A4C 100%)',
        padding: 80, fontFamily: 'sans-serif', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -120, right: -80, width: 480, height: 480,
          borderRadius: '50%', background: 'rgba(255,87,34,0.30)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32,
              background: 'linear-gradient(135deg,#FF5722,#FF8A4C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <path d="M18 3c-6 1-10 5-12 10l-2 6c3-1 9-3 12-7 2-3 3-6 2-9z"
                  fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round" />
                <path d="M4 21c3-4 8-7 12-8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color: '#1A1613', letterSpacing: -2 }}>Siyoh</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: 92, fontWeight: 700, color: '#1A1613',
              letterSpacing: -3, lineHeight: 1.0, marginBottom: 24,
            }}>
              Sekinlashishga{'\n'}arziydigan hikoyalar.
            </div>
            <div style={{ fontSize: 28, color: '#3A332C', display: 'flex' }}>
              Yozuvchilar va kitobxonlar uchun zamonaviy ijodiy maydon
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            fontSize: 22, fontWeight: 600, color: '#1A1613',
          }}>
            <div style={{
              padding: '12px 22px', borderRadius: 999,
              background: '#fff',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>siyoh.app</div>
            <div style={{ color: '#3A332C', display: 'flex' }}>O‘qish · Yozish · Tinglash</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
