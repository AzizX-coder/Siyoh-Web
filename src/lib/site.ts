// Centralized site URL — falls back to deployed Vercel URL or localhost.
// Set NEXT_PUBLIC_SITE_URL in production for canonical links + sitemap.
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const siteName = 'Siyoh';
export const siteTagline = 'Sekinlashishga arziydigan hikoyalar';
export const siteDescription =
  'Yozuvchilar va kitobxonlar uchun zamonaviy ijodiy maydon. Esselar, hikoyalar, ovozli yozuvlar — bepul, abadiy.';
