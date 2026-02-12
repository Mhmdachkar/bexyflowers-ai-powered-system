import React, { Suspense } from "react";
import LazySection from "@/components/LazySection";
import UltraNavigation from "@/components/UltraNavigation";
import About from "@/components/About";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";

const AboutPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <SEO
        title="About Us"
        description="Discover Bexy Flowers - Lebanon's premier luxury florist. Crafting extraordinary arrangements with elegance, innovation, and timeless beauty since our founding."
        canonical="/about"
      />
      <UltraNavigation />
      <div className="relative z-10">
        <LazySection rootMargin="400px 0px">
          <Suspense fallback={null}>
            <About />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="600px 0px">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </LazySection>
      </div>
      <BackToTop />
    </div>
  );
};

export default AboutPage;
