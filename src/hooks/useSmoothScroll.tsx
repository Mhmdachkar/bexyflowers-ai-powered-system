import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isAndroid } from '@/utils/performance';

gsap.registerPlugin(ScrollTrigger);

// Module-level instance for scrollTo function (only used if hook is mounted)
let globalLenis: Lenis | null = null;

// ⚡ PERFORMANCE: Check if device is mobile - disable smooth scroll on mobile
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const useSmoothScroll = () => {
  const rafIdRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const isActiveRef = useRef<boolean>(true);

  useEffect(() => {
    // ⚡ PERFORMANCE: Skip Lenis on mobile devices - native scroll is more performant
    // Lenis runs a constant RAF loop that drains CPU/battery on mobile
    if (isMobileDevice()) {
      console.log('[SmoothScroll] Disabled on mobile for performance');
      return;
    }

    // ⚡ PERFORMANCE: Configure ScrollTrigger for better performance
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      ignoreMobileResize: true,
    });

    // Android: shorter duration and simpler easing for better scroll performance
    const duration = isAndroid() ? 0.9 : 1.2;
    const easing = isAndroid()
      ? (t: number) => t // Linear on Android for less jank
      : (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    // Initialize Lenis with optimized settings - Apple-like on iOS, lighter on Android
    const lenis = new Lenis({
      duration,
      easing,
    });

    lenisRef.current = lenis;
    globalLenis = lenis; // Set global for scrollTo function
    isActiveRef.current = true; // Reset active flag

    // ⚡ PERFORMANCE: Throttle ScrollTrigger updates - more aggressive on Android
    let lastUpdate = 0;
    const throttleMs = isAndroid() ? 20 : 16; // ~50fps on Android to reduce jank
    const updateScrollTrigger = () => {
      const now = performance.now();
      if (now - lastUpdate >= throttleMs) {
        ScrollTrigger.update();
        lastUpdate = now;
      }
    };

    // Integrate Lenis with GSAP ScrollTrigger for smooth animations
    lenis.on('scroll', updateScrollTrigger);

    // Animation loop for Lenis - with proper cleanup checks and visibility handling
    function raf(time: number) {
      if (!isActiveRef.current || !lenisRef.current) {
        // Stop if component unmounted or lenis destroyed
        rafIdRef.current = null;
        return;
      }
      
      // CRITICAL: Pause RAF loop when page is hidden to prevent unresponsive page
      if (document.hidden) {
        // Continue RAF but don't process scroll
        rafIdRef.current = requestAnimationFrame(raf);
        return;
      }
      
      try {
        lenisRef.current.raf(time);
        rafIdRef.current = requestAnimationFrame(raf);
      } catch (error) {
        console.error('Lenis RAF error:', error);
        rafIdRef.current = null;
        isActiveRef.current = false;
      }
    }

    rafIdRef.current = requestAnimationFrame(raf);
    
    // CRITICAL: Pause Lenis when page becomes hidden to prevent performance issues
    const handleVisibilityChange = () => {
      if (document.hidden && lenisRef.current) {
        // Pause smooth scroll when tab is hidden
        lenisRef.current.stop();
      } else if (!document.hidden && lenisRef.current && isActiveRef.current) {
        // Resume when tab becomes visible
        lenisRef.current.start();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Update ScrollTrigger when Lenis scrolls
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && lenisRef.current) {
          lenisRef.current.scrollTo(value, { immediate: true });
        }
        return lenisRef.current?.scroll || 0;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    return () => {
      isActiveRef.current = false; // Stop the RAF loop
      
      // Remove visibility change listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      
      // Remove scroll listener before destroying
      if (lenisRef.current) {
        try {
          lenisRef.current.off('scroll', updateScrollTrigger);
          lenisRef.current.destroy();
        } catch (error) {
          console.error('Error destroying Lenis:', error);
        }
        lenisRef.current = null;
      }
      
      if (globalLenis === lenis) {
        globalLenis = null;
      }
      
      // Clean up ScrollTrigger proxy
      try {
        ScrollTrigger.scrollerProxy(document.body, null);
      } catch (error) {
        // Ignore if already cleaned up
      }
    };
  }, []);

  return lenisRef.current;
};

export const scrollTo = (target: string | number, options?: any) => {
  if (globalLenis) {
    globalLenis.scrollTo(target, options);
  } else {
    // Fallback to native smooth scroll if Lenis is not available
    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', ...options });
      }
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth', ...options });
    }
  }
};