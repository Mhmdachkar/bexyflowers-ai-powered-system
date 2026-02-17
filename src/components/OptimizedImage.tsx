/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading with native browser lazy loading
 * - Placeholder/skeleton while loading
 * - Error handling with fallback
 * - WebP format support
 * 
 * ⚡ PERFORMANCE FIX: Removed broken srcSet generation
 * Supabase Storage doesn't support query params for image resizing
 * Using direct image URLs with native lazy loading for best performance
 * 
 * ⚡ PERFORMANCE FIX: Removed animated placeholders on mobile
 * Static background instead of animate-pulse to reduce CPU usage
 */

import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

// ⚡ PERFORMANCE: Check if device is mobile - use simpler placeholders
const isMobileDevice = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  fallback?: string;
  priority?: boolean; // Load immediately (above the fold)
  sizes?: string; // For responsive images (kept for future CDN support)
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  fallback,
  priority = false,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const imageSrc = hasError && fallback ? fallback : src;

  return (
    <div
      className={`relative overflow-hidden ${className.includes('!w-full') ? 'w-full h-full' : className}`}
      style={{ width: width || '100%', height: height || '100%' }}
    >
      {/* Placeholder/Skeleton - Static on mobile for better performance */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-[#F5F5F5] ${isMobileDevice() ? '' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}
          style={{ width, height }}
        />
      )}

      {/* Actual Image - Direct src, no broken srcSet */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={`transition-opacity duration-200 w-full h-full ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className.includes('object-cover') ? 'object-cover object-center' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
