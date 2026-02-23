'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sun, Scissors, Heart, CheckCircle, ArrowRight } from 'lucide-react';

interface CareStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  color: string;
}

const careSteps: CareStep[] = [
  {
    id: 1,
    title: "Water",
    description: "Keep hydrated",
    icon: <Droplets className="w-5 h-5" />,
    tips: [
      "Use lukewarm water (70-80°F)",
      "Add flower food or sugar + bleach",
      "Change water every 2-3 days",
      "Top off water daily"
    ],
    color: "from-[#C79E48] to-[#D4A85A]"
  },
  {
    id: 2,
    title: "Trim",
    description: "Cut stems properly",
    icon: <Scissors className="w-5 h-5" />,
    tips: [
      "Cut stems at 45° angle",
      "Use sharp, clean floral shears",
      "Remove leaves below waterline",
      "Trim 1-2 inches with water change"
    ],
    color: "from-[#C79E48] to-[#D4A85A]"
  },
  {
    id: 3,
    title: "Place",
    description: "Perfect spot",
    icon: <Sun className="w-5 h-5" />,
    tips: [
      "Keep away from direct sunlight",
      "Maintain room temp 65-70°F",
      "Ensure good air circulation",
      "Avoid heat sources and drafts"
    ],
    color: "from-[#C79E48] to-[#D4A85A]"
  },
  {
    id: 4,
    title: "Maintain",
    description: "Daily care",
    icon: <Heart className="w-5 h-5" />,
    tips: [
      "Remove wilted flowers immediately",
      "Gently mist petals",
      "Rotate vase for even light",
      "Clean vase between arrangements"
    ],
    color: "from-[#C79E48] to-[#D4A85A]"
  }
];

const FlowerCareGuide = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white relative overflow-hidden">
      {/* Glassmorphism Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-slate-200/30 to-transparent rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div
          className="flex flex-col items-center text-center mb-8 sm:mb-10 md:mb-12"
        >
          {/* Modern Floating Badge */}
          <div 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-slate-800/10 to-slate-700/10 backdrop-blur-xl border border-slate-600/20 mb-6 sm:mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse" />
            <span className="text-sm font-normal uppercase" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>EXPERT GUIDANCE</span>
          </div>

          <h2 
            className="font-luxury text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-normal mb-4 sm:mb-6 relative inline-block px-2"
            style={{
              fontFamily: 'EB Garamond, serif',
              background: 'linear-gradient(135deg, #2c2d2a 0%, #3D3027 50%, #2c2d2a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              letterSpacing: '-0.02em',
              lineHeight: '1.2em'
            }}
          >
            MASTER FLOWER CARE
            {/* Gold Underline */}
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-[#C79E48] to-[#D4A85A] rounded-full"
              style={{ width: '100%' }}
            />
          </h2>

          {/* Decorative Elements */}
          <div className="relative mb-8 mt-2">
            <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-[#C79E48]/60 to-transparent mx-auto" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#C79E48] rotate-45 shadow-lg shadow-[#C79E48]/50" />
          </div>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl font-light leading-relaxed px-4" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
            Simple steps to keep your flowers fresh and beautiful for longer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* Left Side: Compact Navigation List */}
          <div className="flex flex-col justify-center h-full gap-3">
            {careSteps.map((step) => (
              <motion.div
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                  activeStep === step.id 
                    ? 'bg-white border-[#C79E48] shadow-lg scale-[1.02]' 
                    : 'bg-white/40 border-transparent hover:bg-white/80 hover:shadow-md'
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeStep === step.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C79E48]/5 to-transparent pointer-events-none" />
                )}
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform duration-300 ${
                    activeStep === step.id ? 'scale-110' : 'scale-100'
                  } bg-gradient-to-r ${step.color}`}>
                    {activeStep === step.id ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-normal text-base transition-colors duration-300 ${
                      activeStep === step.id ? 'text-[#C79E48]' : ''
                    }`} style={{ color: activeStep === step.id ? '#C79E48' : '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                      {step.title}
                    </h3>
                    <p className="text-xs line-clamp-1" style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif" }}>{step.description}</p>
                  </div>
                  {activeStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <ArrowRight className="w-4 h-4 text-[#C79E48]" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Side: Detailed Card */}
          <div className="relative min-h-[280px] sm:min-h-[300px] md:min-h-[350px]">
             <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-[#E8D4A8] shadow-xl h-full flex flex-col"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl filter drop-shadow-md">
                     {activeStep === 1 ? '💧' : activeStep === 2 ? '✂️' : activeStep === 3 ? '🌞' : '💖'}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-normal font-luxury" style={{ color: '#2c2d2a', letterSpacing: '-0.02em' }}>
                      {careSteps[activeStep - 1].title} Guide
                    </h3>
                    <div className="h-1 w-10 sm:w-12 bg-gradient-to-r from-[#C79E48] to-[#D4A85A] rounded-full mt-1" />
                  </div>
                </div>

                <div className="flex flex-col flex-1 gap-3">
                  {careSteps[activeStep - 1].tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 text-sm sm:text-base bg-white/50 p-3 rounded-lg hover:bg-white transition-colors duration-200"
                      style={{ color: '#2c2d2a', fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
                    >
                      <div className="w-5 h-5 rounded-full bg-[#C79E48]/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#C79E48] font-normal text-xs" style={{ fontFamily: "'EB Garamond', serif" }}>
                        {index + 1}
                      </div>
                      {tip}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowerCareGuide;
