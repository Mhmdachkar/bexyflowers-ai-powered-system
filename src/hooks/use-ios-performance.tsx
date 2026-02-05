import { useState, useEffect } from 'react';
import {
  getIOSVersion,
  getAndroidVersion,
  isOldIOS,
  isAndroid,
  needsPerformanceOptimizations,
  needsMobilePerformanceOptimizations,
} from '@/utils/performance';

/**
 * Hook to detect iOS/Android and determine if performance optimizations are needed
 * Returns:
 * - iosVersion: The iOS version number (e.g., 18, 19) or null if not iOS
 * - androidVersion: The Android version number (e.g., 12, 14) or null if not Android
 * - isOldIOS: Whether the device is running iOS 18 or below
 * - isAndroidDevice: Whether the device is Android (all Android gets optimizations)
 * - needsOptimizations: Whether performance optimizations should be applied (low-end, old iOS, or Android)
 * - needsMobileOptimizations: Whether mobile-specific optimizations apply (old iOS or Android)
 */
export function useIOSPerformance() {
  const [iosVersion, setIOSVersion] = useState<number | null>(null);
  const [androidVersion, setAndroidVersion] = useState<number | null>(null);
  const [isOldIOSDevice, setIsOldIOSDevice] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [needsOptimizations, setNeedsOptimizations] = useState(false);
  const [needsMobileOptimizations, setNeedsMobileOptimizations] = useState(false);

  useEffect(() => {
    const iosVer = getIOSVersion();
    const andVer = getAndroidVersion();
    const isOld = isOldIOS();
    const isAnd = isAndroid();
    const needsOpt = needsPerformanceOptimizations();
    const needsMobileOpt = needsMobilePerformanceOptimizations();

    setIOSVersion(iosVer);
    setAndroidVersion(andVer);
    setIsOldIOSDevice(isOld);
    setIsAndroidDevice(isAnd);
    setNeedsOptimizations(needsOpt);
    setNeedsMobileOptimizations(needsMobileOpt);
  }, []);

  return {
    iosVersion,
    androidVersion,
    isOldIOS: isOldIOSDevice,
    isAndroid: isAndroidDevice,
    needsOptimizations,
    needsMobileOptimizations: needsMobileOptimizations,
  };
}
