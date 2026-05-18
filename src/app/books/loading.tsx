import { SkeletonShell } from '@/components/SkeletonShell';
import { BookCardSkeleton, ChipRowSkeleton, PageHeaderSkeleton } from '@/components/Skeleton';

export default function BooksLoading() {
  return (
    <SkeletonShell>
      <div style={{ padding: '28px 36px 0' }}>
        <PageHeaderSkeleton />
      </div>
      <div style={{ padding: '4px 36px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="skeleton" style={{ width: 200, height: 38, borderRadius: 12 }} />
        <ChipRowSkeleton chips={6} />
      </div>
      <div style={{
        padding: '0 36px 160px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, rowGap: 28,
      }}>
        {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
      </div>
    </SkeletonShell>
  );
}
