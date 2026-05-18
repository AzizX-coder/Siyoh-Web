import { SkeletonShell } from '@/components/SkeletonShell';
import { StoryDetailSkeleton } from '@/components/Skeleton';

export default function StoryLoading() {
  return (
    <SkeletonShell hideRail>
      <StoryDetailSkeleton />
    </SkeletonShell>
  );
}
