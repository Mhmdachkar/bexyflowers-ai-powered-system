import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import SEO from "@/components/SEO";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import UltraNavigation from "@/components/UltraNavigation";
import { CollectionHero } from "@/components/collection/CollectionHero";
import { CategoryNavigation } from "@/components/collection/CategoryNavigation";
import { BouquetGrid } from "@/components/collection/BouquetGrid";
import { FeaturedCarousel } from "@/components/collection/FeaturedCarousel";
import { ProductModal } from "@/components/collection/ProductModal";
import Footer from "@/components/Footer";
import { CollectionStats } from "@/components/collection/CollectionStats";
import BackToTop from "@/components/BackToTop";
import LazySection from "@/components/LazySection";
import { FooterSkeleton } from "@/components/SectionSkeletons";
import type { Bouquet } from "@/types/bouquet";
import { generatedCategories } from "@/data/generatedBouquets";
import { encodeImageUrl } from "@/lib/imageUtils";
import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import { FlowerTypeToggle } from "@/components/collection/FlowerTypeToggle";
// ⚡ PERFORMANCE FIX: Disabled navigation hooks - they cause DOM node accumulation on Collection page
// import { useNavigationPredictor } from "@/hooks/useNavigationPredictor";
// import { useEnhancedRoutePrefetch } from "@/hooks/useEnhancedRoutePrefetch";
import { useIsMobile } from "@/hooks/use-mobile";
// import CarouselHero from "@/components/CarouselHero"; // ⚡ DISABLED - Causes 99% CPU usage

// Get default category ID - prefer "red-roses", fallback to first non-"all" category, or "all"
const getDefaultCategoryId = (): string => {
  if (!generatedCategories || generatedCategories.length === 0) {
    return "all";
  }
  const redRoses = generatedCategories.find((cat) => cat.id === "red-roses");
  if (redRoses && redRoses.id) {
    return redRoses.id;
  }
  const firstNonAll = generatedCategories.find((cat) => cat.id !== "all");
  if (firstNonAll && firstNonAll.id) {
    return firstNonAll.id;
  }
  return "all";
};

const DEFAULT_CATEGORY_ID: string = getDefaultCategoryId();

const Collection = () => {
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Collection", url: "/collection" }
  ]);

  const collectionSchema = collectionPageSchema({
    name: "Luxury Flower Collection",
    description: "Browse our luxury flower collection: red roses, eternal flowers, seasonal bouquets, and couture arrangements. Premium floristry in Lebanon.",
    url: "/collection"
  });

  return (
    <>
      <SEO
        title="Luxury Flower Collection"
        description="Browse our luxury flower collection: red roses, eternal flowers, seasonal bouquets, and couture arrangements. Premium floristry in Lebanon. Shop online for delivery across Lebanon."
        canonical="/collection"
        keywords="flower collection Lebanon, luxury bouquets, red roses Lebanon, eternal flowers, seasonal flowers, premium flower arrangements, buy flowers online Lebanon"
        jsonLd={[breadcrumbs, collectionSchema]}
      />
      <CollectionContent />
    </>
  );
};

const CollectionContent = () => {
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY_ID);
  const [selectedBouquet, setSelectedBouquet] = useState<Bouquet | null>(null);
  const [selectedFlowerType, setSelectedFlowerType] = useState<'all' | 'eternal' | 'real'>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isMobile = useIsMobile();

  // ⚡ PERFORMANCE FIX: DISABLE navigation predictor and prefetching on Collection page
  // These hooks create DOM nodes and observers that cause CPU/memory issues on this page
  // useNavigationPredictor(); // DISABLED - causes DOM node accumulation
  // useEnhancedRoutePrefetch(); // DISABLED - causes DOM node accumulation

  // Fetch products using React Query - optimized with caching and pre-loading
  const { data: products, isLoading: loading, error } = useCollectionProducts({ isActive: true });
        
  // Transform products to match Bouquet interface, including flower_type
  const bouquets: Bouquet[] = useMemo(() => {
    if (!products) return [];

    return products.map((product) => ({
          id: product.id,
          name: product.title,
          price: product.price,
          image: encodeImageUrl(product.image_urls?.[0] || ''),
          description: product.description || '',
          category: product.category || '',
          displayCategory: product.display_category || '',
          featured: product.featured || false,
          is_out_of_stock: product.is_out_of_stock || false,
          discount_percentage: product.discount_percentage || null,
          flower_type: product.flower_type || 'real', // Include flower type
          collection_year: product.collection_year,
        }));
  }, [products]);

  useEffect(() => {
    // Ensure page loads at the very top on navigation
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Check for category query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      
      // Scroll to the main collection grid, bypassing the hero section
      // FIX: Store timeout for cleanup
      const scrollTimeoutId = setTimeout(() => {
        const gridElement = document.getElementById('main-collection-grid');
        if (gridElement) {
          // Offset for fixed header/navigation if needed
          const yOffset = -80; 
          const y = gridElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 800); // Delay to allow page transition/animation to complete

      return () => {
        clearTimeout(scrollTimeoutId);
      };
    }
  }, [location.search]);

  // ⚡ PERFORMANCE: Use useMemo for filtering by category and flower type
  // This prevents unnecessary re-renders and state updates
  const filteredBouquets = useMemo(() => {
    let filtered = bouquets;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((b) => b.category === selectedCategory);
    }
    
    // Filter by flower type
    if (selectedFlowerType !== "all") {
      filtered = filtered.filter((b) => b.flower_type === selectedFlowerType);
    }
    
    return filtered;
  }, [selectedCategory, selectedFlowerType, bouquets]);

  // Calculate counts for the toggle
  const flowerTypeCounts = useMemo(() => {
    const categoryFiltered = selectedCategory === "all" 
      ? bouquets 
      : bouquets.filter((b) => b.category === selectedCategory);
    
    return {
      total: categoryFiltered.length,
      eternal: categoryFiltered.filter((b) => b.flower_type === 'eternal').length,
      real: categoryFiltered.filter((b) => b.flower_type === 'real' || !b.flower_type).length,
    };
  }, [selectedCategory, bouquets]);

  // Memoize featured bouquets calculation
  const featuredBouquets = useMemo(
    () => bouquets.filter((b) => b.featured),
    [bouquets]
  );

  const categories = useMemo(
    () =>
      generatedCategories
        .filter((cat) => cat.id !== "all")
        .sort((a, b) => {
          if (a.id === "red-roses") return -1;
          if (b.id === "red-roses") return 1;
          return 0;
        }),
    []
  );
  
  // Use callback for handlers with smooth scroll
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedFlowerType('all'); // Reset flower type when category changes
    
    // ⚡ PERFORMANCE: Smooth scroll to grid when category changes
    // Note: setTimeout in event handler is fine - doesn't need cleanup as it fires immediately
    setTimeout(() => {
      const gridElement = document.getElementById('main-collection-grid');
      if (gridElement) {
        const yOffset = -100;
        const y = gridElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  const handleFlowerTypeChange = useCallback((type: 'all' | 'eternal' | 'real') => {
    setSelectedFlowerType(type);
  }, []);
  
  const handleBouquetClick = useCallback((bouquet: Bouquet) => {
    setSelectedBouquet(bouquet);
  }, []);
  
  const handleModalClose = useCallback(() => {
    setSelectedBouquet(null);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen" 
      style={{ 
        background: isMobile ? '#FFFFFF' : 'linear-gradient(180deg, #FAF8F3 0%, #FFFFFF 100%)', 
        touchAction: 'pan-y' 
      }}
    >
      {/* Ultra Navigation */}
      <UltraNavigation />
      
      <div className="collection-content relative z-10">
        {/* Hero Section - PERFORMANCE FIX: Use CollectionHero on both mobile and desktop to avoid Swiper CPU usage */}
        <CollectionHero />
        
        {/* Fixed Category Navigation */}
        <CategoryNavigation 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        {/* Main Content */}
        <section 
          id="main-collection-grid" 
          className="relative py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-8 w-full" 
          style={{ 
            background: isMobile 
              ? '#FFFFFF' 
              : 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F3 50%, #F5F1E8 100%)',
            zIndex: isMobile ? 1 : 'auto',
            position: 'relative'
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            {/* Flower Type Toggle */}
            <FlowerTypeToggle 
              selectedType={selectedFlowerType}
              onTypeChange={handleFlowerTypeChange}
              eternalCount={flowerTypeCounts.eternal}
              realCount={flowerTypeCounts.real}
              totalCount={flowerTypeCounts.total}
            />
            
            <div className="mb-4 sm:mb-6 md:mb-8 text-center">
              <p className="text-xs sm:text-sm text-[#6B5D52] font-medium">
                Showing <span className="font-normal" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                  {loading ? '...' : filteredBouquets.length}
                </span> beautiful bouquet{(!loading && filteredBouquets.length !== 1) ? 's' : 's'}
              </p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-3 lg:gap-12">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-sm bg-black overflow-hidden"
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
                    <div className="mt-6 space-y-2 p-4">
                      <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                      <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <BouquetGrid 
                bouquets={filteredBouquets}
                onBouquetClick={handleBouquetClick}
                selectedCategory={selectedCategory}
              />
            )}
          </div>
        </section>
        
        {/* Global stats for the collection (moved from hero) */}
        <CollectionStats />

        {/* Footer */}
        <LazySection rootMargin="600px 0px">
          <Suspense fallback={<FooterSkeleton />}>
            <Footer />
          </Suspense>
        </LazySection>
      </div>
      
      {/* Product Modal */}
      <AnimatePresence>
        {selectedBouquet && (
          <ProductModal 
            bouquet={selectedBouquet}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
      <BackToTop />
    </div>
  );
};

export default Collection;