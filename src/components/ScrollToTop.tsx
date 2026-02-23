'use client';

import { useEffect, useLayoutEffect, useCallback } from "react";
import { useLocation } from '@/lib/navigation-compat';
import { scrollTo } from "@/hooks/useSmoothScroll";

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  // Enhanced scroll reset function with Lenis smooth scroll support
  const resetScrollPosition = useCallback(() => {
    try {
      // PRIORITY 1: Try Lenis smooth scroll if available (via exported scrollTo function)
      // Use immediate scroll (no animation) for page transitions
      scrollTo(0, { immediate: true, force: true });
      // Note: scrollTo doesn't throw if Lenis isn't ready, so we always run native fallback too
      
      // PRIORITY 2: ALWAYS use native scroll methods as fallback/ensurance
      // This ensures scroll works even if Lenis isn't initialized yet or fails
      // Method 1: Modern scroll API (immediate, no animation)
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

      // Method 2: Direct property setting (fallback for older browsers)
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Method 3: Scroll the viewport element (Safari fallback)
      const viewport = document.scrollingElement || document.documentElement;
      if (viewport) {
        viewport.scrollTop = 0;
        viewport.scrollLeft = 0;
      }

      // Method 4: Reset any custom scrollable containers
      const scrollableElements = document.querySelectorAll('[data-scroll-container]');
      scrollableElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.scrollTop = 0;
          el.scrollLeft = 0;
        }
      });

      // Method 5: Force scroll for stubborn cases (legacy support)
      if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0) {
        window.scrollTo(0, 0);
      }
    } catch (error) {
      // Silent fail - scroll behavior is not critical
      console.warn('Scroll reset failed:', error);
    }
  }, []);

  // Disable browser's automatic scroll restoration globally
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Reset scroll position on EVERY route change (pathname or search change)
  // Always scroll to top when entering a new page, regardless of hash
  useLayoutEffect(() => {
    // ALWAYS scroll to top on route change, even if hash exists
    // (Hash scrolling happens separately if needed)
    resetScrollPosition();

    // Ensure scroll happens after layout paint
    const rafId = requestAnimationFrame(() => {
      resetScrollPosition();
    });

    // Double-check after a brief delay (for async route loading)
    const timeoutId = setTimeout(() => {
      resetScrollPosition();
    }, 50);
    
    // Final check after page content is fully rendered
    const loadTimeoutId = setTimeout(() => {
      resetScrollPosition();
    }, 200);
    
    // If hash exists, scroll to element AFTER scrolling to top
    if (hash) {
      const hashTimeoutId = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          // Use Lenis smooth scroll if available (pass hash string), otherwise native smooth scroll
          // Note: scrollTo will silently do nothing if Lenis isn't ready, so we always run native fallback
          scrollTo(hash, { immediate: false, duration: 0.8 });
          // Always also use native as fallback/ensurance
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300); // Wait for scroll-to-top to complete first
      
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
        clearTimeout(loadTimeoutId);
        clearTimeout(hashTimeoutId);
      };
    }
    
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      clearTimeout(loadTimeoutId);
    };
  }, [pathname, search, resetScrollPosition]); // Removed 'hash' from deps to always scroll top first

  // Handle browser back/forward navigation
  useEffect(() => {
    let popStateTimeoutId: NodeJS.Timeout | null = null;
    const handlePopState = () => {
      // Clear any pending timeout to prevent accumulation
      if (popStateTimeoutId) {
        clearTimeout(popStateTimeoutId);
      }
      // Small delay to ensure the DOM is ready after navigation
      popStateTimeoutId = setTimeout(() => {
        resetScrollPosition();
        popStateTimeoutId = null;
      }, 10);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (popStateTimeoutId) {
        clearTimeout(popStateTimeoutId);
      }
    };
  }, [resetScrollPosition]);

  // Handle initial page load and page refresh
  useEffect(() => {
    // Scroll to top on initial mount
    resetScrollPosition();
    
    // Also handle visibility change (tab switch back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetScrollPosition();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetScrollPosition]);

  return null;
};

export default ScrollToTop;


