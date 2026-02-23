'use client';

import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { FlyingHeartProvider } from '@/contexts/FlyingHeartContext';
import { RouteStateProvider } from '@/contexts/RouteStateContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import GlobalCartWrapper from '@/components/GlobalCartWrapper';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <RouteStateProvider>
      <TooltipProvider>
        <CartProvider>
          <FavoritesProvider>
            <FlyingHeartProvider>
              <Toaster />
              <Sonner />
              <GlobalCartWrapper />
              {children}
            </FlyingHeartProvider>
          </FavoritesProvider>
        </CartProvider>
      </TooltipProvider>
    </RouteStateProvider>
  );
}
