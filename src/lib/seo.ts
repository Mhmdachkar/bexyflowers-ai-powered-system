/**
 * SEO configuration for Bexy Flowers
 * Set VITE_SITE_URL in .env to your production URL (e.g. https://bexyflowers.com)
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bexyflowers.shop";
export const SITE_NAME = "Bexy Flowers";
export const DEFAULT_DESCRIPTION =
  "Lebanon's most luxurious floral portfolio. Premium custom bouquets, wedding flowers, and couture arrangements. AI-powered flower customization. Order online.";
export const DEFAULT_OG_IMAGE = "/assets/bexy-flowers-logo.webp";
export const TWITTER_HANDLE = ""; // e.g. @bexyflowers
export const FACEBOOK_APP_ID = "";
export const LOCALE = "en_LB";
export const LOCALE_ALT = ["ar_LB"];

export const BUSINESS_INFO = {
  name: "Bexy Flowers",
  address: {
    streetAddress: "Sidon",
    addressLocality: "Sidon",
    addressRegion: "South Governorate",
    postalCode: "",
    addressCountry: "LB"
  },
  telephone: "+961 76 104 882", // Update with actual phone
  email: "info@bexyflowers.shop",
  priceRange: "$$",
  openingHours: ["Mo-Sa 09:00-20:00", "Su 10:00-18:00"],
};

export const ROUTES = {
  HOME: "/",
  COLLECTION: "/collection",
  ABOUT: "/about",
  CUSTOMIZE: "/customize",
  WEDDING: "/wedding-and-events",
  GUIDES: "/guides",
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
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS_INFO.telephone,
      contactType: "customer service",
      email: BUSINESS_INFO.email,
      availableLanguage: ["English", "Arabic"]
    },
    sameAs: [
      // Add social media URLs when available
      // "https://www.facebook.com/bexyflowers",
      // "https://www.instagram.com/bexyflowers",
    ]
  };
}

/** JSON-LD: LocalBusiness schema for physical location */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    "@id": `${SITE_URL}/#localbusiness`,
    name: BUSINESS_INFO.name,
    image: `${SITE_URL}/assets/bexy-flowers-logo.webp`,
    url: SITE_URL,
    telephone: BUSINESS_INFO.telephone,
    email: BUSINESS_INFO.email,
    priceRange: BUSINESS_INFO.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_INFO.address.streetAddress,
      addressLocality: BUSINESS_INFO.address.addressLocality,
      addressRegion: BUSINESS_INFO.address.addressRegion,
      postalCode: BUSINESS_INFO.address.postalCode,
      addressCountry: BUSINESS_INFO.address.addressCountry
    },
    openingHoursSpecification: BUSINESS_INFO.openingHours.map(hours => {
      const [days, time] = hours.split(' ');
      const [open, close] = time.split('-');
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days.split('-').map(d => {
          const dayMap: Record<string, string> = {
            Mo: "Monday", Tu: "Tuesday", We: "Wednesday", 
            Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday"
          };
          return dayMap[d] || d;
        }),
        opens: open,
        closes: close
      };
    }),
    areaServed: {
      "@type": "Country",
      name: "Lebanon"
    }
  };
}

/** JSON-LD: WebSite schema with sitelinks search */
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

/** JSON-LD: BreadcrumbList schema */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`
    }))
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
  sku?: string;
  brand?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  const imageUrl = params.image.startsWith("http") ? params.image : `${SITE_URL}${params.image.startsWith("/") ? "" : "/"}${params.image}`;
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description,
    image: imageUrl,
    url: params.url,
    brand: {
      "@type": "Brand",
      name: params.brand || SITE_NAME
    },
    offers: {
      "@type": "Offer",
      price: params.price.toFixed(2),
      priceCurrency: params.currency || "USD",
      availability: params.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: params.url,
      seller: {
        "@type": "Organization",
        name: SITE_NAME
      }
    },
  };

  if (params.sku) {
    schema.sku = params.sku;
  }

  if (params.aggregateRating && params.aggregateRating.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: params.aggregateRating.ratingValue,
      reviewCount: params.aggregateRating.reviewCount
    };
  }

  return schema;
}

/** JSON-LD: FAQPage schema */
export function faqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

/** JSON-LD: CollectionPage schema for category pages */
export function collectionPageSchema(params: {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: params.url,
    isPartOf: {
      "@type": "WebSite",
      url: SITE_URL,
      name: SITE_NAME
    },
    ...(params.numberOfItems && {
      numberOfItems: params.numberOfItems
    })
  };
}
