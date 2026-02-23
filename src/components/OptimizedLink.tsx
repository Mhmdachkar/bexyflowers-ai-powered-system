import React, { memo, useCallback, startTransition } from 'react';
import { Link, LinkProps, useNavigate } from '@/lib/navigation-compat';
import { useNavigationPrefetch } from '@/hooks/useNavigationPrefetch';

/**
 * Optimized Link component with React Query prefetching
 * Prefetches route data on hover/focus for instant navigation
 */
interface OptimizedLinkProps extends LinkProps {
  prefetch?: boolean; // Enable/disable prefetching (default: true)
}

const OptimizedLinkComponent: React.FC<OptimizedLinkProps> = ({ 
  to,
  prefetch = true,
  onMouseEnter,
  onFocus,
  onClick,
  children,
  ...props 
}) => {
  const navigate = useNavigate();
  const { handleLinkHover, handleLinkFocus } = useNavigationPrefetch();
  
  const path = typeof to === 'string' ? to : (to && typeof to === 'object' && 'pathname' in to ? (to as { pathname: string }).pathname : '');

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetch) {
      handleLinkHover(path);
    }
    onMouseEnter?.(e);
  }, [prefetch, handleLinkHover, path, onMouseEnter]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    if (prefetch) {
      handleLinkFocus(path);
    }
    onFocus?.(e);
  }, [prefetch, handleLinkFocus, path, onFocus]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Use startTransition for non-urgent navigation updates
    startTransition(() => {
      onClick?.(e);
    });
  }, [onClick]);

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export const OptimizedLink = memo(OptimizedLinkComponent);
