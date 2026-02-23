'use client';

import { lazy, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { AnimatePresence } from 'framer-motion';

// Lazy load CartDashboard
const CartDashboard = lazy(() => import('@/components/cart/CartDashboard'));

const GlobalCartWrapper = () => {
    const { isCartOpen, setIsCartOpen } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <Suspense fallback={null}>
                    <CartDashboard
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                    />
                </Suspense>
            )}
        </AnimatePresence>
    );
};

export default GlobalCartWrapper;
