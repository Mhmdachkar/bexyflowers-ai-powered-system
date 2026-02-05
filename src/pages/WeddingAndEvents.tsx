import React, { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Sparkles, Flower2, Palette, Heart, ArrowUp, Loader2 } from "lucide-react";
import LazySection from "@/components/LazySection";
import UltraNavigation from "@/components/UltraNavigation";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIOSPerformance } from "@/hooks/use-ios-performance";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroWeddingImage from "@/assets/heroWedding.webp";
import { useWeddingCreations } from "@/hooks/useWeddingCreations";
import { encodeImageUrl } from "@/lib/imageUtils";
// Video for mobile hero background
import video3Url from '@/assets/video/Video3.webm?url';

gsap.registerPlugin(ScrollTrigger);

const GOLD_COLOR = "rgb(199, 158, 72)";
const GOLD_HEX = "#c79e48";

// Wedding images will be loaded from Supabase

// Event flowers images - automatically rotating (use .webp optimized versions)
const eventFlowersImages = [
  "/assets/wedding-events/events/IMG-20251126-WA0018.webp",
  "/assets/wedding-events/events/IMG-20251126-WA0020.webp",
  "/assets/wedding-events/events/IMG-20251126-WA0022.webp",
  "/assets/wedding-events/events/IMG-20251126-WA0023.webp",
  "/assets/wedding-events/events/IMG-20251126-WA0024.webp",
  "/assets/wedding-events/events/WhatsApp Image 2025-11-26 at 03.14.12_6dbd359d.webp",
];

// Wedding flowers images - automatically rotating (use .webp optimized versions)
const weddingFlowersImages = [
  "/assets/wedding-events/wedding/IMG_1784.webp",
  "/assets/wedding-events/wedding/IMG-20251126-WA0019.webp",
  "/assets/wedding-events/wedding/IMG-20251126-WA0021.webp",
];

const WeddingHero = () => {
  const isMobile = useIsMobile();
  const { isOldIOS, needsMobileOptimizations } = useIOSPerformance();
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // iOS/Android OPTIMIZATION: Simpler animations on mobile
      const useLightAnimations = needsMobileOptimizations;
      const animationDuration = useLightAnimations ? 0.6 : 1.5;
      const animationDelay = useLightAnimations ? 0.1 : 0.3;
      
      // Hero image parallax and fade in
      gsap.fromTo(
        imageRef.current,
        { scale: useLightAnimations ? 1.05 : 1.2, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: animationDuration,
          ease: useLightAnimations ? "power2.out" : "power3.out",
        }
      );

      // Text animation - simplified on mobile
      gsap.fromTo(
        textRef.current?.querySelector("h1"),
        { y: useLightAnimations ? 30 : 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: useLightAnimations ? 0.6 : 1.2,
          delay: animationDelay,
          ease: useLightAnimations ? "power2.out" : "power4.out",
        }
      );

      gsap.fromTo(
        textRef.current?.querySelector("p"),
        { y: useLightAnimations ? 20 : 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: useLightAnimations ? 0.5 : 1,
          delay: useLightAnimations ? animationDelay + 0.1 : 0.6,
          ease: useLightAnimations ? "power2.out" : "power3.out",
        }
      );

      // Button animation - simplified on mobile
      gsap.fromTo(
        buttonRef.current,
        { y: useLightAnimations ? 15 : 30, opacity: 0, scale: useLightAnimations ? 0.95 : 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: useLightAnimations ? 0.4 : 0.8,
          delay: useLightAnimations ? animationDelay + 0.2 : 0.9,
          ease: useLightAnimations ? "power2.out" : "back.out(1.7)",
        }
      );

      // Parallax effect on scroll - disabled on mobile and when optimizations apply
      if (!isMobile && !needsMobileOptimizations) {
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            if (imageRef.current) {
              gsap.to(imageRef.current, {
                y: self.progress * 100,
                scale: 1 + self.progress * 0.1,
                ease: "none",
              });
            }
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isMobile, needsMobileOptimizations]);

  // Intersection Observer for lazy loading video only when visible (mobile only)
  // PERFORMANCE FIX: Keep observer active to pause/resume video
  // iOS 18 OPTIMIZATION: More aggressive optimizations for older iOS
  useEffect(() => {
    if (!isMobile) return;

    const targetElement = heroRef.current || videoRef.current;
    if (!targetElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = videoRef.current;
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            // PERFORMANCE FIX: Play video when visible
            if (videoElement && shouldLoadVideo) {
              // iOS/Android OPTIMIZATION: Reduce playback rate on mobile
              if (needsMobileOptimizations) {
                videoElement.playbackRate = 0.85;
              }
              videoElement.play().catch(() => {
                // Auto-play prevented
              });
            }
          } else {
            // PERFORMANCE FIX: Pause video when not visible to save resources
            if (videoElement && shouldLoadVideo) {
              videoElement.pause();
              // iOS/Android OPTIMIZATION: Reset time to save memory
              if (needsMobileOptimizations) {
                videoElement.currentTime = 0;
              }
            }
          }
        });
      },
      {
        root: null,
        // iOS/Android OPTIMIZATION: Smaller rootMargin on mobile
        rootMargin: needsMobileOptimizations ? '50px' : '100px',
        threshold: 0.01,
      }
    );

    observer.observe(targetElement);

    return () => {
      observer.disconnect();
    };
  }, [isMobile, shouldLoadVideo, needsMobileOptimizations]);

  // Load and play video when it becomes visible
  // iOS 18 OPTIMIZATION: Optimize video settings for older iOS devices
  useEffect(() => {
    if (!isMobile || !videoRef.current || !shouldLoadVideo) return;

    const videoElement = videoRef.current;
    
    // iOS/Android OPTIMIZATION: Reduce playback rate and optimize settings
    if (needsMobileOptimizations) {
      videoElement.playbackRate = 0.85; // Slightly slower playback reduces CPU usage
      videoElement.volume = 0.9; // Slightly lower volume
    }
    
    const forceFullWidth = () => {
      if (videoElement) {
        videoElement.style.width = '100vw';
        videoElement.style.maxWidth = '100vw';
        videoElement.style.left = '0';
        videoElement.style.right = '0';
        videoElement.style.marginLeft = '0';
        videoElement.style.marginRight = '0';
      }
    };
    
    forceFullWidth();
    videoElement.load();
    
    videoElement.addEventListener('loadedmetadata', forceFullWidth);
    videoElement.addEventListener('loadeddata', forceFullWidth);
    
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented
      });
    }
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', forceFullWidth);
      videoElement.removeEventListener('loadeddata', forceFullWidth);
    };
  }, [isMobile, shouldLoadVideo, needsMobileOptimizations]);

  // Handle window resize to ensure video stays full width
  useEffect(() => {
    if (!isMobile || !videoRef.current) return;

    const handleResize = () => {
      if (videoRef.current) {
        videoRef.current.style.width = '100vw';
        videoRef.current.style.maxWidth = '100vw';
        videoRef.current.style.left = '0';
        videoRef.current.style.right = '0';
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isMobile]);

  return (
    <section ref={heroRef} className={`relative ${isMobile ? 'h-screen' : 'min-h-screen'} flex items-center justify-center overflow-hidden ${isMobile ? 'bg-transparent' : 'bg-gradient-to-b from-[#fafafa] to-white'}`} style={isMobile ? { marginTop: '-80px', paddingTop: '80px' } : { marginTop: '-12.3rem', paddingTop: '50' }}>
      {/* Video background for mobile view - Absolute within hero section, extends behind header */}
      {isMobile && (
        <video
          ref={videoRef}
          className="absolute left-0 right-0 w-full object-cover object-center z-0 pointer-events-none"
          style={{
            width: '100%',
            maxWidth: '100%',
            height: 'calc(100vh + 200px)',
            minHeight: 'calc(100vh + 200px)',
            top: '-80px',
            bottom: 0,
            left: 0,
            right: 0,
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0,
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label="Hero background video"
        >
          {shouldLoadVideo && (
            <source src={video3Url} type="video/webm" />
          )}
        </video>
      )}

      {/* Hero Image - Hidden on mobile, shown on desktop */}
      {!isMobile && (
        <div
          ref={imageRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            top: '12rem', 
            height: '100vh',
            willChange: 'transform',
            contain: 'layout style paint'
          }}
        >
          <img
            src={heroWeddingImage}
            alt="Elegant Wedding Couple"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="sync"
            fetchpriority="high"
            width="1920"
            height="1080"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
          {/* Elegant overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center" style={isMobile ? {} : { marginTop: '12rem', transform: 'scale(0.85)' }}>
        <div ref={textRef} className="space-y-3 sm:space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
          >
            <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} style={{ color: GOLD_COLOR }} />
            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-normal uppercase text-white/90`} style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
              Wedding & Events
            </span>
            <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} style={{ color: GOLD_COLOR }} />
          </motion.div>

          <h1
            className={`${isMobile ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl'} font-luxury font-normal mb-3 sm:mb-4 md:mb-6 leading-[1.1] text-white px-2`}
            style={{ letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            Beautiful Floral Arrangements
            <br className="hidden sm:block" />
            <span className="relative inline-block mt-1 sm:mt-2">
              <span style={{ color: GOLD_COLOR }}>For Your Special Day</span>
              <motion.div
                className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-0.5 sm:h-1"
                style={{
                  background: `linear-gradient(to right, transparent, ${GOLD_COLOR}, transparent)`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
            </span>
          </h1>

          <p
            className={`${isMobile ? 'text-sm sm:text-base' : 'text-base md:text-lg lg:text-xl'} text-white/95 max-w-3xl mx-auto font-light leading-relaxed px-4`}
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            Crafting timeless elegance through bespoke floral artistry
            <br className="hidden sm:block" />
            for your most precious moments
          </p>

          <div ref={buttonRef} className="pt-2 sm:pt-3">
            <Button
              size="lg"
              className={`${isMobile ? 'text-xs sm:text-sm px-5 sm:px-6 py-4 sm:py-5' : 'text-base px-10 py-6'} font-normal rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group w-full sm:w-auto`}
              style={{
                fontFamily: "'EB Garamond', serif",
                letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                color: 'white',
              }}
              onClick={() => {
                const contactEl = document.getElementById('contact-section');
                if (contactEl) {
                  contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <motion.span
                className="relative z-10 flex items-center justify-center gap-2 sm:gap-3"
                whileHover={isMobile ? {} : { scale: 1.05 }}
              >
                Get in touch
                <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} group-hover:translate-x-1 transition-transform`} />
              </motion.span>
              {!isMobile && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Subtle decorative elements - elegant, not distracting */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        {/* PERFORMANCE FIX: Removed infinite animation - use CSS instead */}
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2 animate-bounce">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

const ServiceSection = ({
  title,
  description,
  image,
  images, // New prop for multiple images (carousel)
  index,
  features
}: {
  title: string;
  description: string;
  image?: string; // Optional now
  images?: string[]; // Array of images for slideshow
  index: number;
  features?: string[];
}) => {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Use images array if provided, otherwise fall back to single image
  // Memoize to prevent recreating array on every render (fixes infinite loop)
  const imageArray = useMemo(() => {
    return images || (image ? [image] : []);
  }, [images, image]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debug: Log image array to console
  useEffect(() => {
    if (imageArray.length === 0) {
      console.warn(`ServiceSection "${title}": No images provided`);
    }
  }, [imageArray.length, title]);

  // Auto-rotate images every 4 seconds if multiple images provided
  // Seamless loop - no blank/blink between transitions
  // Preload all images to ensure smooth transitions
  // PERFORMANCE FIX: Only run when section is visible
  const preloadedImagesRef = React.useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (imageArray.length <= 1) return;

    // Preload all images for smooth transitions (no blank moments)
    // Track preloaded images to avoid repeated preloading
    imageArray.forEach((imgSrc) => {
      const encodedSrc = encodeImageUrl(imgSrc);
      if (!preloadedImagesRef.current.has(encodedSrc)) {
        const img = new Image();
        img.src = encodedSrc;
        preloadedImagesRef.current.add(encodedSrc);
      }
    });

    let interval: NodeJS.Timeout | null = null;
    
    // Only run interval when section is visible (PERFORMANCE FIX)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start rotation when visible
            if (!interval) {
              interval = setInterval(() => {
                setCurrentImageIndex((prev) => {
                  const next = (prev + 1) % imageArray.length;
                  return next;
                });
              }, 4000);
            }
          } else {
            // Stop rotation when not visible to save resources
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [imageArray]); // Depend on memoized array - will only change when images prop actually changes

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isEven = index % 2 === 0;
      const animationDistance = isMobile ? 30 : (isEven ? -100 : 100);

      // Image animation - reduced on mobile
      gsap.fromTo(
        imageRef.current,
        {
          x: isMobile ? 0 : animationDistance,
          opacity: 0,
          scale: isMobile ? 0.95 : 0.9,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: isMobile ? 0.8 : 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top 20%",
            toggleActions: "play none none none",
          },
        }
      );

      // Content animation - reduced on mobile
      gsap.fromTo(
        contentRef.current,
        {
          x: isMobile ? 0 : (isEven ? 100 : -100),
          opacity: 0,
          y: isMobile ? 20 : 0,
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: isMobile ? 0.8 : 1.2,
          delay: isMobile ? 0.1 : 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top 20%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [index, isMobile]);

  const isEven = index % 2 === 0;

  // Modern mobile card layout
  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        className={`relative py-8 overflow-visible ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-b from-white to-[#fafafa]'}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Modern Card Design for Mobile */}
          <motion.div
            ref={cardRef}
            className="relative"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Card with modern shadow and rounded corners */}
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Image with overlay gradient */}
              <div ref={imageRef} className="relative h-[280px] overflow-hidden">
                {imageArray.length > 0 ? (
                  imageArray.map((img, idx) => (
                    <motion.img
                      key={idx}
                      src={img}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: idx === 0 ? 1 : 0 }}
                      animate={{
                        opacity: idx === currentImageIndex ? 1 : 0,
                        scale: idx === currentImageIndex ? 1 : 1.05
                      }}
                      transition={{
                        duration: 1.2,
                        ease: [0.4, 0, 0.2, 1], // Smooth easing for seamless transition
                        opacity: { duration: 1.2 } // Longer fade for smoother loop
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        willChange: 'opacity', // Optimize for smooth transitions
                      }}
                      onLoad={() => {
                        // Ensure image is loaded before showing
                        if (idx === currentImageIndex) {
                          // Image is ready
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-foreground text-sm">No image available</span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                {/* Title overlay on image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2
                    className="text-3xl font-luxury font-normal text-white mb-2"
                    style={{ letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                  >
                    {title}
                  </h2>
                  <div
                    className="w-16 h-1 mb-3"
                    style={{ background: GOLD_COLOR }}
                  />
                </div>
              </div>

              {/* Content section */}
              <div ref={contentRef} className="p-6 space-y-4">
                <p className="text-sm text-foreground leading-relaxed">
                  {description}
                </p>

                {features && features.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: GOLD_COLOR }}
                        />
                        <span className="text-xs text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-2 px-6 py-5 text-sm font-normal mt-4"
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    letterSpacing: '-0.02em',
                    borderColor: GOLD_COLOR,
                    color: GOLD_COLOR,
                  }}
                  onClick={() => {
                    const contactEl = document.getElementById('contact-section');
                    if (contactEl) {
                      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  Learn More
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </div>

            {/* Decorative floating element */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl"
              style={{
                background: `radial-gradient(circle, ${GOLD_COLOR}, transparent)`,
              }}
            />
          </motion.div>
        </div>
      </section>
    );
  }

  // Desktop layout (unchanged)
  return (
    <section
      ref={sectionRef}
      className={`relative py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-b from-white to-[#fafafa]'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-center ${isEven ? '' : 'md:flex-row-reverse'}`}>
          {/* Image */}
          <div
            ref={imageRef}
            className={`${isEven ? 'order-1' : 'order-2'} relative group`}
          >
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl" style={{ height: '500px', minHeight: '500px' }}>
              {imageArray.length > 0 ? (
                imageArray.map((img, idx) => (
                  <motion.img
                    key={idx}
                    src={encodeImageUrl(img)}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: idx === 0 ? 1 : 0 }}
                    animate={{
                      opacity: idx === currentImageIndex ? 1 : 0,
                      scale: idx === currentImageIndex ? 1 : 1.05
                    }}
                    transition={{
                      duration: 1.5,
                      ease: [0.25, 0.1, 0.25, 1], // Smooth cubic bezier for seamless crossfade
                      opacity: {
                        duration: 1.5,
                        ease: [0.25, 0.1, 0.25, 1] // Overlapping fade for seamless loop
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      willChange: 'opacity', // Optimize for smooth transitions
                    }}
                    onLoad={() => {
                      // Ensure image is loaded before showing
                      if (idx === currentImageIndex) {
                        // Image is ready
                      }
                    }}
                  />
                ))
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-foreground">No image available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            </div>
            {/* Decorative corner accent */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 opacity-20 hidden md:block"
              style={{
                background: `linear-gradient(135deg, ${GOLD_COLOR}, transparent)`,
                borderRadius: '50%',
              }}
            />
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className={`${isEven ? 'order-2' : 'order-1'} space-y-4 sm:space-y-6`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="font-luxury text-6xl md:text-8xl font-normal mb-4 sm:mb-6 relative uppercase"
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
                {title.toUpperCase()}
              </h2>
              <div
                className="w-16 sm:w-20 h-0.5 sm:h-1 mb-4 sm:mb-6"
                style={{ background: `linear-gradient(to right, ${GOLD_COLOR}, transparent)` }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base md:text-lg lg:text-xl text-foreground leading-relaxed"
            >
              {description}
            </motion.p>

            {features && features.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-3 mt-8"
              >
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: GOLD_COLOR }}
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </motion.ul>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-2 sm:pt-4"
            >
              <Button
                variant="outline"
                size="lg"
                className="group rounded-full border-2 px-8 py-6 font-normal transition-all duration-300"
                style={{
                  fontFamily: "'EB Garamond', serif",
                  letterSpacing: '-0.02em',
                  borderColor: GOLD_COLOR,
                  color: GOLD_COLOR,
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    backgroundColor: GOLD_COLOR,
                    color: 'white',
                    scale: 1.05,
                    duration: 0.3,
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    backgroundColor: 'transparent',
                    color: GOLD_COLOR,
                    scale: 1,
                    duration: 0.3,
                  });
                }}
                onClick={() => {
                  const contactEl = document.getElementById('contact-section');
                  if (contactEl) {
                    contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Consultation Scheduling Modal Component
const ConsultationModal = ({ isOpen, onClose, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Generate time slots (9 AM to 6 PM, every hour)
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    setIsSubmitting(true);
    onConfirm(selectedDate, selectedTime);
    setIsSubmitting(false);
    onClose();
    // Reset form
    setSelectedDate('');
    setSelectedTime('');
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-luxury font-normal" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
            Schedule a Consultation
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <span className="text-2xl text-foreground">×</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-normal text-foreground mb-2" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
              Select Date
            </label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{
                borderColor: selectedDate ? GOLD_COLOR : '#e5e7eb',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = GOLD_COLOR;
                e.target.style.boxShadow = `0 0 0 3px ${GOLD_COLOR}33`;
              }}
              onBlur={(e) => {
                if (!selectedDate) {
                  e.target.style.borderColor = '#e5e7eb';
                }
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-sm font-normal text-foreground mb-2" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
              Select Time
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTime === time
                      ? 'text-white'
                      : 'text-foreground border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  style={{
                    backgroundColor: selectedTime === time ? GOLD_COLOR : 'transparent',
                    borderColor: selectedTime === time ? GOLD_COLOR : undefined
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Date & Time Display */}
          {selectedDate && selectedTime && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${GOLD_COLOR}10` }}>
              <p className="text-sm text-foreground mb-1">Selected:</p>
              <p className="font-normal" style={{ color: GOLD_COLOR, fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} at {selectedTime}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{ borderColor: GOLD_COLOR, color: GOLD_COLOR }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className="flex-1 text-white"
              style={{
                backgroundColor: (!selectedDate || !selectedTime) ? '#d1d5db' : GOLD_COLOR,
                cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm & Send'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const PackageSection = () => {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const CONSULTATION_PHONE = "96176104882";

  const handleConsultationConfirm = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `Hello! I would like to schedule a consultation for:\n\n📅 Date: ${formattedDate}\n⏰ Time: ${time}\n\nPlease confirm if this time works for you. Thank you!`;
    const whatsappUrl = `https://wa.me/${CONSULTATION_PHONE}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: isMobile ? 30 : 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: isMobile ? 0.8 : 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      // Animate feature cards - reduced on mobile
      gsap.utils.toArray(cardRef.current?.querySelectorAll('.feature-card') || []).forEach((card: any, index: number) => {
        gsap.fromTo(
          card,
          { y: isMobile ? 20 : 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: isMobile ? 0.6 : 0.8,
            delay: isMobile ? index * 0.05 : index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  const packageFeatures = [
    {
      icon: Flower2,
      title: "Bridal Bouquet",
      description: "Customized bridal bouquet with fresh real flowers of your choice",
    },
    {
      icon: Flower2,
      title: "Bridesmaid Bouquet",
      description: "Elegant bridesmaids' bouquets matching your wedding theme",
    },
    {
      icon: Heart,
      title: "Bride & Groom's House Decorations",
      description: "Beautiful floral arrangements for both bride and groom's houses",
    },
    {
      icon: Sparkles,
      title: "Church Decorations",
      description: "Stunning altar and entrance decorations with fresh and artificial flowers",
    },
    {
      icon: Sparkles,
      title: "Welcome Drink Decoration",
      description: "Elegant table settings with candles and floral centerpieces",
    },
    {
      icon: Sparkles,
      title: "Party Decoration",
      description: "Beautiful dining table centerpieces for your celebration",
    },
    {
      icon: Flower2,
      title: "Tables Centrepieces",
      description: "Large centerpieces with high-quality white artificial flowers",
    },
    {
      icon: Sparkles,
      title: "Car Flower Decoration",
      description: "Three cars decorated with real flowers, including main bridal car",
    },
  ];

  // Modern mobile package section
  if (isMobile) {
    return (
      <>
        <section ref={sectionRef} className="relative py-12 bg-gradient-to-b from-[#fafafa] to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4" style={{ color: GOLD_COLOR }} />
                <span className="text-xs font-normal uppercase" style={{ color: GOLD_COLOR, fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                  Our Standard Package
                </span>
                <Sparkles className="w-4 h-4" style={{ color: GOLD_COLOR }} />
              </div>
              <h2 className="text-3xl font-luxury font-normal mb-3" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                Complete Wedding Experience
              </h2>
              <p className="text-sm text-foreground max-w-3xl mx-auto">
                Everything you need for your perfect day
              </p>
            </motion.div>

            {/* Modern Card Design */}
            <motion.div
              ref={cardRef}
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-[rgba(199,158,72,0.15)]"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Price Header - Prominent */}
              <div className="relative bg-gradient-to-br from-[rgba(199,158,72,0.1)] to-transparent p-6 text-center border-b border-[rgba(199,158,72,0.1)]">
                <div className="mb-3">
                  <span className="text-5xl font-normal font-luxury" style={{ color: GOLD_COLOR, letterSpacing: '-0.02em' }}>
                    $3,200
                  </span>
                </div>
                <p className="text-xs text-foreground">
                  Complete package • Customizable
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Features in scrollable horizontal cards */}
                <div className="overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  <div className="flex gap-4" style={{ width: 'max-content' }}>
                    {packageFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={index}
                          className="feature-card flex-shrink-0 w-[280px] bg-gradient-to-br from-white to-[rgba(199,158,72,0.02)] rounded-2xl p-4 border border-[rgba(199,158,72,0.15)]"
                        >
                          <h3 className="font-luxury font-normal text-sm mb-1" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                            {feature.title}
                          </h3>
                          <p className="text-xs text-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-foreground leading-relaxed mb-3">
                    Our Standard Package offers a complete floral and décor experience designed to make your wedding day elegant and unforgettable.
                  </p>
                  <p className="text-xs font-normal" style={{ color: GOLD_COLOR, fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                    ✨ The package can be customized upon request
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="w-full rounded-full border-0 px-6 py-5 text-sm font-normal shadow-xl"
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                    color: 'white',
                  }}
                  onClick={() => {
                    const contactEl = document.getElementById('contact-section');
                    if (contactEl) {
                      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reserve a Meeting
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        <ConsultationModal
          isOpen={isConsultationModalOpen}
          onClose={() => setIsConsultationModalOpen(false)}
          onConfirm={handleConsultationConfirm}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <>
      <section ref={sectionRef} className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-b from-[#fafafa] to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Sparkles className="w-5 h-5" style={{ color: GOLD_COLOR }} />
              <span className="text-sm font-normal uppercase" style={{ color: GOLD_COLOR, fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                Our Standard Package
              </span>
              <Sparkles className="w-5 h-5" style={{ color: GOLD_COLOR }} />
            </div>
            <h2
              className="font-luxury text-6xl md:text-8xl font-normal mb-6 relative"
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
              COMPLETE WEDDING EXPERIENCE
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-foreground max-w-3xl mx-auto px-2">
              Everything you need for your perfect day, beautifully arranged
            </p>
          </motion.div>

          <div ref={cardRef} className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-[rgba(199,158,72,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(199,158,72,0.03)] via-transparent to-[rgba(199,158,72,0.03)]" />

            <div className="relative p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
              {/* Price Header */}
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="mb-4 sm:mb-6">
                  <span className={`${isMobile ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-6xl md:text-7xl lg:text-8xl'} font-normal font-luxury`} style={{ color: GOLD_COLOR, letterSpacing: '-0.02em' }}>
                    $3,200
                  </span>
                </div>
                <p className={`${isMobile ? 'text-sm sm:text-base' : 'text-base md:text-lg lg:text-xl'} text-foreground max-w-3xl mx-auto leading-relaxed px-2`}>
                  Our Standard Package offers a complete floral and décor experience designed to make your wedding day elegant and unforgettable. This package includes full arrangements from Bexy Flowers – from ceremony to reception – ensuring every detail is beautifully styled and cohesive.
                  <br className="mt-2 sm:mt-4" />
                  <span className="font-normal" style={{ color: GOLD_COLOR, fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                    The package can be customized upon request
                  </span>
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
                {packageFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="feature-card relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[rgba(199,158,72,0.15)] hover:border-[rgba(199,158,72,0.4)] transition-all duration-300 hover:shadow-xl group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(199,158,72,0.03)] to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10">
                        <h3 className={`font-luxury font-normal ${isMobile ? 'text-base' : 'text-lg'} mb-2`} style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                          {feature.title}
                        </h3>
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground leading-relaxed`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  className={`${isMobile ? 'text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6' : 'text-lg px-12 py-7'} font-normal rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group w-full sm:w-auto`}
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                    color: 'white',
                  }}
                  onClick={() => {
                    const contactEl = document.getElementById('contact-section');
                    if (contactEl) {
                      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <motion.span
                    className="relative z-10 flex items-center justify-center gap-2 sm:gap-3"
                    whileHover={isMobile ? {} : { scale: 1.05 }}
                  >
                    <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span className={isMobile ? 'hidden sm:inline' : ''}>Contact Us Now to Reserve a Meeting</span>
                    <span className={isMobile ? 'sm:hidden' : 'hidden'}>Reserve a Meeting</span>
                  </motion.span>
                  {!isMobile && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        onConfirm={handleConsultationConfirm}
      />
    </>
  );
};

// Shared Image Modal Component - Works for both mobile and desktop
const ImageModal = ({
  selectedImage,
  onClose,
  images,
  isMobile
}: {
  selectedImage: number | null;
  onClose: () => void;
  images: string[];
  isMobile: boolean;
}) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (selectedImage === null || !mounted) return null;

  const modalContent = (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center modal-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 999999, // Much higher than navigation (z-100) to overlay everything
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        // Close when clicking outside the image
        const target = e.target as HTMLElement;
        // Only close if clicking directly on the background div (not on image container or button)
        if (target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchEnd={(e) => {
        // Close when tapping outside the image on mobile
        const target = e.target as HTMLElement;
        // Only close if tapping directly on the background div
        if (target === e.currentTarget) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      {/* Close button - X icon - Smaller on mobile, larger on desktop */}
      <button
        className="absolute text-white font-normal transition-all duration-200 flex items-center justify-center rounded-full shadow-2xl"
        style={{
          top: isMobile ? '12px' : '16px',
          right: isMobile ? '12px' : '16px',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          width: isMobile ? '44px' : '70px',
          height: isMobile ? '44px' : '70px',
          pointerEvents: 'auto',
          fontFamily: "'EB Garamond', serif",
          letterSpacing: '-0.02em',
          zIndex: 1000000, // Highest z-index to be above everything
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: isMobile ? '2px solid rgba(255, 255, 255, 0.95)' : '3px solid rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          // Visual feedback on touch
          e.currentTarget.style.transform = 'scale(0.9)';
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          e.preventDefault();
          // Reset visual state
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
          onClose();
        }}
        onTouchCancel={(e) => {
          // Reset if touch is cancelled
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        }}
        onMouseDown={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(0.95)';
          }
        }}
        onMouseUp={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        aria-label="Close image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={isMobile ? "w-6 h-6" : "w-11 h-11"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isMobile ? 3 : 4}
          style={{
            pointerEvents: 'none',
            color: 'white',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image container - prevents closing when clicking on image */}
      <div
        className="relative flex items-center justify-center image-container"
        style={{
          position: 'absolute',
          top: isMobile ? '60px' : '0',
          left: isMobile ? '12px' : '0',
          right: isMobile ? '12px' : '0',
          bottom: isMobile ? '100px' : '0',
          width: isMobile ? 'calc(100% - 24px)' : '100%',
          height: isMobile ? 'calc(100% - 160px)' : '100%',
          padding: isMobile ? '0' : '16px',
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
        }}
      >
        <motion.img
          src={images[selectedImage]}
          alt={`Wedding decoration ${selectedImage + 1}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            maxWidth: isMobile ? '100%' : '90vw',
            maxHeight: isMobile ? 'calc(100vh - 160px)' : '90vh',
            width: 'auto',
            height: 'auto',
            display: 'block',
            pointerEvents: 'none',
            objectFit: 'contain',
            opacity: 1,
            visibility: 'visible',
          }}
          onLoad={(e) => {
            // Ensure image is visible
            const img = e.currentTarget;
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.display = 'block';
          }}
          onError={(e) => {
            console.error('Image failed to load:', images[selectedImage]);
          }}
        />
      </div>

      {/* Tap indicator text for mobile */}
      {isMobile && (
        <motion.div
          className="absolute bottom-6 left-0 right-0 text-center z-[100000] pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/80 text-sm font-medium">Tap outside or X to close</p>
        </motion.div>
      )}
    </motion.div>
  );

  // Render modal using portal to ensure it's above everything
  return createPortal(modalContent, document.body);
};

const ImageGallery = () => {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [weddingImages, setWeddingImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Load wedding images using React Query hook
  const weddingCreationsQuery = useWeddingCreations({
    isActive: true // Only get active wedding creations
  });

  // Process wedding creations data - Fixed: removed isLoading from dependencies to prevent infinite loop
  useEffect(() => {
    // Only process when we have data or error
    const data = weddingCreationsQuery.data;
    if (data && Array.isArray(data)) {
      console.log('Loaded wedding creations:', data.length);

      // Filter out empty/null/undefined image URLs and encode valid ones
      const imageUrls = data
        .map((creation: any) => creation.image_url)
        .filter((url): url is string => Boolean(url && url.trim()))
        .map(url => encodeImageUrl(url))
        .filter(url => url.trim() !== ''); // Filter out any empty strings after encoding

      console.log('Final wedding image URLs:', imageUrls.length);
      setWeddingImages(imageUrls);
      setLoadingImages(false);
    } else if (weddingCreationsQuery.error) {
      console.error('Failed to load wedding images:', weddingCreationsQuery.error);
      setWeddingImages([]);
      setLoadingImages(false);
    }
    // Note: isLoading is handled separately - only update loading state when data actually changes
  }, [weddingCreationsQuery.data, weddingCreationsQuery.error]);
  
  // Separate effect to handle initial loading state
  useEffect(() => {
    if (weddingCreationsQuery.isLoading && !weddingCreationsQuery.data) {
      setLoadingImages(true);
    }
  }, [weddingCreationsQuery.isLoading, weddingCreationsQuery.data]);

  useEffect(() => {
    // Only animate when images are loaded and gallery ref is ready
    if (loadingImages || weddingImages.length === 0 || !galleryRef.current) return;

    const ctx = gsap.context(() => {
      // Animate gallery items - reduced on mobile
      gsap.utils.toArray(galleryRef.current?.querySelectorAll('.gallery-item') || []).forEach((item: any, index: number) => {
        gsap.fromTo(
          item,
          { scale: isMobile ? 0.95 : 0.8, opacity: 0, y: isMobile ? 20 : 50 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.6 : 0.8,
            delay: isMobile ? index * 0.05 : index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none none",
              refreshPriority: -1, // Lower priority for better performance
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile, loadingImages, weddingImages.length]); // Add dependencies to prevent re-animation loops

  // Prevent body scroll when modal is open and restore scroll position
  useEffect(() => {
    if (selectedImage !== null) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedImage]);

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < weddingImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Modern mobile gallery with swipe
  if (isMobile) {
    return (
      <>
        <section ref={sectionRef} className="relative py-12 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-luxury font-normal mb-3" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                Our Wedding Creations
              </h2>
              <p className="text-sm text-foreground max-w-2xl mx-auto">
                Swipe to explore our stunning arrangements
              </p>
            </motion.div>

            {/* Swipeable Carousel */}
            <div className="relative">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {weddingImages.map((image, index) => (
                  <div
                    key={index}
                    className="min-w-full px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] cursor-pointer">
                      <img
                        src={image}
                        alt={`Wedding decoration ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load wedding carousel image:', image, e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Successfully loaded wedding carousel image:', image);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {weddingImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                        ? 'w-8 bg-[rgb(199,158,72)]'
                        : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>

              {/* Navigation arrows */}
              {currentIndex > 0 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" style={{ color: GOLD_COLOR }} />
                </button>
              )}
              {currentIndex < weddingImages.length - 1 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10"
                >
                  <ArrowRight className="w-5 h-5" style={{ color: GOLD_COLOR }} />
                </button>
              )}
            </div>

            {/* Grid view for quick access */}
            <div className="mt-8">
              <p className="text-xs text-foreground text-center mb-4">Quick View</p>
              <div className="grid grid-cols-4 gap-2">
                {weddingImages.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === index ? 'border-[rgb(199,158,72)] scale-105' : 'border-transparent'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIndex(index);
                      setSelectedImage(index);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIndex(index);
                      setSelectedImage(index);
                    }}
                  >
                    <img
                      src={encodeImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Image Modal for Mobile */}
        <ImageModal
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
          images={weddingImages}
          isMobile={true}
        />
      </>
    );
  }

  // Desktop layout
  if (loadingImages) {
    return (
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (weddingImages.length === 0) {
    return (
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-foreground">
            <p>No wedding creation photos available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section ref={sectionRef} className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="font-luxury text-6xl md:text-8xl font-normal mb-3 sm:mb-4 relative uppercase"
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
              OUR WEDDING CREATIONS
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-foreground max-w-2xl mx-auto px-2">
              Explore our stunning wedding floral arrangements and decorations
            </p>
          </motion.div>

          <div ref={galleryRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {weddingImages.map((image, index) => (
              <div
                key={index}
                className="gallery-item relative group cursor-pointer rounded-xl overflow-hidden aspect-square"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
              >
                <img
                  src={image}
                  alt={`Wedding decoration ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    console.error('Failed to load wedding image:', image, e);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded wedding image:', image);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white text-sm font-normal" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>View Details</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal for Desktop */}
      <ImageModal
        selectedImage={selectedImage}
        onClose={() => setSelectedImage(null)}
        images={weddingImages}
        isMobile={false}
      />
    </>
  );
};

const ContactSection = () => {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const CONSULTATION_PHONE = "96176104882";

  const handleConsultationConfirm = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `Hello! I would like to schedule a consultation for:\n\n📅 Date: ${formattedDate}\n⏰ Time: ${time}\n\nPlease confirm if this time works for you. Thank you!`;
    const whatsappUrl = `https://wa.me/${CONSULTATION_PHONE}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: isMobile ? 30 : 100, opacity: 0, scale: isMobile ? 0.98 : 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: isMobile ? 0.8 : 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <>
      <section
        ref={sectionRef}
        id="contact-section"
        className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white via-[#fafafa] to-white overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={cardRef}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 md:p-12 border border-[rgba(199,158,72,0.2)] relative overflow-hidden"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[rgba(199,158,72,0.05)] to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tl from-[rgba(199,158,72,0.05)] to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                {/* PERFORMANCE FIX: Removed infinite rotation */}
                <div
                  className={`inline-flex items-center justify-center ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full mb-4 sm:mb-6 mx-auto`}
                  style={{ backgroundColor: `${GOLD_COLOR}15` }}
                >
                  <Calendar className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`} style={{ color: GOLD_COLOR }} />
                </div>

                <h2
                  className={`${isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl md:text-7xl lg:text-8xl'} font-luxury font-normal mb-3 sm:mb-4 relative uppercase`}
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
                  READY TO BEGIN YOUR JOURNEY?
                </h2>
                <p className={`${isMobile ? 'text-sm sm:text-base' : 'text-base md:text-lg lg:text-xl'} text-foreground mb-6 sm:mb-8`}>
                  Let's discuss how we can make your special day unforgettable
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <motion.div
                  whileHover={isMobile ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className={`w-full ${isMobile ? 'text-sm sm:text-base px-6 py-5' : 'text-lg px-8 py-7'} font-normal rounded-full shadow-xl hover:shadow-2xl transition-all duration-300`}
                    style={{
                      fontFamily: "'EB Garamond', serif",
                      letterSpacing: '-0.02em',
                      background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                      color: 'white',
                    }}
                    onClick={() => setIsConsultationModalOpen(true)}
                  >
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      Schedule a Consultation
                    </span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={isMobile ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className={`w-full ${isMobile ? 'text-sm sm:text-base px-6 py-5' : 'text-lg px-8 py-7'} font-normal rounded-full border-2 transition-all duration-300`}
                    style={{
                      fontFamily: "'EB Garamond', serif",
                      letterSpacing: '-0.02em',
                      borderColor: GOLD_COLOR,
                      color: GOLD_COLOR,
                    }}
                    onClick={() => {
                      const message = "Hi! I'm interested in your Wedding Package. Could you please provide more information?";
                      window.open(`https://wa.me/${CONSULTATION_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      💬 Contact via WhatsApp
                    </span>
                  </Button>
                </motion.div>
              </div>

              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 text-center">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground`}>
                  We respond to all inquiries within 24 hours
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        onConfirm={handleConsultationConfirm}
      />
    </>
  );
};

import BackToTop from "@/components/BackToTop";

const WeddingAndEvents = () => {
  useEffect(() => {
    // Add class to body to identify wedding page
    document.body.classList.add('wedding-page');

    // Make navigation semi-transparent with white text for wedding page
    const nav = document.querySelector('.ultra-navigation') as HTMLElement;
    if (!nav) {
      // Clean up body class if nav not found
      return () => {
        document.body.classList.remove('wedding-page');
      };
    }

    // Check if mobile
    const isMobileDevice = window.innerWidth <= 1024;

    // Set semi-transparent background - more visible on mobile
    const initialOpacity = isMobileDevice ? 0.7 : 0.3;
    const scrolledOpacity = isMobileDevice ? 0.9 : 0.5;

    nav.style.backgroundColor = `rgba(0, 0, 0, ${initialOpacity})`;
    nav.style.backdropFilter = 'blur(10px)';
    nav.style.transition = 'background-color 0.3s ease';

    // Update on scroll - keep semi-transparent but more opaque when scrolled
    // Use requestAnimationFrame to throttle scroll events (throttled to max 60fps)
    let rafId: number | null = null;
    let isMounted = true; // Track if component is still mounted
    let lastScrollTime = 0;
    const throttleMs = 16; // ~60fps max
    
    const handleScroll = () => {
      const now = Date.now();
      
      // Skip if already scheduled, unmounted, or too soon since last update
      if (rafId || !isMounted || (now - lastScrollTime < throttleMs)) return;
      
      rafId = requestAnimationFrame(() => {
        // Double-check mounted state and nav existence
        if (!isMounted || !nav) {
          rafId = null;
          return;
        }
        
        lastScrollTime = Date.now();
        const scrolled = window.scrollY > 50;
        nav.style.backgroundColor = scrolled
          ? `rgba(0, 0, 0, ${scrolledOpacity})`
          : `rgba(0, 0, 0, ${initialOpacity})`;
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      isMounted = false; // Mark as unmounted to prevent any pending callbacks
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('wedding-page');
      // Reset navigation when leaving page - only if nav still exists
      if (nav && nav.parentNode) {
        nav.style.backgroundColor = '';
        nav.style.backdropFilter = '';
        nav.style.transition = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden relative bg-white">
      <UltraNavigation />
      <div className="relative z-10">
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <WeddingHero />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <ServiceSection
              title="Wedding Flowers"
              description="Create your dream wedding with our exquisite floral designs. From bridal bouquets to ceremony decorations, we provide elegant and timeless arrangements that capture the essence of your special day. Every petal is carefully selected and arranged to perfection."
              images={weddingFlowersImages}
              index={0}
              features={[
                "Custom bridal bouquets",
                "Ceremony arch decorations",
                "Aisle arrangements",
                "Altar floral displays"
              ]}
            />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <ServiceSection
              title="Event Flowers"
              description="Enhance your events with stunning floral arrangements. Whether it's a corporate gathering or a private party, we tailor our designs to suit the occasion. Our expert florists create memorable centerpieces and decorations that leave a lasting impression."
              images={eventFlowersImages}
              index={1}
              features={[
                "Corporate event arrangements",
                "Private party decorations",
                "Custom centerpieces",
                "Venue transformation"
              ]}
            />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <ServiceSection
              title="Design Your Bouquet"
              description="Choose from a variety of flowers and colors to create a personalized bouquet for your special day. Our experts will help you craft the perfect arrangement that reflects your unique style and vision. Every detail is tailored to your preferences."
              images={weddingFlowersImages}
              index={2}
              features={[
                "Personalized consultations",
                "Wide selection of flowers",
                "Custom color schemes",
                "Expert design guidance"
              ]}
            />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <PackageSection />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <ImageGallery />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <ContactSection />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="600px 0px">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </LazySection>
      </div>
      <BackToTop />
    </div>
  );
};

export default WeddingAndEvents;
