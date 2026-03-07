'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useMemo, useCallback } from 'react';
import { CartItem, CartContextType, Product } from '@/types/cart';
import { getVisitorCart, upsertVisitorCartItem, removeVisitorCartItem, updateVisitorCartItemQuantity, clearVisitorCart, syncCartToDatabase } from '@/lib/api/visitor-cart';

// Create the Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key for persisting cart data (used as fallback/cache)
const CART_STORAGE_KEY = 'bexy-flowers-cart';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const syncTimeoutRef = useRef<number | null>(null);

  // Load cart - DEFERRED DB: Skip database calls for new visitors (empty cart) to reduce load during traffic spikes
  useEffect(() => {
    const loadCart = async () => {
      try {
        let localCart: CartItem[] = [];
        try {
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (savedCart) {
            localCart = JSON.parse(savedCart);
            setCartItems(localCart);
          }
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
        setIsLoading(false);
        isInitialLoad.current = false;

        // TRAFFIC OPTIMIZATION: Only call database when we have local cart data (returning visitor)
        // New visitors with empty cart skip DB entirely - saves ~3 function calls per passive visitor
        if (localCart.length === 0) {
          return; // No DB call for new/empty visitors
        }

        if (import.meta.env.PROD || import.meta.env.VITE_USE_NETLIFY_FUNCTIONS === 'true') {
          try {
            const dbCart = await getVisitorCart();
            if (dbCart.length > 0) {
              setCartItems(dbCart);
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dbCart));
            } else {
              await syncCartToDatabase(localCart);
            }
          } catch (error) {
            if (!(error instanceof Error && error.message === 'NETLIFY_FUNCTIONS_UNAVAILABLE')) {
              console.warn('Background cart sync failed:', error);
            }
          }
        }
      } catch (error) {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    };

    loadCart();
  }, []);

  // Sync cart to database whenever cartItems changes (debounced)
  useEffect(() => {
    // Skip initial load
    if (isInitialLoad.current) {
      return;
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce database sync (wait 500ms after last change)
    syncTimeoutRef.current = window.setTimeout(async () => {
      try {
        // Save to localStorage as cache
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        // Sync to database
        await syncCartToDatabase(cartItems);
      } catch (error) {
        console.error('Error syncing cart to database:', error);
        // Still save to localStorage even if DB sync fails
      }
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cartItems]);

  /**
   * Add a product to the cart or increment quantity if it already exists
   */
  const addToCart = useCallback(async (product: Product): Promise<void> => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item =>
        item.id === product.id &&
        item.size === product.size &&
        item.personalNote === product.personalNote &&
        item.description === product.description
      );

      let newItems: CartItem[];

      if (existingItem) {
        // If item exists with same size, note, and description, increment quantity
        newItems = prevItems.map(item =>
          item.id === product.id &&
            item.size === product.size &&
            item.personalNote === product.personalNote &&
            item.description === product.description
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist with this combination, add it with quantity 1
        newItems = [...prevItems, { ...product, quantity: 1 }];
      }

      // Sync the new item to database (async, non-blocking)
      const newItem = newItems.find(item =>
        item.id === product.id &&
        item.size === product.size &&
        item.personalNote === product.personalNote &&
        item.description === product.description
      );

      if (newItem) {
        upsertVisitorCartItem(newItem).catch(error => {
          console.error('Error syncing cart item to database:', error);
        });
      }

      return newItems;
    });
  }, []);

  const removeFromCart = useCallback(async (productId: number | string, size?: string, personalNote?: string): Promise<void> => {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        !(item.id === productId &&
          item.size === size &&
          item.personalNote === personalNote)
      )
    );

    // Remove from database (async, non-blocking)
    removeVisitorCartItem(productId, size, personalNote).catch(error => {
      console.error('Error removing cart item from database:', error);
    });
  }, []);

  const getTotalItems = useCallback((): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getTotalPrice = useCallback((): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const updateQuantity = useCallback(async (productId: number | string, newQuantity: number, size?: string, personalNote?: string): Promise<void> => {
    if (newQuantity <= 0) {
      await removeFromCart(productId, size, personalNote);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId &&
          item.size === size &&
          item.personalNote === personalNote
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // Update quantity in database (async, non-blocking)
    updateVisitorCartItemQuantity(productId, newQuantity, size, personalNote).catch(error => {
      console.error('Error updating cart item quantity in database:', error);
    });
  }, [removeFromCart]);

  const clearCart = useCallback(async (): Promise<void> => {
    setCartItems([]);

    // Clear from database (async, non-blocking)
    clearVisitorCart().catch(error => {
      console.error('Error clearing cart from database:', error);
    });
  }, []);

  // PERFORMANCE: Memoize context value to prevent unnecessary re-renders
  const value: CartContextType = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  }), [cartItems, isCartOpen, addToCart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * Custom hook to use the cart context
 * This ensures the hook is used within a CartProvider
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
