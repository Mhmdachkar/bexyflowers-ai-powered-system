import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from '@/lib/navigation-compat';
import { ShoppingCart, Flower2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const CartNavbar: React.FC = () => {
  const { getTotalItems } = useCart();
  const location = useLocation();
  const totalItems = getTotalItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/95 border-b border-border/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center"
            >
              <Flower2 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 
                className="font-luxury text-xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Bexy Flowers
              </h1>
              <p className="text-xs text-slate-500 font-body">E-commerce Cart</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                className={`flex items-center space-x-2 ${
                  isActive('/') 
                    ? 'bg-amber-100 text-amber-800 border-amber-200' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Products</span>
              </Button>
            </Link>

            <Link to="/cart">
              <Button
                variant={isActive('/cart') ? 'default' : 'ghost'}
                className={`relative flex items-center space-x-2 ${
                  isActive('/cart') 
                    ? 'bg-amber-100 text-amber-800 border-amber-200' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                
                {/* Cart Badge */}
                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.div>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CartNavbar;
