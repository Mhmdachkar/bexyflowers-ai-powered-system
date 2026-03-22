import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Lara Khoury',
    location: 'Beirut',
    rating: 5,
    text: 'Bexy Flowers transformed my wedding into a dream. Every arrangement was breathtaking — the roses were still fresh three days after the ceremony. I received more compliments on the flowers than anything else.',
    occasion: 'Wedding',
    avatar: 'LK',
  },
  {
    id: 2,
    name: 'Maya Nassar',
    location: 'Sidon',
    rating: 5,
    text: 'I ordered a surprise bouquet for my mother\'s birthday through WhatsApp and it arrived the same afternoon. The packaging alone made her cry. Truly a luxury experience from start to finish.',
    occasion: 'Birthday Gift',
    avatar: 'MN',
  },
  {
    id: 3,
    name: 'Rania Haddad',
    location: 'Baabda',
    rating: 5,
    text: 'The AI custom bouquet designer is unlike anything I have seen. I described what I wanted and the result was exactly my vision — even better. Bexy Flowers has completely changed how I think about gifting.',
    occasion: 'Custom Order',
    avatar: 'RH',
  },
  {
    id: 4,
    name: 'Joelle Abi Saab',
    location: 'Ashrafieh',
    rating: 5,
    text: 'I have been ordering from Bexy for over a year. The quality is consistently exceptional. My eternal flower arrangement still looks perfect after eight months — worth every penny.',
    occasion: 'Eternal Flowers',
    avatar: 'JA',
  },
  {
    id: 5,
    name: 'Sara Bechara',
    location: 'Jounieh',
    rating: 5,
    text: 'Ordered last minute for Valentine\'s and they delivered on time with a stunning arrangement. Customer service was incredibly warm and responsive on WhatsApp. Will never order flowers anywhere else.',
    occasion: "Valentine's Day",
    avatar: 'SB',
  },
  {
    id: 6,
    name: 'Tala Frem',
    location: 'Hamra, Beirut',
    rating: 5,
    text: 'My corporate event florals were stunning. The team understood our brand palette perfectly and delivered 14 arrangements in time. Every guest asked for the florist\'s contact. 10 out of 10.',
    occasion: 'Corporate Event',
    avatar: 'TF',
  },
];

const StarRow = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} size={13} className="fill-[#C79E48] text-[#C79E48]" />
    ))}
  </div>
);

const AvatarCircle = ({ initials }: { initials: string }) => (
  <div
    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
    style={{
      background: 'linear-gradient(135deg,#C79E48,#8B6914)',
      fontFamily: "'Playfair Display', serif",
    }}
  >
    {initials}
  </div>
);

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const total = REVIEWS.length;

  const next = () => setCurrent((c) => (c + 1) % total);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  // Auto-advance — deps are stable (no `current`), so the interval is created
  // once and never recreated on every slide change.
  // Functional setState safely increments without needing `current` in deps.
  // Skips advance when the browser tab is hidden to prevent accumulation.
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(() => {
      if (!document.hidden) {
        setCurrent((c) => (c + 1) % total);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [isAutoPlaying, total]);

  const pause = () => setIsAutoPlaying(false);
  const resume = () => setIsAutoPlaying(true);

  // Visible card indices: prev, current, next
  const indices = [
    (current - 1 + total) % total,
    current,
    (current + 1) % total,
  ];

  return (
    <section
      className="py-20 lg:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#faf8f4 0%,#f5f0e8 60%,#faf8f4 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            className="text-[11px] uppercase tracking-[0.28em] mb-4"
            style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What Our Clients Say
          </motion.p>
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-normal mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1c1a17' }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            Loved Across Lebanon
          </motion.h2>
          {/* Overall rating strip */}
          <motion.div
            className="flex items-center justify-center gap-2.5 mt-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <StarRow />
            <span
              className="text-sm font-semibold"
              style={{ color: '#1c1a17', fontFamily: "'EB Garamond', serif" }}
            >
              5.0
            </span>
            <span className="text-xs text-stone-400" style={{ fontFamily: "'EB Garamond', serif" }}>
              · 200+ happy customers
            </span>
          </motion.div>
        </div>

        {/* Desktop 3-card layout */}
        <div
          className="hidden md:flex gap-5 items-stretch mb-10"
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {indices.map((idx, position) => {
            const review = REVIEWS[idx];
            const isFeatured = position === 1;
            return (
              <div
                key={review.id}
                className="flex-1 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all duration-500"
                style={{
                  background: isFeatured
                    ? 'linear-gradient(160deg,#1c1a17 0%,#2a2520 100%)'
                    : '#ffffff',
                  border: isFeatured
                    ? '1px solid rgba(199,158,72,0.3)'
                    : '1px solid #ede9e2',
                  boxShadow: isFeatured
                    ? '0 12px 40px rgba(0,0,0,0.22)'
                    : '0 2px 12px rgba(0,0,0,0.05)',
                  transform: isFeatured ? 'scale(1.04)' : 'scale(0.97)',
                  opacity: isFeatured ? 1 : 0.72,
                }}
                onClick={() => setCurrent(idx)}
              >
                <Quote
                  size={22}
                  style={{ color: isFeatured ? '#C79E48' : '#d4c4a0', opacity: 0.8 }}
                />
                <p
                  className="flex-1 leading-relaxed text-sm"
                  style={{
                    color: isFeatured ? 'rgba(255,255,255,0.88)' : '#4a4540',
                    fontFamily: "'EB Garamond', serif",
                    fontSize: '1rem',
                  }}
                >
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t"
                  style={{ borderColor: isFeatured ? 'rgba(199,158,72,0.2)' : '#f0ece6' }}
                >
                  <AvatarCircle initials={review.avatar} />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: isFeatured ? '#fff' : '#1c1a17', fontFamily: "'Playfair Display', serif" }}
                    >
                      {review.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow />
                      <span
                        className="text-[10px]"
                        style={{ color: isFeatured ? 'rgba(255,255,255,0.4)' : '#b0a898' }}
                      >
                        {review.location} · {review.occasion}
                      </span>
                    </div>
                  </div>
                </div>
                </div>
            );
          })}
        </div>

        {/* Mobile single-card carousel */}
        <div
          className="md:hidden relative"
          onTouchStart={pause}
          onTouchEnd={resume}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={REVIEWS[current].id}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: 'linear-gradient(160deg,#1c1a17 0%,#2a2520 100%)',
                border: '1px solid rgba(199,158,72,0.25)',
                boxShadow: '0 10px 36px rgba(0,0,0,0.2)',
              }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <Quote size={20} style={{ color: '#C79E48', opacity: 0.8 }} />
              <p
                className="flex-1 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'EB Garamond', serif", fontSize: '1rem' }}
              >
                "{REVIEWS[current].text}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(199,158,72,0.18)' }}>
                <AvatarCircle initials={REVIEWS[current].avatar} />
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {REVIEWS[current].name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRow />
                    <span className="text-[10px] text-white/40">{REVIEWS[current].location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <motion.button
            onClick={() => { pause(); prev(); }}
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-all"
            style={{ borderColor: '#d4c4a0', color: '#8B6914' }}
            whileHover={{ scale: 1.08, borderColor: '#C79E48', color: '#C79E48' }}
            whileTap={{ scale: 0.93 }}
            aria-label="Previous review"
          >
            <ChevronLeft size={18} />
          </motion.button>

          {/* Dots */}
          <div className="flex gap-2">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => { pause(); setCurrent(i); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '24px' : '8px',
                  height: '8px',
                  background: i === current ? '#C79E48' : '#d4c4a0',
                }}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

          <motion.button
            onClick={() => { pause(); next(); }}
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-all"
            style={{ borderColor: '#d4c4a0', color: '#8B6914' }}
            whileHover={{ scale: 1.08, borderColor: '#C79E48', color: '#C79E48' }}
            whileTap={{ scale: 0.93 }}
            aria-label="Next review"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
