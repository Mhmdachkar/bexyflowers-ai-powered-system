'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useMemo, useCallback } from 'react';
import { FavoriteProduct, FavoritesContextType } from '@/types/favorites';
import { getVisitorFavorites, addVisitorFavorite, removeVisitorFavorite, clearVisitorFavorites, syncFavoritesToDatabase } from '@/lib/api/visitor-favorites';

// Create the Favorites Context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Local storage key for persisting favorites data (used as fallback/cache)
const FAVORITES_STORAGE_KEY = 'bexy-flowers-favorites';

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const syncTimeoutRef = useRef<number | null>(null);

  // Load favorites - DEFERRED DB: Skip database calls for new visitors (empty favorites) to reduce load during traffic spikes
  useEffect(() => {
    let isMounted = true; // SAFETY: Prevent state updates after unmount
    
    const loadFavorites = async () => {
      try {
        let localFavorites: FavoriteProduct[] = [];
        try {
          const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
          if (savedFavorites) {
            localFavorites = JSON.parse(savedFavorites);
            if (isMounted) setFavorites(localFavorites);
          }
        } catch (error) {
          console.error('Error loading favorites from localStorage:', error);
        }
        if (isMounted) {
          setIsLoading(false);
          isInitialLoad.current = false;
        }

        // TRAFFIC OPTIMIZATION: Only call database when we have local favorites (returning visitor)
        // New visitors with empty favorites skip DB entirely - saves ~3 function calls per passive visitor
        if (localFavorites.length === 0) {
          return; // No DB call for new/empty visitors
        }

        if (import.meta.env.PROD || import.meta.env.VITE_USE_NETLIFY_FUNCTIONS === 'true') {
          try {
            const dbFavorites = await getVisitorFavorites();
            if (!isMounted) return; // SAFETY: Check before updating state
            if (dbFavorites.length > 0) {
              setFavorites(dbFavorites);
              localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(dbFavorites));
            } else {
              await syncFavoritesToDatabase(localFavorites);
            }
          } catch (error) {
            if (!(error instanceof Error && error.message === 'NETLIFY_FUNCTIONS_UNAVAILABLE')) {
              console.warn('Background favorites sync failed:', error);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    loadFavorites();
    
    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []);

  // Sync favorites to database whenever favorites changes (debounced)
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
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        // Sync to database
        await syncFavoritesToDatabase(favorites);
      } catch (error) {
        console.error('Error syncing favorites to database:', error);
        // Still save to localStorage even if DB sync fails
      }
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [favorites]);

  /**
   * Add a product to favorites
   */
  const addToFavorites = useCallback(async (product: FavoriteProduct): Promise<void> => {
    setFavorites(prevFavorites => {
      // Check if product already exists
      const exists = prevFavorites.some(item => item.id === product.id);
      if (exists) {
        return prevFavorites; // Already in favorites
      }
      // Normalize product data
      const normalizedProduct: FavoriteProduct = {
        id: product.id,
        title: product.title || product.name || '',
        price: product.price,
        image: product.image || product.imageUrl || '',
        imageUrl: product.imageUrl || product.image || '',
        description: product.description,
        category: product.category,
        featured: product.featured,
        name: product.name || product.title || ''
      };
      
      // Add to database (async, non-blocking)
      addVisitorFavorite(normalizedProduct).catch(error => {
        console.error('Error adding favorite to database:', error);
      });

      return [...prevFavorites, normalizedProduct];
    });
  }, []);

  const removeFromFavorites = useCallback(async (productId: number | string): Promise<void> => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(item => item.id !== productId)
    );

    // Remove from database (async, non-blocking)
    removeVisitorFavorite(productId).catch(error => {
      console.error('Error removing favorite from database:', error);
    });
  }, []);

  const isFavorite = useCallback((productId: number | string): boolean => {
    return favorites.some(item => item.id === productId);
  }, [favorites]);

  const toggleFavorite = useCallback((product: FavoriteProduct): void => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites]);

  const getTotalFavorites = useCallback((): number => {
    return favorites.length;
  }, [favorites]);

  const clearFavorites = useCallback(async (): Promise<void> => {
    setFavorites([]);

    // Clear from database (async, non-blocking)
    clearVisitorFavorites().catch(error => {
      console.error('Error clearing favorites from database:', error);
    });
  }, []);

  // PERFORMANCE: Memoize context value to prevent unnecessary re-renders
  const value: FavoritesContextType = useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getTotalFavorites,
    clearFavorites,
  }), [favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite, getTotalFavorites, clearFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

/**
 * Custom hook to use the favorites context
 * This ensures the hook is used within a FavoritesProvider
 */
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

