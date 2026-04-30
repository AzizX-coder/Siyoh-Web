import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
import { getStories, getWriters } from '@/lib/queries';

export const revalidate = 3600; // refresh once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  // Static, public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,        lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
    { url: `${base}/feed`,    lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/explore`, lastModified: now, changeFrequency: 'daily',  priority: 0.8 },
    { url: `${base}/books`,   lastModified: now, changeFrequency: 'daily',  priority: 0.8 },
    { url: `${base}/search`,  lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/auth/login`,  lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/auth/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];

  // Stories
  let storyRoutes: MetadataRoute.Sitemap = [];
  let writerRoutes: MetadataRoute.Sitemap = [];
  try {
    const [stories, writers] = await Promise.all([getStories({}), getWriters()]);
    storyRoutes = stories.map(s => ({
      url: `${base}/story/${s.slug}`,
      lastModified: s.published_at ? new Date(s.published_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
    writerRoutes = writers.map(w => ({
      url: `${base}/profile/${w.username}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // graceful fallback if Supabase isn't reachable at build time
  }

  return [...staticRoutes, ...storyRoutes, ...writerRoutes];
}
