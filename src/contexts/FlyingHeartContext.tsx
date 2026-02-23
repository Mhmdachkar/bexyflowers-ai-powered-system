'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FlyingHeartContainer } from '@/components/FlyingHeartAnimation';

interface FlyingHeartConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface FlyingHeartContextType {
  triggerFlyingHeart: (startX: number, startY: number, endX: number, endY: number) => void;
  navHeartPulse: boolean;
  setNavHeartPulse: (value: boolean) => void;
}

const FlyingHeartContext = createContext<FlyingHeartContextType | undefined>(undefined);

interface FlyingHeartProviderProps {
  children: ReactNode;
}

export const FlyingHeartProvider: React.FC<FlyingHeartProviderProps> = ({ children }) => {
  const [flyingHearts, setFlyingHearts] = useState<FlyingHeartConfig[]>([]);
  const [navHeartPulse, setNavHeartPulse] = useState(false);
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]);

  const triggerFlyingHeart = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    // Clear any existing timeouts to prevent accumulation
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];

    // Add the flying heart
    setFlyingHearts(prev => [...prev, { startX, startY, endX, endY }]);

    // Trigger navbar heart pulse after animation completes
    const timer1 = setTimeout(() => {
      setNavHeartPulse(true);
      const timer2 = setTimeout(() => {
        setNavHeartPulse(false);
        timeoutRefs.current = timeoutRefs.current.filter(t => t !== timer2);
      }, 600);
      timeoutRefs.current.push(timer2);
      timeoutRefs.current = timeoutRefs.current.filter(t => t !== timer1);
    }, 800);
    timeoutRefs.current.push(timer1);

    // Remove the flying heart after animation completes
    const timer3 = setTimeout(() => {
      setFlyingHearts(prev => {
        if (prev.length > 0) {
          return prev.slice(1); // Remove first heart
        }
        return prev;
      });
      timeoutRefs.current = timeoutRefs.current.filter(t => t !== timer3);
    }, 1100);
    timeoutRefs.current.push(timer3);
  }, []);

  const removeFlyingHeart = useCallback((index: number) => {
    setFlyingHearts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const value: FlyingHeartContextType = {
    triggerFlyingHeart,
    navHeartPulse,
    setNavHeartPulse
  };

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, []);

  return (
    <FlyingHeartContext.Provider value={value}>
      {children}
      <FlyingHeartContainer 
        flyingHearts={flyingHearts} 
        onComplete={removeFlyingHeart} 
      />
    </FlyingHeartContext.Provider>
  );
};

export const useFlyingHeart = (): FlyingHeartContextType => {
  const context = useContext(FlyingHeartContext);
  if (context === undefined) {
    throw new Error('useFlyingHeart must be used within a FlyingHeartProvider');
  }
  return context;
};

