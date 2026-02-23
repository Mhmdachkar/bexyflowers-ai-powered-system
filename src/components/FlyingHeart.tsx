'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FlyingHeartProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete: () => void;
}

const FlyingHeart = ({ startX, startY, endX, endY, onComplete }: FlyingHeartProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsVisible(false);
    }, 800);
    
    const timer2 = setTimeout(() => {
      onComplete();
    }, 1100); // 800ms + 300ms

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-[9999] pointer-events-none"
          initial={{
            x: startX,
            y: startY,
            scale: 1,
            opacity: 1
          }}
          animate={{
            x: endX - 12, // Center the heart icon (24px / 2)
            y: endY - 12,
            scale: [1, 1.5, 0.8, 0.3],
            opacity: [1, 1, 0.8, 0]
          }}
          exit={{
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.8,
            ease: [0.43, 0.13, 0.23, 0.96],
            times: [0, 0.3, 0.7, 1]
          }}
          style={{
            left: 0,
            top: 0
          }}
        >
          <Heart className="w-6 h-6 fill-[#dc267f] text-[#dc267f]" strokeWidth={2.5} />
          
          {/* Sparkle trail effect */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#dc267f]"
              initial={{
                x: 0,
                y: 0,
                opacity: 0.8,
                scale: 1
              }}
              animate={{
                x: (Math.random() - 0.5) * 40,
                y: (Math.random() - 0.5) * 40,
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlyingHeart;

