import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/Toast';
import { siteUrl, siteName, siteTagline, siteDescription } from '@/lib/site';

const SITE = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: 'Aziz Xujamurodov' }],
  creator: 'Siyoh',
  publisher: 'Siyoh',
  generator: 'Next.js',
  keywords: [
    'siyoh', 'siyoh.app', "o'zbek hikoyalar", "kitob o'qish", 'audio hikoyalar',
    "hikoya yozish", 'esselar', 'romanlar', "o'zbek yozuvchilar", "o'zbek tilida o'qish",
    'audio essays', 'uzbek literature', 'modern uzbek writing',
  ],
  category: 'social',
  alternates: {
    canonical: '/',
    languages: { 'uz-UZ': '/' },
  },
  openGraph: {
    type: 'website',
    siteName,
    title: `${siteName} — ${siteTagline}`,
    description: siteDescription,
    url: SITE,
    locale: 'uz_UZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — ${siteTagline}`,
    description: siteDescription,
    creator: '@siyoh_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon',
  },
  // Search-engine ownership verification — fill these in after creating accounts
  // (Bing Webmaster Tools / Google Search Console / Yandex Webmaster). See SETUP.md.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDFBF7' },
    { media: '(prefers-color-scheme: dark)', color: '#141110' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: SITE,
  logo: `${SITE}/icon.svg`,
  sameAs: ['https://github.com/AzizX-coder/Siyoh-Web'],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: SITE,
  inLanguage: 'uz',
  description: siteDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

// Inline before-hydration script to set the theme class and avoid FOUC.
const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('siyoh-theme');
    if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
