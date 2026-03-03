'use client';

import { useEffect, useRef, useState, useCallback, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate, useLocation } from '@/lib/navigation-compat';
import { gsap } from 'gsap';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRoutePrefetch } from '@/hooks/useRoutePrefetch';
import { useRouteState } from '@/contexts/RouteStateContext';
import { useNavigationPrefetch } from '@/hooks/useNavigationPrefetch';
import { isAndroid } from '@/utils/performance';
import {
  ShoppingBag,
  Menu,
  X,
  Home,
  Flower2,
  Sparkles,
  Crown,
  Heart,
  Star,
  Calendar,
  Settings,
  Instagram
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
// Import from public folder - Next.js serves /public files at root
const logoImage = '/assets/bexy-flowers-logo-sm.webp';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Luxury Menu Icon Component
const LuxuryMenuIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    <path d="M4 8H20" />
    <path d="M4 16H20" />
  </svg>
);

// Luxury Close Icon Component
const LuxuryCloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Home",
    path: "/",
    icon: <Home className="w-5 h-5" />,
    description: "Luxury Floral Experience"
  },
  {
    name: "Collection",
    path: "/collection",
    icon: <Flower2 className="w-5 h-5" />,
    description: "Premium Arrangements"
  },
  {
    name: "Custom",
    path: "/customize",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Bespoke Creations"
  },
  {
    name: "Wedding & Events",
    path: "/wedding-and-events",
    icon: <Calendar className="w-5 h-5" />,
    description: "Special Occasions"
  },
  {
    name: "About",
    path: "/about",
    icon: <Crown className="w-5 h-5" />,
    description: "Our Story"
  }
];

const GOLD_COLOR = "rgb(199, 158, 72)";

const UltraNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();
  const { getTotalFavorites } = useFavorites();
  const cartItems = getTotalItems();
  const favoritesCount = getTotalFavorites();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

  // React Query-based navigation prefetching
  const { handleLinkHover, handleLinkFocus } = useNavigationPrefetch();
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();

  // Detect Android device once on mount for Android-specific UI optimizations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setIsAndroidDevice(isAndroid());
    } catch {
      setIsAndroidDevice(false);
    }
  }, []);

  // ⚡ PERFORMANCE: Preload cart + checkout on hover for fast navigation
  const preloadCartDashboard = () => {
    import('@/components/cart/CartDashboard');
    import('@/views/Checkout');
  };

  useEffect(() => {
    const nav = navRef.current;
    const logo = logoRef.current;

    if (nav && logo) {
      // Ensure logo is static and nav uses CSS-driven transparency/blur only.
      gsap.set(logo, { scale: 1, rotation: 0 });
    }
  }, [isMobile, shouldReduceMotion]);

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);

    // Prevent body scroll when menu is open on mobile
    if (isMobile && typeof document !== 'undefined') {
      if (newState) {
        // Use overflow-only lock to avoid Android scroll bugs with position: fixed
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    if (menuRef.current) {
      if (newState) {
        gsap.fromTo(menuRef.current,
          { opacity: 0, y: -50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
        );
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && navRef.current) {
        const target = event.target as Node;
        // Check if click is outside both menu and navigation
        if (
          !menuRef.current.contains(target) &&
          !navRef.current.contains(target)
        ) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      // Add event listener with a small delay to avoid immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  // ⚡ PERFORMANCE: Route prefetching and state management
  const { handlePrefetch, cancelPrefetch } = useRoutePrefetch();
  const { navigateWithState } = useRouteState();

  const handleNavigation = useCallback((path: string, state?: any) => {
    cancelPrefetch();

    // Use startTransition for smoother navigation
    startTransition(() => {
      // Force scroll reset around navigation to ensure new page starts at top
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

      // Use optimized navigation with state caching
      navigateWithState(path, state);

      setIsMenuOpen(false);
      
      // Restore body scroll on mobile
      if (isMobile) {
        document.body.style.overflow = "";
      }
      
      // Run again on next frame to beat layout/animation timing
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    });
  }, [cancelPrefetch, navigateWithState, isMobile]);

  // Scroll effect for navbar
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
            ref={navRef}
            className={`ultra-navigation fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
              ? 'shadow-luxury'
              : ''
              }`}
            style={{
              transition: 'all 0.4s ease-in-out',
              pointerEvents: 'auto', // Ensure navigation is clickable
              position: 'fixed',
              width: '100%',
              // On Android and small screens, avoid heavy backdrop blur for smoother scrolling
              backgroundColor: isScrolled
                ? (isMobile || isAndroidDevice ? 'rgba(229, 228, 226, 0.98)' : 'rgba(255, 255, 255, 0.85)')
                : (isMobile || isAndroidDevice ? 'rgba(229, 228, 226, 0.95)' : 'rgba(255, 255, 255, 0.05)'),
              backdropFilter: (isMobile || isAndroidDevice) ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: (isMobile || isAndroidDevice) ? 'none' : 'blur(20px)', // Disable blur on Android/mobile
              // Removed will-change as it causes performance issues with scroll
            }}
          >
            <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 py-2 xs:py-3 sm:py-4" style={{ paddingTop: isMobile ? 'env(safe-area-inset-top, 0.5rem)' : undefined }}>
              <div className="flex items-center">

                {/* Logo and Brand - Absolute Left - Mobile Optimized */}
                <motion.div
                  ref={logoRef}
                  className="flex items-center flex-shrink-0 mr-auto"
                >
                  <Button
                    variant="ghost"
                    className="relative p-1 sm:p-2 hover:bg-primary/5 transition-all duration-500 group flex items-center rounded-lg touch-target"
                    onClick={() => navigate('/')}
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                  >
                    {/* Logo Container - Clean Luxury - Responsive */}
                    <div
                      className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 relative flex-shrink-0"
                    >
                      <img
                        src={logoImage}
                        alt="Bexy Flowers Logo"
                        width="160"
                        height="99"
                        className="w-full h-full object-contain relative z-10 drop-shadow-lg filter brightness-110"
                      />
                    </div>

                    {/* Brand Name - Clean Luxury Text - Responsive */}
                    <div className="ml-1 sm:ml-1.5 block">
                      <h1
                        className="font-luxury text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold whitespace-nowrap"
                        style={{ 
                          fontFamily: "'EB Garamond', serif",
                          color: '#2c2d2a'
                        }}
                      >
                        Bexy Flowers
                      </h1>
                    </div>
                  </Button>
                </motion.div>

                {/* Desktop Navigation - Centered with Close Spacing */}
                <div className="hidden lg:flex items-center justify-center flex-1 gap-1 xl:gap-2">
                  {navigationItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                      >
                        <Button
                          variant="ghost"
                          className={`relative group font-body font-medium px-3 xl:px-4 py-2 xl:py-3 transition-all duration-500 overflow-hidden ${isActive
                            ? 'text-foreground'
                            : 'text-foreground hover:text-foreground'
                            }`}
                          onClick={() => handleNavigation(item.path)}
                          onMouseEnter={() => {
                            handlePrefetch(item.path, 100);
                            handleLinkHover(item.path);
                          }}
                          onMouseLeave={cancelPrefetch}
                          onFocus={() => handleLinkFocus(item.path)}
                        >
                          <motion.span
                            className="relative z-10 whitespace-nowrap"
                            style={{
                              color: isActive ? GOLD_COLOR : 'inherit',
                              fontFamily: "'EB Garamond', serif",
                            }}
                            whileHover={{
                              scale: 1.05,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {item.name}
                          </motion.span>

                          {/* Active Gold Background */}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-lg"
                              style={{
                                background: `linear-gradient(135deg, ${GOLD_COLOR}20 0%, ${GOLD_COLOR}10 100%)`,
                                border: `1px solid ${GOLD_COLOR}40`,
                              }}
                              layoutId="activeNavBg"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}

                          {/* Hover Effect */}
                          <motion.div
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, ${GOLD_COLOR}15 0%, ${GOLD_COLOR}05 100%)`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Cart - Absolute Right */}
                <div className="flex items-center ml-auto gap-2">
                  {/* Favorites Icon - Desktop (next to cart) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                    className="hidden lg:block"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleNavigation("/favorites")}
                      className={`relative group hover:bg-primary/10 transition-all duration-500 overflow-hidden rounded-lg w-10 h-10 sm:w-12 sm:h-12 ${location.pathname === "/favorites" ? 'text-foreground' : 'text-foreground'
                        }`}
                    >
                      <motion.span
                        className="relative z-10"
                        whileHover={!isMobile && !shouldReduceMotion ? {
                          scale: 1.15,
                        } : {}}
                        style={{
                          color: location.pathname === "/favorites" ? GOLD_COLOR : 'inherit',
                        }}
                      >
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                        {favoritesCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {favoritesCount}
                          </span>
                        )}
                      </motion.span>
                      {location.pathname === "/favorites" && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${GOLD_COLOR}20 0%, ${GOLD_COLOR}10 100%)`,
                            border: `1px solid ${GOLD_COLOR}40`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      {/* Hover Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${GOLD_COLOR}15 0%, ${GOLD_COLOR}05 100%)`,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>

                  {/* Cart with Simplified Hover Effects - Mobile Optimized */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCartOpen(true)}
                      onMouseEnter={preloadCartDashboard}
                      onFocus={preloadCartDashboard}
                      className="relative group hover:bg-primary/10 transition-all duration-500 overflow-hidden rounded-lg touch-target"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        width: isMobile ? '48px' : undefined,
                        height: isMobile ? '48px' : undefined,
                        minWidth: '48px',
                        minHeight: '48px',
                      }}
                    >
                      {/* Cart Icon - Simplified */}
                      <motion.div
                        className="relative z-10 flex items-center justify-center"
                        whileHover={!isMobile && !shouldReduceMotion ? {
                          scale: 1.15,
                          color: "rgb(196,166,105)"
                        } : {}}
                        whileTap={isMobile ? { scale: 0.95 } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-foreground transition-all duration-300" />
                      </motion.div>

                      {/* Simplified Background - Reduced for performance */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 rounded-lg"
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      />

                      {/* Cart Badge with Enhanced Animation */}
                      {cartItems > 0 && (
                        <motion.div
                          className="absolute -top-3 -right-0 -left-3 w-4 h-4 sm:w-4 sm:h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shadow-gold cart-pulse relative z-20"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 1.5, type: "spring", stiffness: 500 }}
                          whileHover={{
                            scale: 1.1,
                            rotate: 360,
                            boxShadow: "0 0 10px rgba(196,166,105,0.8)"
                          }}
                        >
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {cartItems}
                          </motion.span>

                          {/* Badge Glow */}
                          <motion.div
                            className="absolute inset-0 bg-primary/50 rounded-full blur-md"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>

                  {/* Favorites Icon - Mobile (shows on mobile when cart is shown) - Touch-Friendly */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                    className="lg:hidden mr-2"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleNavigation("/favorites")}
                      className={`relative group hover:bg-primary/10 transition-all duration-300 overflow-hidden rounded-lg touch-target ${location.pathname === "/favorites" ? 'text-foreground' : 'text-foreground'
                        }`}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        width: '48px',
                        height: '48px',
                        minWidth: '48px',
                        minHeight: '48px',
                      }}
                    >
                      <motion.span
                        className="relative z-10"
                        whileHover={!isMobile && !shouldReduceMotion ? {
                          scale: 1.15,
                        } : {}}
                        style={{
                          color: location.pathname === "/favorites" ? GOLD_COLOR : 'inherit',
                        }}
                      >
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                        {favoritesCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {favoritesCount}
                          </span>
                        )}
                      </motion.span>
                      {location.pathname === "/favorites" && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${GOLD_COLOR}20 0%, ${GOLD_COLOR}10 100%)`,
                            border: `1px solid ${GOLD_COLOR}40`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Button>
                  </motion.div>

                  {/* Mobile Menu Button - Touch-Friendly */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className="lg:hidden"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMenuToggle}
                      className="relative group hover:bg-primary/10 transition-all duration-300 overflow-hidden rounded-lg touch-target"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        width: '48px',
                        height: '48px',
                        minWidth: '48px',
                        minHeight: '48px',
                      }}
                    >

                      <AnimatePresence mode="wait">
                        {isMenuOpen ? (
                          <motion.div
                            key="close"
                            className="relative z-10"
                            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            whileHover={!isMobile && !shouldReduceMotion ? {
                              scale: 1.1,
                              color: "rgb(196,166,105)"
                            } : {}}
                          >
                            <LuxuryCloseIcon className="w-6 h-6 sm:w-7 sm:h-7 text-foreground transition-all duration-300" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="menu"
                            className="relative z-10"
                            initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            whileHover={!isMobile && !shouldReduceMotion ? {
                              scale: 1.1,
                              color: "rgb(196,166,105)"
                            } : {}}
                          >
                            <LuxuryMenuIcon className="w-6 h-6 sm:w-7 sm:h-7 text-foreground transition-all duration-300" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Mobile Menu - Full-Screen Overlay - Rendered via Portal */}
            {typeof document !== 'undefined' && createPortal(
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                  {/* Backdrop - Full Screen on Mobile */}
                  <motion.div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md"
                    style={{
                      zIndex: 99999,
                      top: 'env(safe-area-inset-top, 0)',
                      bottom: 'env(safe-area-inset-bottom, 0)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <motion.div
                    ref={menuRef}
                    className="lg:hidden fixed inset-0 bg-background/98 backdrop-blur-xl shadow-luxury overflow-y-auto"
                    style={{
                      zIndex: 100000,
                      backgroundColor: 'rgba(229, 228, 226, 0.98)',
                      paddingTop: isMobile ? `calc(var(--nav-height, 4rem) + env(safe-area-inset-top, 0.5rem))` : `calc(var(--nav-height, 5rem) + env(safe-area-inset-top, 0.5rem))`,
                      paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 1rem)' : undefined,
                      WebkitOverflowScrolling: 'touch',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {/* Close Button */}
                    <div className="sticky top-0 z-10 flex justify-end p-2 sm:p-4 bg-background/98 backdrop-blur-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-full hover:bg-slate-200/50 touch-target w-12 h-12"
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation',
                          minWidth: '48px',
                          minHeight: '48px',
                        }}
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>

                    <div className="px-4 sm:px-6 py-2 sm:py-4 space-y-2 sm:space-y-3">
                      {navigationItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                              delay: index * 0.1,
                              duration: 0.6,
                              type: "spring",
                              stiffness: 100,
                              damping: 15
                            }}
                          >
                            <Button
                              variant="ghost"
                              className={`w-full justify-start text-left group relative overflow-hidden rounded-xl transition-all duration-500 touch-target ${isActive
                                ? 'text-foreground'
                                : 'text-foreground hover:text-foreground'
                                }`}
                              onClick={() => handleNavigation(item.path)}
                              onMouseEnter={() => {
                                if (!isMobile) {
                                  handlePrefetch(item.path, 100);
                                  handleLinkHover(item.path);
                                }
                              }}
                              onTouchStart={() => {
                                if (isMobile) {
                                  handlePrefetch(item.path, 50);
                                  handleLinkHover(item.path);
                                }
                              }}
                              onFocus={() => handleLinkFocus(item.path)}
                              style={{
                                WebkitTapHighlightColor: 'transparent',
                                touchAction: 'manipulation',
                                padding: isMobile ? '0.75rem 1rem' : undefined,
                                minHeight: '48px',
                              }}
                            >
                              {/* Active Gold Background */}
                              {isActive && (
                                <motion.div
                                  className="absolute inset-0 rounded-xl"
                                  style={{
                                    background: `linear-gradient(135deg, ${GOLD_COLOR}20 0%, ${GOLD_COLOR}10 100%)`,
                                    border: `1px solid ${GOLD_COLOR}40`,
                                  }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}

                              {/* Hover Effect */}
                              <motion.div
                                className="absolute inset-0 rounded-xl"
                                style={{
                                  background: `linear-gradient(135deg, ${GOLD_COLOR}15 0%, ${GOLD_COLOR}05 100%)`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />

                          <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
                                <div className="flex-1 min-w-0">
                                  <div
                                    className="font-luxury font-medium relative text-lg sm:text-xl uppercase tracking-[0.15em]"
                                    style={{
                                      color: isActive ? GOLD_COLOR : 'inherit',
                                      fontFamily: "'EB Garamond', serif",
                                    }}
                                  >
                                    {item.name}
                                  </div>
                                  <div 
                                    className="font-luxury italic text-xs sm:text-sm text-muted-foreground mt-1 tracking-wide"
                                    style={{ fontFamily: "'EB Garamond', serif" }}
                                  >
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}

                      {/* Favorites - Icon Only in Mobile Menu */}
                      <motion.div
                        initial={{ opacity: 0, x: -50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          delay: navigationItems.length * 0.1,
                          duration: 0.6,
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-left group relative overflow-hidden rounded-xl transition-all duration-500 touch-target ${location.pathname === "/favorites"
                            ? 'text-foreground'
                            : 'text-foreground'
                            }`}
                          onClick={() => handleNavigation("/favorites")}
                          style={{
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                            padding: isMobile ? '0.75rem 1rem' : undefined,
                            minHeight: '48px',
                          }}
                        >
                          {location.pathname === "/favorites" && (
                            <motion.div
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${GOLD_COLOR}20 0%, ${GOLD_COLOR}10 100%)`,
                                border: `1px solid ${GOLD_COLOR}40`,
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}

                          <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
                            <motion.span
                              className="relative flex-shrink-0"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                color: location.pathname === "/favorites" ? GOLD_COLOR : 'inherit',
                              }}
                            >
                              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center relative">
                                <Heart className="w-full h-full" />
                                {favoritesCount > 0 && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {favoritesCount}
                                  </span>
                                )}
                              </div>
                            </motion.span>

                            <div className="flex-1 min-w-0">
                              <div
                                className="font-luxury font-semibold relative text-base sm:text-lg"
                                style={{
                                  color: location.pathname === "/favorites" ? GOLD_COLOR : 'inherit',
                                }}
                              >
                                Favorites
                              </div>
                              <div className="font-body text-xs sm:text-sm text-muted-foreground mt-1">
                                Saved Items
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>

                      {/* Social Media Icons - Mobile Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: (navigationItems.length + 1) * 0.1,
                          duration: 0.6
                        }}
                        className="pt-3 border-t border-primary/20 mt-3"
                      >
                        <div className="flex items-center justify-center gap-4 sm:gap-3">
                          {/* WhatsApp - Touch-Friendly */}
                          <motion.a
                            href="https://api.whatsapp.com/send/?phone=96176104882&text&type=phone_number&app_absent=0&wame_ctl=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors touch-target"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="WhatsApp"
                            style={{
                              WebkitTapHighlightColor: 'transparent',
                              touchAction: 'manipulation',
                              minWidth: '48px',
                              minHeight: '48px',
                            }}
                          >
                            <WhatsAppIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                          </motion.a>

                          {/* Instagram - Touch-Friendly */}
                          <motion.a
                            href="https://www.instagram.com/bexyflowers?igsh=cTcybzM0dzVkc25v"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors touch-target"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Instagram"
                            style={{
                              WebkitTapHighlightColor: 'transparent',
                              touchAction: 'manipulation',
                              minWidth: '48px',
                              minHeight: '48px',
                            }}
                          >
                            <Instagram className="w-5 h-5 sm:w-4 sm:h-4" />
                          </motion.a>

                          {/* TikTok - Touch-Friendly */}
                          <motion.a
                            href="https://www.tiktok.com/@bexyflower?_r=1&_t=ZS-91i2FtAJdVF"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors touch-target"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="TikTok"
                            style={{
                              WebkitTapHighlightColor: 'transparent',
                              touchAction: 'manipulation',
                              minWidth: '48px',
                              minHeight: '48px',
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                          </motion.a>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
            )}
          </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 sm:h-20" />
    </>
  );
};

export default UltraNavigation;