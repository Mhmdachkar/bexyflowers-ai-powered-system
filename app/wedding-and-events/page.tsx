import { Metadata } from 'next';
import WeddingAndEvents from '@/views/WeddingAndEvents';

export const metadata: Metadata = {
  title: 'Weddings & Events - Bexy Flowers',
  description: 'Luxury wedding flowers and event floral design services in Lebanon. From bridal bouquets to venue decorations.',
  alternates: {
    canonical: '/wedding-and-events',
  },
};

export default function WeddingAndEventsPage() {
  return <WeddingAndEvents />;
}
