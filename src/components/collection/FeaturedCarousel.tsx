import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { PriceDisplay } from "@/components/PriceDisplay";
import { getProductImageAlt } from "@/lib/imageAltUtils";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import type { Bouquet } from "@/types/bouquet";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface FeaturedCarouselProps {
  bouquets: Bouquet[];
  onBouquetClick: (bouquet: Bouquet) => void;
}

export const FeaturedCarousel = ({ bouquets, onBouquetClick }: FeaturedCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (carouselRef.current) {
      gsap.fromTo(carouselRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: carouselRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  }, []);

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden">
      <div 
        ref={carouselRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >

        {/* Carousel Container */}
        <div className="relative">
          <Swiper
            ref={swiperRef}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={bouquets.length > 3}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
            className="featured-swiper"
            style={{
              paddingTop: "50px",
              paddingBottom: "50px",
            }}
          >
            {bouquets.map((bouquet, index) => (
              <SwiperSlide
                key={bouquet.id}
                className="!w-[280px] sm:!w-80 md:!w-[400px] lg:!w-[450px] !h-[360px] sm:!h-96 md:!h-[500px] lg:!h-[550px]"
              >
                <motion.div
                  className="relative h-full group cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => onBouquetClick(bouquet)}
                >
                  {/* Card */}
                  <div className="relative h-full bg-white border border-gray-200 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    {/* Image */}
                    <div className="relative h-2/3 overflow-hidden bg-[#F5F5F5]">
                      <OptimizedImage
                        src={bouquet.image}
                        alt={getProductImageAlt(bouquet)}
                        width={450}
                        height={550}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={true}
                      />
                      
                      {/* Beautiful Discount Badge - Top Left */}
                      {bouquet.discount_percentage && bouquet.discount_percentage > 0 && (
                        <div 
                          className="absolute top-3 left-3 z-10 px-3 py-1.5 text-xs font-bold text-white shadow-lg"
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                          }}
                        >
                          {bouquet.discount_percentage}% OFF
                        </div>
                      )}
                    </div>
                    
                    {/* Content - Below Image */}
                    <div className="p-4 md:p-6 bg-white">
                      <p className="text-xs text-gray-600 font-normal mb-1">
                        {bouquet.displayCategory || bouquet.category || "Collection"}
                      </p>
                      <h3 className="font-luxury text-base md:text-lg font-normal text-foreground mb-2 leading-tight">
                        {bouquet.name}
                      </h3>
                      {/* Beautiful Price Display with Discount */}
                      <PriceDisplay 
                        price={bouquet.price}
                        discountPercentage={bouquet.discount_percentage}
                        size="md"
                        showDiscountBadge={false}
                      />
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <Button
            variant="outline"
            size="icon"
            className="swiper-button-prev-custom absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 border-primary/30 hover:border-primary hover:bg-primary/10 touch-target"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="swiper-button-next-custom absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 border-primary/30 hover:border-primary hover:bg-primary/10 touch-target"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </Button>
        </div>
      </div>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .featured-swiper .swiper-pagination {
            bottom: 10px !important;
          }
          
          .featured-swiper .swiper-pagination-bullet {
            background: hsl(var(--primary)) !important;
            opacity: 0.3 !important;
            width: 12px !important;
            height: 12px !important;
          }
          
          .featured-swiper .swiper-pagination-bullet-active {
            opacity: 1 !important;
            transform: scale(1.2) !important;
          }
          
          .featured-swiper .swiper-slide-shadow-left,
          .featured-swiper .swiper-slide-shadow-right {
            background: linear-gradient(to right, rgba(0,0,0,0.3), transparent) !important;
          }
          
          .featured-swiper .swiper-slide {
            transition: all 0.3s ease !important;
          }
        `
      }} />
    </section>
  );
};