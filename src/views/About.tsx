'use client';

import React, { Suspense } from "react";
import LazySection from "@/components/LazySection";
import UltraNavigation from "@/components/UltraNavigation";
import About from "@/components/About";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import { breadcrumbSchema, orgSchema } from "@/lib/seo";

const AboutPage = () => {
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" }
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <SEO
        title="About Us - Lebanon's Premier Luxury Florist"
        description="Discover Bexy Flowers - Lebanon's premier luxury florist. Crafting extraordinary arrangements with elegance, innovation, and timeless beauty. Based in Sidon, serving all of Lebanon."
        canonical="/about"
        keywords="about Bexy Flowers, luxury florist Lebanon, Sidon florist, premium flower shop, Lebanese florist, artisan flowers"
        jsonLd={[breadcrumbs, orgSchema()]}
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
