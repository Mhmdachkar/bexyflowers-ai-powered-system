import { Metadata } from 'next';
import About from '@/views/About';

export const metadata: Metadata = {
  title: 'About Us - Bexy Flowers',
  description: 'Learn about Bexy Flowers, Lebanon\'s premier luxury florist with a passion for creating stunning floral arrangements.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return <About />;
}
