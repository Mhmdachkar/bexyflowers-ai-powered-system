import type { Metadata } from 'next';
import { EB_Garamond, Montserrat } from 'next/font/google';
import { Providers } from './providers';
import { ClientProviders } from './client-providers';
import { ScrollManager } from './scroll-manager';
import UltraNavigation from '@/components/UltraNavigation';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import '@/index.css';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bexyflowers.shop'),
  title: {
    default: 'Bexy Flowers - Lebanon\'s Premier Luxury Florist',
    template: '%s | Bexy Flowers',
  },
  description:
    'Lebanon\'s most luxurious floral portfolio. Premium custom bouquets, wedding flowers, eternal flowers & couture arrangements. AI-powered flower customization. Order online.',
  keywords: [
    'flowers Lebanon',
    'luxury florist Lebanon',
    'custom bouquets',
    'wedding flowers Beirut',
    'eternal flowers',
    'premium flower delivery',
    'Sidon florist',
    'AI flower design',
    'online flower shop Lebanon',
  ],
  authors: [{ name: 'Bexy Flowers' }],
  creator: 'Bexy Flowers',
  publisher: 'Bexy Flowers',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bexyflowers.shop',
    siteName: 'Bexy Flowers',
    title: 'Bexy Flowers - Lebanon\'s Premier Luxury Florist',
    description:
      'Lebanon\'s most luxurious floral portfolio. Premium custom bouquets, wedding flowers, eternal flowers & couture arrangements.',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bexy Flowers - Luxury Floral Arrangements',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bexy Flowers - Lebanon\'s Premier Luxury Florist',
    description:
      'Lebanon\'s most luxurious floral portfolio. Premium custom bouquets, wedding flowers, eternal flowers & couture arrangements.',
    images: ['/assets/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <ClientProviders>
            <ScrollManager />
            <UltraNavigation />
            <main className="relative">{children}</main>
            <Footer />
            <BackToTop />
          </ClientProviders>
        </Providers>
      </body>
    </html>
  );
}
