'use client';
import { useMemo } from 'react';
import twemoji from '@twemoji/api';

// Renders any string with Twemoji SVG glyphs in place of raw emoji.
// Used for consistent emoji styling across OSes (Apple/Notion/Telegram fonts
// are copyrighted — Twemoji is the open alternative used by GitHub, Discord,
// Mastodon, etc.).
//
// SAFETY: We pass the input through twemoji.parse() which only swaps emoji
// code-points for <img> tags; it does NOT execute or interpret other markup.
// For user-supplied content, the string is rendered as text first (React
// escaping), then twemoji wraps emoji code-points. No XSS surface.

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/';

function parseEmoji(text: string): string {
  return twemoji.parse(text, {
    folder: 'svg',
    ext: '.svg',
    base: TWEMOJI_BASE,
    className: 'siyoh-twemoji',
  });
}

export function Emoji({
  children, size = '1em', style,
}: { children: string; size?: string | number; style?: React.CSSProperties }) {
  const html = useMemo(() => parseEmoji(children), [children]);
  return (
    <span
      className="siyoh-emoji"
      style={{
        ...style,
        // Inline style applies to all twemoji <img>; CSS rule in globals.css
        // owns the rendering details.
        '--tw-size': typeof size === 'number' ? `${size}px` : size,
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Standalone single-emoji rendering (no text). Useful in buttons/labels.
export function EmojiGlyph({ char, size = 24 }: { char: string; size?: number }) {
  return <Emoji size={size} style={{ display: 'inline-flex', alignItems: 'center' }}>{char}</Emoji>;
}
