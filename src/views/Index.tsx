'use client';

import React, { Suspense, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SEO from "@/components/SEO";
import { orgSchema, webSiteSchema, localBusinessSchema, breadcrumbSchema } from "@/lib/seo";
import {
  Sparkles,
  Wand2,
  Palette,
  Flower2,
  ChevronRight,
  ArrowRight,
  Layers,
  Pen,
  Sparkle,
  Award
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import LazySection from "@/components/LazySection";
import UltraNavigation from "@/components/UltraNavigation";
import BackToTop from "@/components/BackToTop";
import CarouselHero from "@/components/CarouselHero";
import {
  FeaturedBouquetsSkeleton,
  CategoriesSkeleton,
  GenericSectionSkeleton,
  FooterSkeleton
} from "@/components/SectionSkeletons";

const UltraFeaturedBouquets = React.lazy(() => import("@/components/UltraFeaturedBouquets"));
const UltraCategories = React.lazy(() => import("@/components/UltraCategories"));
// Replaced heavy interactive builder on home with lightweight CTA
// const VirtualBouquetBuilder = React.lazy(() => import("@/components/interactive/VirtualBouquetBuilder"));
const ZodiacBouquetQuiz = React.lazy(() => import("@/components/culture/ZodiacBouquetQuiz"));
const FlowerCareGuide = React.lazy(() => import("@/components/culture/FlowerCareGuide"));
const Footer = React.lazy(() => import("@/components/Footer"));

// Preload removed - components are lazy loaded on demand
// Aggressive preloading was causing slow initial load on mobile

// Professional Custom Bouquet Section Component - Optimized for performance
const ProfessionalCustomSection = React.memo(() => {
  const isMobile = useIsMobile();

  const features = [
    {
      icon: Pen,
      title: "ARTISAN CRAFTED",
      subtitle: "Style Presets",
      description: "Start with romantic, modern, or avant-garde styles. Our master florists guide your creative vision.",
      gradientColors: ["#C29A43", "#D4A85A", "#E8C882"],
      direction: "left"
    },
    {
      icon: Sparkle,
      title: "BESPOKE PALETTES",
      subtitle: "Color Stories",
      description: "Explore professionally curated color harmonies. Each palette tells a unique story for your occasion.",
      gradientColors: ["#B7893C", "#C79E48", "#D4A85A"],
      direction: "center"
    },
    {
      icon: Award,
      title: "LUXURY BLOOMS",
      subtitle: "Premium Selection",
      description: "Exclusively sourced seasonal flowers. Hand-selected for uncompromising quality and elegance.",
      gradientColors: ["#A67C37", "#B88A44", "#CFA340"],
      direction: "right"
    }
  ];

  return (
    <section 
      className={`relative ${isMobile ? 'py-6' : 'py-12 sm:py-16 md:py-24 lg:py-32'} px-4 sm:px-6 lg:px-8 overflow-hidden`}
      style={{
        background: 'linear-gradient(180deg, #faf7f3 0%, #ffffff 100%)'
      }}
    >
      {/* Optimized Floating Background Elements - Static (removed infinite animations for performance) */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-[#C79E48]/8 to-transparent rounded-full blur-2xl opacity-50"
          />
          <div
            className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#B88A44]/8 to-transparent rounded-full blur-2xl opacity-50"
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Premium Header */}
        <div
          className={`text-center ${isMobile ? 'mb-6' : 'mb-12 sm:mb-16 md:mb-20'} relative px-2`}
        >
          {/* Modern Floating Badge - Hidden on mobile */}
          {!isMobile && (
            <div 
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-slate-800/10 to-slate-700/10 backdrop-blur-xl border border-slate-600/20 mb-6 sm:mb-8"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-normal uppercase" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Professional Customization</span>
            </div>
          )}

          {/* Main Title - Luxury Typography with Gold Accent */}
          <h2
            className={`font-luxury ${isMobile ? 'text-xl' : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl'} font-normal ${isMobile ? 'mb-2' : 'mb-4 sm:mb-6'} relative`}
            style={{
              background: 'linear-gradient(135deg, #2c2d2a 0%, #3D3027 50%, #2c2d2a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              letterSpacing: '-0.02em',
              lineHeight: '1.2em'
            }}
          >
            DESIGN YOUR
            {!isMobile && <br />}
            PERFECT BOUQUET
            {/* Animated Gold Underline */}
            <div
              className={`absolute ${isMobile ? '-bottom-0.5 h-0.5' : '-bottom-1 sm:-bottom-2 h-0.5 sm:h-1'} left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#C79E48] to-[#D4A85A] rounded-full`}
              style={{ width: isMobile ? '80px' : 'clamp(120px, 30vw, 200px)' }}
            />
          </h2>

          {/* Enhanced Decorative Elements - Simplified on mobile */}
          {!isMobile && (
            <div className="relative mb-4 sm:mb-6 md:mb-8">
              <div className="w-24 sm:w-32 md:w-40 h-0.5 bg-gradient-to-r from-transparent via-[#C79E48]/60 to-transparent mx-auto" />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-[#C79E48] rotate-45 shadow-lg shadow-[#C79E48]/50" />
            </div>
          )}

          {/* Subtitle - Enhanced Description - Simplified on mobile */}
          <p
            className={`font-body ${isMobile ? 'text-xs mb-0' : 'text-sm sm:text-base md:text-lg lg:text-xl'} max-w-4xl mx-auto ${isMobile ? 'leading-tight' : 'leading-relaxed'} font-light px-2`}
            style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
          >
            {isMobile ? (
              'Create a bespoke floral masterpiece with unlimited creative freedom.'
            ) : (
              <>
                Create a bespoke floral masterpiece with unlimited creative freedom.
                <br className="hidden sm:block" />
                Choose from our curated premium selection and design something uniquely yours.
              </>
            )}
          </p>
        </div>

        {/* Feature Cards - Premium Grid */}
        <div className={`relative ${isMobile ? 'mb-6' : 'mb-16'}`}>
          {/* Optimized decorative elements - reduced for performance - Hidden on mobile */}
          {!isMobile && (
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute top-6 left-8 w-40 h-40 rounded-full bg-[#F1E2CE]/30 blur-xl opacity-60" />
              <div className="absolute bottom-4 right-20 w-48 h-48 rounded-full bg-[#F6EADC]/25 blur-xl opacity-60" />
            </div>
          )}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${isMobile ? 'gap-3' : 'gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12'}`}>
            {features.map((feature, index) => {
              const gradient135 = `linear-gradient(135deg, ${feature.gradientColors[0]} 0%, ${feature.gradientColors[1]} 50%, ${feature.gradientColors[2]} 100%)`;
              const gradient90 = `linear-gradient(90deg, ${feature.gradientColors[0]} 0%, ${feature.gradientColors[1]} 50%, ${feature.gradientColors[2]} 100%)`;
              const gradient225 = `linear-gradient(225deg, ${feature.gradientColors[0]} 0%, ${feature.gradientColors[1]} 50%, ${feature.gradientColors[2]} 100%)`;
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="group relative"
                >
                  <motion.div
                    className={`relative h-full ${isMobile ? 'p-3 rounded-xl' : 'p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl'} overflow-hidden border border-[#C6A15B]/20 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.05)] transition-all duration-300`}
                    style={{
                      background: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                      willChange: 'transform, box-shadow'
                    }}
                    whileHover={!isMobile ? {
                      y: -12,
                      boxShadow: '0 20px 45px rgba(0,0,0,0.10)',
                      borderColor: 'rgba(194, 154, 67, 0.35)'
                    } : {}}
                    transition={{ duration: 0.35 }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                      style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(194, 154, 67, 0.03) 100%)' }}
                      transition={{ duration: 0.4 }}
                    />

                    <motion.div
                      className={`relative ${isMobile ? 'w-8 h-8 mb-2 rounded-lg' : 'w-10 h-10 sm:w-12 sm:h-12 md:w-[48px] md:h-[48px] mb-3 rounded-xl sm:rounded-2xl'} flex items-center justify-center shadow-[0_3px_12px_rgba(198,161,91,0.25)]`}
                      style={{ 
                        background: gradient135, 
                        boxShadow: '0 8px 24px rgba(194, 154, 67, 0.3)',
                        willChange: 'transform'
                      }}
                      whileHover={!isMobile ? { scale: 1.12, rotate: 8 } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Icon - Ensure it stays visible with proper z-index */}
                      <Icon 
                        className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.25)] relative z-10`}
                        strokeWidth={1.6} 
                        style={{ pointerEvents: 'none' }}
                      />
                      {/* Optimized Glow Effect - Removed expensive blur filter - Hidden on mobile */}
                      {!isMobile && (
                        <motion.div
                          className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-30 pointer-events-none -z-10"
                          style={{ background: gradient135, transform: 'scale(1.2)' }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                    </motion.div>

                    <h3
                      className={`${isMobile ? 'text-[0.5rem] mb-0.5' : 'text-[0.6rem] sm:text-[0.65rem]'} font-normal uppercase`}
                      style={{ color: '#B88A44', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                    >
                      {feature.title}
                    </h3>

                    <motion.h4
                      className={`${isMobile ? 'text-sm mb-1' : 'text-base sm:text-lg mb-2'} font-normal transition-all duration-300`}
                      style={{ color: '#2c2d2a', letterSpacing: '-0.02em', fontFamily: "'EB Garamond', serif" }}
                      whileHover={!isMobile ? { color: '#B88A44' } : {}}
                    >
                      {feature.subtitle}
                    </motion.h4>

                    <motion.div
                      className={`h-[2px] ${isMobile ? 'mb-2' : 'mb-3 sm:mb-4'} rounded-full`}
                      style={{ background: gradient90, width: isMobile ? '30px' : '40px' }}
                      whileHover={!isMobile ? { width: '60px' } : {}}
                      transition={{ duration: 0.4 }}
                    />

                    <p
                      className={`${isMobile ? 'leading-tight text-xs' : 'leading-relaxed text-sm sm:text-base'}`}
                      style={{ color: '#525252', lineHeight: isMobile ? '1.4' : '1.7' }}
                    >
                      {feature.description}
                    </p>

                    <div
                      className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
                      style={{ background: gradient225, borderRadius: '0 16px 0 100%' }}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button Section - Elegant Frame */}
        <div
          className={`relative text-center ${isMobile ? 'mt-4' : 'mt-6 sm:mt-8'}`}
        >
          {/* Elegant Decorative Frame - Hidden on mobile */}
          <div className={`relative ${isMobile ? 'inline-block px-2 py-3' : 'inline-block px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10 lg:py-12'}`}>
            {!isMobile && (
              <>
                {/* Top Left Corner */}
                <div
                  className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                  style={{
                    borderTop: '2px solid rgba(194, 154, 67, 0.3)',
                    borderLeft: '2px solid rgba(194, 154, 67, 0.3)',
                  }}
                />
                
                {/* Top Right Corner */}
                <div
                  className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                  style={{
                    borderTop: '2px solid rgba(194, 154, 67, 0.3)',
                    borderRight: '2px solid rgba(194, 154, 67, 0.3)',
                  }}
                />
                
                {/* Bottom Left Corner */}
                <div
                  className="absolute bottom-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                  style={{
                    borderBottom: '2px solid rgba(194, 154, 67, 0.3)',
                    borderLeft: '2px solid rgba(194, 154, 67, 0.3)',
                  }}
                />
                
                {/* Bottom Right Corner */}
                <div
                  className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                  style={{
                    borderBottom: '2px solid rgba(194, 154, 67, 0.3)',
                    borderRight: '2px solid rgba(194, 154, 67, 0.3)',
                  }}
                />

                {/* Floating Particles - Static (removed infinite animations for performance) */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[#C79E48] opacity-50"
                    style={{
                      top: `${20 + Math.sin(i * Math.PI / 2) * 40}%`,
                      left: `${50 + Math.cos(i * Math.PI / 2) * 45}%`
                    }}
                  />
                ))}
              </>
            )}

            {/* CTA Button */}
            <motion.a
              href="/customize"
              className={`group inline-flex items-center ${isMobile ? 'gap-2 px-4 py-2.5' : 'gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5'} rounded-lg sm:rounded-xl md:rounded-2xl font-normal text-white relative overflow-hidden ${isMobile ? 'w-full' : 'w-full sm:w-auto'} touch-target min-h-[44px] ${isMobile ? 'text-xs' : 'text-xs sm:text-sm md:text-base'}`}
              style={{
                fontFamily: "'EB Garamond', serif",
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #B88A44 0%, #D4A85A 50%, #CFA340 100%)',
                boxShadow: '0 8px 32px rgba(184, 138, 68, 0.4)',
                fontSize: isMobile ? '0.75rem' : 'clamp(0.875rem, 2vw, 1.1rem)',
                willChange: 'transform, box-shadow'
              }}
              whileHover={!isMobile ? {
                scale: 1.05,
                boxShadow: '0 12px 48px rgba(194, 154, 67, 0.5)'
              } : {}}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
            <span className={`relative z-10 uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-xs sm:text-sm md:text-base'}`}>
              Start Designing Now
            </span>
            <div className="relative z-10">
              <ArrowRight className={isMobile ? "w-3 h-3" : "w-4 h-4 sm:w-5 sm:h-5"} strokeWidth={2.5} />
            </div>
            </motion.a>

            {/* Trust Badge - Hidden on mobile */}
            {!isMobile && (
              <p
                className="mt-4 sm:mt-6 text-xs sm:text-sm px-2"
                style={{
                  color: '#737373',
                  letterSpacing: '0.02em'
                }}
              >
                ✨ Trusted by over 10,000+ satisfied customers worldwide
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

ProfessionalCustomSection.displayName = 'ProfessionalCustomSection';

const Index = () => {
  // Preload removed - components are lazy loaded on demand to improve mobile performance

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <SEO
        title="Lebanon's Premier Luxury Florist"
        description="Lebanon's most luxurious floral portfolio. Premium custom bouquets, wedding flowers, eternal flowers &amp; couture arrangements. AI-powered flower customization. Order online."
        canonical="/"
        keywords="flowers Lebanon, luxury florist Lebanon, custom bouquets, wedding flowers Beirut, eternal flowers, premium flower delivery, Sidon florist, AI flower design, online flower shop Lebanon"
        jsonLd={[orgSchema(), webSiteSchema(), localBusinessSchema()]}
      />
      <UltraNavigation />
      <div className="relative z-10">
        <CarouselHero isHomepage={true} />
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={<FeaturedBouquetsSkeleton />}>
            <UltraFeaturedBouquets />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={<CategoriesSkeleton />}>
            <UltraCategories />
          </Suspense>
        </LazySection>
        {/* Professional Custom Bouquet Design Section - Premium Redesign */}
        <LazySection rootMargin="400px 0px">
          <ProfessionalCustomSection />
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={<GenericSectionSkeleton />}>
            <ZodiacBouquetQuiz />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={<GenericSectionSkeleton />}>
            <FlowerCareGuide />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="600px 0px">
          <Suspense fallback={<FooterSkeleton />}>
            <Footer />
          </Suspense>
        </LazySection>
      </div>
      <BackToTop />
    </div>
  );
};

export default Index;
