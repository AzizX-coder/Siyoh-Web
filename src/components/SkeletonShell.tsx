'use client';
import { ReactNode } from 'react';
import { SiyohLogo } from './Logo';
import { Skeleton } from './Skeleton';
import { useTheme } from './ThemeProvider';
import { tokens } from '@/lib/tokens';

// Approximates AppShell visually so route-level loading.tsx files don't reflow
// when content arrives. NOT a server component — doesn't fetch the user.
// Use inside a route-segment loading.tsx:
//
//   import { SkeletonShell } from '@/components/SkeletonShell';
//   export default function Loading() {
//     return <SkeletonShell><SomePageSkeleton /></SkeletonShell>;
//   }

const NAV_ITEMS = ['Bosh sahifa', 'Kashf etish', 'Kitoblar', 'Bildirishnomalar', 'Sahifam'];

export function SkeletonShell({ children, hideRail = false }: { children: ReactNode; hideRail?: boolean }) {
  const { dark } = useTheme();
  const line = dark ? tokens.darkLine : tokens.line;
  const mute = dark ? tokens.darkMute : tokens.mute;

  return (
    <div className="app-bg">
      <div style={{
        display: 'grid',
        gridTemplateColumns: hideRail ? '240px 1fr' : '240px 1fr 340px',
        minHeight: '100vh', maxWidth: 1440, margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        {/* Left rail — real logo + nav row placeholders */}
        <aside style={{
          padding: '28px 18px', position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '0 8px 28px' }}>
            <SiyohLogo size={28} dark={dark} />
          </div>
          <div style={{
            margin: '0 0 24px', height: 46, borderRadius: 14,
            background: tokens.orangeGrad, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
          }}>+ Yaratish</div>
          {NAV_ITEMS.map((label, i) => (
            <div key={i} style={{
              height: 42, padding: '0 12px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 12,
              color: mute, fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 500,
            }}>
              <span className="skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} />
              {label}
            </div>
          ))}
          <div style={{ marginTop: 'auto', padding: '14px 10px 0', borderTop: `0.5px solid ${line}`,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton w={34} h={34} r={17} />
            <div style={{ flex: 1 }}>
              <Skeleton w={80} h={11} style={{ marginBottom: 4 }} />
              <Skeleton w={60} h={9} />
            </div>
          </div>
        </aside>

        {/* Main content slot */}
        <main style={{
          borderLeft: `0.5px solid ${line}`,
          borderRight: hideRail ? 'none' : `0.5px solid ${line}`,
          minHeight: '100vh',
        }}>
          {children}
        </main>

        {!hideRail && (
          <aside style={{ padding: '22px 26px', position: 'sticky', top: 0, height: '100vh' }}>
            <Skeleton h={42} r={14} style={{ marginBottom: 22 }} />
            <Skeleton w={140} h={11} style={{ marginBottom: 12 }} />
            <Skeleton h={120} r={20} style={{ marginBottom: 24 }} />
            <Skeleton w={140} h={11} style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Skeleton w={38} h={38} r={19} />
                  <div style={{ flex: 1 }}>
                    <Skeleton w="60%" h={12} style={{ marginBottom: 4 }} />
                    <Skeleton w="90%" h={10} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
