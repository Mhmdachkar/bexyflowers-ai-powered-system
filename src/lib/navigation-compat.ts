'use client';

/**
 * Navigation compatibility layer for Next.js App Router
 * Provides react-router-dom-like API using Next.js navigation
 */

import { useRouter as useNextRouter, usePathname } from 'next/navigation';
import React, { useCallback, forwardRef, createElement, Children, useEffect } from 'react';
import NextLink from 'next/link';

// Stub components for App.tsx compatibility (App.tsx is type-checked but not used in Next.js app router)
// These allow the build to succeed - Next.js uses file-based routing in app/ directory
export function BrowserRouter({ children, ...rest }: { children?: React.ReactNode; [key: string]: unknown }) {
  return createElement(React.Fragment, null, children);
}

function matchPath(pathname: string | null, path: string): boolean {
  if (!pathname) return false;
  if (path === '*') return true;
  if (pathname === path) return true;
  if (path.includes(':')) {
    const pattern = path.replace(/:[^/]+/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(pathname);
  }
  return false;
}

export function Routes({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  let matched: React.ReactNode = null;
  let fallback: React.ReactNode = null;
  Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props?.path !== undefined) {
      const path = child.props.path as string;
      if (path === '*') fallback = child.props.element;
      else if (matchPath(pathname ?? '', path)) matched = child.props.element;
    }
  });
  return createElement(React.Fragment, null, matched ?? fallback);
}

export function Route({ path, element }: { path?: string; element?: React.ReactNode }) {
  return null;
}

// Link props type - compatible with react-router Link
export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string | { pathname?: string }; href?: string; replace?: boolean };

// Link wrapper: accepts both `to` (react-router) and `href` (Next.js) for compatibility
function resolveHref(to?: string | { pathname?: string }, href?: string): string {
  if (href) return href;
  if (typeof to === 'string') return to;
  if (to && typeof to === 'object' && 'pathname' in to) return (to as { pathname: string }).pathname || '#';
  return '#';
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, href, ...rest }, ref) {
  return createElement(NextLink, { ref, href: resolveHref(to, href), ...rest });
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
  // Note: useSearchParams requires Suspense in Next.js App Router - return empty string to avoid SSR issues
  // Components that need search params should use useSearchParams() from 'next/navigation' directly
  const search = typeof window !== 'undefined' && window.location.search ? window.location.search : '';
  
  return {
    pathname,
    search,
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
    key: pathname,
  };
}

/**
 * useParams hook - re-export from next/navigation
 * Note: This works differently in Next.js - params come from the page component props
 */
export { useParams } from 'next/navigation';

/** Navigate component - redirects to the given path (react-router compatible). state is ignored (Next.js uses query params for this). */
export function Navigate({ to, replace }: { to: string; replace?: boolean; state?: unknown }) {
  const router = useNextRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}
