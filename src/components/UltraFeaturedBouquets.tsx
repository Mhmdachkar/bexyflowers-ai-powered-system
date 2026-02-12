import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { collectionQueryKeys } from '@/hooks/useCollectionProducts';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Eye, Crown, ArrowUpRight } from 'lucide-react';
import { useCartWithToast } from '@/hooks/useCartWithToast';
import { useIsMobile } from '@/hooks/use-mobile';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SignatureQuickView from './SignatureQuickView';
import { useSignatureCollection } from '@/hooks/useSignatureCollection';
import { encodeImageUrl } from '@/lib/imageUtils';
import { getProductImageAlt } from '@/lib/imageAltUtils';

gsap.registerPlugin(ScrollTrigger);

const UltraFeaturedBouquets = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCartWithToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBouquet, setSelectedBouquet] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // Use React Query hook for optimized data fetching
  // PERFORMANCE: Removed redundant refetch() - useSignatureCollection already has refetchOnMount: true
  // This was causing duplicate API calls on every component mount
  const { data: signatureCollections, isLoading: loading } = useSignatureCollection();

  // Transform signature collections to bouquets format
  // IMPORTANT: Use custom fields from signature_collections if available, otherwise use product defaults
  const allBouquets = signatureCollections?.map((item) => {
    // Use custom images if available, otherwise use product images
    const images = item.custom_image_urls && item.custom_image_urls.length > 0
      ? item.custom_image_urls
      : item.product?.image_urls || [];
    
    const imageUrl = images[0];
    if (!imageUrl || !imageUrl.trim()) return null;

    // Use custom fields if available, otherwise fall back to product fields
    const title = item.custom_title || item.product?.title || '';
    const description = item.custom_description || item.product?.description || '';
    const price = item.custom_price ?? item.product?.price ?? 0;
    const discountPercentage = item.discount_percentage ?? item.product?.discount_percentage ?? null;
    const imageRotations = (item as any).image_rotations || {};

    return {
      id: item.product?.id || item.id,
      name: title,
      price: price,
      image: encodeImageUrl(imageUrl),
      images: images.map(url => encodeImageUrl(url)),
      description: description,
      category: item.product?.category || 'signature',
      displayCategory: item.product?.display_category || 'Signature Collection',
      featured: item.product?.featured || true,
      is_out_of_stock: item.is_out_of_stock || item.product?.is_out_of_stock || false,
      is_best_selling: item.is_best_selling || false,
      discount_percentage: discountPercentage,
      tags: item.tags || item.product?.tags || [],
      signature_order: item.display_order,
      signature_id: item.id,
      image_rotations: imageRotations, // Include rotation data
    };
  }).filter(Boolean) || [];

  // Show all 6 cards on both mobile and desktop (3 per row)
  const bouquets = allBouquets;


  // Setup GSAP hover effects (no scroll animations)
  useEffect(() => {
    if (loading || bouquets.length === 0) {
      // Return empty cleanup if not ready
      return () => {
        gsap.killTweensOf(cardsRef.current);
      };
    }
    
    const cards = cardsRef.current;
    if (cards.length === 0) {
      return () => {
        gsap.killTweensOf(cards);
      };
    }

    // Set initial states - visible immediately
    gsap.set(cards, { y: 0, opacity: 1, rotateX: 0 });

    // Enhanced 3D hover effects for modern cards
    const eventHandlers: Array<{ card: HTMLElement; mouseenter: (e: Event) => void; mouseleave: (e: Event) => void }> = [];
    
    cards.forEach((card, index) => {
      const image = card.querySelector('img');
      const actionButtons = card.querySelector('[class*="absolute top-4 right-4"]');
      const button = card.querySelector('button');
      const glitterContainer = card.querySelector('[class*="Modern Dynamic Glitter Effect"]');

      let hoverTl: gsap.core.Timeline;

      const handleMouseEnter = () => {
        hoverTl = gsap.timeline();
        
        hoverTl
          .to(card, {
            duration: 0.3,
            rotateX: 0,
            rotateY: 0,
            z: 0,
            scale: 1.03,
            ease: "power2.out"
          })
          .to(image, {
            duration: 0.3,
            scale: 1.08,
            filter: "brightness(1.05) saturate(1.05)",
            ease: "power2.out"
          }, 0)
          .to(actionButtons, {
            duration: 0.25,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)"
          }, 0.1)
          .to(button, {
            duration: 0.25,
            y: -1,
            scale: 1.02,
            ease: "power2.out"
          }, 0.2)
          .to(glitterContainer, {
            duration: 0.4,
            opacity: 1,
            ease: "power2.out"
          }, 0);
      };

      const handleMouseLeave = () => {
        if (hoverTl) hoverTl.kill();
        
        gsap.to(card, {
          duration: 0.25,
          rotateX: 0,
          rotateY: 0,
          z: 0,
          scale: 1,
          ease: "power2.out"
        });
        gsap.to(image, {
          duration: 0.25,
          scale: 1,
          filter: "brightness(1) saturate(1)",
          ease: "power2.out"
        });
        gsap.to(actionButtons, {
          duration: 0.2,
          y: -8,
          opacity: 0,
          ease: "power2.out"
        });
        gsap.to(button, {
          duration: 0.2,
          y: 0,
          scale: 1,
          ease: "power2.out"
        });
        gsap.to(glitterContainer, {
          duration: 0.3,
          opacity: 0,
          ease: "power2.out"
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      
      eventHandlers.push({
        card,
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave
      });
    });

    // Cleanup function
    return () => {
      // Remove all event listeners
      eventHandlers.forEach(({ card, mouseenter, mouseleave }) => {
        card.removeEventListener('mouseenter', mouseenter);
        card.removeEventListener('mouseleave', mouseleave);
      });
      // CRITICAL: Only kill ScrollTriggers created by this component to avoid killing others
      // Store ScrollTrigger IDs instead of killing all
      const triggers = ScrollTrigger.getAll();
      triggers.forEach(trigger => {
        // Only kill if it's related to this component's cards
        const triggerVars = trigger.vars as any;
        if (triggerVars && cards.some(card => card.contains(trigger.trigger as Node))) {
          trigger.kill();
        }
      });
      // Kill any active GSAP animations for these specific cards
      cards.forEach(card => gsap.killTweensOf(card));
    };
  }, [loading, bouquets.length]);

  // 🚨 CRITICAL FIX: Disable auto-scroll IntersectionObserver
  // This was creating unnecessary observers that could accumulate over time
  useEffect(() => {
    // DISABLED: Auto-scroll observer completely removed for stability
    console.log('✅ Auto-scroll observer DISABLED for performance');
    
    return () => {
      // No cleanup needed since we're not creating any observers
    };
  }, []);

  return (
    <>
    <section 
      ref={sectionRef}
        className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 relative overflow-hidden"
      data-section="signature-collection"
      style={{
          background: '#fff',
          fontFamily: '"Lato", sans-serif'
        }}
      >
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className="text-center mb-6 sm:mb-8 relative"
        >
          {/* Luxury Typography with Gold Accent */}
          <h2 
            className="font-luxury text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-8xl font-normal mb-4 sm:mb-6 relative px-2"
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
            SIGNATURE COLLECTION
            {/* Gold Underline */}
            <div 
              className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 sm:h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
              style={{
                width: 'clamp(100px, 30vw, 200px)'
              }}
            />
          </h2>

          {/* Enhanced Decorative Elements */}
          <div className="relative mb-4 sm:mb-6 md:mb-8">
            <div className="w-24 sm:w-32 md:w-40 h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rotate-45 shadow-lg shadow-amber-500/50" />
          </div>

          {/* Enhanced Description */}
          <p 
            className="font-body text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed font-light px-2"
            style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
          >
            Discover our curated selection of premium floral arrangements designed to elevate any space.
          </p>
        </div>

        <div className="flex justify-center">
          <div 
            ref={containerRef}
            className="w-full"
            style={{ marginTop: '1.5em' }}
          >
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                <p className="mt-4" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Loading signature collection...</p>
              </div>
            ) : bouquets.length === 0 ? (
              <div className="text-center py-20">
                <p style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>No signature collection items available.</p>
              </div>
            ) : (
            <div 
              className="grid grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto px-2 sm:px-4 w-full"
            >
          {bouquets.map((bouquet, index) => {
            // Define consistent gold color for all cards
            const currentColor = 'rgb(199, 158, 72)';

            // Define tag configurations for each card
            const tagConfigurations = [
              // Card 1
              [
                { text: 'VALENTINE', color: '#d3b19a' },
                { text: 'ROMANTIC', color: '#70b3b1' }
              ],
              // Card 2
              [
                { text: 'MOTHER\'S DAY', color: '#d05fa2' },
                { text: 'SPECIAL GIFT', color: '#d3b19a' }
              ],
              // Card 3
              [
                { text: 'BEST SELLING', color: '#70b3b1' },
                { text: 'POPULAR', color: '#d05fa2' }
              ],
              // Card 4
              [
                { text: 'BEST GIFT', color: '#d3b19a' },
                { text: 'LUXURY', color: '#70b3b1' }
              ],
              // Card 5
              [
                { text: 'ANNIVERSARY', color: '#d05fa2' },
                { text: 'CELEBRATION', color: '#d3b19a' }
              ],
              // Card 6
              [
                { text: 'NEW ARRIVAL', color: '#70b3b1' },
                { text: 'EXCLUSIVE', color: '#d05fa2' }
              ]
            ];
            
            return (
            <Link
              key={bouquet.id}
              to={bouquet.id ? `/product/${bouquet.id}` : '#'}
              onMouseEnter={() => {
                if (bouquet.id) {
                  // Prefetch product data on hover for instant navigation
                  queryClient.prefetchQuery({
                    queryKey: collectionQueryKeys.detail(bouquet.id),
                    queryFn: async () => {
                      const { getCollectionProduct } = await import('@/lib/api/collection-products');
                      return getCollectionProduct(bouquet.id);
                    },
                    staleTime: 5 * 60 * 1000,
                  });
                }
              }}
              onClick={(e) => {
                if (!bouquet.id) {
                  e.preventDefault();
                }
              }}
              className="block w-full"
            >
            <div
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
                className="group cursor-pointer w-full"
            >
                 {/* Card structure with fully rounded corners */}
                 <div 
                   className="card"
                   style={{
                     position: 'relative',
                     width: 'inherit',
                     height: 'auto',
                     background: '#fff',
                     borderRadius: '1.25rem',
                     maxWidth: isMobile ? '100%' : 'inherit'
                   }}
                 >
                     {/* Image */}
                     <div 
                       className={`imgBox ${isMobile ? 'h-48 sm:h-64' : 'h-64 sm:h-72 md:h-80 lg:h-[clamp(8rem,20vw,18.75rem)]'}`}
                       style={{
                         position: 'relative',
                         width: '100%',
                         borderRadius: '1rem 1rem 0 0',
                         overflow: 'hidden'
                       }}
                     >
                  <motion.img
                    src={bouquet.image}
                    alt={getProductImageAlt(bouquet)}
                    width="400"
                    height="500"
                         style={{
                           width: '100%',
                           height: '100%',
                           objectFit: 'cover',
                           transform: bouquet.image_rotations && bouquet.image_rotations[bouquet.image] 
                             ? `rotate(${bouquet.image_rotations[bouquet.image]}deg)` 
                             : 'none'
                         }}
                         className="transition-all duration-300 ease-out group-hover:scale-105"
                         loading={index < 3 ? "eager" : "lazy"}
                         decoding="async"
                         onError={(e) => {
                           console.error('Failed to load signature collection image:', bouquet.image, bouquet.name, e);
                           (e.target as HTMLImageElement).style.display = 'none';
                         }}
                       />

                       {/* CRITICAL: Discount Badge - Top Right Corner */}
                       {bouquet.discount_percentage && bouquet.discount_percentage > 0 && (
                         <div
                           style={{
                             position: 'absolute',
                             top: isMobile ? '0.5rem' : '1rem',
                             right: isMobile ? '0.5rem' : '1rem',
                             padding: isMobile ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
                             fontSize: isMobile ? '0.625rem' : '0.75rem',
                             fontWeight: '700',
                             fontFamily: "'EB Garamond', serif",
                             color: '#fff',
                             background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                             borderRadius: '0.25rem',
                             boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                             zIndex: 10,
                             letterSpacing: '0.05em',
                             textTransform: 'uppercase'
                           }}
                         >
                           {bouquet.discount_percentage}% OFF
                         </div>
                       )}

                       {/* Icon with sophisticated cut-out effect */}
                       <div 
                         className="icon"
                         style={{
                           position: 'absolute',
                           bottom: '-0.375rem',
                           right: '-0.375rem',
                           width: isMobile ? '4rem' : '6rem',
                           height: isMobile ? '4rem' : '6rem',
                           background:'#fff',
                           borderTopLeftRadius: '50%'
                         }}
                       >
                         {/* Pseudo-element simulation with divs */}
                         <div 
                           style={{
                             position: 'absolute',
                             content: '""',
                             bottom: '0.375rem',
                             left: '-1.25rem',
                             background: 'transparent',
                             width: '1.25rem',
                             height: '1.25rem',
                             borderBottomRightRadius: '1.25rem',
                             boxShadow: '0.313rem 0.313rem 0 0.313rem #fff'
                           }}
                         />
                         <div 
                       style={{
                             position: 'absolute',
                             content: '""',
                             top: '-1.25rem',
                             right: '0.375rem',
                             background: 'transparent',
                             width: '1.25rem',
                             height: '1.25rem',
                             borderBottomRightRadius: '1.25rem',
                             boxShadow: "0.313rem 0.313rem 0 0.313rem #fff"

                           }}
                         />
                         
                         <motion.div 
                           className="iconBox"
                       style={{
                             position: 'absolute',
                             inset: isMobile ? '0.5rem' : '0.725rem',
                             background: currentColor,
                             borderRadius: '50%',
                             display: 'flex',
                             justifyContent: 'center',
                             alignItems: 'center',
                             transition: '0.3s'
                           }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigation is handled by the parent Link component
                    }}
                  >
                          <ArrowUpRight color="#fff" size={isMobile ? 16 : 22} strokeWidth={1.8} />
                         </motion.div>
                  </div>
                </div>

                     {/* Content section */}
                     <div 
                       className={`content ${isMobile ? 'p-2 sm:p-4' : 'p-4 sm:p-5 md:p-6'}`}
                       style={{
                         borderRadius: '0 0 1rem 1rem'
                       }}
                     >
                    <h3 
                      style={{
                        textTransform: 'capitalize',
                        fontSize: isMobile ? 'clamp(0.75rem, 3vw, 1rem)' : 'clamp(1rem, 4vw, 1.8rem)',
                        color: '#2c2d2a',
                        fontFamily: "'EB Garamond', serif",
                        fontWeight: '400',
                        lineHeight: '1.2',
                        marginBottom: isMobile ? '0.25rem' : '0.375rem',
                        letterSpacing: '-0.02em'
                      }}
                    >
                    {bouquet.name}
                  </h3>
                    <p 
                      style={{
                        marginBottom: isMobile ? '0.5rem' : '0.75rem',
                        color: '#2c2d2a',
                        fontFamily: "'EB Garamond', serif",
                        fontSize: isMobile ? 'clamp(0.625rem, 2vw, 0.75rem)' : 'clamp(0.875rem, 2.5vw, 1rem)',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 1 : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      Fill out the form and the algorithm will offer the right team of experts
                    </p>
                    
                     {/* Tags */}
                     <ul 
                       style={{
                         margin: '0',
                         padding: '0',
                         listStyleType: 'none',
                         display: 'flex',
                         alignItems: 'center',
                         flexWrap: 'wrap',
                         gap: '0.625rem'
                       }}
                     >
                       {tagConfigurations[index].map((tag, tagIndex) => (
                         <li 
                           key={tagIndex}
                           style={{
                             textTransform: 'uppercase',
                             background: '#f0f0f0',
                             color: tag.color,
                             fontFamily: "'EB Garamond', serif",
                             fontWeight: '400',
                             fontSize: isMobile ? 'clamp(0.5rem, 1.5vw, 0.625rem)' : 'clamp(0.625rem, 2vw, 0.75rem)',
                             padding: isMobile ? '0.125rem 0.375rem' : '0.25rem 0.5rem',
                             borderRadius: '0.25rem',
                             whiteSpace: 'nowrap',
                             letterSpacing: '-0.02em'
                           }}
                         >
                           {tag.text}
                         </li>
                       ))}
                     </ul>
                </div>
              </div>
            </div>
            </Link>
             );
           })}
            </div>
            )}
          </div>
        </div>

        <div
          className="text-center mt-8 sm:mt-12 md:mt-16 px-2"
        >
          <motion.button
         className="
         inline-flex items-center justify-center gap-2 sm:gap-3
         px-6 sm:px-8 md:px-12 py-3 sm:py-3.5 md:py-4
         bg-gradient-to-r from-[rgb(160,120,40)] via-[rgb(199,158,72)] to-[rgb(240,210,150)]
         text-white
         rounded-xl sm:rounded-2xl
         font-normal text-xs sm:text-sm uppercase
         shadow-md shadow-yellow-600/30
         transition-all duration-300 ease-out
         hover:shadow-lg hover:shadow-yellow-500/40 hover:scale-[1.02]
         active:scale-[0.98]
         group
         w-full sm:w-auto
       "
       style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
       whileHover={{ scale: 1.03 }}
       whileTap={{ scale: 0.97 }}
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
              navigate('/collection');
              requestAnimationFrame(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
              });
            }}
          >
            <span>VIEW COMPLETE COLLECTION</span>
            <motion.div
              className="group-hover:translate-x-1 transition-transform duration-300"
            >
              →
            </motion.div>
          </motion.button>
        </div>
      </div>
    </section>

    {/* Signature Quick View Modal */}
    <SignatureQuickView
      open={isModalOpen}
      item={selectedBouquet}
      onClose={() => {
        setIsModalOpen(false);
        setSelectedBouquet(null);
      }}
    />
    </>
  );
};

export default UltraFeaturedBouquets;