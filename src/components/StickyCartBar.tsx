import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from '@/lib/navigation-compat';

export default function StickyCartBar() {
  const { cartItems, getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const isVisible = totalItems > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-40"
          initial={{ y: '-110%' }}
          animate={{ y: 0 }}
          exit={{ y: '-110%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          <div
            className="w-full flex items-center justify-between px-4 sm:px-6 py-2.5"
            style={{
              background: 'linear-gradient(135deg,#1c1a17 0%,#2a2520 100%)',
              borderBottom: '1px solid rgba(199,158,72,0.25)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            {/* Left — cart summary */}
            <div className="flex items-center gap-3">
              <div
                className="relative w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(199,158,72,0.15)' }}
              >
                <ShoppingCart size={15} style={{ color: '#C79E48' }} />
                {/* Badge */}
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#C79E48' }}
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              </div>
              <div>
                <p
                  className="text-xs font-semibold text-white leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'EB Garamond', serif" }}
                >
                  {cartItems.slice(0, 2).map(i => i.title).join(', ')}
                  {cartItems.length > 2 ? ` +${cartItems.length - 2} more` : ''}
                </p>
              </div>
            </div>

            {/* Right — total + CTA */}
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg,#C79E48,#d4af52)',
                boxShadow: '0 4px 14px rgba(199,158,72,0.4)',
                fontFamily: "'EB Garamond', serif",
                letterSpacing: '0.04em',
              }}
              onClick={() => navigate('/checkout')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span>Checkout · ${totalPrice.toFixed(0)}</span>
              <ChevronRight size={14} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
