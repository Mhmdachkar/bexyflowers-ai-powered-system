'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const GOLD_COLOR = "rgb(199, 158, 72)";

// Back to Top Button Component - Reusable across all pages
const BackToTop = () => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed z-50 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        bottom: isMobile ? '80px' : '24px', // Higher on mobile to avoid footer/content overlap
        right: isMobile ? '16px' : '24px',
        width: isMobile ? '50px' : '60px',
        height: isMobile ? '50px' : '60px',
        background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
        color: 'white',
        border: '2px solid rgba(255, 255, 255, 0.3)',
      }}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 20 }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 10px 30px rgba(199, 158, 72, 0.4)'
      }}
      whileTap={{ scale: 0.9 }}
      aria-label="Back to top"
    >
      <ArrowUp 
        className={isMobile ? "w-6 h-6" : "w-7 h-7"} 
        strokeWidth={3}
      />
    </motion.button>
  );
};

export default BackToTop;

