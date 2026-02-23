import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from '@/lib/navigation-compat';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Navigation pattern learning and prediction system
 * Tracks user behavior and predicts likely next pages for pre-loading
 */
interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  lastVisited: number;
}

interface UserSession {
  startTime: number;
  path: string[];
  patterns: NavigationPattern[];
}

const STORAGE_KEY = 'bexy-navigation-patterns';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_PATTERNS_PER_ROUTE = 5;

/**
 * Hook for predicting user navigation patterns and pre-loading accordingly
 */
export const useNavigationPredictor = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const sessionRef = useRef<UserSession | null>(null);
  const patternsRef = useRef<NavigationPattern[]>([]);

  /**
   * Load navigation patterns from localStorage
   */
  const loadPatterns = useCallback((): NavigationPattern[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out old patterns (older than 7 days)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return parsed.filter((p: NavigationPattern) => p.lastVisited > weekAgo);
      }
    } catch (error) {
      console.warn('Failed to load navigation patterns:', error);
    }
    return [];
  }, []);

  /**
   * Save navigation patterns to localStorage
   */
  const savePatterns = useCallback((patterns: NavigationPattern[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
    } catch (error) {
      console.warn('Failed to save navigation patterns:', error);
    }
  }, []);

  /**
   * Get predicted next routes based on current path and learned patterns
   */
  const getPredictedRoutes = useCallback((currentPath: string): string[] => {
    const relevantPatterns = patternsRef.current
      .filter(p => p.from === currentPath)
      .sort((a, b) => b.count - a.count) // Sort by frequency
      .slice(0, 3); // Take top 3 predictions

    return relevantPatterns.map(p => p.to);
  }, []);

  /**
   * Record a navigation event
   */
  const recordNavigation = useCallback((from: string, to: string) => {
    if (from === to) return; // Don't record self-navigation

    // Update patterns
    const existingPattern = patternsRef.current.find(
      p => p.from === from && p.to === to
    );

    if (existingPattern) {
      existingPattern.count++;
      existingPattern.lastVisited = Date.now();
    } else {
      patternsRef.current.push({
        from,
        to,
        count: 1,
        lastVisited: Date.now(),
      });
    }

    // Keep only top patterns per route and limit total patterns
    const groupedByFrom = patternsRef.current.reduce((acc, pattern) => {
      if (!acc[pattern.from]) acc[pattern.from] = [];
      acc[pattern.from].push(pattern);
      return acc;
    }, {} as Record<string, NavigationPattern[]>);

    patternsRef.current = Object.values(groupedByFrom)
      .flatMap(patterns =>
        patterns
          .sort((a, b) => b.count - a.count)
          .slice(0, MAX_PATTERNS_PER_ROUTE)
      )
      .slice(0, 50); // Limit total patterns

    // Save to localStorage
    savePatterns(patternsRef.current);

    // Update session
    if (sessionRef.current) {
      sessionRef.current.path.push(to);
    }
  }, [savePatterns]);

  /**
   * Pre-load predicted routes
   */
  const preloadPredictedRoutes = useCallback((predictedRoutes: string[]) => {
    const createdLinks: HTMLLinkElement[] = [];
    
    predictedRoutes.forEach(route => {
      // Pre-load route chunk - but track created elements for cleanup
      const existingLink = document.querySelector(`link[rel="prefetch"][href="${route}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'document';
        link.href = route;
        document.head.appendChild(link);
        createdLinks.push(link);
      }

      // Pre-load route-specific data
      if (route.startsWith('/collection')) {
        queryClient.prefetchQuery({
          queryKey: ['collection-products', 'list', { isActive: true }],
          queryFn: () => import('@/lib/api/collection-products').then(m => m.getCollectionProducts({ isActive: true })),
          staleTime: 5 * 60 * 1000,
        }).catch(() => {}); // Silence errors
      }

      if (route.startsWith('/wedding-and-events')) {
        queryClient.prefetchQuery({
          queryKey: ['wedding-creations', 'list', { isActive: true }],
          queryFn: () => import('@/lib/api/wedding-creations').then(m => m.getWeddingCreations({ isActive: true })),
          staleTime: 5 * 60 * 1000,
        }).catch(() => {}); // Silence errors
      }

      if (route === '/favorites') {
        queryClient.prefetchQuery({
          queryKey: ['visitor-favorites'],
          queryFn: () => import('@/lib/api/visitor-favorites').then(m => m.getVisitorFavorites()),
          staleTime: 2 * 60 * 1000, // Favorites change more frequently
        }).catch(() => {}); // Silence errors
      }

      if (route === '/cart') {
        queryClient.prefetchQuery({
          queryKey: ['visitor-cart'],
          queryFn: () => import('@/lib/api/visitor-cart').then(m => m.getVisitorCart()),
          staleTime: 1 * 60 * 1000, // Cart changes frequently
        }).catch(() => {}); // Silence errors
      }
    });
    
    // Return cleanup function for created links
    return () => {
      createdLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [queryClient]);

  /**
   * Start a new session
   */
  const startSession = useCallback(() => {
    sessionRef.current = {
      startTime: Date.now(),
      path: [location.pathname],
      patterns: [],
    };
  }, [location.pathname]);

  /**
   * End current session and analyze patterns
   */
  const endSession = useCallback(() => {
    if (sessionRef.current && sessionRef.current.path.length > 1) {
      // Record navigation patterns from this session
      for (let i = 0; i < sessionRef.current.path.length - 1; i++) {
        recordNavigation(sessionRef.current.path[i], sessionRef.current.path[i + 1]);
      }
    }
    sessionRef.current = null;
  }, [recordNavigation]);

  // Initialize patterns
  useEffect(() => {
    patternsRef.current = loadPatterns();
  }, [loadPatterns]);

  // Handle route changes and session management
  useEffect(() => {
    const currentPath = location.pathname;

    // Check if we need to start a new session
    if (!sessionRef.current) {
      startSession();
    } else {
      // Check if session has timed out
      const sessionAge = Date.now() - sessionRef.current.startTime;
      if (sessionAge > SESSION_TIMEOUT) {
        endSession();
        startSession();
      } else {
        // Record navigation within session
        const previousPath = sessionRef.current.path[sessionRef.current.path.length - 1];
        if (previousPath !== currentPath) {
          recordNavigation(previousPath, currentPath);
          sessionRef.current.path.push(currentPath);
        }
      }
    }

    // Predict and pre-load likely next routes
    const predictedRoutes = getPredictedRoutes(currentPath);
    let preloadTimeoutId: NodeJS.Timeout | null = null;
    let cleanupPrefetchLinks: (() => void) | null = null;
    
    if (predictedRoutes.length > 0) {
      // Delay pre-loading slightly to avoid blocking current navigation
      preloadTimeoutId = setTimeout(() => {
        cleanupPrefetchLinks = preloadPredictedRoutes(predictedRoutes);
      }, 300);
    }

    // Set up session end handlers
    const handleBeforeUnload = () => endSession();
    let visibilityTimeoutId: NodeJS.Timeout | null = null;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear any pending timeout
        if (visibilityTimeoutId) {
          clearTimeout(visibilityTimeoutId);
        }
        // User might be leaving, end session
        visibilityTimeoutId = setTimeout(() => {
          endSession();
          visibilityTimeoutId = null;
        }, 5000); // Give them 5 seconds to come back
      } else {
        // User came back, cancel the timeout
        if (visibilityTimeoutId) {
          clearTimeout(visibilityTimeoutId);
          visibilityTimeoutId = null;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (preloadTimeoutId) {
        clearTimeout(preloadTimeoutId);
      }
      if (visibilityTimeoutId) {
        clearTimeout(visibilityTimeoutId);
      }
      // Clean up prefetch link elements to prevent memory leaks
      if (cleanupPrefetchLinks) {
        cleanupPrefetchLinks();
      }
    };
  }, [location.pathname, startSession, endSession, recordNavigation, getPredictedRoutes, preloadPredictedRoutes]);

  return {
    predictedRoutes: getPredictedRoutes(location.pathname),
    recordNavigation,
    patterns: patternsRef.current,
  };
};




