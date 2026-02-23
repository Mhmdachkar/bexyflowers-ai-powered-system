import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailPage from '@/views/ProductDetailPage';
import { getCollectionProduct } from '@/lib/api/collection-products';

type Props = {
  params: Promise<{ id: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const product = await getCollectionProduct(id);
    
    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bexyflowers.shop';
    const imageUrl = product.image_urls?.[0] || '/assets/og-image.jpg';

    return {
      title: product.title,
      description: product.description || `${product.title} - Premium flower arrangement by Bexy Flowers`,
      alternates: {
        canonical: `/product/${id}`,
      },
      openGraph: {
        title: product.title,
        description: product.description || `${product.title} - Premium flower arrangement`,
        url: `/product/${id}`,
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description || `${product.title} - Premium flower arrangement`,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Product',
    };
  }
}

// Generate structured data for product
async function generateProductStructuredData(id: string) {
  try {
    const product = await getCollectionProduct(id);
    
    if (!product) return null;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bexyflowers.shop';
    const imageUrl = product.image_urls?.[0] || '';

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: imageUrl,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: product.is_out_of_stock
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Bexy Flowers',
        },
      },
      brand: {
        '@type': 'Brand',
        name: 'Bexy Flowers',
      },
      aggregateRating: product.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.review_count || 1,
          }
        : undefined,
    };
  } catch (error) {
    return null;
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const structuredData = await generateProductStructuredData(id);

  // Pre-fetch product for SSR (ProductDetailPage will also fetch client-side)
  try {
    const product = await getCollectionProduct(id);
    if (!product) {
      notFound();
    }
  } catch (error) {
    notFound();
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <ProductDetailPage />
    </>
  );
}
