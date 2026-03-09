'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Gift, Loader2, Wand2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  zodiacSigns, 
  getZodiacSign, 
  getElementColors, 
  ZodiacSign, 
  ZodiacBouquet 
} from '@/data/zodiac';
import { getProductImageAlt } from '@/lib/imageAltUtils';
import { generateBouquetImage as generateImage } from '@/lib/api/imageGeneration';
import { useCartWithToast } from '@/hooks/useCartWithToast';
import { findCachedZodiacImage, cacheZodiacImage } from '@/lib/api/zodiac-image-cache';
import { toast } from 'sonner';

// Luxury Gold Accent Component
const GoldAccent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-[#C79E48]/20 via-[#D4A85A]/30 to-[#C79E48]/20 rounded-full blur-xl" />
    {children}
  </div>
);

const ZodiacBouquetQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: '',
    gender: '' as '' | 'female' | 'male',
    month: '',
    day: '',
    email: ''
  });
  const [birthError, setBirthError] = useState<string | null>(null);
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [selectedBouquet, setSelectedBouquet] = useState<ZodiacBouquet | null>(null);
  const [showResult, setShowResult] = useState(false);

  const steps = [
    { title: 'Welcome', description: 'Discover your cosmic bouquet' },
    { title: 'Birth Details', description: 'Enter your birth information' },
    { title: 'Zodiac Sign', description: 'Your astrological profile' },
    { title: 'Perfect Match', description: 'Your ideal bouquet' }
  ];

  const handleUserInfoChange = (patch: Partial<typeof userInfo>) => {
    setUserInfo(prev => ({ ...prev, ...patch }));
    // Clear birth validation error as soon as the user changes their inputs
    if (birthError) {
      setBirthError(null);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate birth date before moving on
      if (!userInfo.month || !userInfo.day) {
        setBirthError('Please select both your birth month and day.');
        return;
      }

      const month = Number(userInfo.month);
      const day = Number(userInfo.day);

      if (!Number.isInteger(month) || month < 1 || month > 12) {
        setBirthError('Please enter a valid birth month (1-12).');
        return;
      }

      if (!Number.isInteger(day) || day < 1 || day > 31) {
        setBirthError('Please enter a valid birth day.');
        return;
      }

      // Check max days for the selected month (using a non-leap reference year)
      const daysInMonth = new Date(2001, month, 0).getDate();
      if (day > daysInMonth) {
        setBirthError('This day does not exist for the selected month. Please double-check.');
        return;
      }

      const sign = getZodiacSign(month, day);
      if (!sign) {
        setBirthError('We could not determine your zodiac sign from this date. Please check your birth date.');
        return;
      }

      setSelectedSign(sign);
      setBirthError(null);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBouquetSelect = (bouquet: ZodiacBouquet) => {
    setSelectedBouquet(bouquet);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setUserInfo({ name: '', gender: '', month: '', day: '', email: '' });
    setBirthError(null);
    setSelectedSign(null);
    setSelectedBouquet(null);
    setShowResult(false);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  // When entering the final step, auto-select the first recommended bouquet
  useEffect(() => {
    if (currentStep === 3 && selectedSign && !selectedBouquet) {
      const first = selectedSign.recommendedBouquets?.[0];
      if (first) {
        setSelectedBouquet(first);
      }
    }
  }, [currentStep, selectedSign, selectedBouquet]);

  if (showResult && selectedSign && selectedBouquet) {
    return (
      <ZodiacResult 
        userInfo={userInfo}
        sign={selectedSign}
        bouquet={selectedBouquet}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'rgb(211, 211, 209)' }}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, hsl(51 100% 50% / 0.15) 0%, transparent 40%),
                           radial-gradient(circle at 80% 80%, hsl(51 100% 50% / 0.15) 0%, transparent 40%),
                           radial-gradient(circle at 50% 50%, hsl(51 100% 50% / 0.05) 0%, transparent 60%)`
        }} />
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-amber-300/15 to-orange-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-yellow-400/8 to-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        {/* Header */}
        <div
          className="text-center mb-10 sm:mb-16 relative"
        >
          {/* Modern Floating Badge */}
          <div
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-slate-800/10 to-slate-700/10 backdrop-blur-xl border border-slate-600/20 mb-6 sm:mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-700 tracking-wider uppercase">Zodiac Bouquet Finder</span>
          </div>
          
          {/* Luxury Typography with Gold Accent */}
          <h1 
            className="font-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-6 relative"
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
            FIND YOUR
            <br />
            COSMIC BOUQUET
            {/* Gold Underline */}
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-[#C79E48] to-[#D4A85A] rounded-full"
              style={{ width: '200px' }}
            />
          </h1>
          
          {/* Enhanced Decorative Elements */}
          <div className="relative mb-8">
            <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-[#C79E48]/60 to-transparent mx-auto" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#C79E48] rotate-45 shadow-lg shadow-[#C79E48]/50" />
          </div>
          
          {/* Enhanced Description */}
          <p 
            className="text-gray-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
          >
            Discover the perfect floral arrangement that aligns with your zodiac sign and cosmic energy
          </p>
        </div>

        {/* Connected Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 sm:mb-12 px-2 sm:px-4"
        >
          <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            {/* Continuous Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full" />
            
            {/* Active Progress Line */}
            <motion.div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#C79E48] -z-10 transform -translate-y-1/2 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ width: '100%', transformOrigin: 'left' }} 
            />

            {steps.map((step, index) => (
              <div key={index} className="relative group cursor-default flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition-all duration-500 relative z-10 ${
                    index <= currentStep
                      ? 'bg-[#C79E48] text-white shadow-md shadow-[#C79E48]/30 scale-110'
                      : 'bg-white border-2 border-gray-200 text-gray-300'
                  }`}
                  whileHover={{ scale: 1.15 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {index + 1}
                  {index <= currentStep && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#C79E48] opacity-20"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className={`absolute -bottom-7 sm:-bottom-8 text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors duration-300 uppercase hidden sm:block ${
                  index <= currentStep ? 'text-[#C79E48]' : 'text-gray-300'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Luxury Quiz Content Card */}
        <Card className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-white to-[#F5F1E8] border border-[#D4A85A] shadow-xl shadow-[#C79E48]/15 rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {currentStep === 0 && (
                <WelcomeStep 
                  userInfo={userInfo}
                  onChangeUserInfo={handleUserInfoChange}
                />
              )}
              
              {currentStep === 1 && (
                <BirthDetailsStep 
                  userInfo={userInfo}
                  onChangeUserInfo={handleUserInfoChange}
                  error={birthError}
                />
              )}
              
              {currentStep === 2 && selectedSign && (
                <ZodiacProfileStep 
                  sign={selectedSign}
                />
              )}
              
              {currentStep === 3 && selectedSign && (
                <BouquetSelectionStep 
                  sign={selectedSign}
                  selectedBouquet={selectedBouquet}
                  onBouquetSelect={handleBouquetSelect}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Luxury Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between mt-8 sm:mt-10">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-[#C79E48] text-[#C79E48] hover:bg-[#F5F1E8] disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold"
              >
                Previous
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && (!userInfo.name || !userInfo.gender)) ||
                  (currentStep === 1 && (!userInfo.month || !userInfo.day)) ||
                  (currentStep === 3 && !selectedBouquet)
                }
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#C79E48] to-[#C79E48] hover:from-[#C79E48] hover:to-[#C79E48] text-white shadow-lg shadow-[#C79E48]/40 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold text-lg"
              >
                {currentStep === steps.length - 1 ? 'Find My Bouquet' : 'Next'}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </Card>
        </div>
      </section>
    </div>
  );
};

// Step Components
const WelcomeStep = ({ 
  userInfo, 
  onChangeUserInfo,
}: { 
  userInfo: any; 
  onChangeUserInfo: (patch: Partial<any>) => void; 
}) => (
      <div className="text-center space-y-8 sm:space-y-10">
    
    <motion.h3 
      className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wide"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ fontFamily: 'EB Garamond, serif' }}
    >
      Welcome to Your{' '}
      <span className="text-[#C79E48]">Cosmic</span>{' '}
      Journey
    </motion.h3>
    
    <motion.p 
      className="text-gray-600 text-base sm:text-xl mb-6 sm:mb-10 leading-relaxed font-light max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      Let's discover the perfect bouquet that resonates with your zodiac energy and personal style.
    </motion.p>
    
    <motion.div 
      className="max-w-md mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div>
        <Label htmlFor="name" className="text-gray-800 font-semibold text-xl mb-4 block tracking-wide">
          What should we call you?
        </Label>
        <Input
          id="name"
          placeholder="Enter your name"
          value={userInfo.name}
          onChange={(e) => onChangeUserInfo({ name: e.target.value })}
          className="bg-white border-2 border-[#D4A85A] focus:border-[#C79E48] focus:ring-[#C79E48]/20 h-14 text-lg rounded-xl px-6 shadow-lg text-gray-900 placeholder:text-gray-500"
        />
      </div>

      <div>
        <Label className="text-gray-800 font-semibold text-xl mb-4 block tracking-wide">
          Who is this bouquet for?
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {([
            { value: 'female' as const, label: 'Her', icon: '🌸' },
            { value: 'male' as const, label: 'Him', icon: '🌿' },
          ]).map((opt) => (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onChangeUserInfo({ gender: opt.value })}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center justify-center gap-3 h-14 rounded-xl text-lg font-semibold transition-all duration-300 border-2 shadow-lg ${
                userInfo.gender === opt.value
                  ? 'border-[#C79E48] bg-[#F5F1E8] text-[#8B6F3A] ring-2 ring-[#C79E48]/30'
                  : 'border-[#D4A85A] bg-white text-gray-700 hover:border-[#C79E48] hover:bg-[#F5F1E8]/50'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

const BirthDetailsStep = ({ 
  userInfo, 
  onChangeUserInfo,
  error,
}: { 
  userInfo: any; 
  onChangeUserInfo: (patch: Partial<any>) => void;
  error?: string | null;
}) => (
  <div className="space-y-10">
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
        Your Birth Details
      </h3>
      <p className="text-gray-600 text-base sm:text-xl font-light">
        Enter your birth month and day to discover your zodiac sign
      </p>
    </motion.div>
    
    <motion.div 
      className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div>
        <Label htmlFor="month" className="text-gray-800 font-semibold text-xl mb-4 block tracking-wide">Birth Month</Label>
        <Select
          value={userInfo.month}
          onValueChange={(value) => onChangeUserInfo({ month: value })}
        >
          <SelectTrigger className="bg-white border-2 border-[#D4A85A] focus:border-[#C79E48] h-14 text-lg rounded-xl px-6 shadow-lg text-gray-900">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#D4A85A] rounded-xl shadow-lg">
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()} className="text-gray-900 hover:bg-[#F5F1E8]">
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="day" className="text-gray-800 font-semibold text-xl mb-4 block tracking-wide">Birth Day</Label>
        <Input
          id="day"
          type="number"
          min="1"
          max="31"
          placeholder="Day"
          value={userInfo.day}
          onChange={(e) => onChangeUserInfo({ day: e.target.value })}
          className="bg-white border-2 border-[#D4A85A] focus:border-[#C79E48] focus:ring-[#C79E48]/20 h-14 text-lg rounded-xl px-6 shadow-lg text-gray-900 placeholder:text-gray-500"
        />
      </div>
    </motion.div>
    {error && (
      <motion.p
        className="text-center text-sm text-red-600 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {error}
      </motion.p>
    )}
  </div>
);

const ZodiacProfileStep = ({ sign }: { sign: ZodiacSign }) => (
  <div className="space-y-6">
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative mx-auto mb-4"
      >
        <div className="w-28 h-28 bg-white border-4 border-[#C79E48] rounded-full flex items-center justify-center shadow-2xl shadow-[#C79E48]/30 relative">
          <span className="text-6xl drop-shadow-lg">{sign.symbol}</span>
          <motion.div
            className="absolute inset-0 border-4 border-[#C79E48] rounded-full"
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ fontFamily: 'EB Garamond, serif' }}
      >
        {sign.name}
      </motion.h3>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Badge variant="secondary" className="mb-3 bg-[#F5F1E8] border border-[#C79E48] text-[#8B6F3A] text-sm px-4 py-1 rounded-full font-semibold">
          {sign.element} • {sign.modality}
        </Badge>
      </motion.div>
      
      <motion.p 
        className="text-gray-600 text-sm font-light"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {sign.dates} • Ruled by {sign.rulingPlanet}
      </motion.p>
    </motion.div>
    
    <motion.div 
      className="grid md:grid-cols-2 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <div className="bg-white rounded-2xl p-5 border border-[#E8D4A8] shadow-md">
        <h4 className="font-bold text-gray-900 text-lg mb-3 tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
          Your Personality
        </h4>
        <p className="text-gray-800 leading-relaxed text-sm">
          {sign.personality}
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-5 border border-[#E8D4A8] shadow-md">
        <h4 className="font-bold text-gray-900 text-lg mb-3 tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
          Your Traits
        </h4>
        <div className="flex flex-wrap gap-2">
          {sign.traits.map((trait, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="inline-block border border-[#C79E48] text-[#8B6F3A] bg-[#F5F1E8] rounded-full px-3 py-1 text-xs font-medium hover:bg-[#C79E48] hover:text-white transition-all duration-300 cursor-pointer">
                {trait}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
    
    <motion.div 
      className="bg-white rounded-2xl p-5 border border-[#E8D4A8] shadow-md flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
    >
      <h4 className="font-bold text-gray-900 text-lg mb-4 tracking-wide text-center" style={{ fontFamily: 'EB Garamond, serif' }}>
        Your Colors
      </h4>
      <div className="flex justify-center gap-4">
        {sign.colors.map((color, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <div
              className="w-10 h-10 rounded-full border-2 border-[#C79E48] shadow-md"
              style={{ backgroundColor: color }}
              title={`${sign.name} ${color}`}
            />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {color}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

const BouquetSelectionStep = ({ 
  sign, 
  selectedBouquet, 
  onBouquetSelect 
}: { 
  sign: ZodiacSign; 
  selectedBouquet: ZodiacBouquet | null; 
  onBouquetSelect: (bouquet: ZodiacBouquet) => void; 
}) => (
  <div className="space-y-10">
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
        Your Perfect Match
      </h3>
      <p className="text-gray-600 text-base sm:text-xl font-light">
        Choose the bouquet that speaks to your {sign.name} soul
      </p>
    </motion.div>
    
    <div className="grid gap-6 sm:gap-8">
      {sign.recommendedBouquets.map((bouquet, index) => (
        <motion.div
          key={bouquet.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          whileHover={{ y: -8 }}
        >
          <Card 
            className={`p-5 sm:p-6 md:p-8 cursor-pointer transition-all duration-500 rounded-2xl border-2 shadow-lg ${
              selectedBouquet?.id === bouquet.id
                ? 'ring-4 ring-[#C79E48] bg-gradient-to-br from-[#F5F1E8] to-white border-[#C79E48] shadow-xl shadow-[#C79E48]/30'
                : 'bg-white border-[#E8D4A8] hover:border-[#D4A85A] hover:shadow-xl'
            }`}
            onClick={() => onBouquetSelect(bouquet)}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-2xl overflow-hidden flex-shrink-0 border-2 border-[#E8D4A8] shadow-lg">
                <img
                  src={bouquet.image}
                  alt={getProductImageAlt(bouquet)}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-xl sm:text-2xl mb-3 sm:mb-4 tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
                  {bouquet.name}
                </h4>
                <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base md:text-lg">
                  {bouquet.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-base sm:text-lg md:text-xl">
                  <span className="text-[#C79E48] font-bold text-xl sm:text-2xl">
                    ${bouquet.price}
                  </span>
                  <span className="text-gray-800 bg-[#F5F1E8] border border-[#D4A85A] px-4 py-2 rounded-full text-sm font-medium">
                    {bouquet.occasion}
                  </span>
                </div>
              </div>
              
              <div className="text-center md:self-center">
                <motion.div 
                  className={`w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${
                    selectedBouquet?.id === bouquet.id
                      ? 'border-[#C79E48] bg-[#C79E48] shadow-lg shadow-[#C79E48]/40'
                      : 'border-[#D4A85A] bg-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {selectedBouquet?.id === bouquet.id && (
                    <motion.div 
                      className="w-6 h-6 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

// Result Component (with AI image generation)
const ZodiacResult = ({ 
  userInfo, 
  sign, 
  bouquet, 
  onRestart 
}: { 
  userInfo: any; 
  sign: ZodiacSign; 
  bouquet: ZodiacBouquet; 
  onRestart: () => void; 
}) => {
  const { addToCart } = useCartWithToast();
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const gender = (userInfo.gender as 'female' | 'male' | '') || '';

  const handleAddToCart = () => {
    addToCart({
      id: bouquet.id,
      title: bouquet.name,
      price: bouquet.price,
      image: aiImage || bouquet.image,
      description: `${sign.name} Zodiac Bouquet${gender === 'male' ? ' (For Him)' : gender === 'female' ? ' (For Her)' : ''} — ${bouquet.occasion}`,
    });
  };

  // On mount, check if a cached image already exists for this combo
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = await findCachedZodiacImage(gender, sign.id, bouquet.id);
        if (!cancelled && cached) {
          setAiImage(cached);
        }
      } catch { /* ignore */ } finally {
        if (!cancelled) setIsLoadingCache(false);
      }
    })();
    return () => { cancelled = true; };
  }, [gender, sign.id, bouquet.id]);

  const buildZodiacPrompt = () => {
    const flowerList = bouquet.flowers.join(', ');
    const colorList = bouquet.colors.join(', ');

    const genderStyle =
      gender === 'male'
        ? 'Masculine presentation: structured geometric arrangement, bold upright stems, ' +
          'deep rich tones (burgundy, navy, forest green, charcoal, copper), ' +
          'minimal foliage with architectural greenery (eucalyptus, thistle, protea accents), ' +
          'wrapped in matte dark paper or kraft with leather ribbon. ' +
          'No pastel colors, no lace, no overly round or soft shapes.'
        : gender === 'female'
          ? 'Feminine presentation: soft flowing romantic arrangement, ' +
            'lush rounded silhouette with cascading elements, ' +
            'delicate pastel and blush tones mixed with vibrant pops, ' +
            'wrapped in elegant satin ribbon with tissue paper. ' +
            'Soft and luxurious feel with peonies, garden roses, or ranunculus highlights.'
          : '';

    return (
      `A professional studio photograph of a luxury flower bouquet arrangement on a clean white background. ` +
      `The bouquet contains: ${flowerList}. ` +
      `Color palette: ${colorList}. ` +
      `Style: ${sign.bouquetStyle}. ` +
      (genderStyle ? `${genderStyle} ` : '') +
      `The arrangement evokes ${bouquet.meaning}. ` +
      `Soft natural lighting, elegant presentation, high-end floral photography, 8K detail.`
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      toast.loading('Generating your cosmic bouquet preview...', { id: 'zodiac-ai' });
      const prompt = buildZodiacPrompt();
      const result = await generateImage(prompt, {
        width: 768,
        height: 768,
        enhancePrompt: true,
        useCache: false,
      });

      if (aiImage && aiImage.startsWith('blob:')) {
        URL.revokeObjectURL(aiImage);
      }
      setAiImage(result.imageUrl);
      toast.success('AI preview generated!', { id: 'zodiac-ai' });

      // Save to database so future visitors with the same combo skip generation
      cacheZodiacImage(gender, sign.id, bouquet.id, result.imageUrl).then((storedUrl) => {
        if (storedUrl) setAiImage(storedUrl);
      });
    } catch {
      toast.error('Could not generate preview. Please try again.', { id: 'zodiac-ai' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Cleanup blob URLs on unmount (Storage URLs don't need cleanup)
  useEffect(() => {
    return () => {
      if (aiImage && aiImage.startsWith('blob:')) {
        URL.revokeObjectURL(aiImage);
      }
    };
  }, [aiImage]);

  return (
  <div className="min-h-screen bg-white">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-10 sm:space-y-16 px-4 sm:px-8 py-8"
    >
      {/* Success Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative mx-auto mb-8"
        >
          <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-white border-4 border-[#C79E48] rounded-full flex items-center justify-center shadow-2xl shadow-[#C79E48]/30 relative">
            <span className="text-5xl sm:text-7xl md:text-9xl drop-shadow-lg">{sign.symbol}</span>
            <motion.div
              className="absolute inset-0 border-4 border-[#C79E48] rounded-full"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ fontFamily: 'EB Garamond, serif' }}
        >
          {userInfo.name}, Your{' '}
          <span className="text-[#C79E48]">Cosmic</span>{' '}
          Bouquet Awaits!
        </motion.h2>
        
        <motion.p 
          className="text-gray-600 text-base sm:text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          As a {sign.name}, this arrangement perfectly matches your cosmic energy
        </motion.p>
      </motion.div>

      {/* Bouquet Result */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card className="p-6 sm:p-8 md:p-12 bg-gradient-to-br from-white to-[#F5F1E8] border-2 border-[#D4A85A] shadow-2xl shadow-[#C79E48]/15 rounded-3xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="space-y-4"
              >
              <div className="relative">
                <img
                  src={aiImage || bouquet.image}
                  alt={getProductImageAlt(bouquet)}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-3xl shadow-2xl border-2 border-[#E8D4A8]"
                />
                {(isGenerating || isLoadingCache) && (
                  <div className="absolute inset-0 bg-black/40 rounded-3xl flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                    <span className="text-white text-sm font-medium">
                      {isGenerating ? 'Creating your cosmic bouquet…' : 'Loading…'}
                    </span>
                  </div>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isLoadingCache}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C79E48] to-[#D4A85A] hover:from-[#b8903c] hover:to-[#c9a04f] text-white shadow-lg shadow-[#C79E48]/30 h-12 rounded-xl font-semibold"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
                  ) : aiImage ? (
                    <><RefreshCw className="w-5 h-5" /> Regenerate AI Preview</>
                  ) : (
                    <><Wand2 className="w-5 h-5" /> Generate AI Preview</>
                  )}
                </Button>
              </motion.div>
            </motion.div>
            
            <div className="space-y-8 sm:space-y-10">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                >
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
                  {bouquet.name}
                </h3>
                <p className="text-[#C79E48] text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                  ${bouquet.price}
                </p>
                <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  {bouquet.description}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E8D4A8] shadow-lg"
              >
                <h4 className="font-bold text-gray-900 text-lg sm:text-2xl mb-4 sm:mb-6 tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
                  Why This Bouquet?
                </h4>
                <p className="text-gray-800 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg">
                  {bouquet.meaning}
                </p>
                <div className="flex flex-wrap gap-3">
                  {bouquet.specialFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                    >
                      <span className="inline-block border-2 border-[#C79E48] text-[#8B6F3A] bg-[#F5F1E8] rounded-full px-4 py-2 text-sm font-medium">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
              >
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button size="lg" onClick={handleAddToCart} className="w-full bg-gradient-to-r from-[#C79E48] to-[#C79E48] hover:from-[#C79E48] hover:to-[#C79E48] text-white shadow-lg shadow-[#C79E48]/40 h-14 sm:h-16 text-lg sm:text-xl font-semibold rounded-xl">
                    <Gift className="w-6 h-6 mr-3" />
                    Add to Cart
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="sm:flex-none">
                  <Button variant="outline" size="lg" onClick={onRestart} className="w-full sm:w-auto bg-white border-2 border-[#C79E48] text-[#C79E48] hover:bg-[#F5F1E8] h-14 sm:h-16 text-lg sm:text-xl px-6 sm:px-8 rounded-xl font-semibold">
                    Try Again
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Zodiac Insights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <Card className="p-6 sm:p-8 md:p-10 bg-gradient-to-r from-[#F5F1E8] to-white border-2 border-[#D4A85A] shadow-xl shadow-[#C79E48]/10 rounded-3xl">
          <h3 className="font-bold text-gray-900 text-xl sm:text-3xl mb-6 sm:mb-12 text-center tracking-wide" style={{ fontFamily: 'EB Garamond, serif' }}>
            Your Zodiac Insights
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            <motion.div 
              className="text-center bg-white rounded-xl sm:rounded-2xl p-3 sm:p-8 border-2 border-[#E8D4A8] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              <h4 className="font-bold text-gray-900 text-sm sm:text-xl mb-2 sm:mb-4 tracking-wide">Element</h4>
              <span className="inline-block border-2 border-[#C79E48] text-[#8B6F3A] bg-[#F5F1E8] rounded-full px-3 py-1.5 sm:px-6 sm:py-3 text-xs sm:text-lg font-semibold">
                {sign.element}
              </span>
            </motion.div>
            <motion.div 
              className="text-center bg-white rounded-xl sm:rounded-2xl p-3 sm:p-8 border-2 border-[#E8D4A8] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
            >
              <h4 className="font-bold text-gray-900 text-sm sm:text-xl mb-2 sm:mb-4 tracking-wide">Ruling Planet</h4>
              <span className="text-gray-800 text-xs sm:text-xl font-semibold">{sign.rulingPlanet}</span>
            </motion.div>
            <motion.div 
              className="text-center bg-white rounded-xl sm:rounded-2xl p-3 sm:p-8 border-2 border-[#E8D4A8] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.6 }}
            >
              <h4 className="font-bold text-gray-900 text-sm sm:text-xl mb-2 sm:mb-4 tracking-wide">Gemstone</h4>
              <span className="text-gray-800 text-xs sm:text-xl font-semibold">{sign.gemstone}</span>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  </div>
  );
};

export default ZodiacBouquetQuiz;
