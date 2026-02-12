/**
 * SEO configuration for Bexy Flowers
 * Set VITE_SITE_URL in .env to your production URL (e.g. https://bexyflowers.com)
 */
export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://bexyflowers.shop";
export const SITE_NAME = "Bexy Flowers";
export const DEFAULT_DESCRIPTION =
  "Lebanon's most luxurious floral portfolio. Premium custom bouquets, wedding flowers, and couture arrangements. AI-powered flower customization. Order online.";
export const DEFAULT_OG_IMAGE = "/assets/bexy-flowers-logo.webp";
export const TWITTER_HANDLE = ""; // e.g. @bexyflowers
export const FACEBOOK_APP_ID = "";
export const LOCALE = "en_LB";
export const LOCALE_ALT = ["ar_LB"];

export const ROUTES = {
  HOME: "/",
  COLLECTION: "/collection",
  ABOUT: "/about",
  CUSTOMIZE: "/customize",
  WEDDING: "/wedding-and-events",
  CART: "/cart",
  FAVORITES: "/favorites",
  CHECKOUT: "/checkout",
} as const;

/** JSON-LD: Organization schema */
export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/bexy-flowers-logo.webp`,
    description: DEFAULT_DESCRIPTION,
    areaServed: { "@type": "Country", name: "Lebanon" },
  };
}

/** JSON-LD: WebSite schema with sitelinks search (optional) */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/collection?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** JSON-LD: Product schema for product pages */
export function productSchema(params: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  url: string;
  inStock?: boolean;
}) {
  const imageUrl = params.image.startsWith("http") ? params.image : `${SITE_URL}${params.image.startsWith("/") ? "" : "/"}${params.image}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description,
    image: imageUrl,
    url: params.url,
    offers: {
      "@type": "Offer",
      price: params.price,
      priceCurrency: params.currency || "USD",
      availability: params.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}
