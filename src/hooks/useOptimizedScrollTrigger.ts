import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for optimized ScrollTrigger animations with performance optimizations:
 * - Throttled updates to reduce frame drops
 * - Batch ScrollTrigger refreshes
 * - Automatic cleanup
 * - Better refresh priority management
 */
export const useOptimizedScrollTrigger = () => {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRefreshRef = useRef<boolean>(false);

  useEffect(() => {
    // ⚡ PERFORMANCE: Configure ScrollTrigger for better performance
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", // Only refresh on these events
      ignoreMobileResize: true, // Ignore mobile resize events for better performance
    });

    // ⚡ PERFORMANCE: Throttle ScrollTrigger refreshes to batch updates
    const throttledRefresh = () => {
      if (pendingRefreshRef.current) return;
      
      pendingRefreshRef.current = true;
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        ScrollTrigger.refresh();
        pendingRefreshRef.current = false;
      }, 150); // Batch refreshes every 150ms
    };

    // Throttle resize events
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        throttledRefresh();
      }, 250);
    };

    // Throttle orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        throttledRefresh();
      }, 500);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      clearTimeout(resizeTimeout);
      
      // Kill all ScrollTriggers created in this context
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.refreshPriority !== -1) {
          trigger.kill();
        }
      });
    };
  }, []);

  /**
   * Create an optimized ScrollTrigger with performance settings
   */
  const createScrollTrigger = (
    config: ScrollTrigger.Vars,
    element?: gsap.DOMTarget
  ): ScrollTrigger => {
    const optimizedConfig: ScrollTrigger.Vars = {
      ...config,
      // Use lower refresh priority for non-critical animations
      refreshPriority: config.refreshPriority ?? -1,
      // Reduce scrub sensitivity for smoother animations
      scrub: typeof config.scrub === 'number' ? config.scrub : (config.scrub ? 1 : false),
      // Use markers only in development
      markers: import.meta.env.DEV ? config.markers : false,
    };

    if (element) {
      return ScrollTrigger.create({
        trigger: element,
        ...optimizedConfig,
      });
    }

    return ScrollTrigger.create(optimizedConfig);
  };

  return {
    createScrollTrigger,
    refresh: () => ScrollTrigger.refresh(),
    batchRefresh: () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    },
  };
};

/**
 * Hook to optimize GSAP animations for better performance
 */
export const useOptimizedGSAP = () => {
  useEffect(() => {
    // ⚡ PERFORMANCE: Configure GSAP for better performance
    gsap.config({
      nullTargetWarn: false, // Reduce console warnings
      // trialWarn removed - not a valid GSAPConfig property
    });

    // Use will-change hints more efficiently
    gsap.defaults({
      force3D: 'auto', // Let browser decide 3D transforms
      lazy: false, // Disable lazy rendering for consistent performance
    });
  }, []);

  /**
   * Create a performance-optimized animation
   */
  const createAnimation = (
    target: gsap.TweenTarget,
    vars: gsap.TweenVars
  ): gsap.core.Tween => {
    return gsap.to(target, {
      ...vars,
      // Optimize transforms
      force3D: vars.force3D ?? 'auto',
      // Reduce complexity for smoother animations
      ease: vars.ease ?? 'power2.out',
    });
  };

  return { createAnimation };
};

