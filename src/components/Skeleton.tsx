'use client';
// Shimmer placeholders. .skeleton CSS class lives in globals.css.
// Variants mirror the real components they stand in for — same dimensions,
// same gap rhythm — so the layout doesn't reflow when content arrives.

export function Skeleton({
  w = '100%', h = 14, r = 6, style,
}: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return <span className="skeleton" style={{ display: 'block', width: w, height: h, borderRadius: r, ...style }} />;
}

// One row in the home/feed/profile list. Mirrors StoryRow's grid.
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

// One card in the books grid. Mirrors BooksView's grid cell.
export function BookCardSkeleton() {
  return (
    <div>
      <Skeleton w="100%" h={280} r={10} style={{ marginBottom: 12 }} />
      <Skeleton w="85%" h={16} style={{ marginBottom: 6 }} />
      <Skeleton w="50%" h={12} style={{ marginBottom: 4 }} />
      <Skeleton w="35%" h={11} />
    </div>
  );
}

// Featured hero card on the feed page.
export function FeaturedHeroSkeleton() {
  return (
    <div style={{
      borderRadius: 26, padding: 38, minHeight: 340,
      display: 'grid', gridTemplateColumns: '1fr 200px', gap: 28, alignItems: 'center',
      background: 'rgba(26,22,19,0.04)',
    }}>
      <div>
        <Skeleton w={120} h={22} r={11} style={{ marginBottom: 18 }} />
        <Skeleton h={36} w="90%" style={{ marginBottom: 10 }} />
        <Skeleton h={36} w="60%" style={{ marginBottom: 18 }} />
        <Skeleton h={14} style={{ marginBottom: 6 }} />
        <Skeleton h={14} w="80%" style={{ marginBottom: 22 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton w={30} h={30} r={15} />
          <div>
            <Skeleton w={100} h={12} style={{ marginBottom: 4 }} />
            <Skeleton w={140} h={10} />
          </div>
        </div>
      </div>
      <Skeleton w={200} h={270} r={10} />
    </div>
  );
}

// Sticky header chip row (For you / Following / Audio).
export function ChipRowSkeleton({ chips = 3 }: { chips?: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: chips }).map((_, i) => (
        <Skeleton key={i} w={88 + i * 12} h={34} r={999} />
      ))}
    </div>
  );
}

// Story detail page: hero band + title + meta + body paragraphs.
export function StoryDetailSkeleton() {
  return (
    <div className="anim-fade-in">
      <div style={{ height: 280, background: 'linear-gradient(135deg, rgba(255,138,76,0.45), rgba(255,168,108,0.45))' }} />
      <div style={{ padding: '0 60px 160px', marginTop: -100, maxWidth: 740, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', marginBottom: 28 }}>
          <Skeleton w={180} h={240} r={8} />
          <div style={{ flex: 1, paddingBottom: 20, marginTop: 30 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <Skeleton w={68} h={22} r={11} />
              <Skeleton w={84} h={22} r={11} />
            </div>
            <Skeleton h={44} w="90%" style={{ marginBottom: 8 }} />
            <Skeleton h={44} w="70%" style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Skeleton w={30} h={30} r={15} />
              <div>
                <Skeleton w={120} h={12} style={{ marginBottom: 4 }} />
                <Skeleton w={180} h={10} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <Skeleton w={180} h={50} r={14} />
          <Skeleton w={50} h={50} r={14} />
          <Skeleton w={50} h={50} r={14} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            <Skeleton h={18} style={{ marginBottom: 8 }} />
            <Skeleton h={18} style={{ marginBottom: 8 }} />
            <Skeleton h={18} w={i % 2 === 0 ? '92%' : '75%'} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile page: cover band + avatar + name + tabs + rows.
export function ProfilePageSkeleton() {
  return (
    <div>
      <div style={{ height: 180, background: 'linear-gradient(135deg, rgba(255,200,150,0.4), rgba(255,138,76,0.35))' }} />
      <div style={{ padding: '0 36px', marginTop: -52, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>
          <Skeleton w={120} h={120} r={60} />
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <Skeleton w={220} h={32} style={{ marginBottom: 8 }} />
            <Skeleton w={160} h={14} />
          </div>
          <Skeleton w={140} h={40} r={12} />
        </div>
        <Skeleton w="60%" h={18} style={{ marginBottom: 24 }} />
        <div className="card" style={{
          display: 'flex', gap: 28, padding: '18px 22px', marginBottom: 28,
        }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Skeleton w={48} h={22} style={{ marginBottom: 6 }} />
              <Skeleton w={64} h={10} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid rgba(26,22,19,0.06)', marginBottom: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 0' }}>
              <Skeleton w={90} h={14} />
            </div>
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <StoryRowSkeleton key={i} />)}
      </div>
    </div>
  );
}

// Notifications page list skeleton.
export function NotificationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: 14, padding: '16px 18px',
          borderTop: i === 0 ? 'none' : '1px solid rgba(26,22,19,0.06)',
        }}>
          <Skeleton w={40} h={40} r={20} />
          <div style={{ flex: 1 }}>
            <Skeleton w={i % 2 ? '70%' : '55%'} h={14} style={{ marginBottom: 6 }} />
            <Skeleton w={60} h={11} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Generic page header (kicker + title) used at top of most loading screens.
export function PageHeaderSkeleton({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Skeleton w={120} h={11} style={{ marginBottom: 8 }} />
      <Skeleton w={260} h={32} style={{ marginBottom: subtitle ? 10 : 0 }} />
      {subtitle && <Skeleton w={400} h={14} />}
    </div>
  );
}
