import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Siyoh',
    short_name: 'Siyoh',
    description: 'Sekinlashishga arziydigan hikoyalar',
    start_url: '/feed',
    display: 'standalone',
    background_color: '#FDFBF7',
    theme_color: '#FF6A3D',
    orientation: 'portrait',
    lang: 'uz',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
    categories: ['social', 'books', 'lifestyle'],
  };
}
