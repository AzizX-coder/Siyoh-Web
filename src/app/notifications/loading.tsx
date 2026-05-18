import { SkeletonShell } from '@/components/SkeletonShell';
import { NotificationListSkeleton, PageHeaderSkeleton } from '@/components/Skeleton';

export default function NotificationsLoading() {
  return (
    <SkeletonShell hideRail>
      <div style={{ padding: '32px 60px 160px', maxWidth: 760, margin: '0 auto' }}>
        <PageHeaderSkeleton subtitle={false} />
        <NotificationListSkeleton rows={6} />
      </div>
    </SkeletonShell>
  );
}
