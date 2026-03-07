import React from 'react';
import SEO from '@/components/SEO';
import { getProductImageAlt } from '@/lib/imageAltUtils';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/lib/navigation-compat';
import UltraNavigation from '@/components/UltraNavigation';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const isEmpty = cartItems.length === 0;
  const totalPrice = getTotalPrice();

  const handleContinueShopping = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Use requestAnimationFrame to ensure state is preserved
    requestAnimationFrame(() => {
      navigate('/');
    });
  };

  const handleProceedToCheckout = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    navigate('/checkout');
  };

  if (isEmpty) {
    return (
      <>
        <SEO title="Cart" noIndex />
        <UltraNavigation />
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="mb-8">
              <ShoppingBag className="w-24 h-24 mx-auto mb-4" style={{ color: '#2c2d2a' }} />
            </div>
            
            <h2 className="font-luxury text-3xl font-normal mb-4" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
              Your cart is empty
            </h2>
            
            <p className="mb-8 font-body" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
              Looks like you haven't added any beautiful arrangements to your cart yet. 
              Start shopping to find the perfect flowers for your special moments.
            </p>
            
            <Button
              type="button"
              onClick={handleContinueShopping}
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-normal px-8 py-3 rounded-full"
              style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </motion.div>
        </div>
        <Footer />
        <BackToTop />
      </>
    );
  }

  return (
    <>
      <SEO title="Cart" noIndex />
      <UltraNavigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 py-8 px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-luxury text-4xl sm:text-5xl font-normal mb-2" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
              Shopping Cart
            </h1>
            <p className="font-body" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleContinueShopping}
            variant="outline"
            className="border-slate-300 hover:bg-slate-50"
            style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </motion.div>

        {/* TEST BUTTON - to verify buttons work on this page */}
        <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-500 rounded">
          <p className="text-sm font-normal mb-2" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>DEBUG: Test if buttons work on this page</p>
          <button
            type="button"
            onClick={() => alert('TEST BUTTON WORKS!')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            TEST BUTTON (Click Me)
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6 bg-white/60 backdrop-blur-sm border border-white/30">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Product Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={getProductImageAlt({ name: item.title })}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-luxury text-lg font-normal mb-1" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                        {item.title}
                      </h3>
                      <p className="font-body text-sm" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                        ${item.price} each
                      </p>
                      {item.size && (
                        <div className="mt-2">
                          <span className="inline-block bg-amber-100 text-xs font-normal px-2 py-1 rounded-full" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                            Size: {item.size}
                          </span>
                        </div>
                      )}
                      {item.description && (
                        <div className="mt-2">
                          <p className="text-xs italic max-w-md" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                            "{item.description}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Quantity</p>
                        <div className="flex items-center gap-2">
                          <span className="font-luxury text-lg font-normal" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                            {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Subtotal</p>
                        <p className="font-luxury text-lg font-normal" style={{ color: '#C79E48', letterSpacing: '-0.02em' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        onClick={() => removeFromCart(item.id, item.size, item.personalNote)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/30 sticky top-8" style={{ position: 'relative', zIndex: 10 }}>
              <h3 className="font-luxury text-2xl font-normal mb-6" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                  <span>Tax</span>
                  <span>${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between font-luxury text-xl font-normal" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                    <span>Total</span>
                    <span>${(totalPrice * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3" style={{ position: 'relative', zIndex: 10 }}>
                <Button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-normal py-6 rounded-full"
                  style={{ 
                    fontFamily: "'EB Garamond', serif",
                    letterSpacing: '-0.02em',
                    position: 'relative', 
                    zIndex: 1000,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  type="button"
                  onClick={clearCart}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>

              <p className="text-xs text-center mt-4" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                Secure checkout powered by our trusted payment partners
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  );
};

export default CartPage;
