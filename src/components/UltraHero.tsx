import { useEffect, useRef, useMemo } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroBackground from '@/assets/hero-bg.jpg';
import { useIsMobile } from '@/hooks/use-mobile';
import logoImage from '/assets/bexy-flowers-logo.webp';
import { useNavigate } from '@/lib/navigation-compat';

gsap.registerPlugin(ScrollTrigger);

const UltraHero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();

  const prefersReducedMotion = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    const hero = heroRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const button = buttonRef.current;
    if (hero && title && subtitle && button) {

      // Skip heavy animations on mobile or reduced motion
      if (isMobile || prefersReducedMotion) {
        gsap.set([title, subtitle, button], { y: 0, opacity: 1 });
        return;
      }

      // Set initial states (no animations, just instant display for better scroll perf)
      gsap.set([title, subtitle, button], { y: 0, opacity: 1 });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, prefersReducedMotion]);

  return (
    <section
      ref={heroRef}
      className={`relative flex items-center justify-center overflow-hidden perspective-1000 text-center ${isMobile ? '-mt-20 md:bg-transparent md:pt-16 md:sm:pt-8' : 'pt-24 sm:pt-32 md:pt-40 lg:pt-48 mt-[-80px]'
        }`}
      style={{
        minHeight: isMobile ? '100dvh' : 'clamp(650px, 100vh, 900px)',
        height: isMobile ? 'auto' : 'clamp(650px, 100vh, 900px)',
        padding: isMobile ? '5rem 1.4rem' : '6rem 2rem'
      }}
    >
      {/* Background Image with 3D Parallax */}
      <div
        className={`absolute inset-0 z-0 ${isMobile ? '' : ''}`}
        style={{
          top: isMobile ? 0 : 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <motion.img
          src={heroBackground}
          alt="Luxury floral background"
          className={`w-full h-full ${isMobile ? 'opacity-70 scale-105 blur-[2px]' : 'transform-3d shadow-gold opacity-10'}`}
          style={{
            objectFit: 'cover',
            objectPosition: 'center center'
          }}
          initial={
            isMobile
              ? { scale: 1.05, opacity: 0 }
              : { scale: shouldReduceMotion ? 1 : 1.2, rotateX: shouldReduceMotion ? 0 : -5 }
          }
          animate={
            isMobile
              ? { opacity: 1, scale: 1 }
              : { scale: 1, rotateX: 0 }
          }
          whileInView={!isMobile ? { scale: 1, rotateX: 0 } : undefined}
          viewport={!isMobile ? { once: true, amount: 0.2 } : undefined}
          transition={{
            // Keep a smooth initial parallax reveal but avoid an infinite loop on desktop
            duration: shouldReduceMotion ? 0 : 20,
            ease: "linear",
            repeat: 0
          }}
          loading="eager"
          decoding="async"
        />
        <div
          className={`absolute inset-0 ${isMobile ? '' : 'bg-gradient-to-b from-background/90 via-background/70 to-background/90'}`}
          style={
            isMobile
              ? {
                background: 'linear-gradient(180deg, rgba(8,8,8,0.15) 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.85) 100%)',
                pointerEvents: 'none'
              }
              : {
                pointerEvents: 'none'
              }
          }
        />
      </div>




      {/* Background Overlays - Mobile */}
      {isMobile && (
        <>
          {/* Soft translucent overlay */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 5%, rgba(255,255,250,0.4) 55%, rgba(255,255,255,0.6) 100%)',
              pointerEvents: 'none'
            }}
          />
          {/* Gold dust subtle particle effect */}
          <div
            className="absolute inset-0 z-10"
            style={{
              backgroundImage: `
                radial-gradient(circle at 10% 20%, rgba(185,136,57,0.03) 0 6%, transparent 7%),
                radial-gradient(circle at 80% 70%, rgba(185,136,57,0.02) 0 8%, transparent 9%)
              `,
              pointerEvents: 'none'
            }}
          />
        </>
      )}

      {/* Soft edge at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          zIndex: 10,
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(8px)'
        }}
      />

      {/* Modern Hero Content */}
      <div className={`relative z-20 max-w-7xl mx-auto w-full ${isMobile ? 'px-4 sm:px-6 h-full flex items-center justify-center py-0' : 'px-4 xs:px-5 sm:px-6 lg:px-8'
        }`}>
        <div className={`${isMobile ? 'w-full max-w-[860px]' : 'grid lg:grid-cols-2'} ${isMobile ? '' : 'gap-6 sm:gap-8 lg:gap-10 xl:gap-12'} items-center ${isMobile ? 'h-full py-0' : ''}`} style={!isMobile ? { minHeight: 'clamp(500px, 60vh, 700px)' } : undefined}>

          {/* Content Container */}
          <div 
            className={`${isMobile ? 'w-full text-center space-y-4 mt-2 mx-auto max-w-[100vw] overflow-x-hidden' : 'space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left pt-8 sm:pt-12 md:pt-16 lg:pt-20'}`}
            style={!isMobile ? { transform: 'translateX(-50px)' } : undefined}
          >
            {/* Brand Badge - Mobile - Removed */}
            <motion.div
              ref={titleRef}
              className="overflow-hidden"
              initial={{ opacity: 0, x: shouldReduceMotion || isMobile ? 0 : -100, scale: shouldReduceMotion || isMobile ? 1 : 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: shouldReduceMotion || isMobile ? 0 : 1.5,
                delay: shouldReduceMotion || isMobile ? 0 : 0.2,
                type: shouldReduceMotion || isMobile ? "tween" : "spring",
                stiffness: shouldReduceMotion || isMobile ? undefined : 60,
                damping: shouldReduceMotion || isMobile ? undefined : 15
              }}
              style={{ willChange: shouldReduceMotion || isMobile ? "auto" : "transform, opacity" }}
            >
              <motion.h1
                className={`${isMobile ? 'font-luxury text-[clamp(1.6rem,7vw,2.6rem)]' : 'font-luxury text-3xl md:text-4xl lg:text-5xl xl:text-6xl'} font-bold mb-3 relative`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion || isMobile ? 0 : 0.8, delay: shouldReduceMotion || isMobile ? 0 : 0.4 }}
                style={{
                  color: '#2c2d2a',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
                  letterSpacing: '0.02em',
                  lineHeight: '1.2'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="font-luxury text-sm xs:text-base tracking-[0.3em] font-semibold text-primary mb-2 sm:mb-4 uppercase md:hidden"
                >
                  Bexy Flowers
                </motion.div>
                Elegant Florals for Every Occasion
              </motion.h1>

              {/* Gold Arc - Mobile Only */}
              {isMobile && (
                <motion.div
                  className="block w-[320px] h-[32px] mx-auto mt-1 mb-8 max-w-full"
                  style={{ transformOrigin: 'center' }}
                  initial={{ opacity: 0, y: 6, scaleX: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 320 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(185,136,57,0.3))' }}
                  >
                    {/* Main elegant brush stroke arc */}
                    <path
                      d="M20 22 Q80 8, 160 6 T300 22"
                      stroke="url(#goldGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.95"
                    />
                    {/* Subtle secondary stroke for depth */}
                    <path
                      d="M25 24 Q85 10, 160 8 T295 24"
                      stroke="#d4a574"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.5"
                    />
                    {/* Accent highlights */}
                    <path
                      d="M30 23 Q90 11, 160 9 T290 23"
                      stroke="#f0d9b5"
                      strokeWidth="0.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.3"
                    />

                    {/* Decorative Gold Flowers Along Arc */}
                    {/* Left flower */}
                    <g transform="translate(60, 12)" opacity="0.8">
                      <circle cx="0" cy="0" r="1.5" fill="#d4a574" />
                      <circle cx="-2" cy="0" r="1.2" fill="#b98839" />
                      <circle cx="2" cy="0" r="1.2" fill="#b98839" />
                      <circle cx="0" cy="-2" r="1.2" fill="#b98839" />
                      <circle cx="0" cy="2" r="1.2" fill="#b98839" />
                      <circle cx="-1.4" cy="-1.4" r="0.8" fill="#f0d9b5" />
                      <circle cx="1.4" cy="-1.4" r="0.8" fill="#f0d9b5" />
                      <circle cx="-1.4" cy="1.4" r="0.8" fill="#f0d9b5" />
                      <circle cx="1.4" cy="1.4" r="0.8" fill="#f0d9b5" />
                    </g>

                    {/* Center flower (larger) */}
                    <g transform="translate(160, 6)" opacity="0.9">
                      <circle cx="0" cy="0" r="2" fill="#d4a574" />
                      <circle cx="-2.5" cy="0" r="1.5" fill="#b98839" />
                      <circle cx="2.5" cy="0" r="1.5" fill="#b98839" />
                      <circle cx="0" cy="-2.5" r="1.5" fill="#b98839" />
                      <circle cx="0" cy="2.5" r="1.5" fill="#b98839" />
                      <circle cx="-1.8" cy="-1.8" r="1" fill="#f0d9b5" />
                      <circle cx="1.8" cy="-1.8" r="1" fill="#f0d9b5" />
                      <circle cx="-1.8" cy="1.8" r="1" fill="#f0d9b5" />
                      <circle cx="1.8" cy="1.8" r="1" fill="#f0d9b5" />
                    </g>

                    {/* Right flower */}
                    <g transform="translate(260, 12)" opacity="0.8">
                      <circle cx="0" cy="0" r="1.5" fill="#d4a574" />
                      <circle cx="-2" cy="0" r="1.2" fill="#b98839" />
                      <circle cx="2" cy="0" r="1.2" fill="#b98839" />
                      <circle cx="0" cy="-2" r="1.2" fill="#b98839" />
                      <circle cx="0" cy="2" r="1.2" fill="#b98839" />
                      <circle cx="-1.4" cy="-1.4" r="0.8" fill="#f0d9b5" />
                      <circle cx="1.4" cy="-1.4" r="0.8" fill="#f0d9b5" />
                      <circle cx="-1.4" cy="1.4" r="0.8" fill="#f0d9b5" />
                      <circle cx="1.4" cy="1.4" r="0.8" fill="#f0d9b5" />
                    </g>

                    {/* Small accent flowers */}
                    <g transform="translate(110, 9)" opacity="0.6">
                      <circle cx="0" cy="0" r="1" fill="#d4a574" />
                      <circle cx="-1.2" cy="0" r="0.7" fill="#b98839" />
                      <circle cx="1.2" cy="0" r="0.7" fill="#b98839" />
                      <circle cx="0" cy="-1.2" r="0.7" fill="#b98839" />
                      <circle cx="0" cy="1.2" r="0.7" fill="#b98839" />
                    </g>

                    {/* Small accent flowers - Right */}
                    <g transform="translate(210, 9)" opacity="0.6">
                      <circle cx="0" cy="0" r="1" fill="#d4a574" />
                      <circle cx="-1.2" cy="0" r="0.7" fill="#b98839" />
                      <circle cx="1.2" cy="0" r="0.7" fill="#b98839" />
                      <circle cx="0" cy="-1.2" r="0.7" fill="#b98839" />
                      <circle cx="0" cy="1.2" r="0.7" fill="#b98839" />
                    </g>

                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b98839" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#d4a574" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#b98839" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              )}

              {/* Mobile CTA Button - Before subtitle */}
              {isMobile && (
                <motion.button
                  type="button"
                  onClick={() => navigate('/collection')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(23,23,23,0.95)] via-[rgba(38,38,38,0.85)] to-[rgba(23,23,23,0.95)] text-white rounded-full font-semibold tracking-[0.08em] shadow-[0_10px_22px_rgba(12,12,12,0.25)] transition-all duration-200 border border-white/10 mx-auto mb-6 w-[55%] max-w-[220px]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 1.1 }}
                  style={{ letterSpacing: '0.12em' }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 18px 36px rgba(12,12,12,0.28)',
                    background: 'linear-gradient(90deg, rgba(185,136,57,0.95), rgba(141,104,39,0.92))'
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  SHOP NOW
                  <span className="inline-flex w-5 h-5 rounded-full items-center justify-center text-[0.85rem] bg-gradient-to-r from-[rgba(185,136,57,0.95)] to-[rgba(199,158,72,0.95)] text-white shadow-[0_2px_6px_rgba(185,136,57,0.35)]">
                    →
                  </span>
                </motion.button>
              )}

              {/* Microcopy - Mobile */}
              {isMobile && (
                <motion.p
                  className="text-xs text-gray-600 text-center mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  Free consultation • No obligation
                </motion.p>
              )}

              {/* Subtitle with elegant reveal */}
              <motion.div
                className={`relative overflow-hidden ${isMobile ? '' : ''}`}
                initial={{ opacity: 0, y: shouldReduceMotion || isMobile ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion || isMobile ? 0 : 1, delay: shouldReduceMotion || isMobile ? 0 : 0.8 }}
                style={{ willChange: shouldReduceMotion || isMobile ? "auto" : "transform, opacity" }}
              >
                <motion.div
                  className={`${isMobile ? 'text-[1.05rem] text-gray-600 font-light max-w-[62ch] mx-auto mb-6' : 'text-sm xs:text-base sm:text-lg'} font-light tracking-wide ${isMobile ? '' : 'mb-2 px-2 sm:px-0'} ${isMobile
                      ? 'font-luxury'
                      : 'font-luxury text-primary/100'
                    } relative`}
                  initial={{ opacity: shouldReduceMotion || isMobile ? 1 : 0.5, x: shouldReduceMotion || isMobile ? 0 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: shouldReduceMotion || isMobile ? 0 : 1.2, delay: shouldReduceMotion || isMobile ? 0 : 1, ease: "easeOut" }}
                  style={{ willChange: shouldReduceMotion || isMobile ? "auto" : "transform, opacity" }}
                >
                  <span
                    className={`inline-block font-medium ${isMobile ? 'drop-shadow-sm' : 'drop-shadow-md'}`}
                    style={{
                      color: '#2c2d2a',
                      fontSize: isMobile ? 'clamp(0.95rem, 3.5vw, 1.15rem)' : undefined,
                      lineHeight: isMobile ? '1.6' : '1.5',
                      textShadow: isMobile
                        ? '0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.15)'
                        : '0 1px 3px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.2)',
                      background: isMobile ? undefined : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(229,228,226,0.4))',
                      padding: isMobile ? '0.25rem 0.5rem' : '0.5rem 1rem',
                      borderRadius: isMobile ? '8px' : '12px',
                      backdropFilter: isMobile ? undefined : 'blur(8px)'
                    }}
                  >
                    Crafting timeless beauty through refined floral artistry
                  </span>

                  {/* Decorative line - hidden on mobile */}
                  {!isMobile && (
                    <motion.div
                      className="absolute -bottom-1 left-0 h-px bg-gradient-to-r from-primary/50 to-transparent"
                      initial={{ width: 0 }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
                    />
                  )}
                </motion.div>
              </motion.div>

              {/* Mobile CTA Button - After subtitle - REMOVED from here */}

              {/* Description with typewriter effect - Hidden on mobile */}
              {!isMobile && (
                <motion.div
                  className="relative overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <motion.div
                    className="font-body text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl relative px-2 sm:px-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    style={{ willChange: "opacity" }}
                  >
                    <motion.span
                      className="inline-block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.1, delay: 1.6 }}
                    >
                      From intimate weddings to grand celebrations, we design bespoke floral arrangements that elevate life's most meaningful moments.
                    </motion.span>

                    {/* Removed typing cursor */}

                    {/* Background highlight */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-yellow-400/5 rounded-lg"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 2, delay: 2, ease: "easeOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>


            {/* Action Buttons - Desktop */}
            {!isMobile && (
              <motion.div
                ref={buttonRef}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                style={{ willChange: "transform, opacity" }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="font-body text-sm xs:text-base sm:text-lg px-5 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 font-semibold shadow-lg transition-all duration-300 relative overflow-hidden group touch-target min-h-[44px] sm:min-h-[auto] w-full sm:w-auto bg-gradient-to-r from-[rgb(209,162,73)] via-[rgb(229,182,93)] to-[rgb(209,162,73)] text-white hover:shadow-xl hover:shadow-[rgba(209,162,73,0.3)] rounded-full"
                    onClick={() => {
                      const el = document.querySelector('[data-section="signature-collection"]');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        window.location.href = '/collection';
                      }
                    }}
                  >
                    <motion.span
                      className="relative z-10"
                      initial={{ opacity: 1 }}
                      whileHover={{ opacity: 0.9 }}
                    >
                      Start Exploring
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-body text-sm xs:text-base sm:text-lg px-5 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 border-2 border-slate-300/50 text-slate-600 hover:border-primary/60 hover:bg-primary/5 hover:text-primary transition-all duration-300 rounded-full backdrop-blur-sm relative overflow-hidden group touch-target min-h-[44px] sm:min-h-[auto] w-full sm:w-auto"
                    onClick={() => {
                      // Open WhatsApp
                      const whatsappNumber = '96176104882';
                      const message = encodeURIComponent("Hi! I'm interested in learning more about your floral services.");
                      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
                      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <motion.span
                      className="relative z-10"
                      initial={{ opacity: 1 }}
                      whileHover={{ opacity: 0.9 }}
                    >
                      Let's Talk
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Microcopy below CTAs - Desktop */}
            {!isMobile && (
              <motion.p
                className="text-sm text-slate-500 text-center lg:text-left mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Free consultation • No obligation • Luxury guaranteed
              </motion.p>
            )}

            {/* Statistics with Enhanced Animations - Hidden on mobile */}
            {!isMobile && (
              <motion.div
                className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 lg:gap-6 xl:gap-8 pt-4 sm:pt-6 lg:pt-8"
                initial={{ opacity: 0, y: shouldReduceMotion || isMobile ? 0 : 50, scale: shouldReduceMotion || isMobile ? 1 : 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: shouldReduceMotion || isMobile ? 0 : 1.2,
                  delay: shouldReduceMotion || isMobile ? 0 : 1.8,
                  type: shouldReduceMotion || isMobile ? "tween" : "spring",
                  stiffness: shouldReduceMotion || isMobile ? undefined : 60,
                  damping: shouldReduceMotion || isMobile ? undefined : 15
                }}
                style={{ willChange: shouldReduceMotion || isMobile ? "auto" : "transform, opacity" }}
              >
                {[
                  { number: "1+", label: "Years of Excellence", color: "#c6a151" },
                  { number: "100+", label: "Premium Varieties", color: "#ffd700" },
                  { number: "98%", label: "Client Satisfaction", color: "#e4b55c" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center group cursor-pointer relative"
                    initial={{ opacity: 0, y: shouldReduceMotion || isMobile ? 0 : 30, rotateX: shouldReduceMotion || isMobile ? 0 : -45 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: shouldReduceMotion || isMobile ? 0 : 0.8,
                      delay: shouldReduceMotion || isMobile ? 0 : 2 + index * 0.3,
                      type: shouldReduceMotion || isMobile ? "tween" : "spring",
                      stiffness: shouldReduceMotion || isMobile ? undefined : 100,
                      damping: shouldReduceMotion || isMobile ? undefined : 15
                    }}
                    whileHover={isMobile ? {} : {
                      scale: 1.08,
                      y: -8,
                      rotateY: 5,
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                    style={{ willChange: shouldReduceMotion || isMobile ? "auto" : "transform, opacity" }}
                  >
                    {/* Background glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-2xl blur-xl"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 2.5 + index * 0.3 }}
                      whileHover={{
                        scale: 1.2,
                        opacity: 0.3,
                        transition: { duration: 0.3 }
                      }}
                    />

                    {/* Number with counting animation */}
                    <motion.div
                      className="font-luxury text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground relative z-10"
                      initial={{ scale: shouldReduceMotion || isMobile ? 1 : 0.5, opacity: shouldReduceMotion || isMobile ? 1 : 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: shouldReduceMotion || isMobile ? 0 : 0.8,
                        delay: shouldReduceMotion || isMobile ? 0 : 2.2 + index * 0.3,
                        type: shouldReduceMotion || isMobile ? "tween" : "spring",
                        stiffness: shouldReduceMotion || isMobile ? undefined : 200,
                        damping: shouldReduceMotion || isMobile ? undefined : 15
                      }}
                      whileHover={isMobile ? {} : {
                        color: stat.color,
                        scale: 1.1,
                        textShadow: `0 0 20px ${stat.color}40`,
                        transition: { duration: 0.3 }
                      }}
                      style={{ willChange: shouldReduceMotion || isMobile ? "auto" : "transform, opacity" }}
                    >
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 2.4 + index * 0.3 }}
                      >
                        {stat.number}
                      </motion.span>

                      {/* Animated underline with color */}
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full"
                        style={{ backgroundColor: stat.color }}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "80%", opacity: 1 }}
                        transition={{ duration: 1, delay: 2.8 + index * 0.3, ease: "easeOut" }}
                        whileHover={{
                          width: "100%",
                          boxShadow: `0 0 10px ${stat.color}60`,
                          transition: { duration: 0.3 }
                        }}
                      />
                    </motion.div>

                    {/* Label with typewriter effect */}
                    <motion.div
                      className="font-body text-xs xs:text-sm text-muted-foreground mt-1 sm:mt-2 relative z-10"
                      initial={{ opacity: shouldReduceMotion || isMobile ? 1 : 0, y: shouldReduceMotion || isMobile ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: shouldReduceMotion || isMobile ? 0 : 0.6, delay: shouldReduceMotion || isMobile ? 0 : 2.6 + index * 0.3 }}
                      whileHover={isMobile ? {} : {
                        color: stat.color,
                        scale: 1.05,
                        transition: { duration: 0.3 }
                      }}
                      style={{ willChange: shouldReduceMotion || isMobile ? "auto" : "transform, opacity" }}
                    >
                      <motion.span
                        className="inline-block"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1, delay: 2.8 + index * 0.3 }}
                      >
                        {stat.label}
                      </motion.span>

                      {/* Decorative dot */}
                      <motion.div
                        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: stat.color }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 3 + index * 0.3 }}
                        whileHover={{
                          scale: 1.5,
                          boxShadow: `0 0 8px ${stat.color}80`,
                          transition: { duration: 0.3 }
                        }}
                      />
                    </motion.div>

                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right Content - Hidden on mobile if single column */}
          <div className={`relative ${isMobile ? 'hidden' : ''} lg:block`}>
            {/* Flower Image with Clean Transitions */}
            <motion.div
              className="relative"
              initial={{
                opacity: shouldReduceMotion ? 1 : 0,
                x: shouldReduceMotion ? 0 : 300,
                scale: shouldReduceMotion ? 1 : 0.8
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1.5,
                delay: shouldReduceMotion ? 0 : 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{ willChange: shouldReduceMotion ? "auto" : "transform, opacity" }}
            >
              <div className="relative w-full perspective-1000" style={{ transformStyle: "preserve-3d", willChange: "transform", height: 'clamp(360px, 50vh, 650px)' }}>
                {/* Subtle glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl scale-110"
                  animate={{
                    scale: [1.1, 1.2, 1.1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Main flower image */}
                <motion.img
                  src="/assets/flower1.webp"
                  alt="Elegant flower for every single occasion"
                  className="relative w-full h-full object-contain z-10 ml-4 md:ml-6 lg:ml-8"
                  initial={{
                    filter: shouldReduceMotion ? "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" : "blur(8px) brightness(0.9) drop-shadow(0 0 15px rgba(0,0,0,0.6)) drop-shadow(0 0 25px rgba(0,0,0,0.4))",
                    scale: shouldReduceMotion ? 1.2 : 1.15
                  }}
                  animate={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                    scale: 1.2
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 1.2,
                    delay: shouldReduceMotion ? 0 : 0.5,
                    ease: "easeOut"
                  }}
                  loading="eager"
                  decoding="async"
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                    transformStyle: "preserve-3d",
                    willChange: shouldReduceMotion ? "auto" : "transform, filter"
                  }}
                />

              </div>
            </motion.div>

            {/* Glassmorphism Service Cards - Hidden on smaller screens */}
            <motion.div
              className="absolute -right-12 md:-right-16 lg:-right-24 top-8 space-y-4 lg:space-y-6 hidden xl:block"
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 50, scale: shouldReduceMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1,
                delay: shouldReduceMotion ? 0 : 0.5,
                type: shouldReduceMotion ? "tween" : "spring",
                stiffness: shouldReduceMotion ? undefined : 80,
                damping: shouldReduceMotion ? undefined : 12
              }}
              style={{ willChange: shouldReduceMotion ? "auto" : "transform, opacity" }}
            >
              {[
                {
                  icon: "M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.27L5.82 21L7 14L2 9L8.91 8.26L12 2Z",
                  title: "Wedding Arrangements",
                  link: "/wedding-and-events"
                },
                {
                  icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
                  title: "Custom Bouquets",
                  link: "/customize"
                },
                {
                  icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 1c1.93 0 3.5 1.57 3.5 3.5V17h-7v-.5c0-1.93 1.57-3.5 3.5-3.5z",
                  title: "Event Decor",
                  link: "/wedding-and-events"
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="relative group cursor-pointer"
                  initial={{ opacity: 0, x: 30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.7 + index * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.05,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(service.link)}
                >
                  <motion.div
                    className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl p-4 pr-6 shadow-2xl hover:shadow-[0_30px_60px_rgba(198,161,81,0.25)] hover:bg-white/25 hover:border-[rgba(198,161,81,0.5)] transition-all duration-500 relative overflow-hidden"
                    whileHover={{
                      borderColor: "rgba(198,161,81,0.6)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <motion.div
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{
                          scale: 1.1,
                          rotate: 5,
                          backgroundColor: "rgba(198,161,81,0.3)",
                          transition: { duration: 0.3 }
                        }}
                      >
                        <motion.svg
                          className="w-5 h-5 text-white drop-shadow-lg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          whileHover={{
                            scale: 1.1,
                            rotate: -5,
                            transition: { duration: 0.3 }
                          }}
                        >
                          <path d={service.icon} />
                        </motion.svg>
                      </motion.div>
                      <motion.span
                        className="font-body font-semibold text-white drop-shadow-lg"
                        whileHover={{
                          color: "#c6a151",
                          transition: { duration: 0.3 }
                        }}
                      >
                        {service.title}
                      </motion.span>
                    </div>

                    {/* Animated background gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-yellow-400/5 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Advanced Scroll Indicator - Desktop */}
      {!isMobile && (
        <div
          className="absolute bottom-8 left-[47%] transform -translate-x-1/2 z-40"
          style={{ opacity: 1 }}
        >
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-muted-foreground cursor-pointer group"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="font-body text-xs sm:text-sm mb-1 tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
              DISCOVER LUXURY
            </span>
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full border border-primary/30 bg-white/60 shadow-lg shadow-primary/10 backdrop-blur-sm">
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" strokeWidth={1.5} />
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/40"
                  animate={{ scale: [1, 1.25], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Bouquet Images - Positioned on Left and Right */}
      {/* Removed Mobile Bouquet Images as per request */}

      {/* Mobile Scroll Hint */}
      {isMobile && (
        <>
          {/* Decorative separator */}
          <motion.div
            className="absolute bottom-[110px] left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 0.6, height: 40 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#b98839] to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#b98839] mt-1" />
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4 text-[0.98rem] cursor-pointer"
            style={{ color: '#2c2d2a' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="whitespace-nowrap pt-1">Scroll to discover our premium collections ↓</span>
            <div className="relative w-[30px] h-[48px] rounded-[18px] border-2 border-black mt-1">
              <motion.div
                className="absolute left-1/2 top-3 w-1.5 h-1.5 bg-black rounded-full"
                style={{ transform: 'translateX(-50%)' }}
                animate={{
                  y: [0, 14, 0],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </section>
  );
};

export default UltraHero;