'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient, supabaseEnabled } from './supabase/server';

async function requireUser() {
  if (!supabaseEnabled) throw new Error('Sign in required (Supabase not configured).');
  const sb = createClient()!;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Sign in required.');
  return { sb, userId: user.id };
}

// ---------- Likes ----------
export async function toggleLike(storyId: string, currentlyLiked: boolean) {
  try {
    const { sb, userId } = await requireUser();
    if (currentlyLiked) {
      await sb.from('likes').delete().eq('story_id', storyId).eq('user_id', userId);
    } else {
      await sb.from('likes').insert({ story_id: storyId, user_id: userId });
    }
    revalidatePath('/feed');
    return { ok: true, liked: !currentlyLiked };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Bookmarks ----------
export async function toggleBookmark(storyId: string, currentlySaved: boolean) {
  try {
    const { sb, userId } = await requireUser();
    if (currentlySaved) {
      await sb.from('bookmarks').delete().eq('story_id', storyId).eq('user_id', userId);
    } else {
      await sb.from('bookmarks').insert({ story_id: storyId, user_id: userId });
    }
    revalidatePath('/feed');
    revalidatePath('/books');
    revalidatePath('/profile', 'layout');
    return { ok: true, saved: !currentlySaved };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Follows ----------
export async function toggleFollow(targetId: string, currentlyFollowing: boolean) {
  try {
    const { sb, userId } = await requireUser();
    if (userId === targetId) return { ok: false, error: "Can't follow yourself." };
    if (currentlyFollowing) {
      await sb.from('follows').delete().eq('follower_id', userId).eq('following_id', targetId);
    } else {
      await sb.from('follows').insert({ follower_id: userId, following_id: targetId });
      await sb.from('notifications').insert({
        user_id: targetId, kind: 'follow', payload: { from: userId },
      });
    }
    return { ok: true, following: !currentlyFollowing };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Comments ----------
export async function addComment(storyId: string, body: string) {
  try {
    if (!body.trim()) return { ok: false, error: 'Comment is empty.' };
    const { sb, userId } = await requireUser();
    const { data: story } = await sb.from('stories').select('author_id, slug').eq('id', storyId).single();
    const { data: comment, error } = await sb
      .from('comments')
      .insert({ story_id: storyId, author_id: userId, body: body.trim() })
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .single();
    if (error) throw error;
    if (story && story.author_id !== userId) {
      await sb.from('notifications').insert({
        user_id: story.author_id, kind: 'comment',
        payload: { from: userId, story_id: storyId, story_slug: story.slug, comment_id: comment.id },
      });
    }
    if (story?.slug) revalidatePath(`/story/${story.slug}`);
    return { ok: true, comment };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { sb } = await requireUser();
    await sb.from('comments').delete().eq('id', commentId);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Stories ----------
function slugBase(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72) || 'untitled';
}

function slugify(s: string): string {
  // Crypto-strong suffix, 8 hex chars = ~4 billion combos.
  // Globally unique under reasonable concurrency.
  return `${slugBase(s)}-${crypto.randomUUID().slice(0, 8)}`;
}

async function insertWithSlugRetry<T>(
  sb: any,
  title: string,
  buildRow: (slug: string) => Record<string, any>,
  selectCols: string,
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = slugify(title);
    const { data, error } = await sb.from('stories').insert(buildRow(slug)).select(selectCols).single();
    if (!error) return data;
    // 23505 = unique_violation. Retry with a new suffix.
    if (error.code !== '23505') throw error;
  }
  throw new Error('Could not generate a unique slug after 3 attempts.');
}

export async function publishStory(input: {
  title: string; subtitle?: string; body: string;
  type: 'text' | 'audio' | 'both'; tags?: string[]; coverSeed?: number; coverUrl?: string;
}) {
  try {
    const { sb, userId } = await requireUser();
    if (!input.title.trim()) return { ok: false, error: 'Title is required.' };
    if (!input.body.trim()) return { ok: false, error: 'Story body is required.' };
    const words = input.body.split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 220));
    const excerpt = input.body.split(/\n\n/)[0].slice(0, 220);

    const data = await insertWithSlugRetry<{ slug: string }>(sb, input.title, (slug) => ({
      slug,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      body: input.body,
      excerpt,
      type: input.type,
      tags: input.tags || [],
      cover_seed: input.coverSeed ?? Math.floor(Math.random() * 9),
      cover_url: input.coverUrl || null,
      mins,
      author_id: userId,
      status: 'published',
      published_at: new Date().toISOString(),
    }), 'slug');

    revalidatePath('/feed');
    revalidatePath('/books');
    return { ok: true, slug: data.slug };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function saveDraft(input: {
  id?: string; title: string; subtitle?: string; body: string;
  type: 'text' | 'audio' | 'both'; coverUrl?: string;
}) {
  try {
    const { sb, userId } = await requireUser();
    if (input.id) {
      await sb.from('stories').update({
        title: input.title || 'Untitled',
        subtitle: input.subtitle || null,
        body: input.body,
        type: input.type,
        cover_url: input.coverUrl || null,
      }).eq('id', input.id).eq('author_id', userId);
      return { ok: true, id: input.id };
    }
    const data = await insertWithSlugRetry<{ id: string }>(sb, input.title || 'untitled', (slug) => ({
      slug,
      title: input.title || 'Untitled',
      subtitle: input.subtitle || null,
      body: input.body,
      excerpt: input.body.slice(0, 220),
      type: input.type,
      mins: 1,
      author_id: userId,
      status: 'draft',
      cover_url: input.coverUrl || null,
    }), 'id');
    return { ok: true, id: data.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Profile ----------
export async function updateProfile(input: {
  display_name: string; bio?: string; avatar_seed?: number; cover_url?: string | null;
}) {
  try {
    const { sb, userId } = await requireUser();
    const update: Record<string, any> = {
      display_name: input.display_name,
      bio: input.bio || null,
      avatar_seed: input.avatar_seed ?? 0,
    };
    if (input.cover_url !== undefined) update.cover_url = input.cover_url;
    await sb.from('profiles').update(update).eq('id', userId);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Notifications ----------
export async function markNotificationsRead() {
  try {
    const { sb, userId } = await requireUser();
    await sb.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('user_id', userId).is('read_at', null);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Locale ----------
const SUPPORTED_LOCALES = ['uz', 'en', 'ru'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

export async function setLocale(locale: string) {
  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    return { ok: false, error: 'Unsupported locale.' };
  }
  // Always set cookie (works for anonymous users too).
  cookies().set('NEXT_LOCALE', locale, {
    path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax',
  });
  // If logged in, persist to profile.
  if (supabaseEnabled) {
    try {
      const sb = createClient()!;
      const { data: { user } } = await sb.auth.getUser();
      if (user) await sb.from('profiles').update({ locale }).eq('id', user.id);
    } catch { /* not fatal */ }
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

// ---------- Push subscriptions ----------
export async function registerPushToken(input: { token: string; platform: 'web' | 'android' | 'ios'; device?: string }) {
  try {
    const { sb, userId } = await requireUser();
    await sb.from('push_subscriptions').upsert({
      user_id: userId,
      fcm_token: input.token,
      platform: input.platform,
      device: input.device || null,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: 'user_id,fcm_token' });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function unregisterPushToken(token: string) {
  try {
    const { sb, userId } = await requireUser();
    await sb.from('push_subscriptions').delete().eq('user_id', userId).eq('fcm_token', token);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Feed pagination ----------
export async function fetchMoreStories(cursor: string | null, limit: number = 8) {
  try {
    // Local import to avoid bundling the server-only client into other modules.
    const { getStoriesPage } = await import('./queries');
    const items = await getStoriesPage({ cursor, limit });
    return { ok: true, items };
  } catch (e: any) {
    return { ok: false, error: e.message, items: [] };
  }
}

// ---------- Story views (recommendation signal) ----------
export async function recordView(storyId: string, dwellMs: number = 0) {
  try {
    if (!supabaseEnabled) return { ok: true };
    const sb = createClient()!;
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('story_views').insert({
      story_id: storyId,
      user_id: user?.id || null,
      dwell_ms: dwellMs,
    });
    // Bump plays counter on stories (denormalized for fast sort)
    await sb.rpc('increment_story_plays', { p_story_id: storyId });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
