import { Metadata } from 'next';
import Checkout from '@/views/Checkout';

export const metadata: Metadata = {
  title: 'Checkout - Bexy Flowers',
  description: 'Complete your flower order with secure checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <Checkout />;
}
