import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Heart, Award, Users, Star, Crown, Sparkles, Flower2, Leaf } from "lucide-react";
// SUGGESTION: Import a high-quality image of your signature product.
// For now, using a placeholder - you should add your actual signature glitter flower image
import signatureGlitterFlower from '@/assets/about-image.jpg'; // Updated to about page image
import pinkFlower from '@/assets/flowers/pink.png';
import redFlower from '@/assets/flowers/red.png';
import aboutHeroBg from '@/assets/bouquet-2.jpg';

const About = () => {
  // SUGGESTION: Refined and consolidated stats for clarity and credibility.
  const stats = [
    { number: "15k+", label: "Bouquets Delivered", icon: <Users className="w-6 h-6" /> },
    { number: "5.0", suffix: "★", label: "Average Rating", icon: <Star className="w-6 h-6" /> },
    { number: "24/7", label: "Online Ordering", icon: <Heart className="w-6 h-6" /> },
    { number: "25+", label: "Years Combined Experience", icon: <Award className="w-6 h-6" /> }
  ];

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  
  // Detect mobile to reduce parallax amplitude
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(("matches" in e ? e.matches : (e as MediaQueryList).matches));
    handler(mq);
    mq.addEventListener?.("change", handler as (ev: MediaQueryListEvent) => void);
    return () => mq.removeEventListener?.("change", handler as (ev: MediaQueryListEvent) => void);
  }, []);

  const parallaxYPrimary = useTransform(scrollYProgress, [0, 1], isMobile ? [-20, 20] : [-60, 60]);
  const parallaxYSecondary = useTransform(scrollYProgress, [0, 1], isMobile ? [15, -15] : [40, -40]);
  const prefersReducedMotion = useReducedMotion();
  const yPrimary = prefersReducedMotion ? 0 : (parallaxYPrimary as unknown as number | any);
  const ySecondary = prefersReducedMotion ? 0 : (parallaxYSecondary as unknown as number | any);

  // Enhanced scroll effect for signature image - creates un-zoom parallax effect
  const { scrollYProgress: imageScrollProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"]
  });
  const imageScale = useTransform(imageScrollProgress, [0, 1], [1, 1.1]);
  const finalImageScale = prefersReducedMotion ? 1 : imageScale;

  // --- POWERFUL LUXURY PAGE TRANSITION VARIANTS ---
  const pageTransitionVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 30,
      transition: { duration: 0 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1.4,
        ease: [0.25, 0.46, 0.45, 0.94], // More dramatic easing
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  } as const;

  const overlayVariants = {
    hidden: {
      y: "0%",
      scale: 1.1,
      opacity: 1,
      transition: { duration: 0 }
    },
    visible: {
      y: "-100%",
      scale: 1.2,
      opacity: 0,
      transition: {
        duration: 1.6,
        ease: [0.23, 1, 0.32, 1], // Powerful spring-like easing
        delay: 0.3
      }
    }
  } as const;

  // Enhanced background elements animation
  const backgroundVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -5,
      transition: { duration: 0 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 2,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.5
      }
    }
  } as const;

  // --- POWERFUL ANIMATION VARIANTS (cinematic and dramatic) ---
  const sectionVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        staggerChildren: 0.3, 
        delayChildren: 0.4,
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  } as const;

  const headingReveal = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      clipPath: "inset(0 0 100% 0)",
      scale: 0.9,
      rotateX: -15
    },
    show: { 
      opacity: 1, 
      y: 0, 
      clipPath: "inset(0 0 0% 0)",
      scale: 1,
      rotateX: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 1.2
      } 
    }
  } as const;

  const paragraphReveal = {
    hidden: { opacity: 0, y: 40, x: -20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 1, 
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2
      } 
    }
  } as const;

  const logoReveal = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      rotate: -180,
      filter: "blur(10px)"
    },
    show: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        duration: 1.5
      } 
    }
  } as const;

  const imageReveal = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      rotateY: -45,
      filter: "blur(20px)",
      borderRadius: "50%"
    },
    show: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      filter: "blur(0px)",
      borderRadius: "1rem",
      transition: { 
        duration: 1.8, 
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.6
      } 
    }
  } as const;

  // Enhanced CTA button variants with powerful hover effects
  const ctaButtonVariants = {
    rest: { 
      scale: 1, 
      y: 0,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      filter: "brightness(1)"
    },
    hover: { 
      scale: 1.08, 
      y: -8,
      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
      filter: "brightness(1.1)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.3
      }
    },
    tap: {
      scale: 0.95,
      y: -2,
      transition: { duration: 0.1 }
    }
  } as const;

  // Powerful stats card animations
  const statsCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60, 
      scale: 0.8,
      rotateX: -20
    },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        duration: 1
      } 
    }
  } as const;

  return (
    <motion.section 
      ref={sectionRef} 
      className="relative py-12 sm:py-16 md:py-20 lg:py-28 px-4 sm:px-6 overflow-hidden bg-white" 
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.35 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={typeof aboutHeroBg === 'string' ? aboutHeroBg : aboutHeroBg.src}
          alt="About hero background"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>
      <div className="absolute inset-0 -z-0 bg-gradient-to-b from-white/95 via-white/90 to-white/96" />
      

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            show: { 
              opacity: 1, 
              y: 0, 
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } 
            }
          }}
        >
          {/* Luxury Typography with Gold Accent */}
          <motion.h1 
            className="font-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-normal mb-4 sm:mb-6 relative px-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, #2c2d2a 0%, #3D3027 50%, #2c2d2a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              letterSpacing: '-0.02em',
              lineHeight: '1.2em'
            }}
          >
            THE ART OF FLORAL COUTURE
            {/* Animated Gold Underline */}
            <motion.div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: '200px' }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            />
          </motion.h1>

          {/* Enhanced Decorative Elements */}
          <div className="relative mb-8">
            <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-500 rotate-45 shadow-lg shadow-amber-500/50" />
          </div>

          <motion.p 
            className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-foreground max-w-4xl mx-auto leading-relaxed font-light px-4" 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Welcome to Bexy Flowers, where generations of artistry meet modern luxury. Discover Lebanon's first and only glitter flower atelier.
          </motion.p>
        </motion.div>

        {/* Main Content (Image-first layout for visual impact) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          {/* Enhanced Signature Image with Powerful 3D Reveal Effect */}
          <motion.div
            ref={imageRef}
            className="rounded-2xl sm:rounded-3xl lg:rounded-full overflow-hidden shadow-xl order-1 lg:order-2 mx-auto lg:mx-0 w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-none lg:w-[550px] aspect-square"
            style={{ 
             
              boxShadow: '0 10px 30px rgb(198, 156, 72), 0 0 24px rgba(198, 157, 72, 0.2)'
            }}
            variants={imageReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.img 
              src={typeof signatureGlitterFlower === 'string' ? signatureGlitterFlower : signatureGlitterFlower.src} 
              alt="Signature glitter-dusted rose bouquet" 
              className="w-full h-full object-cover" 
            style={{ 
              scale: finalImageScale,
              boxShadow: '0 0 0 5px rgba(212, 175, 55, 0.5)'
            }}
            />
          </motion.div>

          {/* Narrative */}
          <motion.div
            className="flex flex-col gap-6 md:gap-8 order-2 lg:order-1"
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
          >
            <div className="text-center lg:text-left">
              <motion.h2 
                className="font-luxury text-3xl md:text-4xl font-normal text-foreground mb-3" 
                variants={headingReveal}
              >
                Our Story
              </motion.h2>
              <motion.div 
                className="w-16 md:w-24 h-[3px] bg-amber-400/90 rounded-full mb-6 md:mb-8 mx-auto lg:mx-0" 
                initial={{ scaleX: 0 }} 
                whileInView={{ scaleX: 1 }} 
                transition={{ type: "spring", stiffness: 280, damping: 12, delay: 0.1 }} 
                viewport={{ once: true }} 
              />
            </div>

            <div className="flex flex-col gap-4 md:gap-6 text-sm sm:text-base md:text-lg leading-relaxed px-2 md:px-0" style={{ fontFamily: "'EB Garamond', serif", lineHeight: 1.8, color: '#2c2d2a' }}>
              <motion.p variants={paragraphReveal}>
                Founded in <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>2024</span>, our flower boutique has quickly become a <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>pioneer</span> in Lebanon's floral industry. We proudly established the country's first <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>glitter flower shop</span>, introducing a unique and creative concept that combines <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>beauty</span>, <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>artistry</span>, and <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>personalization</span>.
              </motion.p>
              <motion.p variants={paragraphReveal}>
                Whether for <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>weddings</span>, <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>events</span>, or <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>personal gifting</span>, we are committed to redefining the art of floral design in Lebanon, offering products that blend <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>tradition</span> with <span className="font-medium" style={{ color: 'rgb(201, 161, 78)' }}>modern creativity</span>.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-2 items-stretch">
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur border border-amber-100/60 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(198,157,72,0.18)]">
                <div className="flex items-center gap-2 font-normal text-foreground mb-2" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C69D48" strokeWidth="1.5" className="w-5 h-5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z"/></svg>
                  Our Mission
                </div>
                <div className="text-foreground text-sm leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
                  To craft breathtaking floral narratives that turn your cherished moments into unforgettable memories.
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur border border-amber-100/60 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(198,157,72,0.18)]">
                <div className="flex items-center gap-2 font-normal text-foreground mb-2" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C69D48" strokeWidth="1.5" className="w-5 h-5"><path d="M8 5l4-3 4 3 3 4-3 4-4 3-4-3-3-4 3-4z"/></svg>
                  Our Vision
                </div>
                <div className="text-foreground text-sm leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
                  To be Lebanon's most sought-after floral couturier, celebrated for our pioneering designs and artistry.
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-center justify-center py-2">
                <div className="h-px w-24 bg-amber-200" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C69D48" strokeWidth="1.2" className="w-5 h-5 mx-3"><path d="M12 7c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3z"/><path d="M12 2v5M12 13v9M2 12h5M17 12h5"/></svg>
                <div className="h-px w-24 bg-amber-200" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Statistics with Powerful 3D Card Effects */}
        <div className="mt-12 sm:mt-16 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-slate-50/70">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.2 } } }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center p-4 sm:p-5 md:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-amber-100/60"
              variants={statsCardVariants}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                transition: { duration: 0.3 }
              }}
            >
            <motion.div
                className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                {stat.icon}
              </motion.div>
              <div className="font-luxury text-xl sm:text-2xl font-normal text-foreground mb-1 sm:mb-2">
                <span className="text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: 'EB Garamond, serif' }}>{stat.number}</span>
                <span className="text-amber-500 text-2xl md:text-3xl">{stat.suffix}</span>
              </div>
              <div className="text-xs sm:text-sm text-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
        </div>

        {/* Enhanced Values Section - Innovation, Sustainability, Authenticity */}
        <motion.div 
          className="mt-16 sm:mt-20 md:mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-foreground mb-3 sm:mb-4 px-2" style={{ letterSpacing: '-0.02em' }}>
              Our Core Values
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {[
              { 
                icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />, 
                title: 'Innovation', 
                body: 'Forward-thinking design techniques and trends.',
                gradient: 'from-purple-50 to-amber-50',
                iconColor: 'text-purple-600',
                accentColor: 'rgba(147, 51, 234, 0.1)'
              }, 
              { 
                icon: <Flower2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />, 
                title: 'Sustainability', 
                body: 'Responsible sourcing and mindful operations.',
                gradient: 'from-green-50 to-emerald-50',
                iconColor: 'text-green-600',
                accentColor: 'rgba(5, 150, 105, 0.1)'
              }, 
              { 
                icon: <Leaf className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />, 
                title: 'Authenticity', 
                body: 'Honest craft that honors nature&apos;s beauty.',
                gradient: 'from-amber-50 to-orange-50',
                iconColor: 'text-amber-600',
                accentColor: 'rgba(194, 154, 67, 0.1)'
              }
          ].map((v, i) => (
            <motion.div 
              key={i} 
                className="group relative p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-white border-2 border-transparent overflow-hidden h-full"
              variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.95 },
                show: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    type: "spring", 
                      stiffness: 150, 
                    damping: 20,
                    duration: 0.8
                  } 
                }
              }}
              whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
                }}
                style={{ 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                {/* Gradient Background on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                
                {/* Gold Border on Hover */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    boxShadow: 'inset 0 0 0 2px rgba(194, 154, 67, 0)'
                  }}
                  whileHover={{
                    boxShadow: 'inset 0 0 0 2px rgba(194, 154, 67, 0.4)'
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Icon Container */}
                <motion.div 
                  className="relative z-10 flex items-center gap-4 mb-4"
            >
              <motion.div 
                    className={`p-4 rounded-2xl ${v.iconColor} bg-white/80 backdrop-blur-sm shadow-lg`}
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      scale: 1.1
                    }}
                    transition={{ 
                      duration: 0.5,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    {v.icon}
                  </motion.div>
                  
                  <motion.h3 
                    className="font-luxury text-xl sm:text-2xl font-normal text-foreground"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                    {v.title}
                  </motion.h3>
                </motion.div>

                {/* Description */}
                <motion.p 
                  className="relative z-10 text-foreground leading-relaxed text-base"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  {v.body}
                </motion.p>

                {/* Decorative Accent Line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-transparent"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  whileHover={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                />
            </motion.div>
          ))}
          </div>
        </motion.div>

        {/* Enhanced CTA Section with Luxury Hover Effects */}
        <motion.div 
          className="mt-20 sm:mt-24 md:mt-32 relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          {/* Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-amber-50 to-amber-50 rounded-3xl"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center p-6 sm:p-8 md:p-12 lg:p-16 rounded-2xl sm:rounded-3xl border-2 border-amber-100/60 backdrop-blur-sm">
            <motion.h2 
              className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
            Ready to Create Something Beautiful?
            </motion.h2>
            
            <motion.p 
              className="text-foreground max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
            Whether it's a gift for a loved one or a stunning centerpiece for your event, let us bring your vision to life.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
            <motion.a 
              href="/collection" 
                className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-full shadow-xl overflow-hidden text-sm sm:text-base touch-target min-h-[44px] sm:min-h-[auto]"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
              Explore Collections
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
            </motion.a>
              
            <motion.a 
              href="/contact" 
                className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white/90 backdrop-blur-md border-2 border-amber-300 text-foreground font-semibold rounded-full shadow-lg overflow-hidden text-sm sm:text-base touch-target min-h-[44px] sm:min-h-[auto]"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(194, 154, 67, 0.6)',
                  boxShadow: '0 12px 32px rgba(194, 154, 67, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                {/* Gold Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
              Request a Custom Design
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </span>
            </motion.a>
            </motion.div>
          </div>
        </motion.div>

        {/* Wavy separator */}
        <div className="mt-16 sm:mt-20 md:mt-24 -mb-8 sm:-mb-10">
          <svg className="w-full h-16 text-white" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 V40 C150,100 350,100 600,40 C850,-20 1050,-20 1200,40 V0 Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </motion.section>
  );
};

export default About;