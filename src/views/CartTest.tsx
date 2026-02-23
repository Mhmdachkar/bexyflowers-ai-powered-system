'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import BackToTop from '@/components/BackToTop';

const CartTest: React.FC = () => {
  const { cartItems, addToCart, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart();

  const testProducts = [
    { id: 999, title: "Test Rose Bouquet", price: 25.99, image: "/src/assets/bouquet-1.jpg" },
    { id: 998, title: "Test Lily Arrangement", price: 35.99, image: "/src/assets/bouquet-2.jpg" },
    { id: 997, title: "Test Mixed Flowers", price: 29.99, image: "/src/assets/bouquet-3.jpg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="font-luxury text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Cart Integration Test
          </h1>
          <p className="text-lg text-slate-600">
            Test the shopping cart functionality
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Products */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
          >
            <h2 className="font-luxury text-2xl font-bold text-slate-800 mb-6">
              Test Products
            </h2>
            
            <div className="space-y-4">
              {testProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">{product.title}</h3>
                    <p className="text-slate-600">${product.price}</p>
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cart Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
          >
            <h2 className="font-luxury text-2xl font-bold text-slate-800 mb-6">
              Cart Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Items:</span>
                <span className="font-semibold text-slate-800">{getTotalItems()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Price:</span>
                <span className="font-semibold text-slate-800">${getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Items in Cart:</span>
                <span className="font-semibold text-slate-800">{cartItems.length}</span>
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="mt-6">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Cart Items Display */}
        {cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
          >
            <h2 className="font-luxury text-2xl font-bold text-slate-800 mb-6">
              Cart Items
            </h2>
            
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-slate-600">${item.price} × {item.quantity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-slate-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      onClick={() => removeFromCart(item.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <h3 className="font-semibold text-blue-800 mb-3">Test Instructions:</h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• Click "Add to Cart" to add test products to your cart</li>
            <li>• Check the cart badge in the navigation (top right)</li>
            <li>• Navigate to the main collection pages to add real products</li>
            <li>• Visit /cart to see the full cart page</li>
            <li>• Cart data persists in localStorage across page refreshes</li>
          </ul>
        </motion.div>
      </div>
      <BackToTop />
    </div>
  );
};

export default CartTest;
