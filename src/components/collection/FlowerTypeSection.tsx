import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flower2, Calendar, ChevronDown } from 'lucide-react';
import { BouquetGrid } from './BouquetGrid';
import type { Bouquet } from '@/types/bouquet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FlowerTypeSectionProps {
  type: 'eternal' | 'real';
  products: Bouquet[];
  availableYears: number[];
  onBouquetClick: (bouquet: Bouquet) => void;
}

export const FlowerTypeSection: React.FC<FlowerTypeSectionProps> = ({
  type,
  products,
  availableYears,
  onBouquetClick,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredProducts = useMemo(() => {
    if (selectedYear === 'all') return products;
    return products.filter(p => (p as any).collection_year === selectedYear);
  }, [products, selectedYear]);

  const icon = type === 'eternal' ? <Sparkles className="w-6 h-6" /> : <Flower2 className="w-6 h-6" />;
  const title = type === 'eternal' ? 'Eternal Flowers' : 'Real Flowers';
  const description = type === 'eternal' 
    ? 'Preserved flowers that last forever, perfect for lasting memories'
    : 'Fresh, beautiful flowers for every occasion';
  const accentColor = type === 'eternal' ? 'rgb(147, 51, 234)' : 'rgb(34, 197, 94)';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 rounded-2xl bg-white shadow-lg"
                style={{ color: accentColor }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {icon}
              </motion.div>
              <div>
                <h2 
                  className="text-3xl md:text-4xl font-luxury font-normal"
                  style={{ color: accentColor }}
                >
                  {title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {description}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          {/* Year Filter and Stats */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Collection Year:</span>
                </div>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year} Collection
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>

        {/* Products Grid */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-gray-300">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No products found</p>
                  <p className="text-sm">
                    {selectedYear !== 'all' 
                      ? `No ${type} flowers available for ${selectedYear}`
                      : `No ${type} flowers available yet`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <BouquetGrid
                bouquets={filteredProducts}
                onBouquetClick={onBouquetClick}
                selectedCategory="all"
              />
            )}
          </motion.div>
        )}

        {/* Decorative Divider */}
        <div className="mt-12 flex items-center justify-center">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div 
            className="mx-4 w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
      </div>
    </motion.section>
  );
};
