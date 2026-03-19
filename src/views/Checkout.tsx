'use client';

import React, { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { getProductImageAlt } from '@/lib/imageAltUtils';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  Phone,
  Loader2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { useNavigate } from '@/lib/navigation-compat';
import { useCart } from '@/contexts/CartContext';
import { submitCheckoutOrder } from '@/lib/api/checkout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import BackToTop from '@/components/BackToTop';

const DELIVERY_FEE = 4;
const WHATSAPP_NUMBER = '96176104882';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const redirectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure any scroll locks from previous overlays (cart drawer, modals, mobile menu) are cleared on checkout
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      const docEl = document.documentElement;

      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.paddingRight = '';
      docEl.style.overflow = '';
      body.removeAttribute('data-scroll-y');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);
  const [savedOrderDetails, setSavedOrderDetails] = useState<{
    items: typeof cartItems;
    subtotal: number;
    deliveryFee: number;
    total: number;
    fullName: string;
    phone: string;
    email: string;
    location: string;
  } | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  const subtotal = getTotalPrice();
  const total = subtotal + DELIVERY_FEE;

  const formatWhatsAppMessage = (order: typeof savedOrderDetails): string => {
    if (!order) return '';
    
    const itemsText = order.items
      .map((item, idx) => {
        const qty = item.quantity ?? 1;
        const itemTotal = item.price * qty;
        return `${idx + 1}. ${item.title}${item.size ? ` (${item.size})` : ''}${qty > 1 ? ` × ${qty}` : ''} - $${itemTotal.toFixed(2)}${item.personalNote ? `\n   Note: ${item.personalNote}` : ''}`;
      })
      .join('\n');

    return `Hello! I just placed an order at Bexy Flowers. Here are my order details:

👤 *Customer Information:*
Name: ${order.fullName}
Phone: ${order.phone}
Email: ${order.email}
Location: ${order.location}

🛍️ *Order Items:*
${itemsText}

💰 *Order Summary:*
Subtotal: $${order.subtotal.toFixed(2)}
Delivery Fee: $${order.deliveryFee.toFixed(2)}
*Total: $${order.total.toFixed(2)}*

Please confirm my order and let me know about delivery timing. Thank you! 🌸`;
  };

  const handleWhatsAppNotify = () => {
    if (!savedOrderDetails) return;
    
    const message = formatWhatsAppMessage(savedOrderDetails);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const validate = (): boolean => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedLocation = location.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (!trimmedPhone || trimmedPhone.length < 6) {
      setFormError('Please enter a valid phone number.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    if (!trimmedLocation || trimmedLocation.length < 5) {
      setFormError('Please enter your delivery address or location.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setFormError('Your cart is empty. Please add items before checkout.');
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedLocation = location.trim();
      
      await submitCheckoutOrder({
        fullName: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        location: trimmedLocation,
        orderItems: cartItems,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
      });
      
      setSavedOrderDetails({
        items: [...cartItems],
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        fullName: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        location: trimmedLocation,
      });
      setUsedLocalFallback(false);
      setSubmitSuccess(true);
      clearCart();
      redirectTimerRef.current = setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const isDbUnavailable =
        msg === 'NETLIFY_FUNCTIONS_UNAVAILABLE' ||
        msg.includes('Database endpoint not found') ||
        msg.includes('Netlify Functions not available');
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isLocalhost && isDbUnavailable) {
        try {
          const trimmedName = fullName.trim();
          const trimmedPhone = phone.trim();
          const trimmedEmail = email.trim().toLowerCase();
          const trimmedLocation = location.trim();
          
          const order = {
            fullName: trimmedName,
            phone: trimmedPhone,
            email: trimmedEmail,
            location: trimmedLocation,
            orderItems: cartItems,
            subtotal,
            deliveryFee: DELIVERY_FEE,
            total,
            createdAt: new Date().toISOString(),
          };
          const key = 'bexy-checkout-orders-local';
          const existing = localStorage.getItem(key);
          const list = existing ? JSON.parse(existing) : [];
          list.push(order);
          localStorage.setItem(key, JSON.stringify(list));
          
          setSavedOrderDetails({
            items: [...cartItems],
            subtotal,
            deliveryFee: DELIVERY_FEE,
            total,
            fullName: trimmedName,
            phone: trimmedPhone,
            email: trimmedEmail,
            location: trimmedLocation,
          });
        } catch {
          setFormError('Could not save order locally. Please try again.');
          return;
        }
        setUsedLocalFallback(true);
        setSubmitSuccess(true);
        clearCart();
        redirectTimerRef.current = setTimeout(() => navigate('/'), 4000);
      } else {
        setFormError(msg || 'Could not place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !submitSuccess) {
    return (
      <>
        <SEO title="Checkout" noIndex />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/20 flex items-center justify-center">
          <motion.div
            className="text-center space-y-6 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingCart className="w-16 h-16 mx-auto text-amber-700/60" />
            <h1
              className="text-2xl font-normal"
              style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
            >
              Your cart is empty
            </h1>
            <p style={{ color: '#6b7280', fontFamily: "'EB Garamond', serif" }}>
              Add some beautiful flowers to get started.
            </p>
            <Button
              onClick={() => navigate('/collection')}
              className="bg-amber-700 hover:bg-amber-800 text-white font-normal px-6 py-3 rounded-lg"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Continue Shopping
            </Button>
          </motion.div>
        </div>
        <BackToTop />
      </>
    );
  }

  if (submitSuccess) {
    return (
      <>
        <SEO title="Checkout" noIndex />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/20 flex items-center justify-center">
          <motion.div
            className="text-center space-y-6 px-4 max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle2 className="w-20 h-20 mx-auto text-emerald-600" />
            <h1
              className="text-2xl md:text-3xl font-normal"
              style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
            >
              Order received
            </h1>
            {usedLocalFallback ? (
              <>
                <p style={{ color: '#6b7280', fontFamily: "'EB Garamond', serif" }}>
                  You&apos;re testing on <strong>localhost</strong>. The database API (Netlify Functions) isn&apos;t
                  running, so your order was saved <strong>locally</strong> for testing.
                </p>
                <p className="text-sm text-amber-700/90 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3" style={{ fontFamily: "'EB Garamond', serif" }}>
                  To save orders to the database locally, run <code className="bg-white/80 px-1.5 py-0.5 rounded">npm run dev:netlify</code> instead of <code className="bg-white/80 px-1.5 py-0.5 rounded">npm run dev</code>. On production, orders are saved to the database.
                </p>
              </>
            ) : (
              <p style={{ color: '#6b7280', fontFamily: "'EB Garamond', serif" }}>
                Thank you for your order. We&apos;ve saved your details and will be in touch shortly to confirm
                delivery and payment.
              </p>
            )}
            
            {savedOrderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-4"
              >
                <Button
                  onClick={handleWhatsAppNotify}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-normal px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Notify by WhatsApp
                </Button>
              </motion.div>
            )}
            
            <p className="text-sm text-amber-700/80" style={{ fontFamily: "'EB Garamond', serif" }}>
              Redirecting you home...
            </p>
          </motion.div>
        </div>
        <BackToTop />
      </>
    );
  }

  const formStyles = {
    label: 'text-sm font-medium text-stone-700',
    input:
      'border-stone-200 bg-white/80 focus:ring-amber-500/30 focus:border-amber-500 rounded-lg font-normal',
    card: 'bg-white/70 backdrop-blur-sm border border-stone-200/80 shadow-sm rounded-2xl',
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <SEO title="Checkout" noIndex />
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <motion.button
          type="button"
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-8"
          style={{ fontFamily: "'EB Garamond', serif" }}
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="text-center space-y-2">
            <h1
              className="text-3xl md:text-4xl font-normal tracking-tight"
              style={{
                color: '#2c2d2a',
                fontFamily: "'EB Garamond', serif",
                letterSpacing: '-0.03em',
              }}
            >
              Checkout
            </h1>
            <p style={{ color: '#6b7280', fontFamily: "'EB Garamond', serif" }}>
              Enter your details to complete your order
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              className={`p-6 md:p-8 ${formStyles.card}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2
                className="text-lg font-medium mb-6 flex items-center gap-2"
                style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
              >
                <User className="w-5 h-5 text-amber-700/70" />
                Contact & delivery
              </h2>
              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className={formStyles.label} style={{ fontFamily: "'EB Garamond', serif" }}>
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={formStyles.input}
                    style={{ fontFamily: "'EB Garamond', serif" }}
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className={formStyles.label} style={{ fontFamily: "'EB Garamond', serif" }}>
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +961 76 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={formStyles.input}
                    style={{ fontFamily: "'EB Garamond', serif" }}
                    disabled={isSubmitting}
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={formStyles.label} style={{ fontFamily: "'EB Garamond', serif" }}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={formStyles.input}
                    style={{ fontFamily: "'EB Garamond', serif" }}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className={formStyles.label} style={{ fontFamily: "'EB Garamond', serif" }}>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-700/70" />
                      Delivery address / location
                    </span>
                  </Label>
                  <Textarea
                    id="location"
                    placeholder="Street, area, city, and any landmarks"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    rows={3}
                    className={`${formStyles.input} min-h-[88px] resize-none`}
                    style={{ fontFamily: "'EB Garamond', serif" }}
                    disabled={isSubmitting}
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`p-6 md:p-8 ${formStyles.card}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2
                className="text-lg font-medium mb-4 flex items-center gap-2"
                style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
              >
                <CreditCard className="w-5 h-5 text-amber-700/70" />
                Order summary
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size ?? ''}-${item.personalNote ?? ''}`}
                    className="flex gap-4 py-3 border-b border-stone-100 last:border-0"
                  >
                    <img
                      src={item.image}
                      alt={getProductImageAlt({ name: item.title })}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
                      >
                        {item.title}
                      </p>
                      {item.size && (
                        <p className="text-sm text-stone-500" style={{ fontFamily: "'EB Garamond', serif" }}>
                          {item.size}
                        </p>
                      )}
                      <p className="text-sm text-amber-700/90" style={{ fontFamily: "'EB Garamond', serif" }}>
                        ${(item.price * item.quantity).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 space-y-2 border-t border-stone-200">
                <div className="flex justify-between text-stone-600" style={{ fontFamily: "'EB Garamond', serif" }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600" style={{ fontFamily: "'EB Garamond', serif" }}>
                  <span>Delivery</span>
                  <span>${DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between text-lg font-medium pt-2"
                  style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
                >
                  <span>Total</span>
                  <span className="text-amber-700">${total.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            {formError && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {formError}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-normal text-base shadow-lg hover:shadow-xl transition-all"
                style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing order...
                  </span>
                ) : (
                  `Place order · $${total.toFixed(2)}`
                )}
              </Button>
              <p
                className="text-center text-xs text-stone-500 mt-4"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Your information is saved securely and used only to process and deliver your order.
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
      <BackToTop />
    </motion.div>
  );
};

export default Checkout;
