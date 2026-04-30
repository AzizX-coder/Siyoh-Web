import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { StoryDetailView } from './StoryDetailView';
import { getStoryBySlug, getCommentsForStory, getInteractionState, isFollowing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth';
import { siteUrl, siteName } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug);
  if (!story) return { title: 'Hikoya topilmadi' };
  const url = `${siteUrl()}/story/${story.slug}`;
  return {
    title: story.title,
    description: story.excerpt.slice(0, 200),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      siteName,
      title: story.title,
      description: story.excerpt.slice(0, 200),
      url,
      publishedTime: story.published_at || undefined,
      authors: story.author?.display_name ? [story.author.display_name] : undefined,
      tags: story.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.excerpt.slice(0, 200),
    },
  };
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await getStoryBySlug(params.slug);
  if (!story) notFound();
  const [comments, interaction, following, { profile: me }] = await Promise.all([
    getCommentsForStory(story.id),
    getInteractionState(story.id),
    isFollowing(story.author_id),
    getCurrentUser(),
  ]);

  const url = `${siteUrl()}/story/${story.slug}`;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': story.type === 'audio' ? 'AudioObject' : 'Article',
    headline: story.title,
    description: story.excerpt.slice(0, 240),
    inLanguage: 'uz',
    datePublished: story.published_at || undefined,
    author: story.author?.display_name
      ? { '@type': 'Person', name: story.author.display_name, url: `${siteUrl()}/profile/${story.author.username}` }
      : undefined,
    publisher: { '@type': 'Organization', name: siteName, url: siteUrl() },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: story.tags?.join(', '),
    timeRequired: `PT${story.mins}M`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <AppShell hideRail>
        <StoryDetailView
          story={story}
          comments={comments}
          liked={interaction.liked}
          saved={interaction.saved}
          following={following}
          me={me}
        />
      </AppShell>
    </>
  );
}
