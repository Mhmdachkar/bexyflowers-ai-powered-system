import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Bexy Flowers';
const SITE_URL = 'https://bexyflowers.shop';
const DEFAULT_TITLE = "Bexy Flowers | Lebanon's Premier Luxury Florist";
const DEFAULT_DESCRIPTION =
  "Lebanon's most luxurious floral portfolio. Premium custom bouquets, wedding flowers, eternal flowers & couture arrangements. AI-powered customization. Order online.";
// Ideal: a dedicated 1200×630 image placed at /assets/og-image.jpg
// Until then, using the hero image which is publicly accessible
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/hero_section/image1.webp`;
const DEFAULT_KEYWORDS =
  'flowers Lebanon, custom bouquets, floral arrangements, wedding flowers, luxury florist, eternal flowers, premium gifts, Beirut flowers, AI flowers';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  jsonLd?: object | object[];
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noIndex = false,
  jsonLd,
  keywords,
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = ogImage || DEFAULT_OG_IMAGE;
  const canonicalUrl = canonical
    ? `${SITE_URL}${canonical}`
    : undefined;
  const metaKeywords = keywords || DEFAULT_KEYWORDS;

  return (
    <Helmet>
      {/* ── Primary Meta ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {author && <meta name="author" content={author} />}
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow'}
      />
      <meta
        name="googlebot"
        content={noIndex ? 'noindex, nofollow' : 'index, follow'}
      />

      {/* ── Canonical ── */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* ── Open Graph ── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={`${SITE_NAME} - Luxury Florist Lebanon`}
      />
      <meta property="og:locale" content="en_LB" />

      {/* ── Article-specific Open Graph ── */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta
        name="twitter:image:alt"
        content={`${SITE_NAME} - Luxury Florist Lebanon`}
      />

      {/* ── JSON-LD Structured Data ── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}
