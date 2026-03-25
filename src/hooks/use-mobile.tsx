import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// PERFORMANCE: Initialize with actual value to prevent false->true flip on mobile
// This prevents layout shifts and duplicate preloads on mobile devices
function getIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    // Removed redundant setIsMobile call that was causing forced reflow
    // Initial state is already set via getIsMobile() in useState
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
