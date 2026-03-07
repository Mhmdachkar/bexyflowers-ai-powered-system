import { useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Product } from '@/types/cart';

/**
 * Enhanced cart hook that provides toast notifications
 */
export const useCartWithToast = () => {
  const cartContext = useCart();

  const addToCartWithToast = useCallback((product: Product) => {
    cartContext.addToCart(product);
    
    toast.success('Added to Cart!', {
      description: `${product.title} has been added to your cart.`,
      duration: 3000,
      position: 'top-right',
      closeButton: true,
    });
  }, [cartContext.addToCart]);

  const removeFromCartWithToast = useCallback((productId: number) => {
    const item = cartContext.cartItems.find(item => item.id === productId);
    cartContext.removeFromCart(productId);
    
    if (item) {
      toast.info('Removed from Cart', {
        description: `${item.title} has been removed from your cart.`,
        duration: 3000,
        position: 'top-right',
        closeButton: true,
      });
    }
  }, [cartContext.cartItems, cartContext.removeFromCart]);

  return {
    ...cartContext,
    addToCart: addToCartWithToast,
    removeFromCart: removeFromCartWithToast,
  };
};
