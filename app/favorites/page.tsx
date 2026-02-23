import { Metadata } from 'next';
import Favorites from '@/views/Favorites';

export const metadata: Metadata = {
  title: 'My Favorites - Bexy Flowers',
  description: 'View your favorite flower arrangements and bouquets.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return <Favorites />;
}
