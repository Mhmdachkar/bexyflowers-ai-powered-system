import { motion } from "framer-motion";
import { Sparkles, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowerTypeToggleProps {
  selectedType: 'all' | 'eternal' | 'real';
  onTypeChange: (type: 'all' | 'eternal' | 'real') => void;
  eternalCount: number;
  realCount: number;
  totalCount: number;
}

export const FlowerTypeToggle = ({ 
  selectedType, 
  onTypeChange,
  eternalCount,
  realCount,
  totalCount
}: FlowerTypeToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
      <motion.button
        onClick={() => onTypeChange('all')}
        className={cn(
          "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300",
          selectedType === 'all'
            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30"
            : "bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-300 hover:shadow-md"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>All</span>
        <span className={cn(
          "text-xs font-normal px-2 py-0.5 rounded-full",
          selectedType === 'all' 
            ? "bg-white/20" 
            : "bg-gray-100"
        )}>
          {totalCount}
        </span>
      </motion.button>

      <motion.button
        onClick={() => onTypeChange('eternal')}
        className={cn(
          "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300",
          selectedType === 'eternal'
            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
            : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-md"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-4 h-4" />
        <span>Eternal</span>
        <span className={cn(
          "text-xs font-normal px-2 py-0.5 rounded-full",
          selectedType === 'eternal' 
            ? "bg-white/20" 
            : "bg-gray-100"
        )}>
          {eternalCount}
        </span>
      </motion.button>

      <motion.button
        onClick={() => onTypeChange('real')}
        className={cn(
          "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300",
          selectedType === 'real'
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
            : "bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Flower2 className="w-4 h-4" />
        <span>Real</span>
        <span className={cn(
          "text-xs font-normal px-2 py-0.5 rounded-full",
          selectedType === 'real' 
            ? "bg-white/20" 
            : "bg-gray-100"
        )}>
          {realCount}
        </span>
      </motion.button>
    </div>
  );
};
