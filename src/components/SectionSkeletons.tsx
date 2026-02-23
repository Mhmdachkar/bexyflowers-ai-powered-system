'use client';

import { motion } from 'framer-motion';

/**
 * Section-specific skeleton loaders for consistent loading experience
 * These match the exact layout of each section to prevent layout shift
 */

// Shimmer animation component
const Shimmer = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
    animate={{ x: ['-100%', '100%'] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay }}
  />
);

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
          <Shimmer delay={0.1} />
        </div>
        {/* Subtitle skeleton */}
        <div className="h-4 w-64 mx-auto bg-slate-200 rounded-lg relative overflow-hidden">
          <Shimmer delay={0.2} />
        </div>
        {/* Button skeleton */}
        <div className="h-10 w-32 mx-auto bg-amber-200/50 rounded-full relative overflow-hidden mt-6">
          <Shimmer delay={0.3} />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Featured Bouquets Section Skeleton
 */
export const FeaturedBouquetsSkeleton = () => (
  <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
    <div className="max-w-7xl mx-auto">
      {/* Section header skeleton */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="h-8 w-64 mx-auto bg-slate-200 rounded-lg relative overflow-hidden mb-4">
          <Shimmer />
        </div>
        <div className="h-4 w-96 max-w-full mx-auto bg-slate-100 rounded-lg relative overflow-hidden">
          <Shimmer delay={0.1} />
        </div>
      </div>
      
      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="h-48 sm:h-56 bg-slate-200 relative overflow-hidden">
              <Shimmer delay={i * 0.1} />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-slate-200 rounded relative overflow-hidden">
                <Shimmer delay={i * 0.1 + 0.2} />
              </div>
              <div className="h-4 w-1/2 bg-slate-100 rounded relative overflow-hidden">
                <Shimmer delay={i * 0.1 + 0.3} />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-16 bg-amber-200/50 rounded relative overflow-hidden">
                  <Shimmer delay={i * 0.1 + 0.4} />
                </div>
                <div className="h-8 w-20 bg-slate-200 rounded-full relative overflow-hidden">
                  <Shimmer delay={i * 0.1 + 0.5} />
                </div>
              </div>
            </div>
          </div>
        ))}
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
          <Shimmer delay={0.1} />
        </div>
      </div>
      
      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-slate-200 relative overflow-hidden">
            <Shimmer delay={i * 0.15} />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-5 w-24 bg-white/80 rounded relative overflow-hidden">
                <Shimmer delay={i * 0.15 + 0.2} />
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
              <Shimmer delay={i * 0.1} />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 w-24 bg-slate-800 rounded relative overflow-hidden">
                  <Shimmer delay={i * 0.1 + j * 0.05} />
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
          <Shimmer delay={0.1} />
        </div>
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl relative overflow-hidden">
        <Shimmer delay={0.2} />
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
            <Shimmer delay={i * 0.1} />
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
              <Shimmer delay={i * 0.08} />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-slate-200 rounded relative overflow-hidden">
                <Shimmer delay={i * 0.08 + 0.2} />
              </div>
              <div className="h-4 w-1/2 bg-slate-100 rounded relative overflow-hidden">
                <Shimmer delay={i * 0.08 + 0.3} />
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
