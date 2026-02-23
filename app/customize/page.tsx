import { Metadata } from 'next';
import Customize from '@/views/Customize';

export const metadata: Metadata = {
  title: 'Custom Bouquet Designer - Bexy Flowers',
  description: 'Design your perfect custom bouquet with our AI-powered flower customization tool. Choose flowers, colors, and arrangements.',
  alternates: {
    canonical: '/customize',
  },
};

export default function CustomizePage() {
  return <Customize />;
}
