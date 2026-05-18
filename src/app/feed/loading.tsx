import { SkeletonShell } from '@/components/SkeletonShell';
import { ChipRowSkeleton, FeaturedHeroSkeleton, StoryRowSkeleton } from '@/components/Skeleton';

export default function FeedLoading() {
  return (
    <SkeletonShell>
      <div style={{ padding: '18px 36px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: 120, height: 26, borderRadius: 6 }} />
        <ChipRowSkeleton chips={3} />
      </div>
      <div style={{ padding: '28px 36px 0' }}>
        <FeaturedHeroSkeleton />
      </div>
      <div style={{ padding: '32px 36px 160px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="skeleton" style={{ width: 220, height: 26, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 80, height: 13, borderRadius: 4 }} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => <StoryRowSkeleton key={i} />)}
      </div>
    </SkeletonShell>
  );
}
