'use client';
// Shimmer placeholder. .skeleton rule lives in globals.css.
export function Skeleton({ w = '100%', h = 14, r = 6, style }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return <span className="skeleton" style={{ display: 'block', width: w, height: h, borderRadius: r, ...style }} />;
}

export function StoryRowSkeleton() {
  return (
    <div style={{
      padding: '22px 0', borderBottom: '1px solid rgba(26,22,19,0.06)',
      display: 'grid', gridTemplateColumns: '1fr 180px', gap: 28, alignItems: 'start',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Skeleton w={22} h={22} r={11} />
          <Skeleton w={120} h={12} />
        </div>
        <Skeleton h={24} w="80%" style={{ marginBottom: 10 }} />
        <Skeleton h={14} style={{ marginBottom: 6 }} />
        <Skeleton h={14} w="65%" style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 14 }}>
          <Skeleton w={60} h={12} />
          <Skeleton w={48} h={12} />
          <Skeleton w={48} h={12} />
        </div>
      </div>
      <Skeleton w={180} h={200} r={10} />
    </div>
  );
}
