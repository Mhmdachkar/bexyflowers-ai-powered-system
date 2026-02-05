import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Gift, Check, CheckCircle2, Wand2, Plus, Minus, X, Info, ChevronRight, Palette, ShoppingCart, Circle, Square, Heart, Download, MessageCircle, Sparkles, ArrowRight, Star, Crown, GraduationCap, Heart as HeartIcon, Candy, Eye, EyeOff, History, BookmarkPlus, Bookmark, RefreshCw, Loader2, Edit3 } from "lucide-react";
import UltraNavigation from "@/components/UltraNavigation";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIOSPerformance } from "@/hooks/use-ios-performance";
import heroBouquetMain from "@/assets/bouquet-1.jpg";
import { flowerFamilies, EnhancedFlower, Season } from "@/data/flowers";
import { useFlowersForCustomize } from "@/hooks/useFlowers";
import type { CustomizeFlower } from "@/lib/api/flowers";
import { generateBouquetImage as generateImage, generateWithVariation, ProgressStage } from "@/lib/api/imageGeneration";
import { buildAdvancedPrompt } from "@/lib/api/promptEngine";
import { getPromptHistory, getFavorites, addToFavorites, removeFromFavorites, isFavorite, PromptHistoryEntry } from "@/lib/api/promptHistory";
// Video for mobile hero background
import video2Url from '@/assets/video/Video2.webm?url';

// --- Types ---
const GOLD = "rgb(199, 158, 72)";

interface Package {
  id: string;
  name: string;
  type: "box" | "wrap";
  icon: any;
  basePrice: number;
  description: string;
}

interface Size {
  id: string;
  name: string;
  priceMultiplier: number;
  description: string;
  maxFlowers: number; // Maximum number of flowers for this size
}

interface ColorOption {
  id: string;
  name: string;
  hex: string;
  gradient: string;
}

interface SelectedFlower {
  flower: EnhancedFlower;
  quantity: number;
}

interface BoxShape {
  id: string;
  name: string;
  icon: any;
}

interface Accessory {
  id: string;
  name: string;
  icon: any;
  price: number;
}

// New interfaces for arrangement preferences
interface ArrangementStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface DensityOption {
  id: string;
  name: string;
  description: string;
}

interface BloomStage {
  id: string;
  name: string;
  description: string;
}

interface FlowerPosition {
  flowerId: string;
  position: 'center' | 'edges' | 'scattered' | 'accent';
}

// --- Data ---
const packages: Package[] = [
  { id: "box", name: "Luxury Box", type: "box", icon: Box, basePrice: 20, description: "Premium rigid box" },
  { id: "wrap", name: "Signature Wrap", type: "wrap", icon: Gift, basePrice: 15, description: "Elegant paper wrapping" }
];

const sizes: Size[] = [
  { id: "small", name: "Small", priceMultiplier: 1.0, description: "Perfect for a sweet gesture", maxFlowers: 10 },
  { id: "medium", name: "Medium", priceMultiplier: 1.5, description: "Our most popular size", maxFlowers: 22 },
  { id: "large", name: "Large", priceMultiplier: 2.0, description: "A grand statement", maxFlowers: 37 }
];

const colors: ColorOption[] = [
  { id: "black", name: "Black", hex: "#000000", gradient: "linear-gradient(135deg, #2a2a2a 0%, #000000 100%)" },
  { id: "white", name: "White", hex: "#FFFFFF", gradient: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)" },
  { id: "gold", name: "Gold", hex: GOLD, gradient: `linear-gradient(135deg, ${GOLD} 0%, #a88b45 100%)` },
  { id: "pink", name: "Pink", hex: "#FFC0CB", gradient: "linear-gradient(135deg, #ffd1dc 0%, #ffb6c1 100%)" },
  { id: "blue", name: "Blue", hex: "#87CEEB", gradient: "linear-gradient(135deg, #87ceeb 0%, #5f9ea0 100%)" },
  { id: "red", name: "Red", hex: "#DC143C", gradient: "linear-gradient(135deg, #dc143c 0%, #8b0000 100%)" }
];

const boxShapes: BoxShape[] = [
  { id: "round", name: "Round", icon: Circle },
  { id: "square", name: "Square", icon: Square },
  { id: "heart", name: "Heart", icon: Heart }
];

const accessories: Accessory[] = [
  { id: "crown", name: "Crown", icon: Crown, price: 5 },
  { id: "graduation-hat", name: "Graduation Hat", icon: GraduationCap, price: 4 },
  { id: "bear", name: "Bear", icon: HeartIcon, price: 6 },
  { id: "chocolate", name: "Chocolate", icon: Candy, price: 3 }
];

// Arrangement style options for AI accuracy
const arrangementStyles: ArrangementStyle[] = [
  { id: "dome", name: "Dome", description: "Rounded dome shape rising above container", icon: "🔵" },
  { id: "flat", name: "Flat Top", description: "Even, flat arrangement at top", icon: "⬜" },
  { id: "cascading", name: "Cascading", description: "Flowing, natural cascade effect", icon: "🌊" }
];

// Density options for flower spacing
const densityOptions: DensityOption[] = [
  { id: "tight", name: "Tightly Packed", description: "No gaps, densely arranged" },
  { id: "medium", name: "Medium", description: "Balanced spacing" },
  { id: "airy", name: "Airy & Loose", description: "Spacious, breathable arrangement" }
];

// Bloom stage options
const bloomStages: BloomStage[] = [
  { id: "full", name: "Fully Open", description: "All flowers fully bloomed" },
  { id: "semi", name: "Semi-Open", description: "Partially opened blooms" },
  { id: "mixed", name: "Mixed Stages", description: "Variety of bloom stages" }
];

// Position options for mix flowers
const positionOptions = [
  { id: "center", name: "Center", description: "Main focal point in center" },
  { id: "edges", name: "Edges/Outer", description: "Around the outer ring" },
  { id: "scattered", name: "Scattered", description: "Distributed throughout" },
  { id: "accent", name: "Accent", description: "Small accent touches" }
];

// Horizontal Progress Stepper Component
const ProgressStepper = ({ currentStep, steps }: { currentStep: number, steps: Array<{ id: number, title: string, icon: any }> }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C79E48] to-[#d4af4a]"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex flex-col items-center z-10">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#C79E48] border-[#C79E48] text-white shadow-lg'
                    : isActive
                    ? 'bg-white border-[#C79E48] text-[#C79E48] shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                whileHover={!isActive && !isCompleted ? { scale: 1.1 } : {}}
              >
                {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </motion.div>
              <span className={`mt-3 text-xs font-normal uppercase transition-colors ${
                isActive || isCompleted ? 'text-[#C79E48]' : ''
              }`} style={{ color: isActive || isCompleted ? '#C79E48' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Customize: React.FC = () => {
  const isMobile = useIsMobile();
  const { needsMobileOptimizations } = useIOSPerformance();
  const { addToCart } = useCart();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedBoxShape, setSelectedBoxShape] = useState<BoxShape | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [flowerMode, setFlowerMode] = useState<"specific" | "mix" | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedFlowers, setSelectedFlowers] = useState<Record<string, SelectedFlower>>({});
  const [withGlitter, setWithGlitter] = useState<boolean>(false);
  const [withRibbon, setWithRibbon] = useState<boolean>(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flowerFilter, setFlowerFilter] = useState<"all" | "popular" | "romantic" | "minimal" | "luxury" | "seasonal">("all");
  const [seasonFilter, setSeasonFilter] = useState<Season | "all-seasons">("all-seasons");
  const flowersGridRef = useRef<HTMLDivElement>(null);

  // Arrangement preferences for better AI accuracy
  const [arrangementStyle, setArrangementStyle] = useState<string>("dome");
  const [densityPreference, setDensityPreference] = useState<string>("tight");
  const [bloomStage, setBloomStage] = useState<string>("full");
  const [flowerPositions, setFlowerPositions] = useState<Record<string, string>>({});

  // Enhanced AI State
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<{ positive: string; negative: string; preview: string; hash: string } | null>(null);
  const [generationProgress, setGenerationProgress] = useState<ProgressStage | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<PromptHistoryEntry[]>([]);
  const [variationIndex, setVariationIndex] = useState(0);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string | null>(null);
  
  // Editable prompt state
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Fetch flowers from database
  const { data: customizeFlowers = [], isLoading: flowersLoading } = useFlowersForCustomize();

  // ⚡ PERFORMANCE: Memoize flowers mapping to prevent re-computation on every render
  const flowers: EnhancedFlower[] = useMemo(() => {
    // Use a Set to track seen IDs and prevent duplicates
    const seenIds = new Set<string>();
    const uniqueFlowers: EnhancedFlower[] = [];
    
    customizeFlowers.forEach((f: CustomizeFlower, index: number) => {
      // Ensure unique ID by appending index if duplicate found
      let uniqueId = f.id;
      if (seenIds.has(uniqueId)) {
        uniqueId = `${f.id}-${index}`;
        console.warn(`Duplicate flower ID detected: ${f.id}. Using ${uniqueId} instead.`);
      }
      
      seenIds.add(uniqueId);
      uniqueFlowers.push({
        id: uniqueId,
        name: f.name,
        price: f.price,
        imageUrl: f.imageUrl,
        category: f.category,
        description: f.description,
        family: f.family,
        colorName: f.colorName,
        seasons: (f.seasons || []) as Season[],
        availabilityMode: f.availabilityMode, // IMPORTANT: Include availability mode for filtering
        quantity: f.quantity, // Include quantity for stock validation
        filterCategories: f.filterCategories, // Include filter categories for filtering
      });
    });
    
    return uniqueFlowers;
  }, [customizeFlowers]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }
    };
  }, [generatedImage]);

  // Intersection Observer for lazy loading video only when visible (mobile only)
  // iOS 18 OPTIMIZATION: More aggressive optimizations for older iOS
  useEffect(() => {
    if (!isMobile) return;

    const targetElement = containerRef.current || videoRef.current;
    if (!targetElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadVideo) {
            setShouldLoadVideo(true);
          }
        });
      },
      {
        root: null,
        // iOS/Android OPTIMIZATION: Smaller rootMargin on mobile
        rootMargin: needsMobileOptimizations ? '50px' : '100px',
        threshold: 0.01,
      }
    );

    observer.observe(targetElement);

    return () => {
      observer.disconnect();
    };
  }, [isMobile, shouldLoadVideo, needsMobileOptimizations]);

  // Load and play video when it becomes visible
  // iOS 18 OPTIMIZATION: Optimize video settings for older iOS devices
  useEffect(() => {
    if (!isMobile || !videoRef.current || !shouldLoadVideo) return;

    const videoElement = videoRef.current;
    
    // iOS/Android OPTIMIZATION: Reduce playback rate and optimize settings
    if (needsMobileOptimizations) {
      videoElement.playbackRate = 0.85; // Slightly slower playback reduces CPU usage
      videoElement.volume = 0.9; // Slightly lower volume
    }
    
    const forceFullWidth = () => {
      if (videoElement) {
        videoElement.style.width = '100vw';
        videoElement.style.maxWidth = '100vw';
        videoElement.style.left = '0';
        videoElement.style.right = '0';
        videoElement.style.marginLeft = '0';
        videoElement.style.marginRight = '0';
      }
    };
    
    forceFullWidth();
    videoElement.load();
    
    videoElement.addEventListener('loadedmetadata', forceFullWidth);
    videoElement.addEventListener('loadeddata', forceFullWidth);
    
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented
      });
    }
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', forceFullWidth);
      videoElement.removeEventListener('loadeddata', forceFullWidth);
    };
  }, [isMobile, shouldLoadVideo, needsMobileOptimizations]);

  // Handle window resize to ensure video stays full width
  useEffect(() => {
    if (!isMobile || !videoRef.current) return;

    let resizeTimer: NodeJS.Timeout | null = null;
    
    const handleResize = () => {
      if (!videoRef.current) return;
      
      // Use RAF for smoother updates
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.style.width = '100vw';
          videoRef.current.style.maxWidth = '100vw';
          videoRef.current.style.left = '0';
          videoRef.current.style.right = '0';
        }
      });
    };

    // Throttled resize handler
    const throttledResize = () => {
      if (resizeTimer) return;
      resizeTimer = setTimeout(() => {
        handleResize();
        resizeTimer = null;
      }, 150); // Throttle to max once per 150ms
    };

    window.addEventListener('resize', throttledResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    setTimeout(handleResize, 100);

    return () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
      }
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isMobile]);

  // Computed
  const step1Complete = !!selectedPackage && (selectedPackage.type === "wrap" || !!selectedBoxShape);
  const step2Complete = !!selectedSize && !!selectedColor;
  const step3Complete = Object.keys(selectedFlowers).length > 0;
  const step4Complete = true; // Glitter selection is optional (always complete)
  const step5Complete = true; // Accessories selection is optional (always complete)
  const currentStep = !step1Complete ? 1 : !step2Complete ? 2 : !step3Complete ? 3 : !step4Complete ? 4 : 5;

  // Refs for sections
  const step1Ref = useRef<HTMLDivElement>(null);
  const boxShapeRef = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);

  // State for sticky preview card position
  const [previewCardTop, setPreviewCardTop] = useState<number>(96);
  const [scrollY, setScrollY] = useState<number>(0);

  // Calculate preview card position to align with step1 - Optimized with throttling
  useEffect(() => {
    let rafId: number | null = null;
    let resizeTimer: NodeJS.Timeout | null = null;
    let scrollTimer: NodeJS.Timeout | null = null;

    const updatePosition = () => {
      if (step1Ref.current) {
        const rect = step1Ref.current.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        setPreviewCardTop(absoluteTop);
      }
      setScrollY(window.scrollY);
    };

    // Throttled scroll handler using RAF for smooth updates
    const handleScroll = () => {
      // Cancel any pending RAF
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      // Use RAF for smooth scroll updates (max 60fps)
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafId = null;
      });
    };

    // Throttled resize handler
    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(() => {
        updatePosition();
        resizeTimer = null;
      }, 200); // Throttle resize to max once per 200ms
    };

    // Initial position update
    const timeoutId = setTimeout(updatePosition, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Reset box shape when package changes
  useEffect(() => {
    if (selectedPackage?.type !== "box") {
      setSelectedBoxShape(null);
    }
  }, [selectedPackage]);

  // Auto-scroll: When Luxury Box is selected, scroll to box shape
  useEffect(() => {
    if (selectedPackage?.type === "box" && boxShapeRef.current) {
      setTimeout(() => {
        boxShapeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selectedPackage]);

  // Auto-scroll: When box shape is selected, scroll to size & color
  useEffect(() => {
    if (selectedBoxShape && step2Ref.current) {
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selectedBoxShape]);

  // Auto-scroll: When size and color are both selected, scroll to flowers
  useEffect(() => {
    if (step2Complete && step3Ref.current) {
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [step2Complete]);

  // Reset filter when mode changes
  useEffect(() => {
    setFlowerFilter("all");
    setSeasonFilter("all-seasons");
  }, [flowerMode, selectedFamily]);

  // Auto-scroll: When family is selected, scroll to flowers grid
  useEffect(() => {
    if (selectedFamily && flowersGridRef.current) {
      setTimeout(() => {
        flowersGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selectedFamily]);

  // ⚡ PERFORMANCE: Memoize pricing calculations
  const totalPrice = useMemo(() => {
    const basePrice = (selectedPackage?.basePrice || 0) * (selectedSize?.priceMultiplier || 1);
    const flowerPrice = Object.values(selectedFlowers).reduce((acc, curr) => acc + (curr.flower.price * curr.quantity), 0);
    const glitterPrice = withGlitter ? 2 : 0;
    const accessoriesPrice = selectedAccessories.reduce((acc, accId) => {
      const accessory = accessories.find(a => a.id === accId);
      return acc + (accessory?.price || 0);
    }, 0);
    return basePrice + flowerPrice + glitterPrice + accessoriesPrice;
  }, [selectedPackage?.basePrice, selectedSize?.priceMultiplier, selectedFlowers, withGlitter, selectedAccessories]);

  // ⚡ PERFORMANCE: Optimized price animation with cleanup
  const [displayPrice, setDisplayPrice] = useState(0);
  const prevPriceRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (totalPrice === prevPriceRef.current) return;
    
    // Cancel any ongoing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const duration = 500;
    const startTime = Date.now();
    const startPrice = prevPriceRef.current;
    const priceDiff = totalPrice - startPrice;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayPrice(startPrice + priceDiff * easeOut);
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayPrice(totalPrice);
        prevPriceRef.current = totalPrice;
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [totalPrice]);

  // ⚡ PERFORMANCE: Memoize flower count calculations
  const maxFlowers = useMemo(() => selectedSize?.maxFlowers || 10, [selectedSize?.maxFlowers]);
  
  const currentTotalFlowers = useMemo(() => {
    return Object.values(selectedFlowers).reduce((acc, curr) => acc + curr.quantity, 0);
  }, [selectedFlowers]);
  
  const canAddMore = useMemo(() => currentTotalFlowers < maxFlowers, [currentTotalFlowers, maxFlowers]);
  const remainingSlots = useMemo(() => maxFlowers - currentTotalFlowers, [maxFlowers, currentTotalFlowers]);

  // Handlers
  const handleAddFlower = (flower: EnhancedFlower) => {
    // Check if flower has available quantity
    const availableQuantity = flower.quantity ?? 0;
    if (availableQuantity <= 0) {
      toast.error(`${flower.name} is currently out of stock`);
      return;
    }

    if (flowerMode === "specific") {
      // Specific Variety: Set to max flowers (only one flower type allowed)
      // But limit to available quantity
      const quantityToSet = Math.min(maxFlowers, availableQuantity);
      if (quantityToSet <= 0) {
        toast.error(`${flower.name} is currently out of stock`);
        return;
      }
      setSelectedFlowers({
        [flower.id]: {
          flower,
          quantity: quantityToSet
        }
      });
      if (quantityToSet < maxFlowers) {
        toast.warning(`Only ${quantityToSet} ${flower.name}${quantityToSet === 1 ? ' is' : ' are'} available (requested ${maxFlowers})`);
      }
    } else {
      // Mix & Match: Add one at a time, but check max
      if (!canAddMore) {
        toast.warning(`Maximum ${maxFlowers} flowers allowed for this bouquet size`);
        return;
      }
      
      const currentQuantity = selectedFlowers[flower.id]?.quantity || 0;
      if (currentQuantity >= availableQuantity) {
        toast.warning(`Only ${availableQuantity} ${flower.name}${availableQuantity === 1 ? ' is' : ' are'} available`);
        return;
      }

      setSelectedFlowers(prev => ({
        ...prev,
        [flower.id]: {
          flower,
          quantity: (prev[flower.id]?.quantity || 0) + 1
        }
      }));
    }
  };

  const handleRemoveFlower = (flowerId: string) => {
    setSelectedFlowers(prev => {
      const next = { ...prev };
      if (next[flowerId].quantity > 1) {
        next[flowerId].quantity -= 1;
      } else {
        delete next[flowerId];
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    const flowerDesc = Object.values(selectedFlowers).map(f => `${f.quantity} ${f.flower.name}`).join(', ');
    const glitterDesc = withGlitter ? " with glitter" : "";
    const accessoriesDesc = selectedAccessories.length > 0 
      ? ` with ${selectedAccessories.map(id => accessories.find(a => a.id === id)?.name).join(', ')}`
      : "";
    const desc = `${selectedSize?.name} ${selectedColor?.name} ${selectedPackage?.name}${selectedBoxShape ? ` (${selectedBoxShape.name})` : ''} with ${flowerDesc}${glitterDesc}${accessoriesDesc}`;
    addToCart({
      id: `custom-${Date.now()}`,
      title: "Custom Bouquet",
      price: totalPrice,
      image: generatedImage || Object.values(selectedFlowers)[0]?.flower.imageUrl || heroBouquetMain,
      description: desc,
      personalNote: ""
    });
    toast.success("Added to cart!");
  };

  const handleDownloadImage = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bexy-flowers-custom-bouquet-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleDownloadAndShareWhatsApp = async () => {
    if (!generatedImage) return;
    const whatsappNumber = "96176104882";
    const message = "I would like to order this flower. Thank you.";
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bexy-flowers-custom-bouquet-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      toast.success("Image downloaded! Opening WhatsApp...");
    } catch (error) {
      toast.error("Failed to download image or open WhatsApp");
    }
  };

  // Load history and favorites on mount
  useEffect(() => {
    setPromptHistory(getPromptHistory());
    setFavorites(getFavorites());
  }, []);

  // Build current prompt whenever selections change
  const buildCurrentPrompt = useCallback(() => {
    if (!selectedPackage || !selectedSize || !selectedColor || Object.keys(selectedFlowers).length === 0) {
      return null;
    }

    const flowerData = Object.values(selectedFlowers).map(({ flower, quantity }) => ({
      flower,
      quantity
    }));

    const prompt = buildAdvancedPrompt({
      packageType: selectedPackage.type,
      boxShape: selectedBoxShape?.name.toLowerCase(),
      size: selectedSize.name.toLowerCase(),
      color: selectedColor.name.toLowerCase(),
      flowers: flowerData,
      withGlitter,
      withRibbon: selectedPackage.type === 'box' ? withRibbon : false,
      accessories: selectedAccessories,
      includeNegative: true,
      // New arrangement preferences for better AI accuracy
      arrangementStyle: arrangementStyle as 'dome' | 'flat' | 'cascading',
      densityPreference: densityPreference as 'tight' | 'medium' | 'airy',
      bloomStage: bloomStage as 'full' | 'semi' | 'mixed',
      flowerPositions: flowerPositions as Record<string, 'center' | 'edges' | 'scattered' | 'accent'>
    });

    return prompt;
  }, [selectedPackage, selectedBoxShape, selectedSize, selectedColor, selectedFlowers, withGlitter, withRibbon, selectedAccessories, arrangementStyle, densityPreference, bloomStage, flowerPositions]);

  // Update prompt preview when selections change
  useEffect(() => {
    const prompt = buildCurrentPrompt();
    setCurrentPrompt(prompt);
  }, [buildCurrentPrompt]);

  // Progress stage labels
  const progressLabels: Record<ProgressStage, string> = {
    'checking-cache': 'Checking cache...',
    'building-prompt': 'Building prompt...',
    'connecting': 'Connecting to AI...',
    'generating': 'Generating image...',
    'processing': 'Processing result...',
    'caching': 'Saving to cache...',
    'complete': 'Complete!'
  };

  // AI Generation with enhanced features
  const generateBouquetImage = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationProgress(null);
    
    try {
      // Generate a unique seed for this generation - ensures different image each time
      const generationSeed = Date.now();
      
      // Build prompt with unique seed
      if (!selectedPackage || !selectedSize || !selectedColor || Object.keys(selectedFlowers).length === 0) {
        toast.error("Please complete all selections first");
        setIsGenerating(false);
        return;
      }

      const flowerData = Object.values(selectedFlowers).map(({ flower, quantity }) => ({
        flower,
        quantity
      }));

      // Build prompt with unique seed for this generation
      const prompt = buildAdvancedPrompt({
        packageType: selectedPackage.type,
        boxShape: selectedBoxShape?.name.toLowerCase(),
        size: selectedSize.name.toLowerCase(),
        color: selectedColor.name.toLowerCase(),
        flowers: flowerData,
        withGlitter,
        withRibbon: selectedPackage.type === 'box' ? withRibbon : false,
        accessories: selectedAccessories,
        includeNegative: true,
        seed: generationSeed, // Unique seed ensures different image each time
        // Include arrangement preferences for better AI accuracy
        arrangementStyle: arrangementStyle as 'dome' | 'flat' | 'cascading',
        densityPreference: densityPreference as 'tight' | 'medium' | 'airy',
        bloomStage: bloomStage as 'full' | 'semi' | 'mixed',
        flowerPositions: flowerPositions as Record<string, 'center' | 'edges' | 'scattered' | 'accent'>
      });

      setLastGeneratedPrompt(prompt.positive);

      // Build configuration for history
      const configuration = {
        packageType: selectedPackage!.type,
        boxShape: selectedBoxShape?.name.toLowerCase(),
        size: selectedSize!.name.toLowerCase(),
        color: selectedColor!.name.toLowerCase(),
        flowers: Object.values(selectedFlowers).map(({ flower, quantity }) => ({
          id: flower.id,
          name: flower.name,
          quantity
        })),
        withGlitter,
        withRibbon,
        accessories: selectedAccessories
      };

      toast.loading("Generating your bouquet preview...", { id: 'generating-toast' });
      
      const result = await generateImage(prompt.positive, {
        width: 768, // Reduced from 1024 for faster generation
        height: 768, // Reduced from 1024 for faster generation
        enhancePrompt: true,
        negativePrompt: prompt.negative,
        useCache: false, // Disabled - always generate fresh image
        cacheHash: prompt.hash,
        onProgress: (stage) => setGenerationProgress(stage),
        configuration
      });

      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }
      
      setGeneratedImage(result.imageUrl);
      setVariationIndex(0);
      
      // Refresh history
      setPromptHistory(getPromptHistory());
      
      if (result.cached) {
        toast.success("Preview loaded from cache!", { id: 'generating-toast' });
      } else {
        toast.success("Preview generated!", { id: 'generating-toast' });
      }
    } catch (error) {
      toast.dismiss('generating-toast');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isRetryable = (error as any)?.retryable === true || errorMessage.includes('busy') || errorMessage.includes('timeout');
      
      toast.error("Could not generate preview", {
        description: isRetryable 
          ? "AI services are busy right now. Please try again in a moment."
          : "Image generation failed. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Generate variation of current design
  const generateVariation = async () => {
    if (!lastGeneratedPrompt) {
      toast.error("Generate an image first before creating variations");
      return;
    }

    setIsGenerating(true);
    const newVariationIndex = variationIndex + 1;
    setVariationIndex(newVariationIndex);

    try {
      toast.loading(`Creating variation ${newVariationIndex}...`, { id: 'variation-toast' });
      
      const result = await generateWithVariation(lastGeneratedPrompt, newVariationIndex, {
        width: 768,
        height: 768,
        onProgress: (stage) => setGenerationProgress(stage)
      });

      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }
      
      setGeneratedImage(result.imageUrl);
      toast.success(`Variation ${newVariationIndex} created!`, { id: 'variation-toast' });
    } catch (error) {
      toast.dismiss('variation-toast');
      toast.error("Could not generate variation");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Generate with custom edited prompt
  const generateWithCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationProgress(null);

    try {
      toast.loading("Generating with custom prompt...", { id: 'custom-generating-toast' });
      
      const result = await generateImage(customPrompt, {
        width: 768,
        height: 768,
        enhancePrompt: true,
        negativePrompt: currentPrompt?.negative || '',
        useCache: false,
        onProgress: (stage) => setGenerationProgress(stage)
      });

      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }
      
      setGeneratedImage(result.imageUrl);
      setLastGeneratedPrompt(customPrompt);
      setVariationIndex(0);
      setIsEditingPrompt(false);
      toast.success("Custom preview generated!", { id: 'custom-generating-toast' });
    } catch (error) {
      toast.dismiss('custom-generating-toast');
      toast.error("Could not generate preview");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Open prompt editor with current prompt
  const openPromptEditor = () => {
    if (currentPrompt) {
      setCustomPrompt(currentPrompt.positive);
    }
    setIsEditingPrompt(true);
  };

  // Toggle favorite for current configuration
  const toggleCurrentFavorite = () => {
    if (!currentPrompt) return;

    const entry: PromptHistoryEntry = {
      id: `fav-${Date.now()}`,
      hash: currentPrompt.hash,
      prompt: currentPrompt.positive,
      preview: currentPrompt.preview,
      imageUrl: generatedImage || undefined,
      createdAt: Date.now(),
      configuration: {
        packageType: selectedPackage!.type,
        boxShape: selectedBoxShape?.name.toLowerCase(),
        size: selectedSize!.name.toLowerCase(),
        color: selectedColor!.name.toLowerCase(),
        flowers: Object.values(selectedFlowers).map(({ flower, quantity }) => ({
          id: flower.id,
          name: flower.name,
          quantity
        })),
        withGlitter,
        withRibbon,
        accessories: selectedAccessories
      }
    };

    if (isFavorite(currentPrompt.hash)) {
      const fav = favorites.find(f => f.hash === currentPrompt.hash);
      if (fav) {
        removeFromFavorites(fav.id);
        toast.success("Removed from favorites");
      }
    } else {
      if (addToFavorites(entry)) {
        toast.success("Added to favorites!");
      } else {
        toast.error("Favorites list is full (max 10)");
      }
    }
    setFavorites(getFavorites());
  };

  // Load configuration from history entry
  const loadFromHistory = (entry: PromptHistoryEntry) => {
    const config = entry.configuration;
    
    // Find and set package
    const pkg = packages.find(p => p.type === config.packageType);
    if (pkg) setSelectedPackage(pkg);
    
    // Find and set box shape
    if (config.boxShape) {
      const shape = boxShapes.find(s => s.name.toLowerCase() === config.boxShape);
      if (shape) setSelectedBoxShape(shape);
    }
    
    // Find and set size
    const size = sizes.find(s => s.name.toLowerCase() === config.size);
    if (size) setSelectedSize(size);
    
    // Find and set color
    const color = colors.find(c => c.name.toLowerCase() === config.color);
    if (color) setSelectedColor(color);
    
    // Set flowers
    const newSelectedFlowers: Record<string, SelectedFlower> = {};
    config.flowers.forEach(f => {
      const flower = flowers.find(fl => fl.id === f.id);
      if (flower) {
        newSelectedFlowers[f.id] = { flower, quantity: f.quantity };
      }
    });
    setSelectedFlowers(newSelectedFlowers);
    setFlowerMode(Object.keys(newSelectedFlowers).length > 1 ? 'mix' : 'specific');
    
    // Set other options
    setWithGlitter(config.withGlitter);
    setWithRibbon(config.withRibbon || false);
    setSelectedAccessories(config.accessories);
    
    // Load image if available
    if (entry.imageUrl) {
      setGeneratedImage(entry.imageUrl);
    }
    
    setShowHistory(false);
    toast.success("Configuration loaded!");
  };

  // Get current season in Lebanon (Mediterranean climate)
  const getCurrentSeason = (): Season => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 9) return "summer";
    if (month >= 10 && month <= 11) return "fall";
    return "winter"; // Dec, Jan, Feb
  };

  const currentSeason = getCurrentSeason();

  // Season configuration for display
  type SeasonConfig = {
    label: string;
    icon: string;
    color: string;
    style?: React.CSSProperties;
  };
  
  const seasonConfig: Record<Season, SeasonConfig> = {
    spring: { label: "Spring", icon: "🌸", color: "bg-green-100 text-green-700 border-green-300" },
    summer: { label: "Summer", icon: "☀️", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    fall: { label: "Fall", icon: "🍂", color: "bg-orange-100 text-orange-700 border-orange-300" },
    winter: { label: "Winter", icon: "❄️", color: "bg-blue-100 text-blue-700 border-blue-300" },
    "all-year": { label: "All Year", icon: "🌿", color: "bg-gray-100 border-gray-300", style: { color: '#2c2d2a', fontFamily: "'EB Garamond', serif" } }
  };

  // ⚡ PERFORMANCE: Memoize recommended flowers to prevent recalculation
  const recommendedFlowerIds = useMemo((): string[] => {
    if (selectedPackage?.type === "box" && selectedSize?.id === "medium") {
      return ["rose-red", "rose-pink", "peony-pink", "orchid-white", "hydrangea-white"];
    }
    if (selectedPackage?.type === "wrap") {
      return ["rose-red", "rose-pink", "tulip-red", "lily-pink"];
    }
    return ["rose-red", "rose-pink", "tulip-pink", "carnation-red"];
  }, [selectedPackage?.type, selectedSize?.id]);

  // ⚡ PERFORMANCE: Memoize filtered flowers to prevent expensive recalculations
  const filteredFlowers = useMemo(() => {
    // Filter by availability mode first
    let modeFilteredFlowers = flowers;
    if (flowerMode === "specific") {
      // Show only flowers available in "specific" or "both" modes
      modeFilteredFlowers = flowers.filter(f => 
        !f.availabilityMode || f.availabilityMode === 'specific' || f.availabilityMode === 'both'
      );
    } else if (flowerMode === "mix") {
      // Show only flowers available in "mix" or "both" modes
      modeFilteredFlowers = flowers.filter(f => 
        !f.availabilityMode || f.availabilityMode === 'mix' || f.availabilityMode === 'both'
      );
    }
    
    // Then filter by family if in specific mode
    return flowerMode === "specific" && selectedFamily
      ? modeFilteredFlowers.filter(f => f.family === selectedFamily)
      : modeFilteredFlowers;
  }, [flowers, flowerMode, selectedFamily]);

  // ⚡ PERFORMANCE: Memoize category filtering
  // Now uses database filter_categories instead of hardcoded mapping
  // BACKWARD COMPATIBLE: Falls back to family-based filtering if filterCategories not available
  const categoryFiltered = useMemo(() => {
    if (flowerFilter === "all" || flowerFilter === "seasonal") {
      return filteredFlowers;
    }
    
    // Filter by database filter_categories array
    return filteredFlowers.filter(f => {
      // BACKWARD COMPATIBLE: If filterCategories not available, use legacy family-based filtering
      if (!f.filterCategories || f.filterCategories.length === 0) {
        // Legacy fallback mapping
        const legacyCategories: Record<string, string[]> = {
          popular: ["roses", "tulips", "carnation"],
          romantic: ["roses", "peonies", "lily", "tulips", "orchid"],
          minimal: ["gypsum", "daisies", "lavender"],
          luxury: ["orchid", "peonies", "hydrangea", "lily"],
        };
        
        const families = legacyCategories[flowerFilter] || [];
        if (!families.includes(f.family)) return false;
        
        // Additional color-based filtering for romantic category
        if (flowerFilter === "romantic") {
          if (f.family === "roses" && (f.colorName === "blue" || f.colorName === "yellow")) return false;
          if (f.family === "tulips" && !["red", "pink", "white"].includes(f.colorName)) return false;
        }
        
        return true;
      }
      
      // Check if the flower's filterCategories includes the selected filter
      return f.filterCategories.includes(flowerFilter);
    });
  }, [filteredFlowers, flowerFilter]);

  // ⚡ PERFORMANCE: Memoize available flowers (final filtered list)
  const availableFlowers = useMemo(() => {
    if (flowerFilter === "seasonal") {
      if (seasonFilter === "all-seasons") {
        return filteredFlowers;
      }
      return filteredFlowers.filter(f => {
        if (!f.seasons || f.seasons.length === 0) return false;
        return f.seasons.includes(seasonFilter);
      });
    }
    return categoryFiltered;
  }, [filteredFlowers, categoryFiltered, flowerFilter, seasonFilter]);

  const steps = [
    { id: 1, title: "Base", icon: Box },
    { id: 2, title: "Details", icon: Palette },
    { id: 3, title: "Blooms", icon: Sparkles },
    { id: 4, title: "Glitter", icon: Star },
    { id: 5, title: "Extras", icon: Gift }
  ];

  return (
    <div className="min-h-screen bg-white font-body" ref={containerRef}>
      <UltraNavigation />

      {/* Hero Section - Matching Home & Collection Page Style */}
      <section 
        className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16"
        style={{
          background: isMobile ? 'transparent' : 'linear-gradient(180deg, #FAF8F3 0%, #F5F1E8 50%, #EDE7D9 100%)',
          minHeight: isMobile ? 'calc(100vh + 200px)' : '70vh',
          height: isMobile ? 'calc(100vh + 200px)' : undefined,
          marginTop: isMobile ? '-80px' : undefined,
          paddingTop: isMobile ? '80px' : undefined,
          paddingBottom: isMobile ? '4rem' : undefined
        }}
      >
        {/* Video background for mobile view - Absolute within hero section, extends behind header */}
        {isMobile && (
          <video
            ref={videoRef}
            className="absolute left-0 right-0 w-full object-cover object-center pointer-events-none z-0"
            style={{
              width: '100%',
              maxWidth: '100%',
              height: 'calc(100vh + 200px)',
              minHeight: 'calc(100vh + 200px)',
              top: '-80px',
              bottom: 0,
              left: 0,
              right: 0,
              marginLeft: 0,
              marginRight: 0,
              paddingLeft: 0,
              paddingRight: 0,
            }}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-label="Hero background video"
          >
            {shouldLoadVideo && (
              <source src={video2Url} type="video/webm" />
            )}
          </video>
        )}

        {/* Elegant Gradient Background Elements - Desktop Only */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Top-left golden glow */}
            <motion.div
              className="absolute w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 -top-24 -left-24"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div 
                className="w-full h-full rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle, rgba(199, 158, 72, 0.2) 0%, rgba(199, 158, 72, 0.1) 40%, transparent 70%)'
                }}
              />
            </motion.div>
            
            {/* Bottom-right rose gold accent */}
            <motion.div
              className="absolute w-56 h-56 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] -bottom-20 -right-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.25, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            >
              <div 
                className="w-full h-full rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle, rgba(184, 138, 68, 0.15) 0%, rgba(184, 138, 68, 0.08) 40%, transparent 70%)'
                }}
              />
            </motion.div>
            
            {/* Center soft glow */}
            <motion.div
              className="absolute w-64 h-64 sm:w-96 sm:h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            >
              <div 
                className="w-full h-full rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle, rgba(245, 241, 232, 0.4) 0%, rgba(245, 241, 232, 0.2) 40%, transparent 70%)'
                }}
              />
            </motion.div>
          </div>
        )}

        {/* Hero Content - Elegant Design Matching Collection Page */}
        <div
          className="relative z-20 text-center max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8"
          style={isMobile ? {
            paddingTop: '2rem',
            paddingBottom: '2rem',
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          } : undefined}
        >
          <motion.div
            className="space-y-2 sm:space-y-4 md:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={isMobile ? {
              width: '100%',
              maxWidth: '100%'
            } : undefined}
          >
            {/* Brand Name - Desktop Only */}
            {!isMobile && (
              <motion.p 
                className="uppercase tracking-[0.2em] sm:tracking-ultra-wide text-[10px] sm:text-xs md:text-sm text-[#8B7355] font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                BEXY SIGNATURE ATELIER
              </motion.p>
            )}

            {/* Main Heading */}
            <motion.h1 
              className={`font-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold relative ${
                isMobile ? 'text-white' : 'text-[#3D3027]'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                letterSpacing: '0.02em',
                lineHeight: '1.15',
                textShadow: isMobile ? '0 2px 8px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.4)' : 'none'
              }}
            >
              <span className="block">Design Your</span>
              <span className="block mt-1">Masterpiece</span>
            </motion.h1>

            {/* Golden Divider with Diamond */}
            <motion.div 
              className="relative flex items-center justify-center my-3 sm:my-4 md:my-6"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            >
              <div className={`w-20 sm:w-24 md:w-32 h-px bg-gradient-to-r from-transparent ${
                isMobile ? 'via-white/60' : 'via-[#C79E48]'
              } to-transparent`} />
              <div className={`absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 shadow-sm ${
                isMobile ? 'bg-white/80' : 'bg-[#C79E48]'
              }`} />
            </motion.div>

            {/* Description */}
            <motion.p 
              className={`text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-body px-2 sm:px-0 ${
                isMobile ? 'text-white/90' : 'text-[#6B5D52]'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              style={{
                textShadow: isMobile ? '0 2px 8px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.4)' : 'none'
              }}
            >
              {isMobile 
                ? 'Handcrafted by expert florists'
                : 'Create bespoke floral arrangements tailored to your vision. Every detail crafted with precision and passion by our expert florists.'
              }
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Progress Stepper - After Hero */}
      <div className="relative z-20 bg-white pt-4">
        <ProgressStepper currentStep={currentStep} steps={steps} />
      </div>

      {/* Main Content - Split Screen Layout */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 pb-16 overflow-x-hidden bg-white">
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-8 lg:gap-12 w-full`}>
          
          {/* Left: Selection Panels */}
          <div className="space-y-6 w-full min-w-0">
            
            {/* Step 1: Package Selection */}
            <motion.div
              ref={step1Ref}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step1Complete ? 'bg-[#C79E48] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-normal text-lg" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Choose Presentation</h3>
                  <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Select your base style</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {packages.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      selectedPackage?.id === pkg.id
                        ? 'border-[#C79E48] bg-[#C79E48]/5'
                        : 'border-gray-200 hover:border-[#C79E48]/50'
                    }`}
                  >
                    <pkg.icon className={`w-8 h-8 mb-3 ${selectedPackage?.id === pkg.id ? 'text-[#C79E48]' : 'text-gray-400'}`} />
                    <h4 className="font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{pkg.name}</h4>
                    <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{pkg.description}</p>
                    <div className="mt-2 text-sm font-normal" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>${pkg.basePrice}</div>
                  </button>
                ))}
              </div>

              {/* Box Shape - Conditional for Box type */}
              <AnimatePresence>
                {selectedPackage?.type === "box" && (
                  <motion.div
                    ref={boxShapeRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <h4 className="font-normal mb-4" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Box Shape</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {boxShapes.map(shape => {
                        const ShapeIcon = shape.icon;
                        return (
                          <button
                            key={shape.id}
                            onClick={() => setSelectedBoxShape(shape)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedBoxShape?.id === shape.id
                                ? 'border-[#C79E48] bg-[#C79E48]/5'
                                : 'border-gray-200 hover:border-[#C79E48]/50'
                            }`}
                          >
                            <ShapeIcon className={`w-6 h-6 mx-auto mb-2 ${selectedBoxShape?.id === shape.id ? 'text-[#C79E48]' : 'text-gray-400'}`} />
                            <span className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{shape.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouquet Shape - Conditional for Wrap type */}
              <AnimatePresence>
                {selectedPackage?.type === "wrap" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <h4 className="font-normal mb-4" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Bouquet Shape</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedBoxShape(null)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          !selectedBoxShape || selectedBoxShape.id !== 'heart'
                            ? 'border-[#C79E48] bg-[#C79E48]/5'
                            : 'border-gray-200 hover:border-[#C79E48]/50'
                        }`}
                      >
                        <Circle className={`w-6 h-6 mx-auto mb-2 ${!selectedBoxShape || selectedBoxShape.id !== 'heart' ? 'text-[#C79E48]' : 'text-gray-400'}`} />
                        <span className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Classic Round</span>
                        <p className="text-[10px] mt-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Traditional dome shape</p>
                      </button>
                      <button
                        onClick={() => setSelectedBoxShape({ id: 'heart', name: 'Heart', icon: Heart })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedBoxShape?.id === 'heart'
                            ? 'border-[#C79E48] bg-[#C79E48]/5'
                            : 'border-gray-200 hover:border-[#C79E48]/50'
                        }`}
                      >
                        <Heart className={`w-6 h-6 mx-auto mb-2 ${selectedBoxShape?.id === 'heart' ? 'text-[#C79E48]' : 'text-gray-400'}`} />
                        <span className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Heart Shape</span>
                        <p className="text-[10px] mt-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Romantic heart arrangement</p>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ribbon Wrap Option - Conditional for Box type */}
              <AnimatePresence>
                {selectedPackage?.type === "box" && selectedBoxShape && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <h4 className="font-normal mb-4" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Box Decoration</h4>
                    <button
                      onClick={() => setWithRibbon(!withRibbon)}
                      className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                        withRibbon
                          ? 'border-[#C79E48] bg-[#C79E48]/5'
                          : 'border-gray-200 hover:border-[#C79E48]/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${withRibbon ? 'bg-[#C79E48] text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Gift className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <span className="text-sm font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Satin Ribbon Wrap</span>
                        <p className="text-[10px]" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Elegant satin ribbon with bow around the box</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${withRibbon ? 'border-[#C79E48] bg-[#C79E48]' : 'border-gray-300'}`}>
                        {withRibbon && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Step 2: Size & Color */}
            {step1Complete && (
              <motion.div
                ref={step2Ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step2Complete ? 'bg-[#C79E48] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-normal text-lg" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Size & Color</h3>
                    <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Refine the details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Sizes */}
                  <div>
                    <h4 className="text-sm font-normal mb-3" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Size</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {sizes.map(size => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size)}
                          className={`p-4 rounded-lg border-2 transition-all text-center ${
                            selectedSize?.id === size.id
                              ? 'border-[#C79E48] bg-[#C79E48]/5'
                              : 'border-gray-200 hover:border-[#C79E48]/50'
                          }`}
                        >
                          <div className="font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{size.name}</div>
                          <div className="text-xs mt-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>{size.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h4 className="text-sm font-normal mb-3" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Color</h4>
                    <div className="flex flex-wrap gap-3">
                      {colors.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color)}
                          className={`w-12 h-12 rounded-full border-4 transition-all ${
                            selectedColor?.id === color.id ? 'border-[#C79E48] scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ background: color.gradient }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Flowers */}
            {step2Complete && (
              <motion.div
                ref={step3Ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm w-full min-w-0 overflow-x-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step3Complete ? 'bg-[#C79E48] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-normal text-lg" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Choose Your Blooms</h3>
                    <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                      {flowerMode === "specific" 
                        ? "Select one flower type" 
                        : selectedSize 
                          ? `${currentTotalFlowers} / ${maxFlowers} flowers selected`
                          : "Select your flowers"}
                    </p>
                  </div>
                </div>

                {!flowerMode ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFlowerMode("specific")}
                      className="p-6 rounded-xl border-2 border-gray-200 hover:border-[#C79E48] hover:bg-[#C79E48]/5 transition-all text-left"
                    >
                      <div className="text-3xl mb-3">🌹</div>
                      <h4 className="font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Specific Variety</h4>
                      <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Choose one flower type</p>
                    </button>
                    <button
                      onClick={() => setFlowerMode("mix")}
                      className="p-6 rounded-xl border-2 border-gray-200 hover:border-[#C79E48] hover:bg-[#C79E48]/5 transition-all text-left"
                    >
                      <div className="text-3xl mb-3">💐</div>
                      <h4 className="font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Mix & Match</h4>
                      <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Create a mixed bouquet</p>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { setFlowerMode(null); setSelectedFamily(null); }}
                        className="text-sm hover:text-[#C79E48] flex items-center gap-1"
                        style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
                      >
                        ← Back
                      </button>
                      <span className="text-xs font-normal uppercase" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                        {flowerMode === "specific" ? "Single Variety" : "Mixed Bouquet"}
                      </span>
                    </div>

                    {flowerMode === "specific" && !selectedFamily && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-3 sm:grid-cols-4 gap-3"
                      >
                        {flowerFamilies.map(fam => (
                          <motion.button
                            key={fam.id}
                            onClick={() => setSelectedFamily(fam.id)}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#C79E48] hover:bg-[#C79E48]/5 transition-all text-center"
                          >
                            <span className="text-2xl block mb-2">{fam.icon}</span>
                            <span className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{fam.name}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}

                    {flowerMode === "specific" && selectedFamily && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{flowerFamilies.find(f => f.id === selectedFamily)?.icon}</span>
                        <h4 className="font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{flowerFamilies.find(f => f.id === selectedFamily)?.name}</h4>
                        <button
                          onClick={() => setSelectedFamily(null)}
                          className="ml-auto text-xs hover:text-[#C79E48]"
                          style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
                        >
                          Change
                        </button>
                      </div>
                    )}

                    {/* Flower Filters - Available for both Specific Variety and Mix & Match */}
                    {(flowerMode === "mix" || (flowerMode === "specific" && selectedFamily)) && (
                      <div className="space-y-3 mb-4">
                        {/* Style Filters */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "all", label: "All" },
                            { id: "popular", label: "Popular" },
                            { id: "romantic", label: "Romantic" },
                            { id: "minimal", label: "Minimal" },
                            { id: "luxury", label: "Luxury" },
                            { id: "seasonal", label: "Seasonal" }
                          ].map(filter => (
                            <button
                              key={filter.id}
                              onClick={() => setFlowerFilter(filter.id as any)}
                              className={`px-3 py-1.5 rounded-full text-xs font-normal transition-all ${
                                flowerFilter === filter.id
                                  ? 'bg-[#C79E48] text-white shadow-sm'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              style={{ color: flowerFilter === filter.id ? 'white' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>

                        {/* Seasonal Filter - Only show when "seasonal" category is selected */}
                        {flowerFilter === "seasonal" && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Season:</span>
                            {[
                              { id: "all-seasons", label: "All Seasons" },
                              { id: "spring", label: "Spring", icon: "🌸" },
                              { id: "summer", label: "Summer", icon: "☀️" },
                              { id: "fall", label: "Fall", icon: "🍂" },
                              { id: "winter", label: "Winter", icon: "❄️" }
                            ].map(seasonFilterOption => (
                              <button
                                key={seasonFilterOption.id}
                                onClick={() => {
                                  setSeasonFilter(seasonFilterOption.id === "all-seasons" ? "all-seasons" : seasonFilterOption.id as Season);
                                }}
                                className={`px-2.5 py-1 rounded-full text-xs font-normal transition-all flex items-center gap-1 ${
                                  (seasonFilterOption.id === "all-seasons" && seasonFilter === "all-seasons") ||
                                  (seasonFilterOption.id !== "all-seasons" && seasonFilter === seasonFilterOption.id)
                                    ? 'bg-[#C79E48]/20 border border-[#C79E48]/30'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                style={{ color: (seasonFilterOption.id === "all-seasons" && seasonFilter === "all-seasons") || (seasonFilterOption.id !== "all-seasons" && seasonFilter === seasonFilterOption.id) ? '#C79E48' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                              >
                                {seasonFilterOption.icon && <span>{seasonFilterOption.icon}</span>}
                                {seasonFilterOption.label}
                              </button>
                            ))}
                            <span className="text-[10px] ml-auto" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                              Current: {seasonConfig[currentSeason].icon} {seasonConfig[currentSeason].label}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Flower Count Indicator for Mix & Match */}
                    {flowerMode === "mix" && selectedSize && (
                      <div className={`mb-4 p-3 rounded-lg border-2 ${
                        currentTotalFlowers >= maxFlowers 
                          ? 'bg-green-50 border-green-300' 
                          : currentTotalFlowers >= maxFlowers * 0.8
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-blue-50 border-blue-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Flowers Selected:</span>
                          <span className={`text-sm font-normal`} style={{ 
                            color: currentTotalFlowers >= maxFlowers 
                              ? '#059669' 
                              : currentTotalFlowers >= maxFlowers * 0.8
                              ? '#d97706'
                              : '#2563eb',
                            fontFamily: "'EB Garamond', serif",
                            letterSpacing: '-0.02em'
                          }}>
                            {currentTotalFlowers} / {maxFlowers}
                          </span>
                        </div>
                        {currentTotalFlowers >= maxFlowers && (
                          <div className="text-xs text-green-700 mt-1">✓ Maximum capacity reached</div>
                        )}
                        {currentTotalFlowers < maxFlowers && remainingSlots <= 5 && (
                          <div className="text-xs text-yellow-700 mt-1">Only {remainingSlots} more slot{remainingSlots !== 1 ? 's' : ''} available</div>
                        )}
                      </div>
                    )}

                    {/* Recommended Section */}
                    {(flowerMode === "mix" || (flowerMode === "specific" && selectedFamily)) && step1Complete && step2Complete && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-[#C79E48]/5 to-[#C79E48]/10 rounded-xl border border-[#C79E48]/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-[#C79E48]" />
                          <span className="text-sm font-normal" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Florist's Choice</span>
                          <span className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Recommended for {selectedPackage?.name} {selectedSize?.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableFlowers
                            .filter(f => recommendedFlowerIds.includes(f.id))
                            .slice(0, 4)
                            .map(flower => {
                              const availableQuantity = flower.quantity ?? 0;
                              const isOutOfStock = availableQuantity <= 0;
                              return (
                                <button
                                  key={flower.id}
                                  onClick={() => handleAddFlower(flower)}
                                  disabled={isOutOfStock || (flowerMode === "mix" && !canAddMore)}
                                  className={`px-3 py-1.5 bg-white border rounded-lg text-xs font-normal transition-all ${
                                    isOutOfStock || (flowerMode === "mix" && !canAddMore)
                                      ? 'border-gray-200 cursor-not-allowed opacity-60'
                                      : 'border-[#C79E48]/30 hover:bg-[#C79E48]/10 hover:border-[#C79E48]'
                                  }`}
                                  style={{ color: isOutOfStock || (flowerMode === "mix" && !canAddMore) ? '#9ca3af' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                                >
                                  {flower.name} {isOutOfStock && '(Out of Stock)'}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {(flowerMode === "mix" || (flowerMode === "specific" && selectedFamily)) && (
                      <div ref={flowersGridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto overflow-x-hidden w-full">
                        {availableFlowers.map(flower => {
                          const qty = selectedFlowers[flower.id]?.quantity || 0;
                          const isRecommended = recommendedFlowerIds.includes(flower.id);
                          const isSelected = qty > 0;
                          const availableQuantity = flower.quantity ?? 0;
                          const isOutOfStock = availableQuantity <= 0;
                          const isQuantityMaxed = flowerMode === "mix" && qty >= availableQuantity;
                          return (
                            <motion.div
                              key={flower.id}
                              whileHover={!isSelected && !isOutOfStock ? { y: -2 } : {}}
                              className={`relative p-3 rounded-xl border-2 transition-all ${
                                isOutOfStock
                                  ? 'border-gray-200 bg-gray-50 opacity-60'
                                  : isSelected
                                    ? 'border-[#C79E48] bg-gradient-to-br from-[#C79E48]/8 to-[#C79E48]/4 shadow-md translate-y-[-2px]'
                                    : 'border-gray-200 bg-white hover:border-[#C79E48]/50 hover:shadow-sm'
                              }`}
                            >
                              {isRecommended && !isSelected && (
                                <div className="absolute -top-1.5 -right-1.5 bg-[#C79E48] text-white text-[10px] font-normal px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-md whitespace-nowrap" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Choice
                                </div>
                              )}
                              
                              <div className="aspect-square rounded-lg bg-gray-100 mb-2 overflow-hidden relative">
                                <img
                                  src={flower.imageUrl}
                                  alt={flower.name}
                                  className={`w-full h-full object-cover ${
                                    isOutOfStock || (flower.seasons && 
                                    !flower.seasons.includes("all-year") && 
                                    !flower.seasons.includes(currentSeason))
                                      ? "opacity-50 grayscale-[30%]" 
                                      : ""
                                  }`}
                                />
                                {/* Out of Stock Overlay */}
                                {isOutOfStock && (
                                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 z-20">
                                    <div className="text-white text-center">
                                      <div className="text-xs font-normal mb-1" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Out of Stock</div>
                                    </div>
                                  </div>
                                )}
                                {/* Out of Season Overlay */}
                                {!isOutOfStock && flower.seasons && 
                                 !flower.seasons.includes("all-year") && 
                                 !flower.seasons.includes(currentSeason) && (
                                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 z-20">
                                    <div className="text-white text-center">
                                      <div className="text-xs font-normal mb-1" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Not This Season</div>
                                      <div className="text-[10px] text-white/90">
                                        Available in {flower.seasons.map(s => seasonConfig[s].label).join(", ")}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute top-2 right-2 w-5 h-5 bg-[#C79E48] rounded-full flex items-center justify-center shadow-md z-30"
                                  >
                                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                                  </motion.div>
                                )}
                              </div>
                              
                              <div className="text-xs font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{flower.name}</div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-normal" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>${flower.price.toFixed(2)}</div>
                                {!isOutOfStock && availableQuantity > 0 && (
                                  <div className="text-[10px] font-normal" style={{ color: '#6b7280', fontFamily: "'EB Garamond', serif" }}>
                                    {availableQuantity} {availableQuantity === 1 ? 'left' : 'left'}
                                  </div>
                                )}
                              </div>
                              
                              {qty > 0 ? (
                                flowerMode === "specific" ? (
                                  // Specific Variety: Show fixed quantity (no controls)
                                  <div className="text-center py-2">
                                    <div className="text-xs mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Quantity</div>
                                    <div className="font-normal text-lg" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{qty}</div>
                                    <div className="text-[10px] mt-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Fixed for {selectedSize?.name} size</div>
                                  </div>
                                ) : (
                                  // Mix & Match: Show controls with max limit
                                  <div className="flex items-center justify-between">
                                    <button 
                                      onClick={() => handleRemoveFlower(flower.id)} 
                                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-red-50 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-normal text-sm" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{qty}</span>
                                    <button 
                                      onClick={() => handleAddFlower(flower)} 
                                      disabled={!canAddMore || isQuantityMaxed}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                        canAddMore && !isQuantityMaxed
                                          ? 'bg-[#C79E48] text-white hover:bg-[#b08d45]' 
                                          : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                                      }`}
                                      title={isQuantityMaxed ? `Only ${availableQuantity} available` : undefined}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                )
                              ) : (
                                <button
                                  onClick={() => handleAddFlower(flower)}
                                  disabled={isOutOfStock || (flowerMode === "mix" && !canAddMore)}
                                  className={`w-full py-1.5 rounded-lg text-xs font-normal transition-colors ${
                                    isOutOfStock || (flowerMode === "mix" && !canAddMore)
                                      ? 'bg-gray-200 cursor-not-allowed'
                                      : 'bg-gray-100 hover:bg-[#C79E48] hover:text-white'
                                  }`}
                                  style={{ color: isOutOfStock || (flowerMode === "mix" && !canAddMore) ? '#9ca3af' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                                >
                                  {isOutOfStock 
                                    ? "Out of Stock" 
                                    : flowerMode === "specific" 
                                      ? "Select" 
                                      : canAddMore 
                                        ? "Add" 
                                        : "Max Reached"}
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Arrangement Preferences - Shows when Mix & Match with 2+ flower types */}
                    {flowerMode === "mix" && Object.keys(selectedFlowers).length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-gray-200 space-y-5"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-[#C79E48]" />
                          <h4 className="font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Arrangement Preferences</h4>
                          <span className="text-xs ml-auto" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Help AI create your perfect bouquet</span>
                        </div>

                        {/* Flower Positioning */}
                        <div className="bg-gradient-to-r from-[#C79E48]/5 to-[#C79E48]/10 rounded-xl p-4 border border-[#C79E48]/20">
                          <h5 className="font-normal text-sm mb-3 flex items-center gap-2" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                            <span className="text-lg">🎯</span>
                            Flower Positioning
                          </h5>
                          <p className="text-xs mb-3" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Where should each flower type be placed?</p>
                          <div className="space-y-3">
                            {Object.entries(selectedFlowers).map(([flowerId, { flower, quantity }]) => (
                              <div key={flowerId} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                  <img src={flower.imageUrl} alt={flower.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-normal truncate" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{quantity}x {flower.name}</div>
                                  <select
                                    value={flowerPositions[flowerId] || 'scattered'}
                                    onChange={(e) => setFlowerPositions(prev => ({ ...prev, [flowerId]: e.target.value }))}
                                    className="mt-1 w-full text-xs p-1.5 rounded border border-gray-300 focus:border-[#C79E48] focus:ring-1 focus:ring-[#C79E48] bg-white"
                                  >
                                    {positionOptions.map(pos => (
                                      <option key={pos.id} value={pos.id}>{pos.name} - {pos.description}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Arrangement Style */}
                        <div>
                          <h5 className="font-normal text-sm mb-3 flex items-center gap-2" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                            <span className="text-lg">🌸</span>
                            Arrangement Style
                          </h5>
                          <div className="grid grid-cols-3 gap-2">
                            {arrangementStyles.map(style => (
                              <button
                                key={style.id}
                                onClick={() => setArrangementStyle(style.id)}
                                className={`p-3 rounded-lg border-2 transition-all text-center ${
                                  arrangementStyle === style.id
                                    ? 'border-[#C79E48] bg-[#C79E48]/5'
                                    : 'border-gray-200 hover:border-[#C79E48]/50'
                                }`}
                              >
                                <span className="text-xl block mb-1">{style.icon}</span>
                                <div className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{style.name}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>{style.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Density Preference */}
                        <div>
                          <h5 className="font-normal text-sm mb-3 flex items-center gap-2" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                            <span className="text-lg">📏</span>
                            Density & Spacing
                          </h5>
                          <div className="grid grid-cols-3 gap-2">
                            {densityOptions.map(density => (
                              <button
                                key={density.id}
                                onClick={() => setDensityPreference(density.id)}
                                className={`p-3 rounded-lg border-2 transition-all text-center ${
                                  densityPreference === density.id
                                    ? 'border-[#C79E48] bg-[#C79E48]/5'
                                    : 'border-gray-200 hover:border-[#C79E48]/50'
                                }`}
                              >
                                <div className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{density.name}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>{density.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bloom Stage */}
                        <div>
                          <h5 className="font-normal text-sm mb-3 flex items-center gap-2" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                            <span className="text-lg">🌷</span>
                            Bloom Stage
                          </h5>
                          <div className="grid grid-cols-3 gap-2">
                            {bloomStages.map(stage => (
                              <button
                                key={stage.id}
                                onClick={() => setBloomStage(stage.id)}
                                className={`p-3 rounded-lg border-2 transition-all text-center ${
                                  bloomStage === stage.id
                                    ? 'border-[#C79E48] bg-[#C79E48]/5'
                                    : 'border-gray-200 hover:border-[#C79E48]/50'
                                }`}
                              >
                                <div className="text-xs font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{stage.name}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>{stage.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Glitter */}
            {step3Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm w-full min-w-0 overflow-x-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C79E48] text-white">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-normal text-lg" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Add Glitter</h3>
                    <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Make it sparkle! (+$2)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setWithGlitter(false)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      !withGlitter
                        ? 'border-[#C79E48] bg-[#C79E48]/5'
                        : 'border-gray-200 hover:border-[#C79E48]/50'
                    }`}
                  >
                    <div className="text-3xl mb-3">✨</div>
                    <h4 className="font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Without Glitter</h4>
                    <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Classic and elegant</p>
                  </button>
                  <button
                    onClick={() => setWithGlitter(true)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      withGlitter
                        ? 'border-[#C79E48] bg-[#C79E48]/5'
                        : 'border-gray-200 hover:border-[#C79E48]/50'
                    }`}
                  >
                    <div className="text-3xl mb-3">⭐</div>
                    <h4 className="font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>With Glitter</h4>
                    <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Sparkle and shine (+$2)</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Accessories */}
            {step3Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm w-full min-w-0 overflow-x-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C79E48] text-white">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-normal text-lg" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Add Accessories</h3>
                    <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Optional extras to personalize</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {accessories.map(accessory => {
                    const Icon = accessory.icon;
                    const isSelected = selectedAccessories.includes(accessory.id);
                    return (
                      <button
                        key={accessory.id}
                        onClick={() => {
                          setSelectedAccessories(prev => 
                            prev.includes(accessory.id)
                              ? prev.filter(id => id !== accessory.id)
                              : [...prev, accessory.id]
                          );
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? 'border-[#C79E48] bg-[#C79E48]/5'
                            : 'border-gray-200 hover:border-[#C79E48]/50'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-[#C79E48]' : 'text-gray-400'}`} />
                        <div className="font-normal text-sm mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>{accessory.name}</div>
                        <div className="text-xs font-normal" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>+${accessory.price}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}


            {/* Preview Card - Appears at the end after all selections (Mobile) */}
            {isMobile && step3Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mt-6"
              >
                {/* Preview Area */}
                <div className="aspect-square rounded-xl bg-gray-50 mb-6 overflow-hidden border border-gray-200 relative">
                  <AnimatePresence mode="wait">
                    {generatedImage ? (
                      <motion.img
                        key={generatedImage}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        src={generatedImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onLoad={() => setIsGenerating(false)}
                      />
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                        style={{
                          background: selectedColor 
                            ? `linear-gradient(135deg, ${selectedColor.hex}10 0%, ${selectedColor.hex}05 100%)`
                            : undefined
                        }}
                      >
                        <Wand2 className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-sm font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                          Ready to Preview
                        </p>
                        <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                          Generate your custom design
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-[#C79E48]/30 rounded-full" />
                          <div className="absolute inset-0 border-4 border-[#C79E48] border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="font-normal text-sm" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                          {generationProgress ? progressLabels[generationProgress] : 'Creating Your Bouquet'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateBouquetImage}
                  disabled={!step3Complete || isGenerating}
                  className={`w-full py-3.5 rounded-xl font-normal text-sm transition-all mb-2 flex items-center justify-center gap-2 ${
                    step3Complete && !isGenerating
                      ? 'bg-gradient-to-r from-[#C79E48] to-[#d4af4a] text-white hover:shadow-lg hover:scale-[1.02]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  style={{ color: step3Complete && !isGenerating ? 'white' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {isGenerating ? (generationProgress ? progressLabels[generationProgress] : "Generating...") : generatedImage ? "Regenerate" : "Generate Preview"}
                </button>

                {/* Variation Button */}
                {generatedImage && !isGenerating && (
                  <button
                    onClick={generateVariation}
                    className="w-full py-2.5 rounded-xl font-normal text-sm transition-all mb-4 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200"
                    style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Create Variation {variationIndex > 0 && `(${variationIndex})`}
                  </button>
                )}

                {generatedImage && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={handleDownloadImage}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-normal transition-colors flex items-center justify-center gap-2"
                      style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={handleDownloadAndShareWhatsApp}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-normal transition-colors flex items-center justify-center gap-2"
                      style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
                )}

                {/* Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Base</span>
                    <span className="font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                      {selectedPackage?.name || <span style={{ color: '#2c2d2a' }}>—</span>}
                      {selectedBoxShape && ` (${selectedBoxShape.name})`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Size & Color</span>
                    <span className="font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                      {selectedSize?.name && selectedColor?.name ? `${selectedSize.name} / ${selectedColor.name}` : <span style={{ color: '#2c2d2a' }}>—</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>Flowers</span>
                    <span className="font-normal text-right" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                      {Object.values(selectedFlowers).length > 0
                        ? Object.values(selectedFlowers).map(f => `${f.quantity}x ${f.flower.name}`).join(', ')
                        : <span style={{ color: '#2c2d2a' }}>—</span>}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-normal" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Total</span>
                      <span className="text-xl font-normal" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>${displayPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!step3Complete}
                  className="w-full mt-4 py-4 bg-[#C79E48] text-white rounded-xl font-normal hover:bg-[#b08d45] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </motion.div>
            )}

          </div>

          {/* Right: Preview & Summary - Desktop only (mobile version is at top) */}
          {!isMobile && (
          <div 
            className="fixed right-4 xl:right-8 h-fit z-10"
            style={{ 
              width: 'clamp(20rem, 30vw, 28rem)',
              top: `${Math.max(96, previewCardTop - scrollY + 16)}px`
            }}
          >
            <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${isMobile ? 'p-4' : 'p-6'}`}>
              
              {/* Preview Area */}
              <div className="aspect-square rounded-xl bg-gray-50 mb-6 overflow-hidden border border-gray-200 relative">
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.img
                      key={generatedImage}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      src={generatedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onLoad={() => setIsGenerating(false)}
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                      style={{
                        background: selectedColor 
                          ? `linear-gradient(135deg, ${selectedColor.hex}10 0%, ${selectedColor.hex}05 100%)`
                          : undefined
                      }}
                    >
                      <Wand2 className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-sm font-normal mb-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                        {step3Complete ? "Ready to Preview" : "Design Preview"}
                      </p>
                      <p className="text-xs" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>
                        {step3Complete ? "Generate your custom design" : "Complete selections to preview"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-[#C79E48]/30 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#C79E48] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="font-normal text-sm" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                        {generationProgress ? progressLabels[generationProgress] : 'Creating Your Bouquet'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={generateBouquetImage}
                disabled={!step3Complete || isGenerating}
                className={`w-full py-3.5 rounded-xl font-normal text-sm transition-all mb-2 flex items-center justify-center gap-2 ${
                  step3Complete && !isGenerating
                    ? 'bg-gradient-to-r from-[#C79E48] to-[#d4af4a] text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                style={{ color: step3Complete && !isGenerating ? 'white' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {isGenerating ? (generationProgress ? progressLabels[generationProgress] : "Generating...") : generatedImage ? "Regenerate" : "Generate Preview"}
              </button>

              {/* Edit Prompt Button */}
              {step3Complete && !isGenerating && (
                <button
                  onClick={openPromptEditor}
                  className="w-full py-2.5 rounded-xl font-normal text-sm transition-all mb-2 flex items-center justify-center gap-2 border border-gray-300 hover:border-[#C79E48] hover:bg-[#C79E48]/5"
                  style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Prompt
                </button>
              )}

              {/* Editable Prompt Panel */}
              <AnimatePresence>
                {isEditingPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-normal text-sm" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>Custom Prompt</h4>
                        <button
                          onClick={() => setIsEditingPrompt(false)}
                          style={{ color: '#2c2d2a' }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Enter your custom prompt..."
                        className="w-full h-32 p-3 text-xs rounded-lg border border-gray-300 focus:border-[#C79E48] focus:ring-1 focus:ring-[#C79E48] resize-none"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            if (currentPrompt) setCustomPrompt(currentPrompt.positive);
                          }}
                          className="flex-1 py-2 text-xs font-normal rounded-lg border border-gray-300 hover:bg-gray-100"
                          style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                        >
                          Reset to Original
                        </button>
                        <button
                          onClick={generateWithCustomPrompt}
                          disabled={isGenerating || !customPrompt.trim()}
                          className="flex-1 py-2 text-xs font-normal rounded-lg bg-[#C79E48] text-white hover:bg-[#b08d45] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                        >
                          <Wand2 className="w-3 h-3" />
                          Generate
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Variation Button */}
              {generatedImage && !isGenerating && (
                <button
                  onClick={generateVariation}
                  className="w-full py-2.5 rounded-xl font-medium text-sm transition-all mb-4 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create Variation {variationIndex > 0 && `(${variationIndex})`}
                </button>
              )}

              {generatedImage && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleDownloadImage}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleDownloadAndShareWhatsApp}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              )}

              {/* Summary */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base</span>
                  <span className="font-medium text-gray-900">
                    {selectedPackage?.name || <span className="text-gray-400">—</span>}
                    {selectedBoxShape && ` (${selectedBoxShape.name})`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Size & Color</span>
                  <span className="font-medium text-gray-900">
                    {selectedSize?.name && selectedColor?.name ? `${selectedSize.name} / ${selectedColor.name}` : <span className="text-gray-400">—</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Flowers</span>
                  <span className="font-medium text-gray-900 text-right">
                    {Object.values(selectedFlowers).length > 0
                      ? Object.values(selectedFlowers).map(f => `${f.quantity}x ${f.flower.name}`).join(', ')
                      : <span className="text-gray-400">—</span>}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-[#C79E48]">${displayPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!step3Complete}
                className="w-full mt-4 py-4 bg-[#C79E48] text-white rounded-xl font-bold hover:bg-[#b08d45] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

            </div>
          </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Customize;
