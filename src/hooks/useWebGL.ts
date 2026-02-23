import { useState, useEffect, useCallback } from 'react';

// ⚡ PERFORMANCE: Check if device is mobile - disable WebGL/Three.js on mobile
const isMobileDevice = () => {
  if (typeof window === 'undefined') return true; // SSR safety - assume mobile
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

interface WebGLStatus {
  supported: boolean;
  contextLost: boolean;
  error: Error | null;
  isMobile: boolean;
}

export function useWebGL() {
  const [status, setStatus] = useState<WebGLStatus>({
    supported: true,
    contextLost: false,
    error: null,
    isMobile: true // Default to true (safe) until we check
  });

  const checkWebGLSupport = useCallback(() => {
    // ⚡ PERFORMANCE: Skip WebGL on mobile devices entirely
    // Three.js is extremely heavy on mobile (CPU, GPU, memory, battery)
    if (isMobileDevice()) {
      console.log('[WebGL] Disabled on mobile for performance');
      setStatus(prev => ({ 
        ...prev, 
        supported: false, 
        isMobile: true,
        error: new Error('WebGL disabled on mobile for performance') 
      }));
      return false;
    }
    
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      
      if (!gl) {
        throw new Error('WebGL not supported');
      }

      // Test basic WebGL functionality
      const program = gl.createProgram();
      if (!program) {
        throw new Error('WebGL program creation failed');
      }
      gl.deleteProgram(program);

      setStatus(prev => ({ ...prev, supported: true, error: null }));
      return true;
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        supported: false, 
        error: error as Error 
      }));
      return false;
    }
  }, []);

  const handleContextLoss = useCallback((event: Event) => {
    event.preventDefault();
    setStatus(prev => ({ ...prev, contextLost: true }));
    console.warn('WebGL context lost, attempting recovery...');
  }, []);

  const handleContextRestore = useCallback(() => {
    setStatus(prev => ({ ...prev, contextLost: false }));
    console.log('WebGL context restored');
  }, []);

  const setupContextLossHandling = useCallback((canvas: HTMLCanvasElement) => {
    canvas.addEventListener('webglcontextlost', handleContextLoss);
    canvas.addEventListener('webglcontextrestored', handleContextRestore);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLoss);
      canvas.removeEventListener('webglcontextrestored', handleContextRestore);
    };
  }, [handleContextLoss, handleContextRestore]);

  useEffect(() => {
    checkWebGLSupport();
  }, [checkWebGLSupport]);

  return {
    ...status,
    checkWebGLSupport,
    setupContextLossHandling,
    // ⚡ PERFORMANCE: isReady is false on mobile devices (status.supported = false)
    isReady: status.supported && !status.contextLost && !status.isMobile
  };
}
