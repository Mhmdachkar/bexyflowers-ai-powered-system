import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bexy_recently_viewed';
const MAX_ITEMS = 6;

export interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  viewedAt: number;
}

export function useRecentlyViewed(currentProductId?: string) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: RecentlyViewedItem[] = JSON.parse(raw);
        setItems(parsed.filter((item) => item.id !== currentProductId));
      }
    } catch {
      // ignore parse errors
    }
  }, [currentProductId]);

  const trackView = useCallback(
    (item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
      setItems((prev) => {
        // Remove if already exists, add to front
        const filtered = prev.filter((p) => p.id !== item.id);
        const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // storage full – ignore
        }
        return updated;
      });
    },
    []
  );

  // Items excluding current product
  const visibleItems = items.filter((item) => item.id !== currentProductId);

  return { items: visibleItems, trackView };
}
