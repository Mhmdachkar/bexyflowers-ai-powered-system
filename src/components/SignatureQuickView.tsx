'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Gift, 
  Sparkles, 
  Box, 
  MessageSquare, 
  Check, 
  Crown, 
  Flower2, 
  ArrowRight,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react';
import { useCartWithToast } from '@/hooks/useCartWithToast';
import { Link } from '@/lib/navigation-compat';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { collectionQueryKeys } from '@/hooks/useCollectionProducts';

// ==================== TYPES ====================
export interface QuickViewItem {
  id: number | string;
  name: string;
  price: number | string;
  image: string;
  description: string;
  rating?: number;
  reviewsCount?: number;
  isBestseller?: boolean;
  images?: string[];
  category?: string;
  inStock?: boolean;
}

interface SizeOption {
  value: string;
  label: string;
  price: number;
  description: string;
}

interface Accessory {
  id: string;
  name: string;
  price: number;
  icon: typeof Box;
}

interface SignatureQuickViewProps {
  open: boolean;
  item: QuickViewItem | null;
  onClose: () => void;
}

// ==================== CONSTANTS ====================
const SIZE_OPTIONS: SizeOption[] = [
  { value: 'small', label: 'Small', price: 0, description: 'Perfect for intimate moments' },
  { value: 'medium', label: 'Medium', price: 50, description: 'Ideal for special occasions' },
  { value: 'large', label: 'Large', price: 100, description: 'Makes a grand statement' },
  { value: 'premium', label: 'Premium', price: 200, description: 'Ultimate luxury experience' }
];

const ACCESSORIES: Accessory[] = [
  { id: 'gift-box', name: 'Gift Box', price: 20, icon: Box },
  { id: 'glitter', name: 'Glitter', price: 15, icon: Sparkles },
  { id: 'chocolate', name: 'Chocolate', price: 25, icon: Gift },
  { id: 'ribbon', name: 'Premium Ribbon', price: 10, icon: Package }
];

const DEFAULT_RATING = 4.9;
const DEFAULT_REVIEWS_COUNT = 127;
const DEFAULT_CATEGORY = 'Signature Collection';

// ==================== COMPONENT ====================
const SignatureQuickView = ({ open, item, onClose }: SignatureQuickViewProps) => {
  const { addToCart } = useCartWithToast();
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // ==================== STATE ====================
  const [selectedSize, setSelectedSize] = useState<string>('medium');
  const [personalMessage, setPersonalMessage] = useState<string>('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);

  // ==================== COMPUTED VALUES ====================
  const productData = useMemo(() => {
    if (!item) return null;

    const basePrice = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
      : item.price;

    const images = item.images && item.images.length > 0 
      ? item.images 
      : [item.image];

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      basePrice,
      images,
      rating: item.rating ?? DEFAULT_RATING,
      reviewsCount: item.reviewsCount ?? DEFAULT_REVIEWS_COUNT,
      isBestseller: item.isBestseller ?? false,
      category: item.category ?? DEFAULT_CATEGORY,
      inStock: item.inStock ?? true
    };
  }, [item]);

  const totalPrice = useMemo(() => {
    if (!productData) return 0;

    const selectedSizeOption = SIZE_OPTIONS.find(opt => opt.value === selectedSize);
    const sizePrice = selectedSizeOption?.price ?? 0;

    const accessoriesTotal = selectedAccessories.reduce((total, accessoryId) => {
      const accessory = ACCESSORIES.find(acc => acc.id === accessoryId);
      return total + (accessory?.price || 0);
    }, 0);

    return productData.basePrice + sizePrice + accessoriesTotal;
  }, [productData, selectedSize, selectedAccessories]);

  const selectedSizeOption = useMemo(() => {
    return SIZE_OPTIONS.find(opt => opt.value === selectedSize);
  }, [selectedSize]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    
    // Better scroll lock for mobile - avoid fixed position to prevent white screen
    if (isMobile) {
      // On mobile, just prevent overflow - don't use fixed position
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Store scroll position
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      // Desktop: use overflow hidden with scrollbar compensation
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Prevent wheel events on background (desktop only)
    const preventBackgroundScroll = (e: WheelEvent) => {
      if (isMobile) return;
      const target = e.target as HTMLElement;
      // Only prevent if not inside the scrollable content
      if (!target.closest('.modal-scrollable-content')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleEscape);
    if (!isMobile) {
      document.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (!isMobile) {
        document.removeEventListener('wheel', preventBackgroundScroll);
      }
      
      // Restore scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      if (isMobile) {
        // Restore scroll position on mobile
        const savedScrollY = document.body.getAttribute('data-scroll-y');
        if (savedScrollY) {
          requestAnimationFrame(() => {
            window.scrollTo(0, parseInt(savedScrollY, 10));
            document.body.removeAttribute('data-scroll-y');
          });
        }
      } else {
        // Desktop: restore padding
        document.body.style.paddingRight = '';
      }
    };
  }, [open, onClose, isMobile]);

  useEffect(() => {
    if (open && item) {
      setSelectedSize('medium');
      setPersonalMessage('');
      setIsAddingToCart(false);
      setCurrentImageIndex(0);
      setIsGift(false);
      setRecipientName('');
      setDeliveryDate('');
      setSelectedAccessories([]);
      setImageError(false);
    }
  }, [open, item]);

  // ==================== HANDLERS ====================
  const handleImageNavigation = useCallback((direction: 'prev' | 'next') => {
    if (!productData) return;

    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return prev === productData.images.length - 1 ? 0 : prev + 1;
      } else {
        return prev === 0 ? productData.images.length - 1 : prev - 1;
      }
    });
  }, [productData]);

  const handleAccessoryToggle = useCallback((accessoryId: string) => {
    setSelectedAccessories(prev => 
      prev.includes(accessoryId)
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!productData || !selectedSize) return;

    if (isGift && (!recipientName.trim() || !deliveryDate)) {
      alert('Please fill in all gift information');
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem = {
        id: productData.id,
        title: productData.name,
        price: totalPrice,
        image: productData.images[0],
        size: selectedSizeOption?.label,
        description: personalMessage.trim() || `${productData.description} - ${selectedSizeOption?.label} Size`,
        accessories: selectedAccessories,
        ...(isGift && {
          giftInfo: {
            recipient: recipientName,
            deliveryDate: deliveryDate,
            message: personalMessage
          }
        })
      };

      addToCart(cartItem);

      setTimeout(() => {
        setIsAddingToCart(false);
        onClose();
      }, 800);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAddingToCart(false);
      alert('Failed to add item to cart. Please try again.');
    }
  }, [productData, selectedSize, selectedSizeOption, totalPrice, personalMessage, selectedAccessories, isGift, recipientName, deliveryDate, addToCart, onClose]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-amber-400 text-amber-400'
            : i < rating
            ? 'fill-amber-200 text-amber-400'
            : 'fill-gray-200 text-gray-300'
        }`}
      />
    ));
  };

  // ==================== EARLY RETURNS ====================
  if (!open || !item || !productData) return null;

  // ==================== RENDER ====================
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ touchAction: isMobile ? 'pan-y' : 'none' }}
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            className="relative z-10 w-full max-w-7xl max-h-[95vh] sm:h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              touchAction: 'pan-y',
            }}
          >
            {/* Close Button - Absolute positioned */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md hover:bg-white flex items-center justify-center transition-all shadow-lg border border-slate-200/50"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-slate-700" strokeWidth={2.5} />
            </motion.button>

            {/* Main Content Grid */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
              {/* LEFT: Image Gallery */}
              <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
                {productData.images.length > 0 && !imageError ? (
                  <div className="relative w-full max-w-2xl">
                    {/* Main Image */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 group">
                      <img
                        src={productData.images[currentImageIndex]}
                        alt={`${productData.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImageError(true)}
                        loading="eager"
                      />
                      
                      {/* Image Navigation */}
                      {productData.images.length > 1 && (
                        <>
                          <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageNavigation('prev');
                            }}
                          >
                            <ChevronLeft className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
                          </button>
                          <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageNavigation('next');
                            }}
                          >
                            <ChevronRight className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
                          </button>

                          {/* Image Counter */}
                          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {currentImageIndex + 1} / {productData.images.length}
                          </div>
                        </>
                      )}

                      {/* Favorite Button */}
                      <button className="absolute top-4 left-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all hover:scale-110">
                        <Heart className="w-5 h-5 text-slate-600 hover:text-red-500 transition-colors" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Gallery Dots */}
                    {productData.images.length > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        {productData.images.map((_, index) => (
                          <button
                            key={index}
                            className={`rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-amber-500 w-10 h-2.5'
                                : 'bg-slate-300 hover:bg-slate-400 w-2.5 h-2.5'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-2xl aspect-square rounded-2xl bg-slate-200 flex items-center justify-center">
                    <AlertCircle className="w-20 h-20 text-slate-400" />
                  </div>
                )}
              </div>

              {/* RIGHT: Product Details (Scrollable) */}
              <div className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* Header Section - Fixed */}
                <div className="flex-shrink-0 px-6 lg:px-10 pt-8 pb-6 border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
                    <span className="text-amber-700 font-bold text-xs tracking-widest uppercase">
                      {productData.category}
                    </span>
                    {productData.isBestseller && (
                      <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">
                        Bestseller
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 leading-tight" style={{ fontFamily: '"EB Garamond", serif' }}>
                    {productData.name}
                  </h2>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(productData.rating)}
                    </div>
                    <span className="text-slate-600 text-sm font-semibold">
                      {productData.rating.toFixed(1)} ({productData.reviewsCount} reviews)
                    </span>
                  </div>

                  {/* Price Display - Premium Style */}
                  <div className="flex items-baseline gap-4 p-5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border-2 border-amber-200/50">
                    <div>
                      <p className="text-sm text-amber-800 font-semibold mb-1">Starting from</p>
                      <p className="text-4xl font-bold text-amber-900" style={{ fontFamily: '"EB Garamond", serif' }}>
                        ${productData.basePrice.toFixed(2)}
                      </p>
                    </div>
                    {selectedSize && (
                      <div className="ml-auto text-right">
                        <p className="text-xs text-slate-600 mb-1">Your Total</p>
                        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"EB Garamond", serif' }}>
                          ${totalPrice.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div 
                  className="modal-scrollable-content flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-6 sm:space-y-8 custom-scrollbar"
                  style={{ 
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    willChange: 'scroll-position',
                  }}
                >
                  {/* Size Selection */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <Flower2 className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
                      <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"EB Garamond", serif' }}>
                        Choose Your Size
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {SIZE_OPTIONS.map((option) => {
                        const isSelected = selectedSize === option.value;
                        const optionPrice = productData.basePrice + option.price;

                        return (
                          <button
                            key={option.value}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50 shadow-lg ring-2 ring-amber-200'
                                : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md'
                            }`}
                            onClick={() => setSelectedSize(option.value)}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                              </div>
                            )}
                            <h4 className="font-bold text-slate-900 mb-1">{option.label}</h4>
                            <p className="text-xs text-slate-600 mb-2">{option.description}</p>
                            <p className="text-lg font-bold text-amber-600">
                              {option.price > 0 ? `+$${option.price}` : 'Included'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Personal Message */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
                      <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"EB Garamond", serif' }}>
                        Personal Message
                      </h3>
                    </div>
                    <div className="relative">
                      <textarea
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Share your heartfelt message..."
                        className="w-full p-4 border-2 border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                        rows={3}
                        maxLength={200}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-slate-500 font-semibold bg-white px-2 py-1 rounded">
                        {personalMessage.length}/200
                      </div>
                    </div>
                  </section>

                  {/* Accessories */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
                      <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"EB Garamond", serif' }}>
                        Add Elegant Touches
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {ACCESSORIES.map((accessory, index) => {
                        const Icon = accessory.icon;
                        const isSelected = selectedAccessories.includes(accessory.id);

                        return (
                          <motion.button
                            key={accessory.id}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                              isSelected
                                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-lg'
                                : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md'
                            }`}
                            onClick={() => handleAccessoryToggle(accessory.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            whileHover={{ 
                              scale: 1.03,
                              y: -3,
                              transition: { type: 'spring', stiffness: 400, damping: 17 }
                            }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {/* Animated Background on Hover */}
                            {!isSelected && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{
                                  x: '100%',
                                  transition: {
                                    duration: 0.8,
                                    ease: 'easeInOut'
                                  }
                                }}
                              />
                            )}

                            {/* Glow effect when selected */}
                            {isSelected && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-amber-300/0 via-amber-400/20 to-amber-300/0"
                                animate={{
                                  x: ['-100%', '100%'],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut'
                                }}
                              />
                            )}

                            {/* Selection Badge */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div 
                                  className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg"
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ 
                                    scale: 1, 
                                    rotate: 0,
                                  }}
                                  exit={{ scale: 0, rotate: 180 }}
                                  transition={{ 
                                    type: 'spring', 
                                    stiffness: 500, 
                                    damping: 15 
                                  }}
                                >
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                  </motion.div>
                                  
                                  {/* Pulse ring */}
                                  <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-amber-400"
                                    animate={{
                                      scale: [1, 1.5, 1],
                                      opacity: [0.8, 0, 0.8],
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: 'easeOut'
                                    }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="flex items-center gap-3 relative z-10">
                              <motion.div 
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg' 
                                    : 'bg-gradient-to-br from-amber-50 to-amber-100'
                                }`}
                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                              >
                                <motion.div
                                  animate={isSelected ? {
                                    scale: [1, 1.2, 1],
                                  } : {}}
                                  transition={{
                                    duration: 0.3
                                  }}
                                >
                                  <Icon 
                                    className={`w-5 h-5 transition-colors duration-300 ${
                                      isSelected ? 'text-white' : 'text-amber-600'
                                    }`} 
                                    strokeWidth={2.5} 
                                  />
                                </motion.div>
                              </motion.div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{accessory.name}</h4>
                                <motion.p 
                                  className="text-amber-600 font-bold text-sm"
                                  animate={isSelected ? {
                                    scale: [1, 1.1, 1],
                                  } : {}}
                                  transition={{ duration: 0.3 }}
                                >
                                  +${accessory.price}
                                </motion.p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Gift Option */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
                      <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"EB Garamond", serif' }}>
                        Gift Options
                      </h3>
                    </div>
                    <button
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isGift
                          ? 'border-amber-500 bg-amber-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md'
                      }`}
                      onClick={() => setIsGift(!isGift)}
                    >
                      <div className="flex items-center gap-3">
                        <Gift className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
                        <span className="font-bold text-slate-900">Send as a gift</span>
                        {isGift && <Check className="w-5 h-5 text-amber-600 ml-auto" strokeWidth={3} />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isGift && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-4 p-4 bg-amber-50 rounded-xl"
                        >
                          <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                              Recipient Name
                            </label>
                            <input
                              type="text"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              placeholder="Enter recipient's name"
                              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                              Delivery Date
                            </label>
                            <input
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                  {/* Shipping Info */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <Truck className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                    <p className="text-sm text-green-800 font-semibold">
                      Free shipping on orders over $100
                    </p>
                  </div>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 px-6 lg:px-10 py-6 border-t-2 border-slate-200 bg-white space-y-4">
                  {/* Add to Cart Button with Professional Color Wave */}
                  <motion.button
                    className={`relative w-full py-5 px-6 rounded-lg font-bold text-white text-lg shadow-lg overflow-hidden group ${
                      isAddingToCart
                        ? 'bg-green-500'
                        : selectedSize
                        ? ''
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                    onClick={handleAddToCart}
                    disabled={!selectedSize || isAddingToCart}
                    style={{
                      border: selectedSize && !isAddingToCart ? '2px solid rgba(245, 158, 11, 0.5)' : '2px solid rgba(148, 163, 184, 0.3)',
                      letterSpacing: '0.02em',
                    }}
                    whileHover={selectedSize && !isAddingToCart ? {
                      boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)',
                    } : {}}
                    whileTap={selectedSize && !isAddingToCart ? { scale: 0.98 } : {}}
                  >
                    {/* Base Gradient Background */}
                    {selectedSize && !isAddingToCart && (
                      <>
                        {/* Base amber gradient */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 transition-all duration-500"
                        />
                        
                        {/* Animated Color Wave - Changes button color from left to right */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 1) 25%, rgba(245, 158, 11, 1) 50%, rgba(217, 119, 6, 1) 75%, rgba(245, 158, 11, 0) 100%)',
                            backgroundSize: '200% 100%',
                          }}
                          initial={{ 
                            backgroundPosition: '-100% 0%',
                          }}
                          whileHover={{
                            backgroundPosition: ['-100% 0%', '200% 0%'],
                            transition: {
                              duration: 2.5,
                              ease: 'linear',
                              repeat: Infinity,
                              repeatDelay: 0,
                            }
                          }}
                        />

                        {/* Shimmer Overlay - Creates the professional shine effect */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 70%, transparent 100%)',
                            width: '40%',
                          }}
                          initial={{ x: '-100%' }}
                          whileHover={{
                            x: ['-100%', '300%'],
                            transition: {
                              duration: 2,
                              ease: 'easeInOut',
                              repeat: Infinity,
                              repeatDelay: 0.5,
                            }
                          }}
                        />

                        {/* Secondary Color Layer - Adds depth to the color transition */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: 'linear-gradient(90deg, rgba(234, 179, 8, 0) 0%, rgba(234, 179, 8, 0.8) 40%, rgba(217, 119, 6, 0.9) 60%, rgba(234, 179, 8, 0) 100%)',
                            backgroundSize: '250% 100%',
                            filter: 'blur(1px)',
                          }}
                          animate={{
                            backgroundPosition: ['-100% 0%', '200% 0%'],
                          }}
                          transition={{
                            duration: 3,
                            ease: 'linear',
                            repeat: Infinity,
                            repeatDelay: 0,
                          }}
                        />

                        {/* Glow Effect - Creates the luminous border */}
                        <motion.div
                          className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.5) 0%, rgba(245, 158, 11, 0.8) 50%, rgba(251, 191, 36, 0.5) 100%)',
                            backgroundSize: '200% 100%',
                            borderRadius: '0.5rem',
                            filter: 'blur(8px)',
                            zIndex: -1,
                          }}
                          animate={{
                            backgroundPosition: ['-100% 0%', '200% 0%'],
                          }}
                          transition={{
                            duration: 2.5,
                            ease: 'linear',
                            repeat: Infinity,
                            repeatDelay: 0,
                          }}
                        />
                      </>
                    )}
                    
                    {/* Button Content */}
                    <motion.div 
                      className="relative z-10 flex items-center justify-center"
                      whileHover={selectedSize && !isAddingToCart ? { 
                        scale: 1.02,
                      } : {}}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      {isAddingToCart ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Adding to Cart...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <motion.div
                            animate={selectedSize && !isAddingToCart ? {
                              y: [0, -3, 0],
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          >
                            <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
                          </motion.div>
                          <span className="font-bold drop-shadow-sm">Add to Cart — ${totalPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </motion.div>
                  </motion.button>

                  {/* View Full Details Link */}
                  <Link
                    to={`/product/${productData.id}`}
                    onMouseEnter={() => {
                      // Prefetch product data on hover for instant navigation
                      queryClient.prefetchQuery({
                        queryKey: collectionQueryKeys.detail(String(productData.id)),
                        queryFn: async () => {
                          const { getCollectionProduct } = await import('@/lib/api/collection-products');
                          return getCollectionProduct(String(productData.id));
                        },
                        staleTime: 5 * 60 * 1000,
                      });
                    }}
                    className="flex items-center justify-center gap-2 text-amber-700 hover:text-amber-800 font-semibold text-sm transition-colors"
                  >
                    View full details
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignatureQuickView;
