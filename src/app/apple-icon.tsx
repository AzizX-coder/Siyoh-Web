import { ImageResponse } from 'next/og';

// Render at request time (Windows path workaround for @vercel/og prerender bug).
export const dynamic = 'force-dynamic';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#FF5722 0%,#FF8A4C 100%)',
        borderRadius: 36,
      }}>
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d="M44 14c-13 2-21 10-26 22l-4 12c6-2 18-6 26-14 4-6 6-12 4-20z"
            fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
          <path d="M14 48c6-8 16-14 26-16" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
