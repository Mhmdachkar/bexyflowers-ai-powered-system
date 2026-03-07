'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import './CarouselHero.css';
import { useIsMobile } from '@/hooks/use-mobile';
import { useImagePreloader } from '@/hooks/useImagePreloader';

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
    productImage: '/assets/bexyhero.webp',
    // Soft pink → rose gradient background for desktop hero
    bgColor: 'linear-gradient(135deg, #fce0f0 0%, #f78fb3 50%, #f25c78 100%)'
  }
];

const CarouselHero = ({ slidesToShow, isHomepage = false }: CarouselHeroProps = {}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const swiperRef = useRef<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const handleShopNow = () => {
    navigate('/collection');
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.realIndex);
  };

  return (
    <div className="carousel-hero-container" ref={containerRef}>
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
          // On mobile, completely disable Swiper touch interactions so the page
          // never captures vertical scroll gestures inside the hero section.
          touchStartPreventDefault={false}
          allowTouchMove={!isMobile}
          simulateTouch={!isMobile}
          touchRatio={1}
          touchAngle={45}
          grabCursor={false}
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
                  <h3 className="main-header">
                    {slide.id === 'bexy-brand' ? 'BEXY FLOWERS' : slide.title.toUpperCase()}
                  </h3>
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
                    SHOP NOW
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
                      fetchPriority={index === 0 ? "high" : "low"}
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

        {slides.length > 1 && !isHomepage && (
          <div className="swiper-pagination" aria-label="Slide navigation"></div>
        )}
      </div>
    </div>
  );
};

export default CarouselHero;