import React, { useState, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BouquetBuilderProps, BouquetState, SelectedFlower, Flower, PreDesignedBouquet } from '@/types/bouquet';
import { flowers } from '@/data/flowers';
import { generatedBouquets } from '@/data/generatedBouquets';
import BouquetCanvas from './BouquetCanvas';
import FlowerSelector from './FlowerSelector';
import SummaryPanel from './SummaryPanel';
import PreDesignedBouquets from './PreDesignedBouquets';

// Action types for reducer
type BouquetAction =
  | { type: 'ADD_FLOWER'; payload: { flower: Flower; position?: SelectedFlower['position'] } }
  | { type: 'REMOVE_FLOWER'; payload: { flowerId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { flowerId: string; quantity: number } }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_PREDESIGNED'; payload: { bouquet: PreDesignedBouquet } }
  | { type: 'UPDATE_FLOWER_POSITION'; payload: { flowerId: string; position: SelectedFlower['position'] } };

// Reducer for bouquet state management
const bouquetReducer = (state: BouquetState, action: BouquetAction): BouquetState => {
  switch (action.type) {
    case 'ADD_FLOWER': {
      const { flower, position } = action.payload;
      const existingFlower = state.selectedFlowers[flower.id];
      
      if (existingFlower) {
        // Update quantity if flower already exists
        const updatedFlower = {
          ...existingFlower,
          quantity: existingFlower.quantity + 1
        };
        return {
          ...state,
          selectedFlowers: {
            ...state.selectedFlowers,
            [flower.id]: updatedFlower
          },
          totalPrice: Object.values({
            ...state.selectedFlowers,
            [flower.id]: updatedFlower
          }).reduce((sum, item) => sum + (item.flower.price * item.quantity), 0)
        };
      } else {
        // Add new flower
        const newFlower: SelectedFlower = {
          flower,
          quantity: 1,
          position: position || {
            x: Math.random() * (state.canvasSize.width - 100) + 50,
            y: Math.random() * (state.canvasSize.height - 150) + 50,
            rotation: (Math.random() - 0.5) * 30,
            scale: 0.8 + Math.random() * 0.4
          }
        };
        
        const updatedFlowers = {
          ...state.selectedFlowers,
          [flower.id]: newFlower
        };
        
        return {
          ...state,
          selectedFlowers: updatedFlowers,
          totalPrice: Object.values(updatedFlowers).reduce((sum, item) => sum + (item.flower.price * item.quantity), 0)
        };
      }
    }
    
    case 'REMOVE_FLOWER': {
      const { flowerId } = action.payload;
      const updatedFlowers = { ...state.selectedFlowers };
      delete updatedFlowers[flowerId];
      
      return {
        ...state,
        selectedFlowers: updatedFlowers,
        totalPrice: Object.values(updatedFlowers).reduce((sum, item) => sum + (item.flower.price * item.quantity), 0)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { flowerId, quantity } = action.payload;
      if (quantity <= 0) {
        return bouquetReducer(state, { type: 'REMOVE_FLOWER', payload: { flowerId } });
      }
      
      const updatedFlower = {
        ...state.selectedFlowers[flowerId],
        quantity
      };
      
      const updatedFlowers = {
        ...state.selectedFlowers,
        [flowerId]: updatedFlower
      };
      
      return {
        ...state,
        selectedFlowers: updatedFlowers,
        totalPrice: Object.values(updatedFlowers).reduce((sum, item) => sum + (item.flower.price * item.quantity), 0)
      };
    }
    
    case 'CLEAR_ALL': {
      return {
        ...state,
        selectedFlowers: {},
        totalPrice: 0
      };
    }
    
    case 'LOAD_PREDESIGNED': {
      const { bouquet } = action.payload;
      const selectedFlowers: Record<string, SelectedFlower> = {};
      
      bouquet.flowers.forEach(flowerItem => {
        const flower = flowers.find(f => f.id === flowerItem.flowerId);
        if (flower) {
          selectedFlowers[flower.id] = {
            flower,
            quantity: flowerItem.quantity,
            position: flowerItem.position || {
              x: Math.random() * (state.canvasSize.width - 100) + 50,
              y: Math.random() * (state.canvasSize.height - 150) + 50,
              rotation: (Math.random() - 0.5) * 30,
              scale: 0.8 + Math.random() * 0.4
            }
          };
        }
      });
      
      return {
        ...state,
        selectedFlowers,
        totalPrice: Object.values(selectedFlowers).reduce((sum, item) => sum + (item.flower.price * item.quantity), 0)
      };
    }
    
    case 'UPDATE_FLOWER_POSITION': {
      const { flowerId, position } = action.payload;
      if (state.selectedFlowers[flowerId]) {
        return {
          ...state,
          selectedFlowers: {
            ...state.selectedFlowers,
            [flowerId]: {
              ...state.selectedFlowers[flowerId],
              position
            }
          }
        };
      }
      return state;
    }
    
    default:
      return state;
  }
};

const BouquetBuilder: React.FC<BouquetBuilderProps> = ({
  onOrder,
  initialBouquet
}) => {
  const [activeTab, setActiveTab] = useState<'flowers' | 'premade'>('flowers');
  
  // Initial state
  const initialState: BouquetState = {
    selectedFlowers: initialBouquet?.selectedFlowers || {},
    totalPrice: initialBouquet?.totalPrice || 0,
    canvasSize: initialBouquet?.canvasSize || { width: 400, height: 500 }
  };
  
  const [state, dispatch] = useReducer(bouquetReducer, initialState);

  // Event handlers
  const handleFlowerSelect = useCallback((flower: Flower) => {
    dispatch({ type: 'ADD_FLOWER', payload: { flower } });
    toast.success(`${flower.name} added to bouquet!`);
  }, []);

  const handleQuantityChange = useCallback((flowerId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { flowerId, quantity } });
  }, []);

  const handleFlowerRemove = useCallback((flowerId: string) => {
    const flower = state.selectedFlowers[flowerId];
    dispatch({ type: 'REMOVE_FLOWER', payload: { flowerId } });
    if (flower) {
      toast.success(`${flower.flower.name} removed from bouquet`);
    }
  }, [state.selectedFlowers]);

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    toast.success('Bouquet cleared!');
  }, []);

  const handlePreDesignedSelect = useCallback((bouquet: PreDesignedBouquet) => {
    dispatch({ type: 'LOAD_PREDESIGNED', payload: { bouquet } });
    toast.success(`${bouquet.name} loaded! You can now customize it.`);
    setActiveTab('flowers'); // Switch to flowers tab after loading
  }, []);

  const handleFlowerPositionChange = useCallback((flowerId: string, position: SelectedFlower['position']) => {
    dispatch({ type: 'UPDATE_FLOWER_POSITION', payload: { flowerId, position } });
  }, []);

  const handleOrder = useCallback(() => {
    if (Object.keys(state.selectedFlowers).length === 0) {
      toast.error('Please add some flowers to your bouquet first!');
      return;
    }
    
    onOrder?.(state);
    toast.success('Order placed successfully! 🎉');
  }, [state, onOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-medium mb-4">
            <span>✨</span>
            <span>Bouquet Builder</span>
          </div>
          <h1 className="font-luxury text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Design Your Perfect Bouquet
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create a custom floral arrangement with our interactive builder. 
            Choose from premium flowers and arrange them exactly how you want.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Canvas - Takes up 2 columns */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BouquetCanvas
              selectedFlowers={state.selectedFlowers}
              canvasSize={state.canvasSize}
              onFlowerPositionChange={handleFlowerPositionChange}
            />
          </motion.div>

          {/* Controls Panel - Takes up 1 column */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'flowers' | 'premade')}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 backdrop-blur-xl">
                <TabsTrigger 
                  value="flowers" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Choose Flowers
                </TabsTrigger>
                <TabsTrigger 
                  value="premade"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Pre-Made
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flowers" className="mt-6">
                <FlowerSelector
                  flowers={flowers}
                  onFlowerSelect={handleFlowerSelect}
                  selectedCount={Object.keys(state.selectedFlowers).length}
                />
              </TabsContent>

              <TabsContent value="premade" className="mt-6">
                <PreDesignedBouquets
                  bouquets={generatedBouquets.map((b) => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    imageUrl: b.image,
                    flowers: [],
                    totalPrice: b.price,
                    category: b.category,
                  }))}
                  onBouquetSelect={handlePreDesignedSelect}
                />
              </TabsContent>
            </Tabs>

            {/* Summary Panel */}
            <SummaryPanel
              selectedFlowers={state.selectedFlowers}
              totalPrice={state.totalPrice}
              onQuantityChange={handleQuantityChange}
              onFlowerRemove={handleFlowerRemove}
              onOrder={handleOrder}
              onClearAll={handleClearAll}
            />
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/50">
            <div className="text-3xl mb-2">🌸</div>
            <div className="font-luxury text-2xl font-bold text-slate-800">
              {Object.values(state.selectedFlowers).reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Flowers</div>
          </div>
          
          <div className="text-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/50">
            <div className="text-3xl mb-2">🌹</div>
            <div className="font-luxury text-2xl font-bold text-slate-800">
              {Object.keys(state.selectedFlowers).length}
            </div>
            <div className="text-sm text-slate-600">Flower Types</div>
          </div>
          
          <div className="text-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/50">
            <div className="text-3xl mb-2">💰</div>
            <div className="font-luxury text-2xl font-bold text-slate-800">
              ${state.totalPrice.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">Total Price</div>
          </div>
          
          <div className="text-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/50">
            <div className="text-3xl mb-2">🚚</div>
            <div className="font-luxury text-2xl font-bold text-slate-800">Free</div>
            <div className="text-sm text-slate-600">Delivery</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BouquetBuilder;

