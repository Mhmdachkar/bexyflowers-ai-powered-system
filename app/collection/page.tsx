import { Metadata } from 'next';
import { Suspense } from 'react';
import Collection from '@/views/Collection';

export const metadata: Metadata = {
  title: 'Luxury Flower Collection',
  description:
    'Browse our curated collection of premium flower arrangements, bouquets, and floral designs. Handcrafted by master florists in Lebanon.',
  alternates: {
    canonical: '/collection',
  },
};

// JSON-LD for collection page
function generateCollectionStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bexyflowers.shop';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Luxury Flower Collection',
    description:
      'Browse our curated collection of premium flower arrangements, bouquets, and floral designs.',
    url: `${siteUrl}/collection`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Collection',
          item: `${siteUrl}/collection`,
        },
      ],
    },
  };
}

export default function CollectionPage() {
  const structuredData = generateCollectionStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Collection />
    </>
  );
}
