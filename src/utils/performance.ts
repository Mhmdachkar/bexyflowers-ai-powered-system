/**
 * Performance Utilities
 * 
 * Helper functions for performance monitoring and optimization
 */

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (import.meta.env.DEV) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
}

/**
 * Measure async performance
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  if (import.meta.env.DEV) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch function calls
 */
export function batch<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => void | Promise<void>
): Promise<void> {
  return new Promise(async (resolve) => {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await processor(batch);
      // Yield to browser for smooth rendering
      await new Promise((r) => setTimeout(r, 0));
    }
    resolve();
  });
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check connection (if available)
  const connection = (navigator as any).connection;
  const slowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData
  );
  
  return cores <= 2 || memory <= 2 || slowConnection;
}

/**
 * Get optimal batch size based on device
 */
export function getOptimalBatchSize(defaultSize: number = 12): number {
  if (isLowEndDevice()) {
    return Math.max(6, Math.floor(defaultSize / 2));
  }
  return defaultSize;
}

/**
 * Detect iOS version from user agent
 * Returns the major iOS version number (e.g., 18, 17, 16) or null if not iOS
 */
export function getIOSVersion(): number | null {
  if (typeof navigator === 'undefined') return null;
  
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const match = ua.match(/OS (\d+)[_\d]*/);
  
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * Check if device is running older iOS (iOS 18 or below)
 * iOS 18 and below may have performance issues with heavy animations/videos
 */
export function isOldIOS(): boolean {
  const iosVersion = getIOSVersion();
  if (iosVersion === null) return false;
  
  // iOS 18 and below are considered "old" for performance optimization purposes
  return iosVersion <= 18;
}

/**
 * Detect Android from user agent
 */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /Android/i.test(ua);
}

/**
 * Get Android version from user agent (e.g., 12, 13, 14)
 * Returns major version or null if not Android
 */
export function getAndroidVersion(): number | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const match = ua.match(/Android (\d+)(?:\.(\d+))?/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Check if Android device should get performance optimizations
 * Applies to all Android (Chrome/WebView can be heavy with videos/animations)
 */
export function needsAndroidOptimizations(): boolean {
  if (!isAndroid()) return false;
  const version = getAndroidVersion();
  // Android 12 and below: older WebView/Chrome, more lag
  if (version !== null && version <= 12) return true;
  // All Android gets lighter optimizations (video rate, intersection margin)
  return true;
}

/**
 * Check if device needs performance optimizations
 * Combines low-end device, old iOS, and Android checks
 */
export function needsPerformanceOptimizations(): boolean {
  return isLowEndDevice() || isOldIOS() || needsAndroidOptimizations();
}

/**
 * True when mobile-focused optimizations should apply (iOS 18-, or any Android)
 */
export function needsMobilePerformanceOptimizations(): boolean {
  return isOldIOS() || needsAndroidOptimizations();
}
