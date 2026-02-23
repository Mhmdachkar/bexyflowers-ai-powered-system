'use client';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from '@/lib/navigation-compat';
import { CartProvider } from '@/contexts/CartContext';
import CartNavbar from '@/components/cart/CartNavbar';
import ProductList from '@/components/cart/ProductList';
import CartPage from '@/components/cart/CartPage';
import BackToTop from '@/components/BackToTop';

const CartApp: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <CartNavbar />
          
          {/* Spacer for fixed navbar */}
          <div className="h-20" />
          
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
          <BackToTop />
        </div>
      </Router>
    </CartProvider>
  );
};

export default CartApp;
