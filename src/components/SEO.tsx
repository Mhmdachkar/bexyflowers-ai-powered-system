'use client';

/**
 * Legacy SEO component - kept for compatibility with existing views
 * In Next.js App Router, use metadata exports in page components instead
 * This component now only handles JSON-LD structured data
 */

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "product" | "article";
  noIndex?: boolean;
  jsonLd?: object | object[];
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function SEO({
  jsonLd,
}: SEOProps) {
  // In Next.js App Router, metadata is handled at the page level
  // This component only renders JSON-LD if provided
  if (!jsonLd) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])
      }}
    />
  );
}
