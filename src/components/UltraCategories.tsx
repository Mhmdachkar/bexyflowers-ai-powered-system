'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from '@/lib/navigation-compat';
import { Heart, Gift, Cake, Crown, Briefcase, Flower2, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { encodeImageUrl, getResponsiveImageProps } from '@/lib/imageUtils';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    id: 1,
    name: "WEDDINGS",
    description: "Architectural bridal arrangements",
    image: "/assets/wedding-events/wedding/IMG-20251126-WA0021.webp",
    gradient: "from-rose-200/20 via-amber-100/30 to-yellow-200/20",
    icon: Crown,
    color: "from-rose-400/80 to-amber-300/90",
    filterValue: "wedding-percent-events"
  },
  {
    id: 2,
    name: "VALENTINE'S",
    description: "Romantic luxury collections",
    image: "/assets/valentine/IMG_4172.webp",
    gradient: "from-red-200/20 via-pink-100/30 to-rose-200/20",
    icon: Heart,
    color: "from-red-400/80 to-pink-300/90",
    filterValue: "valentine"
  },
  {
    id: 3,
    name: "MOTHER'S DAY",
    description: "Elegant tribute arrangements",
    image: "/assets/mother day/IMG_8394.webp",
    gradient: "from-pink-200/20 via-rose-100/30 to-lavender-200/20",
    icon: Flower2,
    color: "from-pink-400/80 to-rose-300/90",
    filterValue: "mother-day"
  },
  {
    id: 4,
    name: "BIRTHDAYS",
    description: "Celebration masterpieces",
    image: "/assets/birthday/IMG_3730 (1).webp",
    gradient: "from-purple-200/20 via-violet-100/30 to-indigo-200/20",
    icon: Cake,
    color: "from-purple-400/80 to-violet-300/90",
    filterValue: "birthday"
  },
  {
    id: 5,
    name: "ANNIVERSARIES",
    description: "Timeless love expressions",
    image: "/assets/red roses/red roses the letter J.webp",
    gradient: "from-amber-200/20 via-yellow-100/30 to-gold-200/20",
    icon: Star,
    color: "from-amber-400/80 to-yellow-300/90",
    filterValue: "red-roses"
  },
  {
    id: 6,
    name: "CORPORATE",
    description: "Professional luxury designs",
    image: "/assets/wedding-events/events/IMG-20251126-WA0022.webp",
    gradient: "from-slate-200/20 via-gray-100/30 to-zinc-200/20",
    icon: Briefcase,
    color: "from-slate-400/80 to-gray-300/90",
    filterValue: "wedding-percent-events"
  },
  {
    id: 8,
    name: "SEASONAL",
    description: "Limited edition collections",
    image: "/assets/hand band/IMG_5392.webp",
    gradient: "from-emerald-200/20 via-green-100/30 to-teal-200/20",
    icon: Sparkles,
    color: "from-emerald-400/80 to-green-300/90",
    filterValue: "hand-band"
  },
  {
    id: 9,
    name: "GRADUATION",
    description: "Achievement celebrations",
    image: "/assets/graduation/IMG_0295.webp",
    gradient: "from-blue-200/20 via-indigo-100/30 to-purple-200/20",
    icon: Star,
    color: "from-blue-400/80 to-indigo-300/90",
    filterValue: "graduation"
  },
  {
    id: 10,
    name: "LUXURY GIFTS",
    description: "Premium gift arrangements",
    image: "/assets/red%20roses/large%20red%20roses%20flower%20bouquet%20with%20gliter.webp",
    gradient: "from-orange-200/20 via-amber-100/30 to-yellow-200/20",
    icon: Gift,
    color: "from-orange-400/80 to-amber-300/90",
    filterValue: "red-roses"
  }
];

// ⚡ PERFORMANCE: Check if device is mobile - skip heavy GSAP animations
const isMobileDevice = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const UltraCategories = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileRow1Ref = useRef<HTMLDivElement>(null);
  const mobileRow2Ref = useRef<HTMLDivElement>(null);
  // Removed isAutoScroll state to force auto scroll always

  const handleExplore = (filterValue: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    navigate(`/collection?category=${filterValue}`);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  // Scroll-reveal animations for title and description (sliding from left to right)
  // ⚡ PERFORMANCE: Skip GSAP ScrollTrigger on mobile - use CSS animations instead
  useEffect(() => {
    // Skip heavy GSAP animations on mobile for better scroll performance
    if (isMobileDevice()) {
      return;
    }
    
    const title = titleRef.current;
    const description = descriptionRef.current;
    const section = sectionRef.current;

    if (title && description && section) {
      const ctx = gsap.context(() => {
        // Animate title sliding from left to right
        gsap.fromTo(
          title,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );

        // Animate description sliding from left to right
        gsap.fromTo(
          description,
          { x: -80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            delay: 0.3,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }, section);

      return () => ctx.revert();
    }
  }, []);

  // Scroll-reveal animations for category cards (desktop)
  // ⚡ PERFORMANCE: Skip on mobile
  useEffect(() => {
    if (isMobileDevice()) {
      return;
    }
    
    const container = containerRef.current;
    const section = sectionRef.current;

    if (container && section) {
      const ctx = gsap.context(() => {
        // Get first set of cards (not duplicates)
        const cards = container.querySelectorAll('.category-card-desktop');
        
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            {
              y: 60,
              opacity: 0,
              scale: 0.95,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: container,
                start: "top 75%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }, section);

      return () => ctx.revert();
    }
  }, []);

  // Scroll-reveal animations for category cards (mobile)
  // ⚡ PERFORMANCE: DISABLED on mobile - GSAP ScrollTrigger causes scroll jank
  // Cards will be visible immediately with CSS, no animation needed
  useEffect(() => {
    // Skip GSAP animations on mobile entirely for smooth scrolling
    if (isMobileDevice()) {
      return;
    }
    
    const row1 = mobileRow1Ref.current;
    const row2 = mobileRow2Ref.current;
    const section = sectionRef.current;

    if ((row1 || row2) && section) {
      const ctx = gsap.context(() => {
        // Animate row 1 cards
        if (row1) {
          const cards1 = row1.querySelectorAll('.category-card-mobile');
          if (cards1.length > 0) {
            gsap.fromTo(
              cards1,
              {
                x: -50,
                opacity: 0,
              },
              {
                x: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: row1,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              }
            );
          }
        }

        // Animate row 2 cards
        if (row2) {
          const cards2 = row2.querySelectorAll('.category-card-mobile');
          if (cards2.length > 0) {
            gsap.fromTo(
              cards2,
              {
                x: 50,
                opacity: 0,
              },
              {
                x: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: row2,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              }
            );
          }
        }
      }, section);

      return () => ctx.revert();
    }
  }, []);

  // Auto-scroll effect for desktop (single row) - OPTIMIZED VERSION
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // PERFORMANCE: Only enable auto-scroll on desktop
    const isMobile = window.innerWidth < 1024;
    if (isMobile) return;
    
    // PERFORMANCE: Disable on low-end devices to prevent jank
    // Check if device has reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Calculate the width of one set of categories
    const cardWidth = 352;
    const gap = 32;
    const singleSetWidth = categories.length * (cardWidth + gap);
    
    // Reset initial position
    gsap.set(container, { x: 0 });

    let isActive = true;
    let animation: gsap.core.Tween | null = null;
    let isPaused = false;
    
    // Use Intersection Observer to only animate when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isActive && !isPaused) {
            // Start animation when visible
            if (!animation) {
              animation = gsap.to(container, {
                x: -singleSetWidth,
                duration: 40, // Slower duration to reduce CPU usage
                ease: "none",
                repeat: -1,
                modifiers: {
                  x: (x) => {
                    const num = parseFloat(x);
                    return `${num % singleSetWidth}px`;
                  }
                }
              });
            } else {
              animation.resume();
            }
          } else {
            // Pause animation when not visible
            if (animation) {
              animation.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    // Pause on hover for better UX
    const handleMouseEnter = () => {
      isPaused = true;
      if (animation) animation.pause();
    };
    const handleMouseLeave = () => {
      isPaused = false;
      if (animation && isActive) animation.resume();
    };
    
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isActive = false;
      isPaused = true;
      observer.disconnect();
      if (animation) {
        animation.kill();
        animation = null;
      }
      gsap.killTweensOf(container);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [categories.length]);

  // Mobile: Two rows with opposite scroll directions - OPTIMIZED VERSION
  useEffect(() => {
    const row1 = mobileRow1Ref.current;
    const row2 = mobileRow2Ref.current;
    const section = sectionRef.current;
    
    if (!row1 || !row2 || !section) return;
    
    // Only enable on mobile
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    // PERFORMANCE: Disable infinite animations on mobile to save battery and prevent jank
    // These continuous GSAP transforms can cause frame drops on mobile devices
    // Users can still scroll horizontally to see all categories
  }, []);

  const scrollLeft = () => {
    const container = containerRef.current;
    if (container) {
      const currentX = gsap.getProperty(container, "x") as number;
      const newPosition = Math.max(0, currentX + 400);
      
      gsap.to(container, {
        x: -newPosition,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  };

  const scrollRight = () => {
    const container = containerRef.current;
    if (container) {
      const currentX = gsap.getProperty(container, "x") as number;
      const maxScroll = (categories.length * 352) - 1200;
      const newPosition = Math.min(maxScroll, currentX + 400);
      
      gsap.to(container, {
        x: -newPosition,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  };


  return (
    <section 
      ref={sectionRef}
      className="py-16 sm:py-24 md:py-32 px-3 sm:px-4 relative overflow-hidden min-h-screen"
      style={{ background: 'rgb(211, 211, 209)' }}
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, hsl(51 100% 50% / 0.15) 0%, transparent 40%),
                           radial-gradient(circle at 80% 80%, hsl(51 100% 50% / 0.15) 0%, transparent 40%),
                           radial-gradient(circle at 50% 50%, hsl(51 100% 50% / 0.05) 0%, transparent 60%)`
        }} />
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-amber-300/15 to-orange-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-yellow-400/8 to-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-8xl mx-auto relative z-10">
        <div 
          className="text-center mb-12 sm:mb-16 md:mb-20 relative px-2"
        >
          {/* Modern Floating Badge */}
          <div 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-slate-800/10 to-slate-700/10 backdrop-blur-xl border border-slate-600/20 mb-6 sm:mb-8"
          >
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-slate-700 tracking-wider uppercase">Curated Excellence</span>
          </div>

          {/* Luxury Typography with Gold Accent */}
          <h2 
            ref={titleRef}
            className="font-luxury text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-8xl font-normal mb-4 sm:mb-6 relative"
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
            LUXURY COLLECTIONS
            {/* Gold Underline */}
            <div 
              className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 sm:h-1 bg-gradient-to-r from-[#C79E48] to-[#D4A85A] rounded-full"
              style={{ width: 'clamp(120px, 30vw, 200px)' }}
            />
          </h2>

          {/* Enhanced Decorative Elements */}
          <div className="relative mb-4 sm:mb-6 md:mb-8">
            <div className="w-24 sm:w-32 md:w-40 h-0.5 bg-gradient-to-r from-transparent via-[#C79E48]/60 to-transparent mx-auto" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-[#C79E48] rotate-45 shadow-lg shadow-[#C79E48]/50" />
          </div>

          {/* Enhanced Description */}
          <p 
            ref={descriptionRef}
            className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light px-2"
          >
            Discover our meticulously curated floral collections, where each arrangement 
            represents the pinnacle of artistic expression and timeless elegance.
          </p>
        </div>

        {/* Desktop: Single Row Cards Container */}
        <div className="w-full overflow-hidden hidden lg:block">
          <div 
            ref={containerRef} 
            className="flex gap-8" 
            style={{ 
              width: `${categories.length * 2 * 352}px`,
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              perspective: '1000px'
            }}
          >
            {/* Duplicate categories for seamless infinite scroll */}
            {[...categories, ...categories].map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                className={`flex-shrink-0 w-80 h-96 group cursor-pointer ${index < categories.length ? 'category-card-desktop' : ''}`}
                onClick={() => handleExplore(category.filterValue)}
                  style={{ 
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)'
                  }}
              >
                <div className="relative h-full w-full">
                  {/* Ultra-Modern Glassmorphism Card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-slate-50/90 to-slate-100/95 backdrop-blur-xl border border-slate-200/50 rounded-[30px] shadow-[0_20px_60px_rgba(198,161,81,0.15)] hover:shadow-[0_30px_80px_rgba(198,161,81,0.25)] transition-all duration-700 ease-out overflow-hidden hover:scale-95 hover:-translate-y-2">
                    
                    {/* Enhanced Background Image */}
                    <div className="absolute inset-0 overflow-hidden rounded-[30px]">
                      <img
                        {...getResponsiveImageProps(category.image)}
                        alt={category.name}
                        width="320"
                        height="384"
                        sizes="320px"
                        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                      
                      {/* Modern Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-800/40 to-transparent transition-all duration-700 ease-out group-hover:from-slate-900/50 group-hover:via-slate-800/20" />
                      
                      {/* Sophisticated Pattern Overlay */}
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700" 
                           style={{
                             backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                             radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                           }} />
                    </div>

                    {/* Luxury Gold Border System */}
                    <div className="absolute inset-0 rounded-[30px] border border-amber-300/30 group-hover:border-amber-400/60 transition-all duration-700 ease-out" />
                    <div className="absolute inset-[1px] rounded-[30px] bg-gradient-to-br from-amber-100/20 via-transparent to-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Enhanced Content Layout */}
                    <div className="absolute inset-0 flex flex-col justify-between p-8">
                      
                      {/* Top Icon with Modern Design */}
                      <div className="flex justify-end">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#C79E48]/80 to-[#8B6F3A]/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-[#C79E48]/50 transition-all duration-700 ease-out group-hover:scale-110 group-hover:from-slate-700/90 group-hover:to-slate-800/95 shadow-lg">
                          <category.icon className="w-7 h-7 text-white transition-all duration-700 ease-out group-hover:text-white" />
                        </div>
                      </div>

                      {/* Bottom Content with Modern Typography */}
                      <div className="space-y-5">
                        {/* Category Name - Modern Typography */}
                        <h3 className="font-luxury text-3xl font-bold text-white transition-all duration-700 ease-out group-hover:text-slate-100 tracking-wide">
                          {category.name}
                        </h3>

                        {/* Description - Sophisticated Styling */}
                        <p className="font-sans font-light text-sm text-white/90 opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-700 ease-out leading-relaxed">
                          {category.description}
                        </p>

                        {/* Modern Explore Button */}
                        <motion.button 
                          className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-600/50 text-slate-100 px-8 py-3 rounded-2xl font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-700 ease-out hover:from-slate-700/90 hover:to-slate-800/90 hover:text-white hover:border-slate-500/70 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExplore(category.filterValue);
                          }}
                        >
                          EXPLORE COLLECTION
                        </motion.button>
                      </div>
                    </div>

                    {/* Modern Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent opacity-0 group-hover:opacity-100 rounded-[30px] transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                    {/* Sophisticated 3D Shadow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/10 via-transparent to-amber-400/10 rounded-[30px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />

                    {/* Glitter Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[30px]">
                      {/* Glitter dots positioned randomly */}
                      <div className="absolute top-4 left-8 w-1 h-1 bg-amber-400/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-100" />
                      <div className="absolute top-12 right-6 w-1 h-1 bg-amber-500/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-200" />
                      <div className="absolute top-20 left-12 w-1 h-1 bg-amber-600/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-300" />
                      <div className="absolute top-8 right-12 w-1 h-1 bg-amber-400/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-150" />
                      <div className="absolute top-16 left-6 w-1 h-1 bg-amber-500/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-250" />
                      <div className="absolute top-24 right-8 w-1 h-1 bg-amber-600/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-350" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Two Rows with Opposite Scroll Directions */}
        <div className="w-full overflow-hidden lg:hidden space-y-4">
          
          {/* Row 1: Scrolls Left */}
          <div className="w-full overflow-hidden">
              <div 
                ref={mobileRow1Ref} 
                className="flex gap-3" 
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  perspective: '1000px'
                }}
              >
              {/* First 5 categories, tripled for seamless infinite scroll */}
              {[...categories.slice(0, 5), ...categories.slice(0, 5), ...categories.slice(0, 5)].map((category, index) => (
                <div
                  key={`row1-${category.id}-${index}`}
                  className={`flex-shrink-0 w-[196px] h-56 group cursor-pointer ${index < 5 ? 'category-card-mobile' : ''}`}
                  onClick={() => handleExplore(category.filterValue)}
                  style={{ 
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)'
                  }}
                >
                  <div className="relative h-full w-full">
                    {/* Ultra-Modern Glassmorphism Card - Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-slate-50/90 to-slate-100/95 backdrop-blur-xl border border-slate-200/50 rounded-[24px] shadow-[0_15px_45px_rgba(198,161,81,0.15)] active:shadow-[0_20px_60px_rgba(198,161,81,0.25)] transition-all duration-700 ease-out overflow-hidden active:scale-95">
                      
                      {/* Enhanced Background Image */}
                      <div className="absolute inset-0 overflow-hidden rounded-[24px]">
                        <img
                          {...getResponsiveImageProps(category.image)}
                          alt={category.name}
                          width="196"
                          height="224"
                          sizes="196px"
                          className="w-full h-full object-cover transition-all duration-700 ease-out"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                        
                        {/* Modern Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-800/40 to-transparent transition-all duration-700 ease-out" />
                        
                        {/* Sophisticated Pattern Overlay */}
                        <div className="absolute inset-0 opacity-20 transition-opacity duration-700" 
                             style={{
                               backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                               radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                             }} />
                      </div>

                      {/* Luxury Gold Border System */}
                      <div className="absolute inset-0 rounded-[24px] border border-amber-300/30 transition-all duration-700 ease-out" />

                      {/* Enhanced Content Layout */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6">
                        
                        {/* Top Icon with Modern Design */}
                        <div className="flex justify-end">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#C79E48]/80 to-[#8B6F3A]/90 backdrop-blur-xl rounded-xl flex items-center justify-center border border-[#C79E48]/50 transition-all duration-700 ease-out shadow-lg">
                            <category.icon className="w-6 h-6 text-white transition-all duration-700 ease-out" />
                          </div>
                        </div>

                        {/* Bottom Content with Modern Typography */}
                        <div className="space-y-3">
                          {/* Category Name - Modern Typography */}
                          <h3 className="font-luxury text-2xl font-bold text-white transition-all duration-700 ease-out tracking-wide">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          </div>

          {/* Row 2: Scrolls Right (Opposite Direction) */}
          <div className="w-full overflow-hidden">
              <div 
                ref={mobileRow2Ref} 
                className="flex gap-3" 
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  perspective: '1000px'
                }}
              >
              {/* Last 4 categories, tripled for seamless infinite scroll */}
              {[...categories.slice(5, 9), ...categories.slice(5, 9), ...categories.slice(5, 9)].map((category, index) => (
                <div
                  key={`row2-${category.id}-${index}`}
                  className={`flex-shrink-0 w-[196px] h-56 group cursor-pointer ${index < 4 ? 'category-card-mobile' : ''}`}
                  onClick={() => handleExplore(category.filterValue)}
                  style={{ 
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)'
                  }}
                >
                  <div className="relative h-full w-full">
                    {/* Ultra-Modern Glassmorphism Card - Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-slate-50/90 to-slate-100/95 backdrop-blur-xl border border-slate-200/50 rounded-[24px] shadow-[0_15px_45px_rgba(198,161,81,0.15)] active:shadow-[0_20px_60px_rgba(198,161,81,0.25)] transition-all duration-700 ease-out overflow-hidden active:scale-95">
                      
                      {/* Enhanced Background Image */}
                      <div className="absolute inset-0 overflow-hidden rounded-[24px]">
                        <img
                          {...getResponsiveImageProps(category.image)}
                          alt={category.name}
                          width="196"
                          height="224"
                          sizes="196px"
                          className="w-full h-full object-cover transition-all duration-700 ease-out"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                        
                        {/* Modern Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-800/40 to-transparent transition-all duration-700 ease-out" />
                        
                        {/* Sophisticated Pattern Overlay */}
                        <div className="absolute inset-0 opacity-20 transition-opacity duration-700" 
                             style={{
                               backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                               radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                             }} />
                      </div>

                      {/* Luxury Gold Border System */}
                      <div className="absolute inset-0 rounded-[24px] border border-amber-300/30 transition-all duration-700 ease-out" />

                      {/* Enhanced Content Layout */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6">
                        
                        {/* Top Icon with Modern Design */}
                        <div className="flex justify-end">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#C79E48]/80 to-[#8B6F3A]/90 backdrop-blur-xl rounded-xl flex items-center justify-center border border-[#C79E48]/50 transition-all duration-700 ease-out shadow-lg">
                            <category.icon className="w-6 h-6 text-white transition-all duration-700 ease-out" />
                          </div>
                        </div>

                        {/* Bottom Content with Modern Typography */}
                        <div className="space-y-3">
                          {/* Category Name - Modern Typography */}
                          <h3 className="font-luxury text-2xl font-bold text-white transition-all duration-700 ease-out tracking-wide">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          </div>
        </div>

        {/* Modern Navigation Buttons - Desktop Only */}
        <motion.div 
          className="hidden lg:flex justify-center items-center mt-16 space-x-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={scrollLeft}
            className="w-16 h-16 bg-gradient-to-br from-[#C79E48]/90 to-[#8B6F3A]/95 backdrop-blur-xl border border-[#C79E48]/50 rounded-2xl flex items-center justify-center text-white hover:from-[#D4A85A]/90 hover:to-[#C79E48]/95 hover:text-white transition-all duration-500 shadow-[0_10px_30px_rgba(199,158,72,0.2)] hover:shadow-[0_15px_40px_rgba(199,158,72,0.3)]"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-7 h-7" />
          </motion.button>

          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#C79E48]/10 to-[#D4A85A]/10 backdrop-blur-xl border border-[#C79E48]/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#C79E48] to-[#D4A85A] animate-pulse" />
            <span className="text-sm text-[#8B6F3A] font-medium tracking-wider uppercase">
              Navigate Collections
            </span>
          </div>

          <motion.button
            onClick={scrollRight}
            className="w-16 h-16 bg-gradient-to-br from-[#C79E48]/90 to-[#8B6F3A]/95 backdrop-blur-xl border border-[#C79E48]/50 rounded-2xl flex items-center justify-center text-white hover:from-[#D4A85A]/90 hover:to-[#C79E48]/95 hover:text-white transition-all duration-500 shadow-[0_10px_30px_rgba(199,158,72,0.2)] hover:shadow-[0_15px_40px_rgba(199,158,72,0.3)]"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-7 h-7" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default UltraCategories;
