import React, { useEffect, useRef, useState, memo, useCallback, Suspense } from 'react';
import SEO from '@/components/SEO';
import { getProductImageAlt } from '@/lib/imageAltUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { collectionQueryKeys } from '@/hooks/useCollectionProducts';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, ShoppingCart, ArrowLeft, Sparkles } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCartWithToast } from '@/hooks/useCartWithToast';
import UltraNavigation from '@/components/UltraNavigation';
import BackToTop from '@/components/BackToTop';

const Footer = React.lazy(() => import('@/components/Footer'));

gsap.registerPlugin(ScrollTrigger);

const Favorites = memo(() => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { favorites, removeFromFavorites, isFavorite, toggleFavorite, getTotalFavorites } = useFavorites();
  const { addToCart } = useCartWithToast();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null);

  useEffect(() => {
    // Ensure at top on page mount
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [favorites]);

  const totalFavorites = getTotalFavorites();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#faf9f7] to-white relative overflow-hidden">
      <SEO title="Favorites" noIndex />
      <UltraNavigation />
      
      {/* Optimized Floating Background Elements - Reduced for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#C79E48]/4 to-transparent rounded-full blur-2xl opacity-60" 
          style={{ 
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            willChange: 'opacity'
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#C79E48]/4 to-transparent rounded-full blur-2xl opacity-60" 
          style={{ 
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '1s',
            willChange: 'opacity'
          }} 
        />
      </div>

      <section 
        ref={sectionRef}
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Section - Elegant and Powerful */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Sharp Header Text Above */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p 
                className="font-luxury text-xs sm:text-sm font-normal uppercase mb-2"
                style={{
                  color: '#2c2d2a',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  letterSpacing: '-0.02em'
                }}
              >
                YOUR CURATED COLLECTION
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#C79E48]" />
                <div className="h-1 w-1 rounded-full bg-[#C79E48]" />
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#C79E48]" />
              </div>
            </motion.div>

            {/* My Favorites Title */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 
                className="font-luxury text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal mb-2"
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
                MY FAVORITES
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#C79E48]" />
                <div className="h-1 w-1 rounded-full bg-[#C79E48]" />
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#C79E48]" />
              </div>
            </motion.div>
            
            {/* Description Text */}
            <motion.p 
              className="font-luxury text-xs sm:text-sm font-normal uppercase mb-8"
              style={{
                color: '#2c2d2a',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                letterSpacing: '-0.02em'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {totalFavorites > 0 
                ? `YOU HAVE ${totalFavorites} ${totalFavorites === 1 ? 'BEAUTIFUL ITEM' : 'BEAUTIFUL ITEMS'} SAVED FOR LATER`
                : 'YOUR FAVORITES COLLECTION IS EMPTY. START ADDING ITEMS YOU LOVE!'
              }
            </motion.p>

            {/* Back Button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span 
                  className="font-luxury text-xs sm:text-sm font-normal uppercase"
                  style={{
                    color: '#2c2d2a',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  BACK TO COLLECTION
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Favorites Grid - Powerful Layout */}
          {totalFavorites === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* PERFORMANCE FIX: Removed infinite animation */}
              <div className="inline-block mb-8">
                <Heart className="w-20 h-20 text-foreground mx-auto" strokeWidth={1} />
              </div>
              <h2 
                className="font-luxury text-2xl sm:text-3xl font-normal uppercase mb-4"
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
                NO FAVORITES YET
              </h2>
              <p 
                className="font-luxury text-xs sm:text-sm font-normal uppercase mb-8"
                style={{
                  color: '#2c2d2a',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  letterSpacing: '-0.02em'
                }}
              >
                START EXPLORING AND ADD ITEMS YOU LOVE TO YOUR FAVORITES
              </p>
              <button
                onClick={() => navigate('/collection')}
                className="px-8 py-4 hover:opacity-70 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, #C79E48 0%, #D4A85A 100%)',
                  boxShadow: '0 4px 12px rgba(199, 158, 72, 0.3)'
                }}
              >
                <span 
                  className="font-luxury text-xs sm:text-sm font-normal uppercase text-white"
                  style={{
                    letterSpacing: '-0.02em'
                  }}
                >
                  EXPLORE COLLECTION
                </span>
              </button>
            </motion.div>
          ) : (
            <div 
              ref={containerRef}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10"
            >
              <AnimatePresence mode="popLayout">
                {favorites.map((favorite, index) => {
                  const isHovered = hoveredCard === favorite.id;
                  const isFav = isFavorite(favorite.id);
                  
                  return (
                    <motion.div
                      key={favorite.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -50 }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.23, 1, 0.32, 1],
                        layout: { duration: 0.3 }
                      }}
                      className="group"
                      onHoverStart={() => setHoveredCard(favorite.id)}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      {/* Premium Luxury Card - Optimized Design */}
                      <Link
                        to={`/product/${favorite.id}`}
                        onMouseEnter={() => {
                          // Prefetch product data on hover for instant navigation
                          queryClient.prefetchQuery({
                            queryKey: collectionQueryKeys.detail(String(favorite.id)),
                            queryFn: async () => {
                              const { getCollectionProduct } = await import('@/lib/api/collection-products');
                              return getCollectionProduct(String(favorite.id));
                            },
                            staleTime: 5 * 60 * 1000,
                          });
                        }}
                        className="block"
                      >
                      <motion.div
                        className="relative rounded-2xl overflow-hidden cursor-pointer border border-slate-200/80"
                        style={{
                          background: 'linear-gradient(180deg, #ffffff 0%, #fefcfb 100%)',
                          boxShadow: isHovered 
                            ? '0 24px 48px rgba(199, 158, 72, 0.2), 0 0 0 2px rgba(199, 158, 72, 0.4)'
                            : '0 8px 32px rgba(0, 0, 0, 0.08)',
                          willChange: 'transform, box-shadow',
                          // ⚡ PERFORMANCE: CSS containment for better scroll performance
                          contain: 'layout style paint'
                        }}
                        animate={{
                          y: isHovered ? -4 : 0,
                          scale: isHovered ? 1.04 : 1,
                        }}
                        transition={{ 
                          duration: 0.3, 
                          ease: [0.23, 1, 0.32, 1] 
                        }}
                      >
                        {/* Optimized Pink Border Overlay - Simplified */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                          style={{
                            boxShadow: isHovered 
                              ? 'inset 0 0 0 2px rgba(199, 158, 72, 0.5)'
                              : 'inset 0 0 0 0px rgba(199, 158, 72, 0)',
                          }}
                          transition={{ duration: 0.4 }}
                        />

                        {/* Sharp Corner Accent */}
                        {isHovered && (
                          <motion.div
                            className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-t-[#C79E48] border-l-[24px] border-l-transparent z-20"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        {/* Image Section - Optimized */}
                        <div className="relative h-48 sm:h-72 lg:h-80 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                          <motion.img
                            src={favorite.image || favorite.imageUrl}
                            alt={getProductImageAlt({ name: favorite.title || favorite.name || 'Favorite' })}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                            style={{
                              willChange: 'transform'
                            }}
                            animate={{
                              scale: isHovered ? 1.08 : 1,
                            }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                          />
                          
                          {/* Sharp Gradient Overlay */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                          />
                          
                          {/* Gold Glow Overlay on Hover */}
                          {isHovered && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-[#C79E48]/10 via-transparent to-transparent"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4 }}
                            />
                          )}

                          {/* Optimized Floating Action Buttons - Removed backdrop-blur */}
                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2 z-20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <motion.button
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative overflow-visible"
                              style={{
                                background: isFav ? 'rgba(199, 158, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                willChange: 'transform, box-shadow'
                              }}
                              whileHover={{ 
                                scale: 1.15,
                                y: -2,
                                boxShadow: '0 6px 20px rgba(199, 158, 72, 0.4)'
                              }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(favorite);
                              }}
                            >
                              <Heart 
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${isFav ? 'fill-white text-white' : 'text-foreground'}`} 
                                strokeWidth={2.5} 
                              />
                            </motion.button>
                          </div>

                          {/* Featured Badge */}
                          {favorite.featured && (
                            <span 
                              className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-normal text-white shadow-lg flex items-center gap-1"
                              style={{ 
                                fontFamily: "'EB Garamond', serif", 
                                letterSpacing: '-0.02em',
                                background: 'linear-gradient(90deg, #C79E48 0%, #D4A85A 100%)'
                              }}
                            >
                              <Sparkles className="w-3 h-3" />
                              FAVORITE
                            </span>
                          )}
                        </div>

                        {/* Content Section - Sharper Typography */}
                        <div className="p-4 sm:p-5 lg:p-7 bg-gradient-to-b from-white to-slate-50/50">
                          <h3 
                            className="font-luxury text-[10px] sm:text-xs lg:text-sm font-normal uppercase mb-2 sm:mb-3 line-clamp-1"
                            style={{
                              color: '#2c2d2a',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {favorite.title || favorite.name}
                          </h3>
                          
                          {/* Sharp Gold Underline - Simplified */}
                          <div 
                            className="h-[2px] sm:h-[3px] bg-gradient-to-r from-[#C79E48] via-[#D4A85A] to-[#E5C17A] mb-3 sm:mb-5 rounded-full transition-all duration-300"
                            style={{ width: isHovered ? '60px' : '32px' }}
                          />

                          <p 
                            className="font-luxury text-xs sm:text-sm lg:text-base font-normal mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3 min-h-[3rem] sm:min-h-[4rem] leading-relaxed text-foreground" 
                            style={{
                              letterSpacing: '0.02em'
                            }}
                          >
                            {favorite.description || 'Premium floral arrangement crafted with exquisite attention to detail'}
                          </p>

                          {/* Price and Actions - Enhanced */}
                          <div className="flex items-end justify-between pt-2 border-t border-slate-200/60">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-normal bg-gradient-to-r from-[#C79E48] via-[#D4A85A] to-[#E5C17A] bg-clip-text text-transparent leading-none" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                                  ${favorite.price}
                                </span>
                                <span 
                                  className="font-luxury text-[10px] sm:text-xs lg:text-sm font-normal mb-0.5 text-foreground"
                                  style={{
                                    letterSpacing: '0.05em'
                                  }}
                                >
                                  USD
                                </span>
                              </div>
                              <p 
                                className="font-luxury text-[10px] sm:text-xs lg:text-sm font-normal mt-1 text-foreground"
                                style={{
                                  letterSpacing: '0.05em'
                                }}
                              >
                                Per arrangement
                              </p>
                            </div>

                            <motion.button
                              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center relative overflow-hidden group/btn border-2 border-[#C79E48]/20 flex-shrink-0 ml-2"
                              style={{
                                background: isHovered 
                                  ? 'linear-gradient(135deg, #C79E48 0%, #D4A85A 50%, #E5C17A 100%)'
                                  : 'linear-gradient(135deg, #C79E48 0%, #D4A85A 100%)',
                                boxShadow: isHovered
                                  ? '0 8px 24px rgba(199, 158, 72, 0.5)'
                                  : '0 6px 20px rgba(199, 158, 72, 0.35)',
                                willChange: 'transform, box-shadow'
                              }}
                              whileHover={{
                                scale: 1.1
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({
                                  id: favorite.id,
                                  title: favorite.title || favorite.name || '',
                                  price: favorite.price,
                                  image: favorite.image || favorite.imageUrl || ''
                                });
                              }}
                            >
                              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white relative z-10" strokeWidth={2.5} />
                              
                              {/* PERFORMANCE FIX: Removed infinite shimmer animation */}
                            </motion.button>
                          </div>
                        </div>

                        {/* Optimized Ambient Particles - Reduced for performance */}
                        {isHovered && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full"
                                style={{
                                  background: 'rgba(199, 158, 72, 0.5)',
                                  left: `${25 + i * 25}%`,
                                  top: `${35 + i * 10}%`,
                                  willChange: 'transform, opacity'
                                }}
                                animate={{
                                  y: [0, -20, 0],
                                  opacity: [0, 0.8, 0]
                                }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
      <BackToTop />
      
      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
});

Favorites.displayName = 'Favorites';

export default Favorites;
