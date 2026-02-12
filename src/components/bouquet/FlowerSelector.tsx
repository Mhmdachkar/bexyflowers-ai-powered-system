import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Heart, Star } from 'lucide-react';
import { FlowerSelectorProps } from '@/types/bouquet';
import { flowerCategories } from '@/data/flowers';

const FlowerSelector: React.FC<FlowerSelectorProps> = ({
  flowers,
  onFlowerSelect,
  selectedCount = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');

  // Filter and sort flowers
  const filteredFlowers = useMemo(() => {
    let filtered = flowers.filter(flower => {
      const matchesSearch = flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flower.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || flower.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort flowers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [flowers, searchTerm, selectedCategory, sortBy]);

  const handleFlowerClick = (flower: typeof flowers[0]) => {
    onFlowerSelect(flower);
    
    // Add a subtle animation feedback
    const button = document.querySelector(`[data-flower-id="${flower.id}"]`) as HTMLElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400/20 to-rose-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-pink-300/30">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-luxury text-2xl font-bold text-slate-800">Choose Flowers</h3>
            <p className="text-sm text-slate-600">Select from our premium collection</p>
          </div>
        </div>
        
        {selectedCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
          >
            {selectedCount} selected
          </motion.div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search flowers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {flowerCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'category')}
            className="bg-slate-50/80 border border-slate-200/50 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50"
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Flowers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <AnimatePresence>
          {filteredFlowers.map((flower, index) => (
            <motion.div
              key={flower.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <motion.button
                data-flower-id={flower.id}
                onClick={() => handleFlowerClick(flower)}
                className="w-full bg-gradient-to-br from-white/90 to-slate-50/80 backdrop-blur-xl border border-slate-300/30 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:border-pink-400/50 hover:shadow-lg hover:bg-gradient-to-br hover:from-pink-50/50 hover:to-rose-50/50 group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Flower Image */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={flower.imageUrl}
                      alt={flower.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement;
                        if (fallback) {
                          fallback.innerHTML = '<div class="text-2xl">🌸</div>';
                        }
                      }}
                    />
                  </div>
                  
                  {/* Add Button Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-pink-500/90 to-rose-600/90 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1 }}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Flower Info */}
                <div className="text-center">
                  <h4 className="font-luxury font-semibold text-sm text-slate-800 mb-1 group-hover:text-pink-700 transition-colors">
                    {flower.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-xs text-slate-600">{flower.category}</span>
                  </div>
                  <div className="bg-gradient-to-r from-amber-400/20 to-yellow-500/20 backdrop-blur-xl border border-amber-300/30 text-amber-700 px-3 py-1 rounded-xl text-xs font-bold">
                    ${flower.price.toFixed(2)}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-rose-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredFlowers.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg font-medium text-slate-600 mb-2">No flowers found</p>
          <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  );
};

export default FlowerSelector;

