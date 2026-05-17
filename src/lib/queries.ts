import { genres, themes } from './mock-data';
import type { Story, Profile, Contest, Comment } from './types';
import { createClient, supabaseEnabled } from './supabase/server';

export async function getStories(opts: { limit?: number; type?: 'text' | 'audio' | 'all'; genre?: string; authorId?: string } = {}): Promise<Story[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  let q = sb.from('stories').select('*, author:profiles!stories_author_id_fkey(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (opts.limit) q = q.limit(opts.limit);
  if (opts.type && opts.type !== 'all') q = q.eq('type', opts.type);
  if (opts.authorId) q = q.eq('author_id', opts.authorId);
  if (opts.genre && opts.genre !== 'Hammasi') q = q.contains('tags', [opts.genre]);
  const { data } = await q;
  return (data as Story[]) || [];
}

// Smart recommendations. Falls back to recent-published if the RPC isn't deployed yet.
export async function getRecommended(limit: number = 20): Promise<Story[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  const { data: { user } } = await sb.auth.getUser();
  try {
    const { data, error } = await sb.rpc('recommend_for_user', {
      p_user_id: user?.id ?? null,
      p_limit: limit,
    });
    if (error) throw error;
    if (data && data.length > 0) {
      // RPC returns base story rows; hydrate authors in a single roundtrip.
      const authorIds = Array.from(new Set((data as Story[]).map(s => s.author_id).filter(Boolean)));
      if (authorIds.length === 0) return data as Story[];
      const { data: authors } = await sb.from('profiles').select('*').in('id', authorIds);
      const map: Record<string, Profile> = {};
      (authors as Profile[] | null)?.forEach(p => { map[p.id] = p; });
      return (data as Story[]).map(s => ({ ...s, author: map[s.author_id] }));
    }
    return [];
  } catch {
    // Migration not applied yet — graceful fallback.
    return getStories({ limit });
  }
}

// Paged feed for infinite scroll (Phase H3).
export async function getStoriesPage(opts: {
  cursor?: string | null;   // ISO timestamp of last seen published_at
  limit?: number;
  type?: 'text' | 'audio' | 'all';
}): Promise<Story[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  const limit = opts.limit ?? 12;
  let q = sb.from('stories').select('*, author:profiles!stories_author_id_fkey(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (opts.cursor) q = q.lt('published_at', opts.cursor);
  if (opts.type && opts.type !== 'all') q = q.eq('type', opts.type);
  const { data } = await q;
  return (data as Story[]) || [];
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  if (!supabaseEnabled) return null;
  const sb = createClient()!;
  const { data } = await sb.from('stories').select('*, author:profiles!stories_author_id_fkey(*)').eq('slug', slug).single();
  return (data as Story) || null;
}

export async function getCommentsForStory(storyId: string): Promise<Comment[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  const { data } = await sb.from('comments')
    .select('*, author:profiles!comments_author_id_fkey(*)')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false });
  return (data as Comment[]) || [];
}

export async function getInteractionState(storyId: string): Promise<{ liked: boolean; saved: boolean }> {
  if (!supabaseEnabled) return { liked: false, saved: false };
  const sb = createClient()!;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { liked: false, saved: false };
  const [{ count: liked }, { count: saved }] = await Promise.all([
    sb.from('likes').select('*', { count: 'exact', head: true }).eq('story_id', storyId).eq('user_id', user.id),
    sb.from('bookmarks').select('*', { count: 'exact', head: true }).eq('story_id', storyId).eq('user_id', user.id),
  ]);
  return { liked: (liked || 0) > 0, saved: (saved || 0) > 0 };
}

export async function isFollowing(targetId: string): Promise<boolean> {
  if (!supabaseEnabled) return false;
  const sb = createClient()!;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { count } = await sb.from('follows').select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id).eq('following_id', targetId);
  return (count || 0) > 0;
}

export async function getWriters(): Promise<Profile[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  const { data } = await sb.from('profiles').select('*').eq('role', 'writer').limit(8);
  return (data as Profile[]) || [];
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  if (!supabaseEnabled) return null;
  const sb = createClient()!;
  const { data } = await sb.from('profiles').select('*').eq('username', username).single();
  return (data as Profile) || null;
}

export async function getContests(): Promise<Contest[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  const { data } = await sb.from('contests').select('*').order('starts_at', { ascending: false });
  return (data as Contest[]) || [];
}

export async function getNotifications(): Promise<{
  id: string; kind: string; payload: any; created_at: string; read_at: string | null; from?: Profile;
}[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from('notifications').select('*')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  if (!data) return [];
  const fromIds = Array.from(new Set(data.map(n => n.payload?.from).filter(Boolean)));
  const fromMap: Record<string, Profile> = {};
  if (fromIds.length > 0) {
    const { data: profs } = await sb.from('profiles').select('*').in('id', fromIds);
    profs?.forEach((p: any) => { fromMap[p.id] = p as Profile; });
  }
  return data.map(n => ({ ...n, from: n.payload?.from ? fromMap[n.payload.from] : undefined })) as any;
}

export async function getDrafts(authorId: string): Promise<Story[]> {
  if (!supabaseEnabled) return [];
  const sb = createClient()!;
  const { data } = await sb.from('stories').select('*').eq('author_id', authorId).eq('status', 'draft')
    .order('updated_at', { ascending: false });
  return (data as Story[]) || [];
}

export const collections: { name: string; count: number; seed: number }[] = [];

export { genres, themes };
