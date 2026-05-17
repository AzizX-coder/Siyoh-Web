import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { CreateView } from './CreateView';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const { profile } = await getCurrentUser();
  // Middleware already gates /create for unauthenticated users when Supabase
  // is configured. This is a belt-and-braces fallback for demo mode.
  if (!profile && process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/auth/login?next=/create');
  return (
    <AppShell hideRail>
      <CreateView userId={profile?.id ?? null} />
    </AppShell>
  );
}
