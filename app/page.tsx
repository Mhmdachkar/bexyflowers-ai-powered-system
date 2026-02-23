import { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import CarouselHero from '@/components/CarouselHero';
import {
  FeaturedBouquetsSkeleton,
  CategoriesSkeleton,
  GenericSectionSkeleton,
  FooterSkeleton,
} from '@/components/SectionSkeletons';

// Lazy load components for performance
const UltraFeaturedBouquets = dynamic(() => import('@/components/UltraFeaturedBouquets'), {
  loading: () => <FeaturedBouquetsSkeleton />,
});

const UltraCategories = dynamic(() => import('@/components/UltraCategories'), {
  loading: () => <CategoriesSkeleton />,
});

const ZodiacBouquetQuiz = dynamic(() => import('@/components/culture/ZodiacBouquetQuiz'), {
  loading: () => <GenericSectionSkeleton />,
});

const FlowerCareGuide = dynamic(() => import('@/components/culture/FlowerCareGuide'), {
  loading: () => <GenericSectionSkeleton />,
});

// SEO metadata with structured data
export const metadata: Metadata = {
  title: 'Lebanon\'s Premier Luxury Florist',
  description:
    'Lebanon\'s most luxurious floral portfolio. Premium custom bouquets, wedding flowers, eternal flowers & couture arrangements. AI-powered flower customization. Order online.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bexy Flowers - Lebanon\'s Premier Luxury Florist',
    description:
      'Lebanon\'s most luxurious floral portfolio. Premium custom bouquets, wedding flowers, eternal flowers & couture arrangements.',
    url: '/',
    type: 'website',
  },
};

// JSON-LD structured data for SEO
function generateStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bexyflowers.shop';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Organization schema
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Bexy Flowers',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/assets/bexy-flowers-logo-sm.webp`,
          width: 160,
          height: 99,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+961-76-104-882',
          contactType: 'Customer Service',
          availableLanguage: ['English', 'Arabic'],
        },
        sameAs: [
          'https://www.instagram.com/bexyflowers',
          'https://www.tiktok.com/@bexyflower',
        ],
      },
      // Local Business schema
      {
        '@type': 'Florist',
        '@id': `${siteUrl}/#localbusiness`,
        name: 'Bexy Flowers',
        image: `${siteUrl}/assets/bexy-flowers-logo-sm.webp`,
        telephone: '+961-76-104-882',
        email: 'bexyflowersmsg@gmail.com',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'LB',
          addressLocality: 'Sidon',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 33.5631,
          longitude: 35.3708,
        },
        priceRange: '$$',
        servesCuisine: 'Floral Arrangements',
      },
      // Website schema
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Bexy Flowers',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/collection?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      // Breadcrumb schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
        ],
      },
    ],
  };
}

export default function HomePage() {
  const structuredData = generateStructuredData();

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen overflow-x-hidden relative">
        {/* Hero Section */}
        <CarouselHero isHomepage={true} />

        {/* Featured Bouquets */}
        <Suspense fallback={<FeaturedBouquetsSkeleton />}>
          <UltraFeaturedBouquets />
        </Suspense>

        {/* Categories */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <UltraCategories />
        </Suspense>

        {/* Custom Bouquet Section - from Index.tsx ProfessionalCustomSection */}
        <Suspense fallback={<GenericSectionSkeleton />}>
          <ProfessionalCustomSection />
        </Suspense>

        {/* Zodiac Quiz */}
        <Suspense fallback={<GenericSectionSkeleton />}>
          <ZodiacBouquetQuiz />
        </Suspense>

        {/* Flower Care Guide */}
        <Suspense fallback={<GenericSectionSkeleton />}>
          <FlowerCareGuide />
        </Suspense>
      </div>
    </>
  );
}

// Professional Custom Section component (from Index.tsx)
function ProfessionalCustomSection() {
  return (
    <section 
      className="relative py-6 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #faf7f3 0%, #ffffff 100%)'
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-12 md:mb-16 relative px-2">
          <h2
            className="font-luxury text-xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-8xl font-normal mb-2 sm:mb-4 md:mb-6 relative"
            style={{
              background: 'linear-gradient(135deg, #2c2d2a 0%, #3D3027 50%, #2c2d2a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              letterSpacing: '-0.02em',
              lineHeight: '1.2em'
            }}
          >
            DESIGN YOUR PERFECT BOUQUET
            <div
              className="absolute -bottom-0.5 sm:-bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 sm:h-1 bg-gradient-to-r from-[#C79E48] to-[#D4A85A] rounded-full"
              style={{ width: 'clamp(80px, 30vw, 200px)' }}
            />
          </h2>

          <p
            className="font-body text-xs sm:text-sm md:text-base lg:text-xl max-w-4xl mx-auto leading-relaxed font-light px-2"
            style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
          >
            Create a bespoke floral masterpiece with unlimited creative freedom.
            <br className="hidden sm:block" />
            Choose from our curated premium selection and design something uniquely yours.
          </p>
        </div>

        <div className="text-center mt-4 sm:mt-6 md:mt-8 px-2">
          <a
            href="/customize"
            className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-lg sm:rounded-xl md:rounded-2xl font-normal text-white relative overflow-hidden w-full sm:w-auto touch-target min-h-[44px] text-xs sm:text-sm md:text-base"
            style={{
              fontFamily: "'EB Garamond', serif",
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #B88A44 0%, #D4A85A 50%, #CFA340 100%)',
              boxShadow: '0 8px 32px rgba(184, 138, 68, 0.4)',
            }}
          >
            <span className="relative z-10 uppercase tracking-wider">
              Start Designing Now
            </span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
