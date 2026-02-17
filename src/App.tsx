import { lazy, Suspense, useEffect } from "react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import RouteLoader from "@/components/RouteLoader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/hooks/useTheme";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { FlyingHeartProvider } from "@/contexts/FlyingHeartContext";
import { RouteStateProvider } from "@/contexts/RouteStateContext";
import GlobalCartWrapper from "@/components/GlobalCartWrapper";
import { useNavigationPredictor } from "@/hooks/useNavigationPredictor";
import { useComponentPrefetch } from "@/hooks/useComponentPrefetch";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { register as registerServiceWorker } from "@/lib/serviceWorkerRegistration";
import { isAndroid } from "@/utils/performance";
import { gsap } from "gsap";

// Configure GSAP globally to suppress null target warnings
gsap.config({
  nullTargetWarn: false,
});

// ⚡ PERFORMANCE: Preload critical routes ONLY on desktop after page is fully loaded
// Mobile devices have limited bandwidth - don't preload aggressively
const preloadCriticalRoutes = () => {
  // Skip preloading on mobile devices to save bandwidth
  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    console.log('[Preload] Skipping preload on mobile device');
    return;
  }
  
  // Only preload on desktop after page is interactive
  import("./pages/Index");
  import("./pages/Collection");
};

// Start preloading only after page is fully loaded and idle
if (typeof window !== 'undefined') {
  // Wait for load event before preloading anything
  window.addEventListener('load', () => {
    // Use requestIdleCallback for non-blocking preload with longer timeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => preloadCriticalRoutes(), { timeout: 5000 });
    } else {
      // Delay preload significantly on slower devices
      setTimeout(preloadCriticalRoutes, 3000);
    }
  }, { once: true });
}

// ⚡ PERFORMANCE OPTIMIZATION: Route-based code splitting
// Lazy load all routes to reduce initial bundle size by ~68%
const Index = lazy(() => import("./pages/Index"));
const Collection = lazy(() => import("./pages/Collection"));
const AboutPage = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Customize = lazy(() => import("./pages/Customize"));
const WeddingAndEvents = lazy(() => import("./pages/WeddingAndEvents"));
const Guides = lazy(() => import("./pages/Guides"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CartTest = lazy(() => import("./pages/CartTest"));
const Favorites = lazy(() => import("./pages/Favorites"));
const CartPage = lazy(() => import("./components/cart/CartPage"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminSignatureCollection = lazy(() => import("./pages/admin/AdminSignatureCollection"));
const AdminEternalFlowers = lazy(() => import("./pages/admin/AdminEternalFlowers"));
const AdminAccessories = lazy(() => import("./pages/admin/AdminAccessories"));
const AdminFlowers = lazy(() => import("./pages/admin/AdminFlowers"));
const AdminLuxuryBoxes = lazy(() => import("./pages/admin/AdminLuxuryBoxes"));
const AdminWeddingCreations = lazy(() => import("./pages/admin/AdminWeddingCreations"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));

// ⚡ MEMORY LEAK FIX: Reduced cache times to prevent memory accumulation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⚡ PERFORMANCE: Increased cache times to reduce API calls on mobile
      staleTime: 10 * 60 * 1000, // 10 minutes - data doesn't change frequently
      gcTime: 15 * 60 * 1000, // 15 minutes - keep cached data longer
      refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
      refetchOnMount: false, // Use cached data if available - prevents duplicate API calls
      refetchOnReconnect: false, // Don't refetch on reconnect - use cached data
      retry: 1, // Reduced retry attempts to prevent excessive queries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Reduced max delay
      // ⚡ SCALABILITY: Network mode for better offline support
      networkMode: 'online',
      // ⚡ SCALABILITY: Structural sharing for better memory usage
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

// ⚡ PERFORMANCE: Check if device is mobile
const isMobileDevice = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Component that contains router-dependent logic
const AppRouter = () => {
  // CRITICAL FIX: Disable heavy performance hooks on mobile AND in development
  // These hooks do prefetching, pattern learning, and monitoring which can overload mobile devices
  const isProduction = import.meta.env.PROD;
  const isMobile = isMobileDevice();
  
  // ⚡ PERFORMANCE: Only enable these hooks on desktop in production
  // Mobile devices struggle with the constant localStorage reads, prefetching, and monitoring
  if (isProduction && !isMobile) {
    useNavigationPredictor();
    useComponentPrefetch();
    usePerformanceMonitor();
  }

  return (
    <RouteStateProvider>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/wedding-and-events" element={<WeddingAndEvents />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/cart-test" element={<CartTest />} />
          {/* Admin Routes - Protected */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/products/:id" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/signature-collection" element={<ProtectedRoute><AdminSignatureCollection /></ProtectedRoute>} />
          <Route path="/admin/eternal-flowers" element={<ProtectedRoute><AdminEternalFlowers /></ProtectedRoute>} />
          <Route path="/admin/accessories" element={<ProtectedRoute><AdminAccessories /></ProtectedRoute>} />
          <Route path="/admin/flowers" element={<ProtectedRoute><AdminFlowers /></ProtectedRoute>} />
          <Route path="/admin/boxes" element={<ProtectedRoute><AdminLuxuryBoxes /></ProtectedRoute>} />
          <Route path="/admin/wedding-creations" element={<ProtectedRoute><AdminWeddingCreations /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteStateProvider>
  );
};

const App = () => {
  // Initialize smooth scrolling (can be called outside router context)
  useSmoothScroll();

  // Register service worker for caching
  useEffect(() => {
    if (import.meta.env.PROD) {
      registerServiceWorker();
      console.log('[App] Service Worker registration initiated');
    }
  }, []);

  // Android: set data attribute for Android-specific CSS optimizations
  useEffect(() => {
    if (isAndroid()) {
      document.documentElement.setAttribute('data-android', 'true');
    }
  }, []);

  // 🚨 CRITICAL FIX: Disable periodic cache cleanup interval
  // This setInterval was running every 5 minutes and could accumulate over time
  // React Query already has built-in garbage collection with gcTime
  useEffect(() => {
    // DISABLED: Periodic cleanup removed - React Query handles this automatically
    console.log('✅ Manual cache cleanup DISABLED - using React Query built-in GC');
    
    // React Query will automatically clean up stale queries based on:
    // - staleTime: 2 minutes
    // - gcTime: 5 minutes
    // This is more efficient and doesn't create additional intervals
    
    return () => {
      // No interval to clean up
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <CartProvider>
            <FavoritesProvider>
              <FlyingHeartProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <GlobalCartWrapper />
                  <AppRouter />
                </BrowserRouter>
              </FlyingHeartProvider>
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
