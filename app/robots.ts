import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bexyflowers.shop';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/cart', '/checkout', '/favorites'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
