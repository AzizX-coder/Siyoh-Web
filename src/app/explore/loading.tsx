import { SkeletonShell } from '@/components/SkeletonShell';
import { PageHeaderSkeleton, Skeleton } from '@/components/Skeleton';

export default function ExploreLoading() {
  return (
    <SkeletonShell>
      <div style={{ padding: '28px 36px 20px' }}>
        <PageHeaderSkeleton />
      </div>
      <div style={{ padding: '28px 36px 0' }}>
        <Skeleton w={240} h={22} style={{ marginBottom: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} h={200} r={20} />
          ))}
        </div>
      </div>
      <div style={{ padding: '40px 36px 160px' }}>
        <Skeleton w={260} h={22} style={{ marginBottom: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <Skeleton w={56} h={56} r={28} style={{ margin: '0 auto 10px' }} />
              <Skeleton w="60%" h={14} style={{ margin: '0 auto 6px' }} />
              <Skeleton w="80%" h={11} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonShell>
  );
}
