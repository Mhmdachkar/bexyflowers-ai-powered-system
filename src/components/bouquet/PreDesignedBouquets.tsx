import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Sparkles, ChevronRight, Eye, ShoppingCart } from 'lucide-react';
import { PreDesignedBouquetsProps } from '@/types/bouquet';
import { getProductImageAlt } from '@/lib/imageAltUtils';

const PreDesignedBouquets: React.FC<PreDesignedBouquetsProps> = ({
  bouquets,
  onBouquetSelect
}) => {
  const [hoveredBouquet, setHoveredBouquet] = useState<string | null>(null);

  const handleBouquetSelect = (bouquet: any) => {
    onBouquetSelect(bouquet);
    
    // Add visual feedback
    const button = document.querySelector(`[data-bouquet-id="${bouquet.id}"]`) as HTMLElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      romance: 'from-amber-500 to-yellow-600',
      seasonal: 'from-green-500 to-emerald-600',
      formal: 'from-slate-500 to-slate-600',
      warm: 'from-orange-500 to-red-600'
    };
    return colors[category] || 'from-purple-500 to-indigo-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      romance: '💕',
      seasonal: '🌸',
      formal: '👑',
      warm: '🌅'
    };
    return icons[category] || '💐';
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-purple-300/30">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-luxury text-2xl font-bold text-slate-800">Pre-Designed Bouquets</h3>
          <p className="text-sm text-slate-600">Beautiful arrangements crafted by our florists</p>
        </div>
      </div>

      {/* Bouquets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {bouquets.map((bouquet, index) => (
            <motion.div
              key={bouquet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative group"
              onMouseEnter={() => setHoveredBouquet(bouquet.id)}
              onMouseLeave={() => setHoveredBouquet(null)}
            >
              {/* Bouquet Card */}
              <div className="bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <img
                      src={bouquet.imageUrl}
                      alt={getProductImageAlt(bouquet)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement;
                        if (fallback) {
                          fallback.innerHTML = `
                            <div class="flex flex-col items-center justify-center text-slate-400">
                              <div class="text-6xl mb-2">💐</div>
                              <p class="text-sm font-medium">${bouquet.name}</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${getCategoryColor(bouquet.category)} shadow-lg`}>
                      <span>{getCategoryIcon(bouquet.category)}</span>
                      <span className="capitalize">{bouquet.category}</span>
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ${bouquet.totalPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredBouquet === bouquet.id ? 1 : 0 }}
                  >
                    <div className="p-4 w-full">
                      <motion.button
                        data-bouquet-id={bouquet.id}
                        onClick={() => handleBouquetSelect(bouquet)}
                        className="w-full bg-white/90 backdrop-blur-xl text-slate-800 px-4 py-2 rounded-xl font-medium text-sm hover:bg-white transition-all flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Use This Design</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-luxury font-bold text-lg text-slate-800 leading-tight">
                      {bouquet.name}
                    </h4>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {bouquet.description}
                  </p>

                  {/* Flower Count */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-1">
                      {bouquet.flowers.slice(0, 3).map((flowerItem, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full border-2 border-white flex items-center justify-center text-xs"
                        >
                          🌸
                        </div>
                      ))}
                      {bouquet.flowers.length > 3 && (
                        <div className="w-6 h-6 bg-slate-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                          +{bouquet.flowers.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {bouquet.flowers.length} flower types
                    </span>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    data-bouquet-id={bouquet.id}
                    onClick={() => handleBouquetSelect(bouquet)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium text-sm hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview & Customize</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Bouquets */}
      {bouquets.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">💐</div>
          <p className="text-lg font-medium text-slate-600 mb-2">No pre-designed bouquets available</p>
          <p className="text-sm text-slate-500">Check back later for new designs</p>
        </motion.div>
      )}
    </div>
  );
};

export default PreDesignedBouquets;

