'use client';

import { useRef, memo } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import LazyVideo from "@/components/LazyVideo";
// Video for mobile hero background
const video4Url = '/assets/video/video4.webm';
const posterUrl = '/assets/bexyhero.webp';

const CollectionHeroComponent = () => {
  const heroRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  return (
    <section 
      ref={heroRef}
      className={`relative ${isMobile ? 'h-screen' : 'min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh]'} flex items-center justify-center overflow-hidden ${isMobile ? 'bg-transparent' : 'bg-gradient-to-b from-[#FAF8F3] to-white'}`}
      style={isMobile ? { marginTop: '-80px', paddingTop: '80px' } : { marginTop: '-12.3rem', paddingTop: '50' }}
    >
      {/* Video background for mobile view — LazyVideo handles iOS/slow-network fallback */}
      {isMobile && (
        <LazyVideo
          src={video4Url}
          poster={posterUrl}
          rootMargin="300px"
          ariaLabel="Hero background video"
          style={{
            position: 'absolute',
            width: '100%',
            height: 'calc(100vh + 200px)',
            minHeight: 'calc(100vh + 200px)',
            top: '-80px',
            left: 0,
            right: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Elegant Gradient Background Elements - Hidden on mobile when video is shown */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left golden glow */}
        <motion.div
          className="absolute w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 -top-24 -left-24"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div 
            className="w-full h-full rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(199, 158, 72, 0.2) 0%, rgba(199, 158, 72, 0.1) 40%, transparent 70%)'
            }}
          />
        </motion.div>
        
        {/* Bottom-right rose gold accent */}
        <motion.div
          className="absolute w-56 h-56 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] -bottom-20 -right-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        >
          <div 
            className="w-full h-full rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(184, 138, 68, 0.15) 0%, rgba(184, 138, 68, 0.08) 40%, transparent 70%)'
            }}
          />
        </motion.div>
        
        {/* Center soft glow */}
        <motion.div
          className="absolute w-64 h-64 sm:w-96 sm:h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
        >
          <div 
            className="w-full h-full rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(245, 241, 232, 0.4) 0%, rgba(245, 241, 232, 0.2) 40%, transparent 70%)'
            }}
          />
        </motion.div>
        </div>
      )}

      {/* Hero Content - Elegant Design Matching Product Layout */}
      <div
        className={`relative ${isMobile ? 'z-10' : 'z-20'} text-center max-w-4xl mx-auto ${isMobile ? 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16' : 'px-3 xs:px-4 sm:px-6 lg:px-8'}`}
        style={isMobile ? {} : { marginTop: '12rem', transform: 'scale(0.85)' }}
      >
        <motion.div
          className="space-y-2 sm:space-y-4 md:space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Brand Name */}
          <motion.p 
            className={`uppercase tracking-[0.2em] sm:tracking-ultra-wide text-[10px] sm:text-xs md:text-sm font-semibold ${isMobile ? 'text-white' : 'text-primary/90'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            style={isMobile ? {
              textShadow: '0 3px 12px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)'
            } : {}}
          >
            BEXY SIGNATURE ATELIER
          </motion.p>

          {/* Main Heading */}
          <motion.h1 
            className={`font-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold relative ${isMobile ? 'text-white' : 'text-[#2c2d2a]'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              letterSpacing: '0.02em',
              lineHeight: '1.15',
              ...(isMobile ? {
                textShadow: '0 3px 12px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)'
              } : {})
            }}
          >
            <span className="block">Our Complete</span>
            <span className="block mt-1">Collection</span>
          </motion.h1>

          {/* Golden Divider with Diamond */}
          <motion.div 
            className="relative flex items-center justify-center my-3 sm:my-4 md:my-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            <div className={`w-20 sm:w-24 md:w-32 h-px bg-gradient-to-r ${isMobile ? 'from-transparent via-white/90 to-transparent' : 'from-transparent via-[#C79E48] to-transparent'}`} />
            <div className={`absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 shadow-sm ${isMobile ? 'bg-white/90' : 'bg-[#C79E48]'}`} />
          </motion.div>

          {/* Description */}
          <motion.p 
            className={`text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-body px-2 sm:px-0 ${isMobile ? 'text-white' : 'text-muted-foreground'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            style={isMobile ? {
              textShadow: '0 3px 12px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)'
            } : {}}
          >
            Discover Lebanon&apos;s most luxurious floral portfolio — curated themes, couture arrangements, and limited editions designed to celebrate every exquisite moment.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

// Export memoized version for better performance
export const CollectionHero = memo(CollectionHeroComponent);