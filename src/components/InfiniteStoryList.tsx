'use client';
import { useEffect, useRef, useState } from 'react';
import { StoryRow } from './StoryRow';
import { StoryRowSkeleton } from './Skeleton';
import { fetchMoreStories } from '@/lib/actions';
import type { Story } from '@/lib/types';

// Client-side cursor pagination. Server renders the initial page; this
// component appends more rows as the sentinel scrolls into view.

export function InfiniteStoryList({
  initial, pageSize = 8,
}: { initial: Story[]; pageSize?: number }) {
  const [items, setItems] = useState<Story[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < pageSize);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) return;
    const node = sentinel.current;
    if (!node) return;
    const obs = new IntersectionObserver(async (entries) => {
      const visible = entries[0]?.isIntersecting;
      if (!visible || loading || done) return;
      setLoading(true);
      const last = items[items.length - 1];
      const cursor = last?.published_at ?? null;
      const res = await fetchMoreStories(cursor, pageSize);
      setLoading(false);
      if (!res.ok) { setDone(true); return; }
      const next = res.items as Story[];
      if (!next || next.length === 0) { setDone(true); return; }
      setItems(prev => {
        const seen = new Set(prev.map(s => s.id));
        const fresh = next.filter(s => !seen.has(s.id));
        if (fresh.length < pageSize) setDone(true);
        return [...prev, ...fresh];
      });
    }, { rootMargin: '600px 0px' });
    obs.observe(node);
    return () => obs.disconnect();
  }, [items, loading, done, pageSize]);

  return (
    <>
      {items.map((s, i) => <StoryRow key={s.id} story={s} seed={i + 1} />)}
      {loading && (
        <>
          <StoryRowSkeleton />
          <StoryRowSkeleton />
        </>
      )}
      <div ref={sentinel} style={{ height: 1 }} aria-hidden />
    </>
  );
}
