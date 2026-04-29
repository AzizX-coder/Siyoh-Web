'use client';
// Soft, hand-drawn-style SVG illustrations on Siyoh's orange palette.

type Props = { size?: number; className?: string };

const ORANGE = '#FF6A3D';
const ORANGE_DEEP = '#F04A1E';
const ORANGE_SOFT = '#FFC8A8';
const PAPER = '#FFF6EE';
const INK = '#1A1613';

export const Illust = {
  // Empty feed: feather over an open book
  emptyFeed: ({ size = 220, className }: Props) => (
    <svg width={size} height={size * 0.85} viewBox="0 0 240 200" className={className} fill="none">
      <ellipse cx="120" cy="180" rx="86" ry="8" fill={ORANGE} opacity="0.12" />
      {/* book pages */}
      <path d="M40 60 Q120 50 200 60 L200 160 Q120 150 40 160 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M120 55 L120 155" stroke={INK} strokeWidth="2" />
      <path d="M55 80 L105 78 M55 95 L105 93 M55 110 L100 108" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      <path d="M135 80 L185 78 M135 95 L185 93 M135 110 L180 108" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      {/* feather */}
      <g transform="translate(150 40) rotate(20)">
        <path d="M0 0 C20 -10 40 -8 50 8 C46 30 26 50 -2 60 Z" fill={ORANGE} />
        <path d="M0 0 C18 -8 36 -6 44 8" stroke={ORANGE_DEEP} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M-2 60 L-22 90" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      </g>
      {/* sparkles */}
      <circle cx="60" cy="40" r="2.4" fill={ORANGE} />
      <circle cx="200" cy="50" r="1.8" fill={ORANGE} />
      <circle cx="32" cy="90" r="1.6" fill={ORANGE_SOFT} />
    </svg>
  ),

  // Empty bookshelf
  emptyBooks: ({ size = 220, className }: Props) => (
    <svg width={size} height={size * 0.85} viewBox="0 0 240 200" className={className} fill="none">
      <ellipse cx="120" cy="180" rx="86" ry="8" fill={ORANGE} opacity="0.12" />
      {/* shelf */}
      <rect x="40" y="150" width="160" height="6" rx="2" fill={INK} />
      {/* one tilted book */}
      <g transform="translate(70 100) rotate(-12)">
        <rect width="34" height="50" rx="3" fill={ORANGE} />
        <rect x="4" y="6" width="26" height="2" rx="1" fill="#fff" opacity="0.6" />
        <rect x="4" y="12" width="20" height="2" rx="1" fill="#fff" opacity="0.5" />
      </g>
      {/* empty space arrow */}
      <g transform="translate(115 115)">
        <rect x="0" y="0" width="60" height="40" rx="6" stroke={INK} strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <text x="30" y="25" fontSize="14" textAnchor="middle" fill={INK} fontFamily="Poppins" fontWeight="500" opacity="0.5">+</text>
      </g>
      <circle cx="55" cy="50" r="2.4" fill={ORANGE} />
      <circle cx="200" cy="60" r="1.8" fill={ORANGE_SOFT} />
    </svg>
  ),

  // Empty notifications: bell with soft sparkles
  emptyBell: ({ size = 200, className }: Props) => (
    <svg width={size} height={size * 0.9} viewBox="0 0 220 200" className={className} fill="none">
      <ellipse cx="110" cy="180" rx="76" ry="6" fill={ORANGE} opacity="0.12" />
      <g transform="translate(110 100)">
        <path d="M-40 0 C-40 -36 -22 -56 0 -56 C22 -56 40 -36 40 0 L46 14 L-46 14 Z"
          fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-10 22 C-8 30 8 30 10 22" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="0" cy="-58" r="4" fill={INK} />
      </g>
      {/* zzz */}
      <g fill={ORANGE_DEEP} fontFamily="Poppins" fontWeight="600">
        <text x="170" y="40" fontSize="20">z</text>
        <text x="186" y="56" fontSize="14">z</text>
        <text x="40" y="50" fontSize="16" opacity="0.6">.</text>
      </g>
    </svg>
  ),

  // Writing illustration: pen on paper
  writing: ({ size = 220, className }: Props) => (
    <svg width={size} height={size * 0.85} viewBox="0 0 240 200" className={className} fill="none">
      <ellipse cx="120" cy="180" rx="86" ry="8" fill={ORANGE} opacity="0.12" />
      {/* paper */}
      <rect x="50" y="40" width="140" height="120" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M62 64 L160 64 M62 76 L150 76 M62 88 L168 88 M62 100 L130 100 M62 112 L156 112" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      {/* pen */}
      <g transform="translate(150 100) rotate(28)">
        <rect width="60" height="10" rx="2" fill={ORANGE} />
        <polygon points="60,0 76,5 60,10" fill={INK} />
        <rect x="-6" y="0" width="6" height="10" fill={ORANGE_DEEP} />
      </g>
      <circle cx="60" cy="36" r="2" fill={ORANGE} />
      <circle cx="200" cy="48" r="2" fill={ORANGE_SOFT} />
    </svg>
  ),

  // Reading illustration (hero) — mug + book + steam
  reading: ({ size = 280, className }: Props) => (
    <svg width={size} height={size * 0.9} viewBox="0 0 320 280" className={className} fill="none">
      <ellipse cx="160" cy="250" rx="120" ry="10" fill={ORANGE} opacity="0.12" />
      {/* book */}
      <g transform="translate(40 110)">
        <path d="M0 30 Q120 18 240 30 L240 130 Q120 118 0 130 Z" fill={PAPER} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M120 24 L120 124" stroke={INK} strokeWidth="2" />
        <path d="M16 50 L106 48 M16 64 L102 62 M16 78 L98 76 M16 92 L100 90 M16 106 L96 104" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
        <path d="M138 50 L228 48 M138 64 L224 62 M138 78 L218 76 M138 92 L222 90 M138 106 L216 104" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      </g>
      {/* mug */}
      <g transform="translate(220 50)">
        <rect x="0" y="0" width="56" height="56" rx="8" fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="2" />
        <path d="M56 14 C70 14 70 42 56 42" stroke={ORANGE_DEEP} strokeWidth="3" fill="none" />
        {/* steam */}
        <path d="M14 -4 C8 -14 18 -20 12 -32" stroke={ORANGE_DEEP} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M30 -4 C24 -14 34 -20 28 -32" stroke={ORANGE_DEEP} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M42 -4 C36 -14 46 -20 40 -32" stroke={ORANGE_DEEP} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.4" />
      </g>
      {/* sparkles */}
      <circle cx="36" cy="60" r="3" fill={ORANGE} />
      <circle cx="290" cy="160" r="2" fill={ORANGE_SOFT} />
      <circle cx="60" cy="230" r="2" fill={ORANGE} />
    </svg>
  ),

  // Listening: headphones + sound waves
  listening: ({ size = 220, className }: Props) => (
    <svg width={size} height={size * 0.85} viewBox="0 0 240 200" className={className} fill="none">
      <ellipse cx="120" cy="180" rx="86" ry="8" fill={ORANGE} opacity="0.12" />
      <g transform="translate(120 110)">
        <path d="M-60 0 C-60 -40 -28 -64 0 -64 C28 -64 60 -40 60 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="-72" y="-6" width="22" height="40" rx="6" fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="2" />
        <rect x="50" y="-6" width="22" height="40" rx="6" fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="2" />
      </g>
      <path d="M28 70 C40 80 40 110 28 120" stroke={ORANGE} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M212 70 C200 80 200 110 212 120" stroke={ORANGE} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),

  // 404 — paper plane lost
  notFound: ({ size = 260, className }: Props) => (
    <svg width={size} height={size * 0.85} viewBox="0 0 280 240" className={className} fill="none">
      <ellipse cx="140" cy="220" rx="100" ry="8" fill={ORANGE} opacity="0.12" />
      {/* dotted path */}
      <path d="M30 200 Q90 60 250 30" stroke={INK} strokeWidth="2.4" strokeDasharray="2 8" strokeLinecap="round" opacity="0.4" fill="none" />
      {/* plane */}
      <g transform="translate(220 22) rotate(-18)">
        <polygon points="0,0 64,18 26,28 18,52 0,0" fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="26,28 18,52 64,18" fill={ORANGE_DEEP} opacity="0.9" />
      </g>
      <text x="80" y="160" fontSize="84" fontFamily="Poppins" fontWeight="700" fill={ORANGE}>404</text>
    </svg>
  ),

  // Hero scene — writer at desk with floating words/stories
  heroScene: ({ size = 460, className }: Props) => (
    <svg width={size} height={size * 0.85} viewBox="0 0 460 400" className={className} fill="none">
      {/* shadow */}
      <ellipse cx="230" cy="370" rx="180" ry="14" fill={ORANGE} opacity="0.12" />

      {/* desk */}
      <rect x="40" y="320" width="380" height="14" rx="3" fill={INK} />
      <rect x="60" y="334" width="6" height="38" fill={INK} />
      <rect x="394" y="334" width="6" height="38" fill={INK} />

      {/* big open book */}
      <g transform="translate(100 200)">
        <path d="M0 30 Q120 18 240 30 L240 120 Q120 108 0 120 Z" fill={PAPER} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M120 24 L120 114" stroke={INK} strokeWidth="2" />
        <g opacity="0.4" stroke={INK} strokeWidth="1.4" strokeLinecap="round">
          <path d="M14 50 L106 48 M14 64 L102 62 M14 78 L96 76 M14 92 L98 90" />
          <path d="M138 50 L228 48 M138 64 L222 62 M138 78 L218 76 M138 92 L226 90" />
        </g>
      </g>

      {/* mug w/ steam */}
      <g transform="translate(60 240)">
        <rect x="0" y="0" width="48" height="56" rx="6" fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="2" />
        <path d="M48 12 C62 12 62 38 48 38" stroke={ORANGE_DEEP} strokeWidth="3" fill="none" />
        <g className="anim-drift">
          <path d="M12 -4 C8 -14 16 -22 12 -34" stroke={ORANGE_DEEP} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M28 -4 C22 -14 32 -22 28 -34" stroke={ORANGE_DEEP} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.5" />
        </g>
      </g>

      {/* ink bottle */}
      <g transform="translate(360 250)">
        <rect x="0" y="0" width="36" height="48" rx="4" fill={INK} />
        <rect x="6" y="-8" width="24" height="10" rx="2" fill={INK} />
        <circle cx="18" cy="16" r="6" fill={ORANGE} />
      </g>

      {/* feather pen */}
      <g transform="translate(340 100) rotate(28)" className="anim-drift">
        <path d="M0 0 C30 -20 60 -22 80 0 C70 30 38 60 -10 70 Z" fill={ORANGE} stroke={ORANGE_DEEP} strokeWidth="1.6" />
        <path d="M0 0 C26 -16 52 -18 70 0" stroke={ORANGE_DEEP} strokeWidth="1.6" fill="none" />
        <path d="M-10 70 L-30 100" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* floating word chips */}
      <g className="anim-float-illustration">
        <rect x="20" y="70" width="78" height="22" rx="11" fill="#fff" stroke={INK} strokeWidth="1.5" />
        <text x="59" y="86" fontSize="11" textAnchor="middle" fontFamily="Poppins" fontWeight="600" fill={INK}>so&apos;z</text>
      </g>
      <g style={{ animationDelay: '0.5s' }} className="anim-float-illustration">
        <rect x="340" y="40" width="92" height="22" rx="11" fill={ORANGE} />
        <text x="386" y="56" fontSize="11" textAnchor="middle" fontFamily="Poppins" fontWeight="600" fill="#fff">hikoya</text>
      </g>
      <g style={{ animationDelay: '1s' }} className="anim-float-illustration">
        <rect x="380" y="160" width="64" height="22" rx="11" fill="#fff" stroke={ORANGE_DEEP} strokeWidth="1.5" />
        <text x="412" y="176" fontSize="11" textAnchor="middle" fontFamily="Poppins" fontWeight="600" fill={ORANGE_DEEP}>sokin</text>
      </g>

      {/* sparkles */}
      <g fill={ORANGE}>
        <circle cx="40" cy="160" r="3" />
        <circle cx="430" cy="220" r="2.4" />
        <circle cx="220" cy="40" r="2" />
        <circle cx="280" cy="80" r="3" opacity="0.6" />
      </g>
    </svg>
  ),

  // Stars/badges row
  badge: ({ size = 60, className }: Props) => (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} fill="none">
      <circle cx="30" cy="30" r="26" fill={ORANGE} />
      <circle cx="30" cy="30" r="26" fill="url(#bg)" opacity="0.3" />
      <path d="M30 14 L34.5 24.5 L46 26 L37 33.5 L40 45 L30 39 L20 45 L23 33.5 L14 26 L25.5 24.5 Z" fill="#fff" />
      <defs>
        <radialGradient id="bg"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor={ORANGE} /></radialGradient>
      </defs>
    </svg>
  ),

  // Error illustration: cracked envelope
  error: ({ size = 220, className }: Props) => (
    <svg width={size} height={size * 0.85} viewBox="0 0 240 200" className={className} fill="none">
      <ellipse cx="120" cy="180" rx="86" ry="8" fill={ORANGE} opacity="0.12" />
      <g transform="translate(60 60)">
        <rect x="0" y="0" width="120" height="80" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" />
        <path d="M0 0 L60 50 L120 0" stroke={INK} strokeWidth="2" fill="none" />
        <path d="M60 50 L60 24 M50 36 L70 36" stroke={ORANGE_DEEP} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  ),
};
