import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Heart, Star, ChevronDown } from 'lucide-react';
import { FlowerSelectorProps } from '@/types/bouquet';
import { flowerCategories } from '@/data/flowers';

const PremiumFlowerSelector: React.FC<FlowerSelectorProps> = ({
  flowers,
  onFlowerSelect,
  selectedCount = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [showFilters, setShowFilters] = useState(false);

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

  const sortOptions = [
    { value: 'name', label: 'Name A-Z', icon: '🔤' },
    { value: 'price', label: 'Price Low to High', icon: '💰' },
    { value: 'category', label: 'Category', icon: '🏷️' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Premium Flowers</h3>
            <p className="text-slate-600">Handpicked from the finest gardens</p>
          </div>
        </div>
        
        {selectedCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg"
          >
            {selectedCount} selected
          </motion.div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-6 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search flowers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50/80 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-3">
                {flowerCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'category')}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Flowers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pr-2">
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
                className="w-full bg-white border border-slate-200/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-amber-200/50 group"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Flower Image */}
                <div className="relative mb-4">
                  <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                    <img
                      src={flower.imageUrl}
                      alt={flower.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement;
                        if (fallback) {
                          fallback.innerHTML = '<div class="text-4xl">🌸</div>';
                        }
                      }}
                    />
                  </div>
                  
                  {/* Add Button Overlay */}
                  <motion.div
                    className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </motion.div>
                </div>

                {/* Flower Info */}
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                    {flower.name}
                  </h4>
                  
                  {flower.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {flower.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-xs text-slate-500 capitalize">{flower.category}</span>
                    </div>
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-xl text-sm font-bold">
                      ${flower.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
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

export default PremiumFlowerSelector;
