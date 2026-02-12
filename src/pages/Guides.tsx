import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Droplets,
  Scissors,
  Sun,
  Heart,
  Gift,
  Flower2,
  Church,
  ChevronRight,
} from "lucide-react";
import SEO from "@/components/SEO";
import UltraNavigation from "@/components/UltraNavigation";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import LazySection from "@/components/LazySection";

const Guides = () => {
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <SEO
        title="Flower Care, Occasions & Wedding Tips"
        description="Expert flower care tips, occasion guides, and wedding floral advice from Bexy Flowers Lebanon. How to care for fresh flowers, choose bouquets for birthdays, sympathy, and weddings."
        canonical="/guides"
      />
      <UltraNavigation />

      {/* Hero */}
      <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 px-4 sm:px-6 bg-gradient-to-b from-[#FAF8F3] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="font-luxury text-3xl sm:text-4xl md:text-5xl font-normal mb-4"
            style={{
              color: "#2c2d2a",
              fontFamily: "'EB Garamond', serif",
              letterSpacing: "-0.02em",
            }}
          >
            Flower Care & Occasion Guides
          </h1>
          <p
            className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Expert tips for caring for your flowers, choosing the right bouquet
            for every occasion, and creating your dream wedding florals.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-16">
        {/* Flower Care */}
        <LazySection rootMargin="100px 0px">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="prose prose-stone max-w-none"
          >
            <h2
              className="flex items-center gap-2 text-2xl sm:text-3xl font-normal mb-6"
              style={{
                color: "#2c2d2a",
                fontFamily: "'EB Garamond', serif",
              }}
            >
              <Droplets className="w-8 h-8 text-[#C79E48]" />
              How to Care for Fresh Flowers
            </h2>
            <p
              className="text-stone-600 leading-relaxed mb-6"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Fresh flowers from Bexy Flowers deserve proper care to last longer.
              Follow these tips to keep your bouquets vibrant and beautiful.
            </p>

            <div className="space-y-6">
              <div className="border-l-2 border-[#C79E48]/40 pl-6">
                <h3
                  className="flex items-center gap-2 text-lg font-medium mb-2"
                  style={{ color: "#2c2d2a" }}
                >
                  <Scissors className="w-5 h-5 text-[#C79E48]" />
                  Trim Stems
                </h3>
                <p className="text-stone-600 text-sm sm:text-base">
                  Cut stems at a 45° angle with sharp, clean shears before placing
                  in water. This allows better water absorption. Remove any leaves
                  that would sit below the waterline to prevent bacteria growth.
                </p>
              </div>
              <div className="border-l-2 border-[#C79E48]/40 pl-6">
                <h3
                  className="flex items-center gap-2 text-lg font-medium mb-2"
                  style={{ color: "#2c2d2a" }}
                >
                  <Droplets className="w-5 h-5 text-[#C79E48]" />
                  Water & Feeding
                </h3>
                <p className="text-stone-600 text-sm sm:text-base">
                  Use lukewarm water (70–80°F) and add flower food if provided.
                  Change water every 2–3 days and recut stems. Top off water
                  daily. Avoid placing flowers near fruit, which releases ethylene
                  and shortens vase life.
                </p>
              </div>
              <div className="border-l-2 border-[#C79E48]/40 pl-6">
                <h3
                  className="flex items-center gap-2 text-lg font-medium mb-2"
                  style={{ color: "#2c2d2a" }}
                >
                  <Sun className="w-5 h-5 text-[#C79E48]" />
                  Placement
                </h3>
                <p className="text-stone-600 text-sm sm:text-base">
                  Keep bouquets away from direct sunlight, drafts, and heat
                  sources. Ideal room temperature is 65–70°F. Good air
                  circulation helps, but avoid strong AC or heating vents.
                </p>
              </div>
              <div className="border-l-2 border-[#C79E48]/40 pl-6">
                <h3
                  className="flex items-center gap-2 text-lg font-medium mb-2"
                  style={{ color: "#2c2d2a" }}
                >
                  <Heart className="w-5 h-5 text-[#C79E48]" />
                  Daily Maintenance
                </h3>
                <p className="text-stone-600 text-sm sm:text-base">
                  Remove wilted blooms and leaves promptly. Gently mist petals
                  with water. Rotate the vase for even light. Clean the vase
                  between arrangements to prevent bacterial buildup.
                </p>
              </div>
            </div>
          </motion.article>
        </LazySection>

        {/* Occasions */}
        <LazySection rootMargin="100px 0px">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="flex items-center gap-2 text-2xl sm:text-3xl font-normal mb-6"
              style={{
                color: "#2c2d2a",
                fontFamily: "'EB Garamond', serif",
              }}
            >
              <Gift className="w-8 h-8 text-[#C79E48]" />
              Choosing Flowers for Every Occasion
            </h2>
            <p
              className="text-stone-600 leading-relaxed mb-8"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              The right bouquet can elevate any moment. Here’s how to pick
              flowers for life’s special occasions in Lebanon and beyond.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Birthday Flowers",
                  desc: "Bright, cheerful blooms like gerberas, sunflowers, and mixed bouquets suit birthdays. For elegance, choose roses or peonies in soft pinks and creams.",
                  keywords: "birthday bouquet Lebanon",
                },
                {
                  title: "Anniversary & Romance",
                  desc: "Red roses remain the classic symbol of love. For something unique, consider peonies, ranunculus, or a custom mixed arrangement in romantic tones.",
                  keywords: "anniversary flowers",
                },
                {
                  title: "Sympathy & Condolences",
                  desc: "White lilies, white roses, and gentle pastels convey respect and peace. Subtle arrangements offer comfort during difficult times.",
                  keywords: "sympathy flowers Lebanon",
                },
                {
                  title: "Congratulations & Graduation",
                  desc: "Bold, vibrant arrangements celebrate achievements. Sunflowers, mixed bright blooms, or luxury bouquets make memorable gifts.",
                  keywords: "graduation flowers",
                },
                {
                  title: "Get Well Soon",
                  desc: "Soft, uplifting colors like pale pinks, lavenders, and whites bring cheer. Avoid heavy scents; choose light, fresh arrangements.",
                  keywords: "get well flowers",
                },
                {
                  title: "Thank You",
                  desc: "Elegant bouquets in warm golds, peaches, or mixed pastels express gratitude. A hand-tied arrangement adds a personal touch.",
                  keywords: "thank you flowers",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-stone-200 bg-white/50 hover:border-[#C79E48]/30 transition-colors"
                >
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: "#2c2d2a", fontFamily: "'EB Garamond', serif" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-stone-600 text-sm"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.article>
        </LazySection>

        {/* Wedding Tips */}
        <LazySection rootMargin="100px 0px">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="flex items-center gap-2 text-2xl sm:text-3xl font-normal mb-6"
              style={{
                color: "#2c2d2a",
                fontFamily: "'EB Garamond', serif",
              }}
            >
              <Church className="w-8 h-8 text-[#C79E48]" />
              Wedding Flower Tips from Bexy Flowers
            </h2>
            <p
              className="text-stone-600 leading-relaxed mb-8"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Your wedding flowers should reflect your style and create lasting
              memories. Here’s expert advice for planning your bridal florals.
            </p>

            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-stone-200 bg-gradient-to-br from-amber-50/30 to-white">
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "#2c2d2a", fontFamily: "'EB Garamond', serif" }}
                >
                  Book Early
                </h3>
                <p
                  className="text-stone-600 text-sm"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  Wedding florists in Lebanon book up quickly, especially for
                  peak seasons. Contact us 6–12 months ahead to secure your date
                  and discuss your vision.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-stone-200 bg-gradient-to-br from-amber-50/30 to-white">
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "#2c2d2a", fontFamily: "'EB Garamond', serif" }}
                >
                  Match Your Theme & Season
                </h3>
                <p
                  className="text-stone-600 text-sm"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  Choose flowers that suit your venue and season. Peonies and
                  roses work for spring; dahlias and hydrangeas for summer and
                  autumn. We offer both fresh and high-quality artificial options
                  for lasting arrangements.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-stone-200 bg-gradient-to-br from-amber-50/30 to-white">
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "#2c2d2a", fontFamily: "'EB Garamond', serif" }}
                >
                  Prioritize Key Pieces
                </h3>
                <p
                  className="text-stone-600 text-sm"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  Focus budget on bridal bouquet, ceremony arch, and centerpieces.
                  Bridesmaid bouquets and boutonnieres can use simpler designs
                  that still complement your main arrangements.
                </p>
              </div>
            </div>

            <Link
              to="/wedding-and-events"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-lg bg-[#C79E48] text-white font-medium hover:bg-[#B88A44] transition-colors"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              View Wedding & Events
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.article>
        </LazySection>

        {/* CTA */}
        <LazySection rootMargin="100px 0px">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-[#FAF8F3] to-amber-50/50 border border-[#C79E48]/20"
          >
            <Flower2 className="w-12 h-12 text-[#C79E48] mx-auto mb-4" />
            <h3
              className="text-xl font-normal mb-2"
              style={{ color: "#2c2d2a", fontFamily: "'EB Garamond', serif" }}
            >
              Ready to order your perfect bouquet?
            </h3>
            <p
              className="text-stone-600 mb-6 max-w-md mx-auto"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Browse our collection or design a custom arrangement tailored to
              your occasion.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/collection"
                className="px-6 py-3 rounded-lg border-2 border-[#C79E48] text-[#2c2d2a] hover:bg-[#C79E48]/5 transition-colors"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Shop Collection
              </Link>
              <Link
                to="/customize"
                className="px-6 py-3 rounded-lg bg-[#C79E48] text-white hover:bg-[#B88A44] transition-colors"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Design Custom Bouquet
              </Link>
            </div>
          </motion.div>
        </LazySection>
      </div>

      <LazySection rootMargin="200px 0px">
        <Footer />
      </LazySection>
      <BackToTop />
    </div>
  );
};

export default Guides;
