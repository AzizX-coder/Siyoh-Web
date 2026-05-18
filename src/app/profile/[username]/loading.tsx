import { SkeletonShell } from '@/components/SkeletonShell';
import { ProfilePageSkeleton } from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <SkeletonShell>
      <ProfilePageSkeleton />
    </SkeletonShell>
  );
}
