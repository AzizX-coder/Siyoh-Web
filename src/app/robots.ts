import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/*', '/auth/callback', '/auth/signout', '/profile/edit'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin', '/admin/*', '/auth/callback', '/auth/signout', '/profile/edit'] },
      { userAgent: 'Bingbot', allow: '/', disallow: ['/admin', '/admin/*', '/auth/callback', '/auth/signout', '/profile/edit'] },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
