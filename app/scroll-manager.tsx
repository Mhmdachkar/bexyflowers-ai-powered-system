'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import ScrollToTop from '@/components/ScrollToTop';

export function ScrollManager() {
  // Initialize smooth scroll
  useSmoothScroll();

  return <ScrollToTop />;
}
