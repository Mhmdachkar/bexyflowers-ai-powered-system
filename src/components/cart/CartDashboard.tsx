'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowRight, Sparkles, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface CartDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDashboard: React.FC<CartDashboardProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const isMobile = useIsMobile();

  const isEmpty = cartItems.length === 0;
  const totalPrice = getTotalPrice();
  const accentColor = '#C79E48'; // Gold accent matching zodiac theme

  // Swipe-to-close for mobile
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);
  const translateY = useTransform(y, [0, 300], [0, 300]);

  // Prevent body scroll when cart is open - FIXED to allow internal scroll only
  useEffect(() => {
    if (isOpen) {
      // Prevent background scroll while allowing cart content to scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
      
      // Store scroll position
      document.body.setAttribute('data-scroll-lock-y', window.scrollY.toString());
    } else {
      // Restore scroll position
      const scrollY = parseInt(document.body.getAttribute('data-scroll-lock-y') || '0', 10);
      
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.removeAttribute('data-scroll-lock-y');
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
      
      // Reset swipe position
      y.set(0);
    }

    return () => {
      // Cleanup on unmount
      const scrollY = parseInt(document.body.getAttribute('data-scroll-lock-y') || '0', 10);
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.removeAttribute('data-scroll-lock-y');
      if (scrollY) window.scrollTo(0, scrollY);
    };
  }, [isOpen, y]);

  // Handle swipe gesture for mobile
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobile) return;

    y.set(0); // Reset position

    // Close cart if swiped down more than 150px or with velocity > 500
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    }
  };

  const handleCheckout = (e?: React.MouseEvent<HTMLButtonElement> | MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if ('stopImmediatePropagation' in e && typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }
    if (isEmpty || isCheckingOut) return;
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    try {
      setIsCheckingOut(true);
      // Navigate first so we're not unmounting CartDashboard during this handler.
      navigate('/checkout');
      // Defer close to next tick to avoid unmount-during-handler React errors.
      setTimeout(() => {
        onClose();
      }, 0);
    } catch (err) {
      setIsCheckingOut(false);
      onClose();
    }
  };

  const handleClearCart = () => {
    if (isEmpty) return;

    // Confirm before clearing
    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
      clearCart();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Don't set overflow here - it's handled in the main useEffect above
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Don't reset overflow here - it's handled in the main useEffect above
    };
  }, [isOpen, onClose, isMobile]); // Added isMobile dependency

  // Variants for correct mobile/desktop handling
  const variants = {
    open: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    closed: {
      opacity: 0,
      x: isMobile ? 0 : '100%', // On mobile, we use y for translation
      y: isMobile ? '100%' : 0,  // On desktop, we use x for translation
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Luxury dark theme matching zodiac */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dashboard - Luxury dark theme matching zodiac */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            className={`fixed ${isMobile
                ? 'top-0 left-0 right-0 bottom-0 h-full w-full'
                : 'top-0 right-0 h-full w-full max-w-md sm:max-w-lg'
              } shadow-2xl z-[110] overflow-hidden`}
            style={{
              background: 'linear-gradient(160deg, #1c1a17 0%, #2a2218 50%, #1c1a17 100%)',
              paddingTop: isMobile ? 'env(safe-area-inset-top, 0)' : undefined,
              paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0)' : undefined,
              display: 'flex',
              flexDirection: 'column',
              touchAction: 'pan-y',
            }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            dragDirectionLock
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe Indicator for Mobile - Gold themed */}
            {isMobile && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full z-20" 
                style={{ background: 'rgba(199, 158, 72, 0.4)' }} />
            )}
            {/* Luxury Background Glow - Zodiac inspired */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{ opacity: 0.08 }}
            >
              <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, #C79E48, transparent)' }} />
              <div className="absolute bottom-10 left-1/4 w-60 h-60 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, #C79E48, transparent)' }} />
            </div>

            {/* Header - Luxury dark theme */}
            <div
              className={`relative flex items-center justify-between border-b flex-shrink-0 ${isMobile ? 'p-4' : 'p-6'
                }`}
              style={{
                borderColor: 'rgba(199, 158, 72, 0.2)',
                background: 'rgba(255, 255, 255, 0.03)',
                paddingTop: isMobile ? 'calc(env(safe-area-inset-top, 0) + 1rem)' : undefined,
                minHeight: isMobile ? '4.5rem' : '5rem',
              }}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className={`flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-12 h-12'
                    } rounded-lg`}
                  style={{
                    background: 'linear-gradient(135deg, #C79E48 0%, #d4af52 100%)',
                    boxShadow: '0 4px 16px rgba(199, 158, 72, 0.3)'
                  }}
                >
                  <ShoppingCart className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} strokeWidth={2.5} />
                </div>
                <div>
                  <h2
                    className={`font-normal ${isMobile ? 'text-xl' : 'text-2xl'
                      } text-white`}
                    style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}
                  >
                    Shopping Cart
                  </h2>
                  <p className={`font-normal ${isMobile ? 'text-xs' : 'text-sm'}`} 
                    style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'EB Garamond', serif" }}>
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={`rounded-lg hover:bg-white/10 touch-target ${isMobile ? 'w-12 h-12' : 'w-10 h-10'
                  } text-white/70 hover:text-white`}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  minWidth: '48px',
                  minHeight: '48px',
                }}
              >
                <X className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div
              className={`flex flex-col flex-1 overflow-y-auto ${isMobile ? 'min-h-0' : ''
                }`}
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: `${accentColor}50 transparent`,
                // Ensure scrolling works on mobile
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
              }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  width: 4px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background-color: ${accentColor}50;
                  border-radius: 2px;
                }
              `}</style>
              {isEmpty ? (
                /* Empty State - Sharp Design */
                <div className="flex-1 flex items-center justify-center p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div
                      className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-xl"
                      style={{
                        background: 'rgba(199, 158, 72, 0.12)',
                        border: '1px solid rgba(199, 158, 72, 0.3)'
                      }}
                    >
                      <ShoppingCart className="w-10 h-10" style={{ color: accentColor }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-normal mb-2 text-white" 
                      style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}>
                      Your cart is empty
                    </h3>
                    <p className="mb-8 max-w-xs mx-auto" 
                      style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'EB Garamond', serif", fontSize: '1.1rem' }}>
                      Add some beautiful arrangements to get started
                    </p>
                    <Button
                      onClick={onClose}
                      className="px-8 py-3 font-normal uppercase rounded-full"
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        letterSpacing: '0.1em',
                        background: 'linear-gradient(135deg, #C79E48, #d4af52)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(199, 158, 72, 0.4)'
                      }}
                    >
                      Continue Shopping
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Cart Items - Professional Sharp Layout with Custom Scrollbar */}
                  <div
                    className="flex-1 overflow-y-auto p-6 space-y-4 cart-scrollbar"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${accentColor}40 transparent`
                    }}
                  >
                    {cartItems.map((item, index) => {
                      // Create unique key based on item properties
                      const uniqueKey = `${item.id}-${item.size || 'default'}-${item.personalNote || 'no-note'}-${index}`;
                      return (
                        <motion.div
                          key={uniqueKey}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className="relative rounded-2xl"
                          style={{
                            background: 'linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                            border: '1px solid rgba(199, 158, 72, 0.2)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex gap-3 sm:gap-4">
                              {/* Product Image - Enhanced Sharp Design */}
                              <div
                                className="flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 relative group/image"
                                style={{
                                  width: '90px',
                                  height: '90px',
                                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                                  border: `2px solid ${accentColor}20`,
                                  boxShadow: `0 2px 8px ${accentColor}10`
                                }}
                              >
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                                />
                                {/* Image Overlay on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                              </div>

                              {/* Product Details - Enhanced Professional Layout */}
                              <div className="flex-1 min-w-0 space-y-2.5">
                                <div className="space-y-1.5">
                                  <h3
                                    className="font-normal text-white text-base sm:text-lg leading-tight line-clamp-2"
                                    style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}
                                  >
                                    {item.title}
                                  </h3>

                                  {/* Price Display - Enhanced */}
                                  <div className="flex items-baseline gap-2">
                                    <span
                                      className="font-normal text-lg sm:text-xl"
                                      style={{ color: accentColor, fontFamily: "'Playfair Display', serif" }}
                                    >
                                      ${item.price.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-normal" style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: "'EB Garamond', serif" }}>each</span>
                                    {item.quantity > 1 && (
                                      <span className="text-xs ml-1" style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: "'EB Garamond', serif" }}>
                                        × {item.quantity}
                                      </span>
                                    )}
                                  </div>

                                  {/* Item Total - Prominent Display */}
                                  {item.quantity > 1 && (
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                      <span className="text-xs font-normal" style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'EB Garamond', serif" }}>Subtotal:</span>
                                      <span
                                        className="font-normal text-base"
                                        style={{ color: accentColor, fontFamily: "'Playfair Display', serif" }}
                                      >
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Size and Personal Note - Luxury Design */}
                                {item.size && (
                                  <div
                                    className="inline-block px-2.5 py-1 text-xs font-normal uppercase rounded-md"
                                    style={{
                                      fontFamily: "'EB Garamond', serif",
                                      letterSpacing: '0.05em',
                                      color: accentColor,
                                      background: 'rgba(199, 158, 72, 0.12)',
                                      border: '1px solid rgba(199, 158, 72, 0.3)'
                                    }}
                                  >
                                    Size: {item.size}
                                  </div>
                                )}

                                {/* Accessories Display - Enhanced */}
                                {item.accessories && item.accessories.length > 0 && (
                                  <div
                                    className="flex flex-wrap gap-1.5"
                                  >
                                    {item.accessories.map((accessory, accIndex) => (
                                      <span
                                        key={accIndex}
                                        className="px-2 py-0.5 text-[10px] font-normal uppercase rounded-md"
                                        style={{
                                          fontFamily: "'EB Garamond', serif",
                                          letterSpacing: '0.05em',
                                          color: accentColor,
                                          background: 'rgba(199, 158, 72, 0.1)',
                                          border: '1px solid rgba(199, 158, 72, 0.25)'
                                        }}
                                      >
                                        {accessory}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {item.personalNote && (
                                  <div
                                    className="p-2.5 sm:p-3 text-xs leading-relaxed rounded-lg"
                                    style={{
                                      background: 'rgba(199, 158, 72, 0.08)',
                                      border: '1px solid rgba(199, 158, 72, 0.2)'
                                    }}
                                  >
                                    <p className="text-xs font-normal mb-1 uppercase flex items-center gap-1" 
                                      style={{ color: accentColor, fontFamily: "'EB Garamond', serif", letterSpacing: '0.05em' }}>
                                      <Sparkles className="w-3 h-3" />
                                      Personal Note:
                                    </p>
                                    <p className="italic leading-relaxed" 
                                      style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: "'EB Garamond', serif", fontSize: '1.05rem' }}>
                                      "{item.personalNote}"
                                    </p>
                                  </div>
                                )}

                                {/* Gift Info Display - Enhanced */}
                                {item.giftInfo && (
                                  <div
                                    className="p-2.5 sm:p-3 text-xs leading-relaxed rounded-lg"
                                    style={{
                                      background: 'rgba(199, 158, 72, 0.08)',
                                      border: '1px solid rgba(199, 158, 72, 0.25)'
                                    }}
                                  >
                                    <p className="text-xs font-normal mb-1.5 uppercase flex items-center gap-1" 
                                      style={{ color: accentColor, fontFamily: "'EB Garamond', serif", letterSpacing: '0.05em' }}>
                                      <Package className="w-3 h-3" />
                                      Gift Information:
                                    </p>
                                    <div className="space-y-1" style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: "'EB Garamond', serif" }}>
                                      {item.giftInfo.recipient && (
                                        <p><span className="font-normal text-white/60">To:</span> {item.giftInfo.recipient}</p>
                                      )}
                                      {item.giftInfo.deliveryDate && (
                                        <p><span className="font-normal text-white/60">Delivery:</span> {item.giftInfo.deliveryDate}</p>
                                      )}
                                      {item.giftInfo.message && (
                                        <p className="italic mt-1">"{item.giftInfo.message}"</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Quantity Controls - Mobile Optimized */}
                                <div className={`flex items-center justify-between pt-3 border-t ${isMobile ? 'flex-col gap-3' : ''
                                  }`} style={{ borderColor: 'rgba(199, 158, 72, 0.2)' }}>
                                  <div className="flex items-center gap-2.5">
                                    <span className={`font-normal uppercase ${isMobile ? 'text-xs' : 'text-xs'
                                      }`} style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'EB Garamond', serif", letterSpacing: '0.05em' }}>Quantity:</span>
                                    <div className={`flex items-center gap-1.5 rounded-lg ${isMobile ? 'p-1.5' : 'p-1'
                                      }`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          try {
                                            const newQuantity = item.quantity - 1;
                                            if (newQuantity >= 1) {
                                              updateQuantity(item.id, newQuantity, item.size, item.personalNote);
                                            }
                                          } catch (error) {
                                            console.error('Error updating quantity:', error);
                                          }
                                        }}
                                        disabled={item.quantity <= 1}
                                        className={`flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target rounded-lg ${isMobile ? 'w-10 h-10' : 'w-8 h-8'
                                          }`}
                                        style={{
                                          color: 'rgba(255, 255, 255, 0.8)',
                                          border: '1px solid rgba(255, 255, 255, 0.1)',
                                          WebkitTapHighlightColor: 'transparent',
                                          touchAction: 'manipulation',
                                          minWidth: '44px',
                                          minHeight: '44px',
                                        }}
                                        whileHover={item.quantity > 1 && !isMobile ? { scale: 1.05 } : {}}
                                        whileTap={item.quantity > 1 ? { scale: 0.95 } : {}}
                                        title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                                      >
                                        <Minus className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} strokeWidth={2.5} />
                                      </motion.button>
                                      <span className={`text-center font-normal ${isMobile ? 'w-12 text-base' : 'w-10 text-sm'
                                        }`} style={{ color: 'white', fontFamily: "'EB Garamond', serif" }}>{item.quantity}</span>
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          try {
                                            const newQuantity = item.quantity + 1;
                                            if (newQuantity <= 99) {
                                              updateQuantity(item.id, newQuantity, item.size, item.personalNote);
                                            }
                                          } catch (error) {
                                            console.error('Error updating quantity:', error);
                                          }
                                        }}
                                        disabled={item.quantity >= 99}
                                        className={`flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target rounded-lg ${isMobile ? 'w-10 h-10' : 'w-8 h-8'
                                          }`}
                                        style={{
                                          color: 'rgba(255, 255, 255, 0.8)',
                                          border: '1px solid rgba(255, 255, 255, 0.1)',
                                          WebkitTapHighlightColor: 'transparent',
                                          touchAction: 'manipulation',
                                          minWidth: '44px',
                                          minHeight: '44px',
                                        }}
                                        whileHover={item.quantity < 99 && !isMobile ? { scale: 1.05 } : {}}
                                        whileTap={item.quantity < 99 ? { scale: 0.95 } : {}}
                                        title={item.quantity >= 99 ? 'Maximum quantity is 99' : 'Increase quantity'}
                                      >
                                        <Plus className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} strokeWidth={2.5} />
                                      </motion.button>
                                    </div>
                                  </div>

                                  {/* Total Price - Enhanced Display */}
                                  <div className="text-right">
                                    <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: "'EB Garamond', serif" }}>Item Total</p>
                                    <p
                                      className="font-normal text-lg sm:text-xl"
                                      style={{ color: accentColor, fontFamily: "'Playfair Display', serif" }}
                                    >
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Remove Button - Mobile Optimized */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  try {
                                    // Optional: Add confirmation for single item removal
                                    if (window.confirm(`Remove "${item.title}" from cart?`)) {
                                      removeFromCart(item.id, item.size, item.personalNote);
                                    }
                                  } catch (error) {
                                    console.error('Error removing item:', error);
                                  }
                                }}
                                className={`flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 transition-all flex-shrink-0 touch-target ${isMobile ? 'w-12 h-12' : 'w-9 h-9'
                                  }`}
                                style={{
                                  WebkitTapHighlightColor: 'transparent',
                                  touchAction: 'manipulation',
                                  minWidth: '44px',
                                  minHeight: '44px',
                                  clipPath: isMobile ? 'none' : 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                                  borderRadius: isMobile ? '0.5rem' : undefined,
                                  border: '1.5px solid #fee2e2',
                                  boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)'
                                }}
                                whileHover={!isMobile ? { scale: 1.1, backgroundColor: '#fef2f2' } : {}}
                                whileTap={{ scale: 0.9 }}
                                title="Remove item from cart"
                              >
                                <Trash2 className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} strokeWidth={2.5} />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer - Luxury dark theme */}
                  <div
                    className="border-t p-6 space-y-6"
                    style={{
                      borderColor: 'rgba(199, 158, 72, 0.2)',
                      background: 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    {/* Order Summary - Luxury Layout */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'EB Garamond', serif" }}>Subtotal ({cartItems.length} items)</span>
                        <span className="font-normal" style={{ color: 'white', fontFamily: "'EB Garamond', serif" }}>${totalPrice.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'EB Garamond', serif" }}>Shipping</span>
                        <span className="font-normal" style={{ color: 'white', fontFamily: "'EB Garamond', serif" }}>Free</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: "'EB Garamond', serif" }}>Tax</span>
                        <span className="font-semibold text-white">${(totalPrice * 0.08).toFixed(2)}</span>
                      </div>

                      <div
                        className="pt-3 border-t"
                        style={{ borderColor: 'rgba(199, 158, 72, 0.3)' }}
                      >
                        <div className="flex justify-between items-baseline">
                          <span className="text-xl font-normal text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Total</span>
                          <span
                            className="text-2xl font-normal"
                            style={{ color: accentColor, fontFamily: "'Playfair Display', serif" }}
                          >
                            ${(totalPrice * 1.08).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Luxury Design */}
                    <div className="space-y-3" style={{ position: 'relative', zIndex: 10 }}>
                      <Button
                        type="button"
                        onClick={(e) => handleCheckout(e)}
                        disabled={isCheckingOut}
                        className="w-full py-4 font-semibold text-sm uppercase tracking-wider relative overflow-hidden rounded-full"
                        style={{
                          fontFamily: "'EB Garamond', serif",
                          letterSpacing: '0.1em',
                          background: 'linear-gradient(135deg, #C79E48, #d4af52)',
                          color: 'white',
                          boxShadow: '0 4px 16px rgba(199, 158, 72, 0.4)',
                          position: 'relative',
                          zIndex: 1000,
                          pointerEvents: 'auto',
                          cursor: 'pointer',
                          touchAction: 'manipulation'
                        }}
                      >
                        {isCheckingOut ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleClearCart();
                        }}
                        variant="outline"
                        disabled={isEmpty}
                        className="w-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                        style={{
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          background: 'rgba(239, 68, 68, 0.05)',
                          fontFamily: "'EB Garamond', serif"
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cart
                      </Button>
                    </div>

                    <p className="text-xs text-center pt-2" style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: "'EB Garamond', serif" }}>
                      <Package className="w-3 h-3 inline mr-1" />
                      Secure checkout powered by our trusted partners
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDashboard;