'use client';
import { useEffect, useRef, useState } from 'react';
import { tokens } from '@/lib/tokens';
import { recordView } from '@/lib/actions';

// Mounts on every story page. Renders:
//   • A 3px fixed scroll-progress bar at top (signals reading depth).
// And tracks:
//   • Dwell time (foreground only, paused while tab hidden).
//   • Fires recordView(storyId, dwellMs) on unmount or page hide.
// recordView is fire-and-forget; it both inserts a story_views row and bumps
// stories.plays (so the recommendation MVs see up-to-date popularity).

export function ReadingTracker({ storyId }: { storyId: string }) {
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number>(Date.now());
  const accumulated = useRef<number>(0);
  const isVisible = useRef<boolean>(true);
  const reported = useRef<boolean>(false);

  // Scroll progress (0..1).
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) { setProgress(1); return; }
      const p = Math.max(0, Math.min(1, window.scrollY / total));
      setProgress(p);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Dwell timer — pause when tab hidden, resume when visible again.
  useEffect(() => {
    function tickStop() {
      if (isVisible.current) {
        accumulated.current += Date.now() - startedAt.current;
        isVisible.current = false;
      }
    }
    function tickStart() {
      if (!isVisible.current) {
        startedAt.current = Date.now();
        isVisible.current = true;
      }
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') tickStop();
      else tickStart();
    }
    function report() {
      if (reported.current) return;
      reported.current = true;
      tickStop();
      // Fire and forget; await would block unmount/unload.
      void recordView(storyId, Math.round(accumulated.current));
    }

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', report);
    window.addEventListener('beforeunload', report);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', report);
      window.removeEventListener('beforeunload', report);
      report();
    };
  }, [storyId]);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 60,
        background: 'transparent', pointerEvents: 'none',
      }}
    >
      <div style={{
        width: `${progress * 100}%`, height: '100%',
        background: tokens.orangeGrad,
        transition: 'width 0.12s linear',
        boxShadow: progress > 0.02 ? '0 0 8px rgba(255,87,34,0.4)' : 'none',
      }} />
    </div>
  );
}
