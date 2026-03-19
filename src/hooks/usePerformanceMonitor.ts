import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from '@/lib/navigation-compat';

/**
 * Performance monitoring hook for navigation and loading times
 * Helps track and optimize page performance
 */
interface PerformanceMetrics {
  route: string;
  loadTime: number;
  navigationTime: number;
  timestamp: number;
  prefetchEffective: boolean;
}

const PERFORMANCE_STORAGE_KEY = 'bexy-performance-metrics';
const MAX_METRICS = 100;

/**
 * Hook for monitoring navigation performance
 */
export const usePerformanceMonitor = () => {
  const location = useLocation();
  const navigationStartRef = useRef<number>(0);
  const routeStartRef = useRef<number>(0);
  const saveMetricsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMetricsRef = useRef<PerformanceMetrics[] | null>(null);

  /**
   * Load stored performance metrics
   */
  const loadMetrics = useCallback((): PerformanceMetrics[] => {
    try {
      const stored = localStorage.getItem(PERFORMANCE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  /**
   * Save performance metrics - throttled to prevent excessive localStorage writes
   */
  const saveMetrics = useCallback((metrics: PerformanceMetrics[]) => {
    // Batch localStorage writes to prevent performance issues
    pendingMetricsRef.current = metrics;
    
    if (saveMetricsTimeoutRef.current) {
      clearTimeout(saveMetricsTimeoutRef.current);
    }
    
    saveMetricsTimeoutRef.current = setTimeout(() => {
      try {
        if (pendingMetricsRef.current) {
          localStorage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify(pendingMetricsRef.current));
          pendingMetricsRef.current = null;
        }
      } catch (error) {
        console.warn('Failed to save performance metrics:', error);
        pendingMetricsRef.current = null;
      }
      saveMetricsTimeoutRef.current = null;
    }, 500); // Throttle to max once per 500ms
  }, []);

  /**
   * Record navigation performance
   */
  const recordNavigationPerformance = useCallback((
    route: string,
    loadTime: number,
    prefetchEffective: boolean = false
  ) => {
    const metrics: PerformanceMetrics = {
      route,
      loadTime,
      navigationTime: Date.now() - navigationStartRef.current,
      timestamp: Date.now(),
      prefetchEffective,
    };

    const existingMetrics = loadMetrics();
    existingMetrics.push(metrics);

    // Keep only recent metrics
    const recentMetrics = existingMetrics
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_METRICS);

    saveMetrics(recentMetrics);
  }, [loadMetrics, saveMetrics]);

  /**
   * Get average performance for a route
   */
  const getAveragePerformance = useCallback((route: string): {
    avgLoadTime: number;
    avgNavigationTime: number;
    prefetchHitRate: number;
  } => {
    const metrics = loadMetrics().filter(m => m.route === route);

    if (metrics.length === 0) {
      return { avgLoadTime: 0, avgNavigationTime: 0, prefetchHitRate: 0 };
    }

    const avgLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
    const avgNavigationTime = metrics.reduce((sum, m) => sum + m.navigationTime, 0) / metrics.length;
    const prefetchHitRate = metrics.filter(m => m.prefetchEffective).length / metrics.length;

    return { avgLoadTime, avgNavigationTime, prefetchHitRate };
  }, [loadMetrics]);

  /**
   * Get performance insights
   */
  const getPerformanceInsights = useCallback(() => {
    const metrics = loadMetrics();
    const routeGroups = metrics.reduce((acc, metric) => {
      if (!acc[metric.route]) acc[metric.route] = [];
      acc[metric.route].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetrics[]>);

    const insights = Object.entries(routeGroups).map(([route, routeMetrics]) => {
      const avgLoadTime = routeMetrics.reduce((sum, m) => sum + m.loadTime, 0) / routeMetrics.length;
      const prefetchHitRate = routeMetrics.filter(m => m.prefetchEffective).length / routeMetrics.length;
      const slowLoads = routeMetrics.filter(m => m.loadTime > 1000).length;

      return {
        route,
        avgLoadTime: Math.round(avgLoadTime),
        prefetchHitRate: Math.round(prefetchHitRate * 100),
        slowLoads,
        totalNavigations: routeMetrics.length,
      };
    });

    return insights.sort((a, b) => b.avgLoadTime - a.avgLoadTime);
  }, [loadMetrics]);

  /**
   * Start timing navigation
   */
  const startNavigationTiming = useCallback(() => {
    navigationStartRef.current = performance.now();
  }, []);

  /**
   * Start timing route loading
   */
  const startRouteTiming = useCallback(() => {
    routeStartRef.current = performance.now();
  }, []);

  /**
   * End timing and record metrics
   */
  const endTiming = useCallback((prefetchEffective = false) => {
    const loadTime = performance.now() - routeStartRef.current;
    recordNavigationPerformance(location.pathname, loadTime, prefetchEffective);
  }, [location.pathname, recordNavigationPerformance]);

  // Track route changes
  useEffect(() => {
    startNavigationTiming();
    startRouteTiming();

    // Mark timing as complete after a short delay to allow components to load
    const timer = setTimeout(() => {
      endTiming();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Clean up pending localStorage writes
      if (saveMetricsTimeoutRef.current) {
        clearTimeout(saveMetricsTimeoutRef.current);
        saveMetricsTimeoutRef.current = null;
      }
    };
  }, [location.pathname, startNavigationTiming, startRouteTiming, endTiming]);

  return {
    recordNavigationPerformance,
    getAveragePerformance,
    getPerformanceInsights,
    startNavigationTiming,
    startRouteTiming,
    endTiming,
  };
};




