import { AppShell } from '@/components/AppShell';
import { FeedView } from './FeedView';
import { getRecommended } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  // Smart recommendations (anonymous = trending; logged-in = personalized).
  const stories = await getRecommended(12);
  return (
    <AppShell>
      <FeedView stories={stories} />
    </AppShell>
  );
}
