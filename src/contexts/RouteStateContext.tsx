'use client';

import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { useLocation, useNavigate } from '@/lib/navigation-compat';
import type { Location, NavigateFunction } from '@/lib/navigation-compat';

interface RouteStateCache {
  [key: string]: {
    state: any;
    timestamp: number;
    scrollPosition?: number;
  };
}

interface RouteStateContextType {
  cacheRouteState: (path: string, state: any, scrollPosition?: number) => void;
  getCachedState: (path: string) => any | null;
  clearCache: (path?: string) => void;
  navigateWithState: (path: string, state?: any, options?: { replace?: boolean; preserveScroll?: boolean }) => void;
  restoreScrollPosition: (path: string) => void;
}

const RouteStateContext = createContext<RouteStateContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cached routes

export const RouteStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<RouteStateCache>({});
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Cache route state for faster navigation back
   */
  const cacheRouteState = useCallback((path: string, state: any, scrollPosition?: number) => {
    const cache = cacheRef.current;
    
    // Clean old cache entries if we're at capacity
    const entries = Object.entries(cache);
    if (entries.length >= MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = entries.reduce((oldest, [key, value]) => 
        value.timestamp < cache[oldest]?.timestamp ? key : oldest,
        entries[0][0]
      );
      delete cache[oldestKey];
    }

    // Store state with timestamp
    cache[path] = {
      state,
      timestamp: Date.now(),
      scrollPosition
    };
  }, []);

  /**
   * Get cached state for a route
   */
  const getCachedState = useCallback((path: string): any | null => {
    const cached = cacheRef.current[path];
    
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      delete cacheRef.current[path];
      return null;
    }
    
    return cached.state;
  }, []);

  /**
   * Clear cache for a specific path or all paths
   */
  const clearCache = useCallback((path?: string) => {
    if (path) {
      delete cacheRef.current[path];
    } else {
      cacheRef.current = {};
    }
  }, []);

  /**
   * Navigate with state management and caching
   */
  const navigateWithState = useCallback((
    path: string, 
    state?: any, 
    options?: { replace?: boolean; preserveScroll?: boolean }
  ) => {
    // Save current scroll position if preserveScroll is true
    if (options?.preserveScroll && location.pathname !== path) {
      cacheRouteState(
        location.pathname, 
        location.state, 
        window.scrollY
      );
    }

    // Merge with any existing cached state
    const cachedState = getCachedState(path);
    const mergedState = state || cachedState || {};

    navigate(path, {
      state: mergedState,
      replace: options?.replace
    });
  }, [navigate, location, cacheRouteState, getCachedState]);

  /**
   * Restore scroll position for a route
   */
  const restoreScrollPosition = useCallback((path: string) => {
    const cached = cacheRef.current[path];
    if (cached?.scrollPosition !== undefined) {
      // Use requestAnimationFrame for smooth scroll restoration
      requestAnimationFrame(() => {
        window.scrollTo({
          top: cached.scrollPosition,
          behavior: 'auto'
        });
      });
    }
  }, []);

  return (
    <RouteStateContext.Provider
      value={{
        cacheRouteState,
        getCachedState,
        clearCache,
        navigateWithState,
        restoreScrollPosition
      }}
    >
      {children}
    </RouteStateContext.Provider>
  );
};

export const useRouteState = (): RouteStateContextType => {
  const context = useContext(RouteStateContext);
  if (!context) {
    throw new Error('useRouteState must be used within RouteStateProvider');
  }
  return context;
};

