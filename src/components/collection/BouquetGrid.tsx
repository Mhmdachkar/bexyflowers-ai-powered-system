import { useRef, memo, useCallback } from "react";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartWithToast } from "@/hooks/useCartWithToast";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useFlyingHeart } from "@/contexts/FlyingHeartContext";
import { useNavigate } from '@/lib/navigation-compat';
import { useQueryClient } from "@tanstack/react-query";
import { collectionQueryKeys } from "@/hooks/useCollectionProducts";
import { OptimizedImage } from "@/components/OptimizedImage";
import { PriceDisplay } from "@/components/PriceDisplay";
import { getProductImageAlt } from "@/lib/imageAltUtils";
import type { Bouquet } from "@/types/bouquet";

interface BouquetGridProps {
  bouquets: Bouquet[];
  onBouquetClick: (bouquet: Bouquet) => void;
  selectedCategory?: string;
}

// Helper function to get badge text for bouquet
const getBouquetBadge = (bouquet: Bouquet): string | undefined => {
  if (bouquet.is_out_of_stock) return undefined;
  if (bouquet.featured) return "FEATURED";
  if (bouquet.discount_percentage && bouquet.discount_percentage > 0) return `${bouquet.discount_percentage}% OFF`;
  if (bouquet.price > 300) return "PREMIUM";
  if (bouquet.price > 200) return "LUXURY";
  return undefined;
};

// ⚡ PERFORMANCE FIX: Simplified card component - removed Framer Motion, reduced state
const BouquetCard = memo(({ 
  bouquet, 
  index, 
  onBouquetClick 
}: { 
  bouquet: Bouquet; 
  index: number; 
  onBouquetClick: (bouquet: Bouquet) => void;
}) => {
  const navigate = useNavigate();
  const heartButtonRef = useRef<HTMLButtonElement | null>(null);
  const { addToCart } = useCartWithToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { triggerFlyingHeart } = useFlyingHeart();
  const queryClient = useQueryClient();
  
  const isFav = isFavorite(bouquet.id);
  const badge = getBouquetBadge(bouquet);
  const finalPrice = bouquet.discount_percentage && bouquet.discount_percentage > 0
    ? bouquet.price * (1 - bouquet.discount_percentage / 100)
    : bouquet.price;

  const handleClick = useCallback(() => {
    navigate(`/product/${bouquet.id}`, {
      state: {
        id: bouquet.id,
        name: bouquet.name,
        price: finalPrice,
        category: bouquet.category || bouquet.displayCategory || "Collection",
        description: bouquet.description,
        fullDescription: bouquet.description,
        images: [bouquet.image],
      },
    });
  }, [navigate, bouquet, finalPrice]);

  const handleMouseEnter = useCallback(() => {
    // Prefetch product data on hover for instant navigation
    queryClient.prefetchQuery({
      queryKey: collectionQueryKeys.detail(bouquet.id),
      queryFn: async () => {
        const { getCollectionProduct } = await import('@/lib/api/collection-products');
        return getCollectionProduct(bouquet.id);
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, bouquet.id]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isFav) {
      const button = heartButtonRef.current;
      const navButtons = document.querySelectorAll('nav button');
      let navHeart: HTMLElement | null = null;
      
      for (let i = 0; i < navButtons.length; i++) {
        const btn = navButtons[i];
        if (btn.querySelector('svg') && btn.innerHTML.includes('Heart') && !btn.innerHTML.includes('ShoppingCart')) {
          navHeart = btn as HTMLElement;
          break;
        }
      }
      
      if (button && navHeart) {
        const buttonRect = button.getBoundingClientRect();
        const navRect = navHeart.getBoundingClientRect();
        
        triggerFlyingHeart(
          buttonRect.left + buttonRect.width / 2,
          buttonRect.top + buttonRect.height / 2,
          navRect.left + navRect.width / 2,
          navRect.top + navRect.height / 2
        );
      }
    }
    
    toggleFavorite({
      id: bouquet.id,
      title: bouquet.name,
      price: bouquet.price,
      image: bouquet.image,
      description: bouquet.description,
      featured: bouquet.featured
    });
  }, [isFav, bouquet, toggleFavorite, triggerFlyingHeart]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bouquet.is_out_of_stock) {
      addToCart({
        id: parseInt(bouquet.id),
        title: bouquet.name,
        price: finalPrice,
        image: bouquet.image
      });
    }
  }, [bouquet, finalPrice, addToCart]);

  const handleCheckout = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bouquet.is_out_of_stock) {
      addToCart({
        id: parseInt(bouquet.id),
        title: bouquet.name,
        price: finalPrice,
        image: bouquet.image
      });
      navigate('/checkout');
    }
  }, [bouquet, finalPrice, addToCart, navigate]);

  return (
    <div
      className="group relative cursor-pointer transition-all duration-300 ease-out"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Discount Badge - Top Left */}
      {bouquet.discount_percentage && bouquet.discount_percentage > 0 && !bouquet.is_out_of_stock && (
        <div
          className="absolute top-2 left-2 z-10 px-2 py-1 text-[9px] sm:text-[10px] font-bold text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
          }}
        >
          {bouquet.discount_percentage}% OFF
        </div>
      )}

      {/* Other Badges - Top Left */}
      {badge && !bouquet.is_out_of_stock && !bouquet.discount_percentage && (
        <div className="absolute top-2 left-2 z-10 bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wide">
          {badge}
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F5]">
        <OptimizedImage
          src={bouquet.image}
          alt={getProductImageAlt(bouquet)}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110 ${bouquet.is_out_of_stock ? 'grayscale' : ''}`}
          loading={index < 8 ? "eager" : "lazy"}
          decoding="async"
          priority={index < 8}
        />

        {/* Out of Stock Overlay */}
        {bouquet.is_out_of_stock && (
          <div className="absolute inset-0 bg-gray-500/40 flex items-center justify-center z-10">
            <div className="bg-white/95 px-4 py-2 rounded-sm shadow-lg">
              <span className="text-gray-800 text-xs sm:text-sm font-bold tracking-wider">
                OUT OF STOCK
              </span>
            </div>
          </div>
        )}

        {/* Favorite Button - Top Right */}
        <button
          ref={heartButtonRef}
          className="absolute top-2 right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
          onClick={handleFavoriteClick}
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-[#dc267f] text-[#dc267f]' : 'text-stone-600'}`}
            strokeWidth={1.5}
          />
        </button>

        {/* ── Bottom CTA Bar ─────────────────────────────────────────────────
            Desktop: slides up from bottom on hover.
            Mobile:  always visible as a compact bar (no hover on touch).
        ──────────────────────────────────────────────────────────────────── */}
        {!bouquet.is_out_of_stock && (
          <div
            className="
              absolute bottom-0 left-0 right-0 z-20
              translate-y-full group-hover:translate-y-0
              sm:translate-y-full sm:group-hover:translate-y-0
              transition-transform duration-300 ease-out
            "
          >
            <div
              className="flex"
              style={{ background: 'rgba(28,26,23,0.92)', backdropFilter: 'blur(6px)' }}
            >
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-white/10 active:bg-white/20"
                style={{ borderRight: '1px solid rgba(255,255,255,0.12)' }}
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#C79E48] flex-shrink-0" strokeWidth={1.5} />
                <span
                  className="text-white text-[10px] sm:text-[11px] font-medium tracking-wider uppercase"
                  style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '0.1em' }}
                >
                  Add to Cart
                </span>
              </button>

              {/* Quick Checkout */}
              <button
                onClick={handleCheckout}
                className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-white/10 active:bg-white/20 flex-shrink-0"
                aria-label="Buy now"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#C79E48]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile-only: always-visible compact CTA strip (no hover on touch screens) */}
        {!bouquet.is_out_of_stock && (
          <div
            className="sm:hidden absolute bottom-0 left-0 right-0 z-10"
          >
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ background: 'linear-gradient(to top, rgba(28,26,23,0.85) 0%, transparent 100%)' }}
            >
              <span
                className="text-white/90 text-[10px] font-medium tracking-wider uppercase"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Add to Cart
              </span>
              <ShoppingBag className="w-3.5 h-3.5 text-[#C79E48]" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </div>

      {/* Card Info Below Image - Minimal Style */}
      <div className="mt-2 space-y-0.5">
        {/* Category */}
        <p className="text-[10px] text-gray-600 font-normal">
          {bouquet.displayCategory || bouquet.category || "Collection"}
        </p>
        
        {/* Name and Price on same line */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-luxury text-xs font-normal text-foreground leading-tight flex-1">
            {bouquet.name}
          </h3>
          
          {/* Price with Beautiful Discount Display */}
          <div className="flex-shrink-0">
            <PriceDisplay 
              price={bouquet.price}
              discountPercentage={bouquet.discount_percentage}
              size="sm"
              showDiscountBadge={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ⚡ PERFORMANCE: Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.bouquet.id === nextProps.bouquet.id &&
    prevProps.index === nextProps.index
  );
});

BouquetCard.displayName = 'BouquetCard';

const BouquetGridComponent = ({ bouquets, onBouquetClick, selectedCategory }: BouquetGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 w-full">
      {bouquets.map((bouquet, index) => (
        <BouquetCard
          key={bouquet.id}
          bouquet={bouquet}
          index={index}
          onBouquetClick={onBouquetClick}
        />
      ))}
    </div>
  );
};

// Export memoized version for better performance
export const BouquetGrid = memo(BouquetGridComponent);
