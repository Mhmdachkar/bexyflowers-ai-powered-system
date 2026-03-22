'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Gift, Loader2, Wand2, RefreshCw,
  Star, Shuffle, ChevronRight, Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  zodiacSigns, getZodiacSign, ZodiacSign, ZodiacBouquet,
} from '@/data/zodiac';
import { generateBouquetImage as generateImage } from '@/lib/api/imageGeneration';
import { useCartWithToast } from '@/hooks/useCartWithToast';
import { findCachedZodiacImage, cacheZodiacImage } from '@/lib/api/zodiac-image-cache';
import { toast } from 'sonner';

// ── Variation system ─────────────────────────────────────────────────────────
// 8 distinct cinematographic styles ensure every regeneration looks different
const COMPOSITION_VARIATIONS = [
  'elegant overhead flat-lay on a white marble surface, soft diffused window light from the left',
  'three-quarter angle close-up at 45 degrees, shallow depth of field, bokeh background',
  'straight-on frontal portrait of bouquet in hands, warm golden-hour studio lighting',
  'dramatic side profile with hard rim lighting creating deep contrast and long shadows',
  'macro close-up detail shot focusing on a single central bloom with surrounding flowers softly blurred',
  'elevated view with petals scattered around the arrangement on a light wood surface',
  'romantic soft-focus portrait with backlit halo glow, gauze-like atmosphere',
  'editorial-style full-length on a white studio sweep, crisp even lighting, fashion magazine quality',
];

// ── Prompt builder ───────────────────────────────────────────────────────────
function buildZodiacPrompt(
  sign: ZodiacSign,
  bouquet: ZodiacBouquet,
  gender: 'female' | 'male' | '',
  variationIndex: number
): string {
  const { aiPromptDetails } = sign;
  const composition = COMPOSITION_VARIATIONS[variationIndex % COMPOSITION_VARIATIONS.length];

  const genderNote =
    gender === 'male'
      ? 'Masculine presentation: structured upright stems, no lace or pastel, dark rich wrapping, architectural feel.'
      : gender === 'female'
      ? 'Feminine presentation: soft flowing romantic silhouette, lush rounded shape, delicate ribbon detail.'
      : '';

  return (
    `Professional luxury floral photography. A stunning handcrafted bouquet. ` +
    `Flowers: ${aiPromptDetails.flowers}. ` +
    `Color atmosphere: ${aiPromptDetails.colorAtmosphere}. ` +
    `Arrangement shape: ${aiPromptDetails.arrangementShape}. ` +
    `Packaging: ${aiPromptDetails.packaging}. ` +
    `Emotional tone: ${aiPromptDetails.mood}. ` +
    (genderNote ? `${genderNote} ` : '') +
    `Composition: ${composition}. ` +
    `The bouquet evokes ${bouquet.meaning}. ` +
    `Zodiac energy: ${sign.name} ruled by ${sign.rulingPlanet}, ${sign.element} element. ` +
    `Photorealistic, 8K detail, high-end floral studio photography, white or neutral background.`
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const ZodiacBouquetQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: '', gender: '' as '' | 'female' | 'male', month: '', day: '',
  });
  const [birthError, setBirthError] = useState<string | null>(null);
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [showResult, setShowResult] = useState(false);

  const steps = [
    { title: 'Welcome', description: 'Discover your cosmic bouquet' },
    { title: 'Birth Date', description: 'Enter your birth details' },
    { title: 'Your Sign', description: 'Your astrological profile' },
    { title: 'Bouquet', description: 'Your perfect match' },
  ];

  const handleUserInfoChange = (patch: Partial<typeof userInfo>) => {
    setUserInfo(prev => ({ ...prev, ...patch }));
    if (birthError) setBirthError(null);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!userInfo.month || !userInfo.day) {
        setBirthError('Please select both your birth month and day.');
        return;
      }
      const month = Number(userInfo.month);
      const day = Number(userInfo.day);
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        setBirthError('Please enter a valid birth month (1–12).');
        return;
      }
      const daysInMonth = new Date(2001, month, 0).getDate();
      if (day < 1 || day > daysInMonth) {
        setBirthError('This day does not exist for the selected month.');
        return;
      }
      const sign = getZodiacSign(month, day);
      if (!sign) {
        setBirthError('Could not determine your zodiac sign. Please check your birth date.');
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
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setUserInfo({ name: '', gender: '', month: '', day: '' });
    setBirthError(null);
    setSelectedSign(null);
    setShowResult(false);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (showResult && selectedSign) {
    const bouquet = selectedSign.recommendedBouquets[0];
    return (
      <ZodiacResult
        userInfo={userInfo}
        sign={selectedSign}
        bouquet={bouquet}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#1c1a17 0%,#2a2218 50%,#1c1a17 100%)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle,#C79E48,transparent)' }} />
        <div className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full blur-3xl opacity-8"
          style={{ background: 'radial-gradient(circle,#C79E48,transparent)' }} />
      </div>

      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-14">
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
              style={{ background: 'rgba(199,158,72,0.12)', border: '1px solid rgba(199,158,72,0.3)' }}
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#C79E48] animate-pulse" />
              <span className="text-xs tracking-widest uppercase text-[#C79E48]"
                style={{ fontFamily: "'EB Garamond', serif" }}>
                Zodiac Bouquet Finder
              </span>
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl font-normal text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Find Your{' '}
              <span style={{ color: '#C79E48' }}>Cosmic</span>{' '}
              Bouquet
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg max-w-xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'EB Garamond', serif", fontSize: '1.1rem' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Your birth chart knows which flowers are yours. Let the stars choose.
            </motion.p>
          </div>

          {/* Progress steps */}
          <motion.div className="mb-10 px-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <div className="relative flex justify-between items-center max-w-xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)' }} />
              <motion.div
                className="absolute top-1/2 left-0 h-px -translate-y-1/2 rounded-full origin-left"
                style={{ background: '#C79E48', width: '100%' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.6 }}
              />
              {steps.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    index <= currentStep
                      ? 'text-white shadow-lg'
                      : 'bg-transparent border border-white/20 text-white/30'
                  }`}
                    style={index <= currentStep
                      ? { background: 'linear-gradient(135deg,#C79E48,#d4af52)', boxShadow: '0 4px 16px rgba(199,158,72,0.4)' }
                      : {}
                    }
                  >
                    {index + 1}
                  </div>
                  <span className={`absolute -bottom-7 text-[10px] tracking-wider uppercase hidden sm:block ${
                    index <= currentStep ? 'text-[#C79E48]' : 'text-white/25'
                  }`} style={{ fontFamily: "'EB Garamond', serif", whiteSpace: 'nowrap' }}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quiz card */}
          <div
            className="rounded-3xl p-7 sm:p-10"
            style={{
              background: 'linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))',
              border: '1px solid rgba(199,158,72,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
              >
                {currentStep === 0 && <WelcomeStep userInfo={userInfo} onChangeUserInfo={handleUserInfoChange} />}
                {currentStep === 1 && <BirthDetailsStep userInfo={userInfo} onChangeUserInfo={handleUserInfoChange} error={birthError} />}
                {currentStep === 2 && selectedSign && <ZodiacProfileStep sign={selectedSign} />}
                {currentStep === 3 && selectedSign && <FinalStep sign={selectedSign} />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between gap-4 mt-10">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                style={{
                  border: '1px solid rgba(199,158,72,0.35)',
                  color: '#C79E48',
                  background: 'transparent',
                  fontFamily: "'EB Garamond', serif",
                }}
              >
                ← Back
              </button>

              <motion.button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && (!userInfo.name || !userInfo.gender)) ||
                  (currentStep === 1 && (!userInfo.month || !userInfo.day))
                }
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg,#C79E48,#d4af52)',
                  boxShadow: '0 6px 20px rgba(199,158,72,0.4)',
                  fontFamily: "'EB Garamond', serif",
                  letterSpacing: '0.04em',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {currentStep === steps.length - 1 ? (
                  <><Sparkles size={15} /> Reveal My Bouquet</>
                ) : (
                  <>Continue <ChevronRight size={15} /></>
                )}
              </motion.button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

// ── Step 1 — Welcome ──────────────────────────────────────────────────────────
const WelcomeStep = ({
  userInfo, onChangeUserInfo
}: { userInfo: any; onChangeUserInfo: (p: Partial<any>) => void }) => (
  <div className="space-y-8 text-center">
    <div>
      <h3 className="text-2xl sm:text-3xl font-normal text-white mb-3"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        Welcome to Your <span style={{ color: '#C79E48' }}>Cosmic</span> Journey
      </h3>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'EB Garamond', serif", fontSize: '1rem' }}>
        Tell us a little about yourself so we can curate your perfect arrangement.
      </p>
    </div>

    <div className="max-w-sm mx-auto space-y-6 text-left">
      <div>
        <label className="block text-xs tracking-widest uppercase mb-2"
          style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
          Your Name
        </label>
        <input
          type="text"
          placeholder="Enter your name"
          value={userInfo.name}
          onChange={e => onChangeUserInfo({ name: e.target.value })}
          className="w-full h-12 rounded-xl px-4 text-sm text-white outline-none focus:ring-1 focus:ring-[#C79E48]"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(199,158,72,0.25)',
            fontFamily: "'EB Garamond', serif",
          }}
        />
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase mb-3"
          style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
          Who is this bouquet for?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'female', label: 'Her', icon: '🌸' },
            { value: 'male', label: 'Him', icon: '🌿' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeUserInfo({ gender: opt.value })}
              className="h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{
                background: userInfo.gender === opt.value ? 'rgba(199,158,72,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${userInfo.gender === opt.value ? '#C79E48' : 'rgba(255,255,255,0.12)'}`,
                color: userInfo.gender === opt.value ? '#C79E48' : 'rgba(255,255,255,0.6)',
                fontFamily: "'EB Garamond', serif",
              }}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Step 2 — Birth Date ───────────────────────────────────────────────────────
const BirthDetailsStep = ({
  userInfo, onChangeUserInfo, error,
}: { userInfo: any; onChangeUserInfo: (p: Partial<any>) => void; error?: string | null }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h3 className="text-2xl sm:text-3xl font-normal text-white mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        Your Birth Details
      </h3>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'EB Garamond', serif", fontSize: '1rem' }}>
        Your birth date unlocks your zodiac sign and your perfect blooms.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
      <div>
        <label className="block text-xs tracking-widest uppercase mb-2"
          style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
          Month
        </label>
        <Select value={userInfo.month} onValueChange={v => onChangeUserInfo({ month: v })}>
          <SelectTrigger className="h-12 rounded-xl text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(199,158,72,0.25)', fontFamily: "'EB Garamond', serif" }}>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="bg-[#1c1a17] border border-[#C79E48]/30 rounded-xl">
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}
                className="text-white hover:bg-[#C79E48]/10 text-sm">
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase mb-2"
          style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
          Day
        </label>
        <input
          type="number" min="1" max="31" placeholder="Day"
          value={userInfo.day}
          onChange={e => onChangeUserInfo({ day: e.target.value })}
          className="w-full h-12 rounded-xl px-4 text-sm text-white outline-none focus:ring-1 focus:ring-[#C79E48]"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(199,158,72,0.25)', fontFamily: "'EB Garamond', serif" }}
        />
      </div>
    </div>

    {error && (
      <motion.p className="text-center text-sm text-red-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {error}
      </motion.p>
    )}
  </div>
);

// ── Step 3 — Zodiac Profile ────────────────────────────────────────────────────
const ZodiacProfileStep = ({ sign }: { sign: ZodiacSign }) => (
  <div className="space-y-6">
    {/* Sign header */}
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl border-2 shadow-xl"
        style={{
          borderColor: '#C79E48',
          background: 'rgba(199,158,72,0.1)',
          boxShadow: '0 0 32px rgba(199,158,72,0.25)',
        }}
      >
        {sign.symbol}
      </motion.div>
      <h3 className="text-3xl font-normal text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
        {sign.name}
      </h3>
      <p className="text-xs tracking-widest" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
        {sign.element.toUpperCase()} · {sign.rulingPlanet.toUpperCase()} · {sign.dates}
      </p>
    </div>

    {/* Personality */}
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(199,158,72,0.15)' }}>
      <p className="leading-relaxed text-sm" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: "'EB Garamond', serif", fontSize: '0.95rem' }}>
        {sign.personality}
      </p>
    </div>

    {/* Traits + Colors */}
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(199,158,72,0.12)' }}>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>Traits</p>
        <div className="flex flex-wrap gap-1.5">
          {sign.traits.map(t => (
            <span key={t}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ background: 'rgba(199,158,72,0.12)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(199,158,72,0.2)', fontFamily: "'EB Garamond', serif" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(199,158,72,0.12)' }}>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>Your Colors</p>
        <div className="space-y-2">
          {sign.colors.map((hex, i) => (
            <div key={hex} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                style={{ background: hex }} />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'EB Garamond', serif" }}>
                {sign.colorNames[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Flowers */}
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(199,158,72,0.12)' }}>
      <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>Your Flowers</p>
      <div className="flex flex-wrap gap-2">
        {sign.flowers.map(f => (
          <span key={f} className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(199,158,72,0.08)', color: 'rgba(255,255,255,0.65)', fontFamily: "'EB Garamond', serif" }}>
            🌸 {f}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ── Step 4 — Final confirmation ───────────────────────────────────────────────
const FinalStep = ({ sign }: { sign: ZodiacSign }) => {
  const bouquet = sign.recommendedBouquets[0];
  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-2xl sm:text-3xl font-normal text-white mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Perfect Bouquet is Ready
        </h3>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'EB Garamond', serif", fontSize: '1rem' }}>
          We've crafted the perfect arrangement for {sign.name} energy.
          Click below to generate your AI preview.
        </p>
      </div>

      {/* Preview card */}
      <div className="rounded-2xl p-5 text-left"
        style={{ background: 'rgba(199,158,72,0.06)', border: '1px solid rgba(199,158,72,0.2)' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(199,158,72,0.12)', border: '1px solid rgba(199,158,72,0.2)' }}>
            {sign.symbol}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {bouquet.name}
            </p>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'EB Garamond', serif" }}>
              {bouquet.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {bouquet.flowers.slice(0, 3).map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(199,158,72,0.12)', color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <p className="text-lg font-bold flex-shrink-0" style={{ color: '#C79E48', fontFamily: "'Playfair Display', serif" }}>
            ${bouquet.price}
          </p>
        </div>
      </div>

      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'EB Garamond', serif" }}>
        ✨ Each generation creates a unique AI image based on your sign's real astrology
      </p>
    </div>
  );
};

// ── Result page ───────────────────────────────────────────────────────────────
const ZodiacResult = ({
  userInfo, sign, bouquet, onRestart,
}: {
  userInfo: any;
  sign: ZodiacSign;
  bouquet: ZodiacBouquet;
  onRestart: () => void;
}) => {
  const { addToCart } = useCartWithToast();
  const gender = (userInfo.gender as 'female' | 'male' | '') || '';

  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [variationIndex, setVariationIndex] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);

  // Check cache on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = await findCachedZodiacImage(gender, sign.id, bouquet.id);
        if (!cancelled && cached) setAiImage(cached);
      } catch { /* ignore */ } finally {
        if (!cancelled) setIsLoadingCache(false);
      }
    })();
    return () => { cancelled = true; };
  }, [gender, sign.id, bouquet.id]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (aiImage && aiImage.startsWith('blob:')) URL.revokeObjectURL(aiImage);
    };
  }, [aiImage]);

  const handleGenerate = async (isRegenerate = false) => {
    if (isGenerating) return;
    setIsGenerating(true);

    // Each regeneration uses next variation index for a genuinely different image
    const nextVariation = isRegenerate ? (variationIndex + 1) % 8 : variationIndex;
    if (isRegenerate) setVariationIndex(nextVariation);

    const toastId = 'zodiac-ai';
    toast.loading(
      isRegenerate
        ? `Creating variation ${generationCount + 2} of your ${sign.name} bouquet…`
        : 'Generating your cosmic bouquet preview…',
      { id: toastId }
    );

    try {
      const prompt = buildZodiacPrompt(sign, bouquet, gender, nextVariation);

      if (aiImage && aiImage.startsWith('blob:')) URL.revokeObjectURL(aiImage);

      const result = await generateImage(prompt, {
        width: 768,
        height: 768,
        enhancePrompt: true,
        useCache: false,
      });

      setAiImage(result.imageUrl);
      setGenerationCount(c => c + 1);
      toast.success(
        isRegenerate ? `New variation generated!` : 'Your cosmic bouquet is ready!',
        { id: toastId }
      );

      // Cache the first generation only
      if (!isRegenerate) {
        cacheZodiacImage(gender, sign.id, bouquet.id, result.imageUrl).then(storedUrl => {
          if (storedUrl) setAiImage(storedUrl);
        });
      }
    } catch {
      toast.error('Could not generate preview. Please try again.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: bouquet.id,
      title: `${sign.name} — ${bouquet.name}`,
      price: bouquet.price,
      image: aiImage || bouquet.image,
      description: `${sign.name} Zodiac Bouquet · ${bouquet.occasion}`,
    });
  };

  const compositionLabel = [
    'Flat-Lay', 'Three-Quarter', 'Frontal Portrait', 'Side Dramatic',
    'Macro Detail', 'Elevated View', 'Soft Focus', 'Editorial',
  ][variationIndex % 8];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg,#1c1a17 0%,#2a2218 60%,#1c1a17 100%)' }}
    >
      {/* Glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-8"
          style={{ background: `radial-gradient(circle,${sign.colors[0]},transparent)` }} />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-6"
          style={{ background: `radial-gradient(circle,${sign.colors[1] || sign.colors[0]},transparent)` }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl sm:text-6xl"
            style={{
              background: 'rgba(199,158,72,0.1)',
              border: '2px solid rgba(199,158,72,0.4)',
              boxShadow: '0 0 48px rgba(199,158,72,0.2)',
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.2 }}
          >
            {sign.symbol}
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            {userInfo.name
              ? <>{userInfo.name}, Your <span style={{ color: '#C79E48' }}>Cosmic</span> Bouquet</>
              : <>Your <span style={{ color: '#C79E48' }}>Cosmic</span> Bouquet</>
            }
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'EB Garamond', serif", fontSize: '1.05rem' }}>
            Curated by the stars for {sign.name} · {sign.dates}
          </p>
        </motion.div>

        {/* Main 2-column grid */}
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 items-start">

          {/* Left — AI Image */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Image card */}
            <div className="relative rounded-2xl overflow-hidden aspect-square"
              style={{ border: '1px solid rgba(199,158,72,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>

              {aiImage ? (
                <img src={aiImage} alt={`${sign.name} bouquet`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-6xl opacity-20">{sign.symbol}</div>
                  <p className="text-sm text-white/30" style={{ fontFamily: "'EB Garamond', serif" }}>
                    Generate your bouquet below
                  </p>
                </div>
              )}

              {(isGenerating || isLoadingCache) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
                  <motion.div
                    className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[#C79E48]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  />
                  <p className="text-sm text-white/70" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {isLoadingCache ? 'Loading…' : `Creating your ${sign.name} bouquet…`}
                  </p>
                </div>
              )}

              {/* Variation badge */}
              {aiImage && !isGenerating && (
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-[11px]"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(6px)', fontFamily: "'EB Garamond', serif" }}>
                  {compositionLabel} · Generation {generationCount}
                </div>
              )}
            </div>

            {/* Generate / Regenerate button */}
            {!aiImage && !isLoadingCache ? (
              <motion.button
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg,#C79E48,#d4af52)',
                  boxShadow: '0 6px 24px rgba(199,158,72,0.4)',
                  fontFamily: "'EB Garamond', serif",
                  letterSpacing: '0.04em',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Wand2 size={17} />
                Generate My {sign.name} Bouquet
              </motion.button>
            ) : aiImage && !isGenerating ? (
              <motion.button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-medium"
                style={{
                  background: 'rgba(199,158,72,0.1)',
                  border: '1px solid rgba(199,158,72,0.3)',
                  color: '#C79E48',
                  fontFamily: "'EB Garamond', serif",
                }}
                whileHover={{ scale: 1.01, background: 'rgba(199,158,72,0.16)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Shuffle size={15} />
                Generate New Variation
                <span className="text-[10px] text-white/30 ml-1">
                  (Style {((variationIndex + 1) % 8) + 1}/8)
                </span>
              </motion.button>
            ) : null}

            {/* Variation hint */}
            {aiImage && (
              <p className="text-center text-[11px]"
                style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'EB Garamond', serif" }}>
                Each generation uses a different composition style for a unique result
              </p>
            )}
          </motion.div>

          {/* Right — Sign info + CTAs */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Bouquet name + price */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(199,158,72,0.18)' }}>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
                Your Cosmic Arrangement
              </p>
              <h2 className="text-2xl sm:text-3xl font-normal text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {bouquet.name}
              </h2>
              <p className="text-2xl font-bold mb-3" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
                ${bouquet.price}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: "'EB Garamond', serif", fontSize: '0.95rem' }}>
                {bouquet.description}
              </p>
            </div>

            {/* Why this bouquet */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(199,158,72,0.12)' }}>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}>
                Why This Bouquet?
              </p>
              <p className="text-sm leading-relaxed mb-4"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'EB Garamond', serif", fontSize: '0.9rem' }}>
                {bouquet.meaning}
              </p>
              <div className="flex flex-wrap gap-2">
                {bouquet.specialFeatures.map(f => (
                  <span key={f} className="text-[11px] px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(199,158,72,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(199,158,72,0.2)', fontFamily: "'EB Garamond', serif" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Sign stats grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Element', value: sign.element },
                { label: 'Planet', value: sign.rulingPlanet },
                { label: 'Gemstone', value: sign.gemstone },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(199,158,72,0.1)' }}>
                  <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'EB Garamond', serif" }}>
                    {label}
                  </p>
                  <p className="text-xs font-semibold text-white capitalize" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Colors row */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(199,158,72,0.1)' }}>
              <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'EB Garamond', serif" }}>
                Your Sign's Colors
              </p>
              <div className="flex gap-3 flex-wrap">
                {sign.colors.map((hex, i) => (
                  <div key={hex} className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: hex }} />
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'EB Garamond', serif" }}>
                      {sign.colorNames[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-semibold text-white"
                style={{
                  background: aiImage
                    ? 'linear-gradient(135deg,#C79E48,#d4af52)'
                    : 'rgba(199,158,72,0.3)',
                  boxShadow: aiImage ? '0 6px 24px rgba(199,158,72,0.38)' : 'none',
                  fontFamily: "'EB Garamond', serif",
                  letterSpacing: '0.04em',
                  cursor: aiImage ? 'pointer' : 'not-allowed',
                  opacity: aiImage ? 1 : 0.5,
                }}
                whileHover={aiImage ? { scale: 1.02 } : {}}
                whileTap={aiImage ? { scale: 0.97 } : {}}
              >
                <Gift size={16} />
                Add to Cart — ${bouquet.price}
              </motion.button>

              <button
                onClick={onRestart}
                className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'EB Garamond', serif",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(199,158,72,0.35)'; (e.currentTarget as HTMLButtonElement).style.color = '#C79E48'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
              >
                Try a Different Sign
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default ZodiacBouquetQuiz;
