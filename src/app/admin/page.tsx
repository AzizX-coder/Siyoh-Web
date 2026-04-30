import { getStories, getWriters, getContests } from '@/lib/queries';
import { AdminOverview } from './AdminOverview';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [stories, writers, contests] = await Promise.all([getStories({}), getWriters(), getContests()]);
  return (
    <AdminOverview
      stories={stories}
      writerCount={writers.length}
      contestCount={contests.length}
      recentWriters={writers}
    />
  );
}
