'use client';

import React from 'react';

/**
 * Section-specific skeleton loaders for consistent loading experience
 * These match the exact layout of each section to prevent layout shift
 * ⚡ PERFORMANCE: Pure CSS shimmer — no framer-motion dependency, runs on GPU compositor thread,
 *    zero JS overhead during initial mobile paint.
 */

// Pure-CSS shimmer — no framer-motion, no JS animation loop
const shimmerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.5s infinite linear',
};

const Shimmer = () => <div style={shimmerStyle} />;

/**
 * Hero Section Skeleton - matches CarouselHero layout
 */
export const HeroSkeleton = () => (
  <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        {/* Brand name skeleton */}
        <div className="h-6 w-32 mx-auto bg-slate-200 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
        {/* Title skeleton */}
        <div className="h-12 w-48 mx-auto bg-slate-200 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
        {/* Subtitle skeleton */}
        <div className="h-4 w-64 mx-auto bg-slate-200 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
        {/* Button skeleton */}
        <div className="h-10 w-32 mx-auto bg-amber-200/50 rounded-full relative overflow-hidden mt-6">
          <Shimmer />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Signature Collection / Featured Bouquets Skeleton
 * ⚡ Matches the EXACT grid used by UltraFeaturedBouquets:
 *    3-column grid, 6 cards, card-style layout with image top + content bottom.
 *    This prevents layout shift (CLS) when the real content loads in.
 */
export const FeaturedBouquetsSkeleton = () => (
  <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      {/* Section header — mirrors the real heading height */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="h-10 sm:h-14 w-72 mx-auto bg-slate-200 rounded-lg relative overflow-hidden mb-4">
          <Shimmer />
        </div>
        <div className="h-1 w-32 mx-auto bg-amber-200/60 rounded-full relative overflow-hidden mb-4">
          <Shimmer />
        </div>
        <div className="h-4 w-80 max-w-full mx-auto bg-slate-100 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
      </div>

      {/* 3-column card grid — matches grid-cols-3 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto px-2 sm:px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
            {/* Image placeholder — mirrors h-48 sm:h-64 */}
            <div className="h-32 sm:h-48 md:h-64 bg-slate-200 relative overflow-hidden rounded-t-2xl">
              <Shimmer />
            </div>
            {/* Content placeholder */}
            <div className="p-2 sm:p-4 space-y-2">
              <div className="h-4 sm:h-5 w-3/4 bg-slate-200 rounded relative overflow-hidden">
                <Shimmer />
              </div>
              <div className="h-3 sm:h-4 w-full bg-slate-100 rounded relative overflow-hidden">
                <Shimmer />
              </div>
              <div className="flex gap-1 sm:gap-2 pt-1">
                <div className="h-4 sm:h-5 w-14 bg-slate-100 rounded relative overflow-hidden">
                  <Shimmer />
                </div>
                <div className="h-4 sm:h-5 w-16 bg-slate-100 rounded relative overflow-hidden">
                  <Shimmer />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* "View all" button placeholder */}
      <div className="text-center mt-8 sm:mt-12">
        <div className="h-10 sm:h-12 w-48 mx-auto bg-amber-200/50 rounded-xl relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  </section>
);

/**
 * Categories Section Skeleton
 */
export const CategoriesSkeleton = () => (
  <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-8">
        <div className="h-8 w-48 mx-auto bg-slate-200 rounded-lg relative overflow-hidden mb-3">
          <Shimmer />
        </div>
        <div className="h-4 w-72 max-w-full mx-auto bg-slate-100 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
      
      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-slate-200 relative overflow-hidden">
            <Shimmer />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-5 w-24 bg-white/80 rounded relative overflow-hidden">
                <Shimmer />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/**
 * Footer Skeleton
 */
export const FooterSkeleton = () => (
  <footer className="bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 bg-slate-700 rounded relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 w-24 bg-slate-800 rounded relative overflow-hidden">
                  <Shimmer />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </footer>
);

/**
 * Generic Section Skeleton - for quiz, care guide, etc.
 */
export const GenericSectionSkeleton = () => (
  <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="h-8 w-56 mx-auto bg-slate-200 rounded-lg relative overflow-hidden mb-3">
          <Shimmer />
        </div>
        <div className="h-4 w-80 max-w-full mx-auto bg-slate-100 rounded-lg relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl relative overflow-hidden">
        <Shimmer />
      </div>
    </div>
  </section>
);

/**
 * Collection Page Skeleton
 */
export const CollectionPageSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    {/* Hero skeleton */}
    <div className="h-48 sm:h-64 bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
      <Shimmer />
    </div>
    
    {/* Category nav skeleton */}
    <div className="py-4 px-4 bg-white border-b">
      <div className="max-w-7xl mx-auto flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-24 flex-shrink-0 bg-slate-200 rounded-full relative overflow-hidden">
            <Shimmer />
          </div>
        ))}
      </div>
    </div>
    
    {/* Products grid skeleton */}
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="h-56 bg-slate-200 relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-slate-200 rounded relative overflow-hidden">
                <Shimmer />
              </div>
              <div className="h-4 w-1/2 bg-slate-100 rounded relative overflow-hidden">
                <Shimmer />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default {
  HeroSkeleton,
  FeaturedBouquetsSkeleton,
  CategoriesSkeleton,
  FooterSkeleton,
  GenericSectionSkeleton,
  CollectionPageSkeleton,
};
