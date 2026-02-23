import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Code, Database, Smartphone } from 'lucide-react';
import CartApp from '@/views/CartApp';

/**
 * Demo component that showcases the shopping cart functionality
 * This component provides an overview of the implemented features
 */
const CartDemo: React.FC = () => {
  const features = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Local Storage Persistence",
      description: "Cart items persist across browser sessions using localStorage"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Type-Safe TypeScript",
      description: "Fully typed with TypeScript for better development experience"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Responsive Design",
      description: "Mobile-first design that works perfectly on all devices"
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Real-time Updates",
      description: "Cart updates instantly with smooth animations and transitions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Demo Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              React TypeScript Shopping Cart
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              A complete, type-safe e-commerce cart implementation with localStorage persistence
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Demo App */}
      <div className="border-t border-slate-200">
        <CartApp />
      </div>
    </div>
  );
};

export default CartDemo;
