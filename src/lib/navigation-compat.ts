'use client';

/**
 * Navigation compatibility layer for Next.js App Router
 * Provides react-router-dom-like API using Next.js navigation
 */

import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, forwardRef, createElement } from 'react';
import NextLink from 'next/link';

// Link wrapper: accepts both `to` (react-router) and `href` (Next.js) for compatibility
const Link = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string; href?: string; replace?: boolean }
>(function Link({ to, href, ...rest }, ref) {
  return createElement(NextLink, { ref, href: href ?? to ?? '#', ...rest });
});

export { Link };

// Type definitions compatible with react-router-dom
export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
  key: string;
}

export type NavigateFunction = (to: string | number, options?: { replace?: boolean; state?: any }) => void;

/**
 * useNavigate hook compatible with react-router-dom
 * Returns a function to navigate to different routes
 */
export function useNavigate(): NavigateFunction {
  const router = useNextRouter();
  
  return useCallback((to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      // Handle back/forward navigation
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
      return;
    }
    
    // Navigate to path
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router]);
}

/**
 * useLocation hook compatible with react-router-dom
 * Returns current location information
 */
export function useLocation(): Location {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Handle potential null from useSearchParams during SSR
  const search = searchParams ? (searchParams.toString() ? `?${searchParams.toString()}` : '') : '';
  
  return {
    pathname,
    search,
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null, // Next.js doesn't support location state
    key: pathname, // Use pathname as key
  };
}

/**
 * useParams hook - re-export from next/navigation
 * Note: This works differently in Next.js - params come from the page component props
 */
export { useParams } from 'next/navigation';
