import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import './CarouselHero.css';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIOSPerformance } from '@/hooks/use-ios-performance';
import { useImagePreloader } from '@/hooks/useImagePreloader';
// WebM video - using ?url suffix for Vite to handle it as an asset
// Optimized: 720p max, no audio, compressed WebM for smaller file size
import video1Url from '@/assets/video/video1.WebM?url';

interface SlideData {
  id: string;
  title: string;
  price: string;
  contentTitle: string;
  contentSubtitle: string;
  productImage: string;
  bgColor: string;
}

interface CarouselHeroProps {
  slidesToShow?: SlideData[];
  isHomepage?: boolean;
}

// Helper function to get image path
const getImagePath = (imageName: string) => {
  return `/assets/hero_section/${imageName}`;
};

// All slides (used by Collection page)
const allSlides: SlideData[] = [
  {
    id: 'romantic',
    title: 'Romantic',
    price: '$49.90',
    contentTitle: 'Where emotions bloom into timeless elegance.',
    contentSubtitle: 'Every arrangement is a masterpiece of passion and artistry. Handcrafted by master florists, our premium collections transform moments into unforgettable memories.',
    productImage: getImagePath('image1.webp'),
    bgColor: 'rgb(143, 5, 36)'
  },
  {
    id: 'elegant',
    title: 'Elegant',
    price: '$59.90',
    contentTitle: 'Sophistication meets artistic excellence.',
    contentSubtitle: 'Discover the art of luxury floristry. Each creation is meticulously designed to reflect your refined taste and celebrate life\'s most distinguished occasions.',
    productImage: getImagePath('image2.webp'),
    bgColor: '#e9bf8b'
  },
  {
    id: 'luxury',
    title: 'Luxury',
    price: '$79.90',
    contentTitle: 'Exquisite artistry for the most discerning.',
    contentSubtitle: 'Experience the pinnacle of floral design. Our exclusive collections feature rare blooms and artistic arrangements that make a statement of unparalleled elegance.',
    productImage: getImagePath('image3.webp'),
    bgColor: '#b6d6c8'
  },
  {
    id: 'celebration',
    title: 'Celebration',
    price: '$69.90',
    contentTitle: 'Celebrate every moment with extraordinary beauty.',
    contentSubtitle: 'Life\'s milestones deserve exceptional arrangements. Our celebration collections bring vibrant elegance to every occasion, crafted with passion and attention to detail.',
    productImage: getImagePath('image4.webp'),
    bgColor: '#e86357'
  }
];

// Homepage slide (single slide for desktop) - Brand-focused content
// Desktop hero image now uses the dedicated bexyhero asset
const homepageSlides: SlideData[] = [
  {
    id: 'bexy-brand',
    title: 'Bexy Flowers',
    price: '',
    contentTitle: 'Lebanon\'s Premier Luxury Florist',
    contentSubtitle: 'Bexy Flowers represents the pinnacle of floral artistry in Lebanon. We craft extraordinary arrangements that elevate every moment with sophistication, elegance, and timeless beauty. Experience the art of premium floristry.',
    productImage: '/assets/bexyhero.png',
    // Soft pink → rose gradient background for desktop hero
    bgColor: 'linear-gradient(135deg, #fce0f0 0%, #f78fb3 50%, #f25c78 100%)'
  }
];

const CarouselHero = ({ slidesToShow, isHomepage = false }: CarouselHeroProps = {}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isOldIOS, needsMobileOptimizations } = useIOSPerformance();
  const needsOptimizations = needsMobileOptimizations; // old iOS or Android
  const swiperRef = useRef<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  // Determine which slides to use
  // Homepage desktop: 1 slide, Homepage mobile: all slides, Collection: all slides
  const slides = slidesToShow || (isHomepage && !isMobile ? homepageSlides : allSlides);

  // Memoize to prevent new array every render (useImagePreloader effect thrash → page freeze)
  const allSlideImages = useMemo(
    () => slides.map((slide) => slide.productImage),
    [slides]
  );

  // Preload all images
  useImagePreloader(allSlideImages);

  // Note: First image is preloaded in index.html for optimal LCP
  // Other images are preloaded via useImagePreloader hook

  // Set body data attribute for styling
  useEffect(() => {
    document.body.setAttribute('data-sld', String(currentSlide));
    
    return () => {
      document.body.removeAttribute('data-sld');
    };
  }, [currentSlide]);

  // Mark images as loaded after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for lazy loading video only when visible
  // PERFORMANCE FIX: Keep observer active to pause/resume video
  // iOS 18 OPTIMIZATION: More aggressive pausing and reduced quality for older iOS
  useEffect(() => {
    if (!isMobile) return;

    // Observe the container to detect when hero section enters viewport
    const targetElement = containerRef.current || videoRef.current;
    if (!targetElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = videoRef.current;
          if (entry.isIntersecting) {
            setIsVideoVisible(true);
            setShouldLoadVideo(true);
            // PERFORMANCE FIX: Play video when visible (use ref directly, not state)
            if (videoElement) {
              // iOS/Android OPTIMIZATION: Reduce playback rate for better performance
              if (needsOptimizations) {
                videoElement.playbackRate = 0.85; // Slightly slower playback reduces CPU usage
              }
              videoElement.play().catch(() => {
                // Auto-play prevented, video will play when user interacts
              });
            }
          } else {
            setIsVideoVisible(false);
            if (videoElement) {
              videoElement.pause();
              // iOS/Android OPTIMIZATION: More aggressive memory cleanup on mobile
              if (needsOptimizations) {
                videoElement.currentTime = 0;
                // Clear video buffer on old iOS; on Android just reset time to save memory
                if (isOldIOS) {
                  videoElement.removeAttribute('src');
                  videoElement.load();
                }
              } else {
                videoElement.currentTime = 0;
              }
            }
          }
        });
      },
      {
        root: null,
        // iOS/Android OPTIMIZATION: Smaller rootMargin on mobile to reduce intersection checks
        rootMargin: needsOptimizations ? '50px' : '100px',
        threshold: 0.01, // Trigger when 1% visible
      }
    );

    observer.observe(targetElement);

    return () => {
      observer.disconnect();
    };
  }, [isMobile, needsOptimizations, isOldIOS]);

  // Load and play video when it becomes visible
  // iOS 18 OPTIMIZATION: Optimize video settings for older iOS devices
  useEffect(() => {
    if (!isMobile || !videoRef.current || !shouldLoadVideo) return;

    const videoElement = videoRef.current;
    
    // iOS/Android OPTIMIZATION: Reduce playback rate and optimize settings
    if (needsOptimizations) {
      videoElement.playbackRate = 0.85; // Slightly slower playback reduces CPU usage
      videoElement.volume = 0.9; // Slightly lower volume
    }
    
    // Force video to cover full width
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
    
    // Force full width immediately
    forceFullWidth();
    
    // Load the video source
    videoElement.load();
    
    // Force full width after load
    videoElement.addEventListener('loadedmetadata', forceFullWidth);
    videoElement.addEventListener('loadeddata', forceFullWidth);
    
    // Attempt to play (may require user interaction on some browsers)
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented, video will play when user interacts
      });
    }
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', forceFullWidth);
      videoElement.removeEventListener('loadeddata', forceFullWidth);
    };
  }, [isMobile, shouldLoadVideo, needsOptimizations]);

  // Handle window resize to ensure video stays full width - Throttled for performance
  useEffect(() => {
    if (!isMobile || !videoRef.current) return;

    let resizeTimer: NodeJS.Timeout | null = null;
    let initialTimeoutId: NodeJS.Timeout | null = null; // FIX: Store initial timeout for cleanup
    
    const handleResize = () => {
      if (!videoRef.current) return;
      
      // Use RAF for smoother updates
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.style.width = '100vw';
          videoRef.current.style.maxWidth = '100vw';
          videoRef.current.style.left = '0';
          videoRef.current.style.right = '0';
        }
      });
    };

    // Throttled resize handler
    const throttledResize = () => {
      if (resizeTimer) return;
      resizeTimer = setTimeout(() => {
        handleResize();
        resizeTimer = null;
      }, 150); // Throttle to max once per 150ms
    };

    window.addEventListener('resize', throttledResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    // FIX: Store initial timeout so it can be cleaned up
    initialTimeoutId = setTimeout(handleResize, 100);

    return () => {
      // FIX: Clear initial timeout
      if (initialTimeoutId) {
        clearTimeout(initialTimeoutId);
        initialTimeoutId = null;
      }
      if (resizeTimer) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
      }
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isMobile]);

  const handleShopNow = () => {
    navigate('/collection');
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.realIndex);
  };

  return (
    <div className="carousel-hero-container" ref={containerRef}>
      {/* Video background for mobile view - Optimized with lazy loading */}
      {isMobile && (
        <video
          ref={videoRef}
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={getImagePath('image1.png')}
          aria-label="Hero background video"
        >
          {shouldLoadVideo && (
            <source src={video1Url} type="video/webm" />
          )}
        </video>
      )}
      <div className="carousel-hero-wrapper">
        <Swiper
          modules={[Pagination, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          loop={slides.length > 1}
          effect="fade"
          fadeEffect={{
            crossFade: true
          }}
          speed={800}
          autoplay={false}
          pagination={slides.length > 1 ? {
            el: '.swiper-pagination',
            type: 'fraction',
            formatFractionCurrent: (number) => String(number),
            formatFractionTotal: (number) => String(number),
          } : false}
          observer={false}
          observeParents={false}
          watchSlidesProgress={false}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // Update Swiper dimensions after initialization (guard against destroyed instance)
            setTimeout(() => {
              const instance = swiperRef.current;
              if (!instance || (instance as any).destroyed) return;
              instance.update();
              instance.updateSize();
              instance.updateSlides();
            }, 100);
          }}
          onSlideChange={handleSlideChange}
          onResize={(swiper) => {
            // Guard against updates on a destroyed or undefined swiper instance
            if (!swiper || (swiper as any).destroyed) return;
            swiper.update();
            swiper.updateSize();
            swiper.updateSlides();
          }}
          className="mySwiper"
        >
          {(isMobile ? [...slides, ...slides.slice(0, 2)] : slides).map((slide, index) => (
            <SwiperSlide key={`${slide.id}-${index}`} className="main">
              <div className="left-side">
                <div className="main-wrapper">
                  <h3 className="main-header">Bexy Flowers</h3>
                  <h1 className="main-title">{slide.title}</h1>
                  {isMobile && <h2 className="main-subtitle">{slide.price}</h2>}
                </div>
                <div className="main-content">
                  <div className="main-content__title">{slide.contentTitle}</div>
                  <div className="main-content__subtitle">{slide.contentSubtitle}</div>
                  <button 
                    className="more-menu" 
                    onClick={handleShopNow}
                    aria-label={`Shop ${slide.title} collection`}
                  >
                    Shop Now
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      strokeWidth="1.7" 
                      stroke="currentColor" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <line x1="15" y1="16" x2="19" y2="12" />
                      <line x1="15" y1="8" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
              
                <div className="center">
                  <div 
                    className="right-side__img"
                    style={{
                      // Allow solid colors or gradients for background
                      background: slide.bgColor
                    }}
                  >
                    <img
                      className="bottle-img"
                      src={slide.productImage}
                      alt={`${slide.title} flower arrangement`}
                      width="600"
                      height="800"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding={index === 0 ? "sync" : "async"}
                      fetchpriority={index === 0 ? "high" : "low"}
                      style={{
                        contentVisibility: index === 0 ? 'auto' : 'auto',
                      }}
                      onLoad={() => {
                        // Update Swiper when images load
                        if (swiperRef.current) {
                          setTimeout(() => {
                            swiperRef.current?.update();
                            swiperRef.current?.updateSize();
                            swiperRef.current?.updateSlides();
                          }, 50);
                        }
                      }}
                    />
                  </div>
                </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-pagination" aria-label="Slide navigation"></div>
      </div>
    </div>
  );
};

export default CarouselHero;