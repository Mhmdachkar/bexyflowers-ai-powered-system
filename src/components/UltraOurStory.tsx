import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Heart, 
  Award, 
  Users, 
  Star, 
  Crown,
  Sparkles,
  Flower2,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '/assets/bexy-flowers-logo.webp';
import whoWeAreImage from '@/assets/who we-are-bexy-flowers.jpeg';
import { toImageSrc } from '@/lib/imageUtils';
import ThreeJSErrorBoundary from '@/components/3D/ThreeJSErrorBoundary';
import { useWebGL } from '@/hooks/useWebGL';

gsap.registerPlugin(ScrollTrigger);

// 3D Floating Elements for Background - Optimized
function FloatingStoryElements({ onError }: { onError?: (error: Error) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);
  const [elements] = useState(() => 
    Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 40,
        Math.random() * 20,
        (Math.random() - 0.5) * 20
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.7,
      color: ['rgb(198, 161, 81)', '#FF6B35', '#32CD32', '#FFB6C1'][Math.floor(Math.random() * 4)],
      type: ['flower', 'heart', 'star'][Math.floor(Math.random() * 3)]
    }))
  );

  useFrame((state) => {
    try {
      // Throttle to 30fps for better performance
      frameCountRef.current++;
      if (frameCountRef.current % 2 !== 0) return;
      
      if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.01;
        
        groupRef.current.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            child.rotation.y = state.clock.elapsedTime * 0.3 + index;
            child.position.y = Math.sin(state.clock.elapsedTime * 1.0 + index) * 0.2;
          }
        });
      }
    } catch (error) {
      onError?.(error as Error);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="rgb(198, 161, 81)" />
      
      {elements.map((element, index) => (
        <Sphere
          key={index}
          args={[0.08, 8, 6]}
          position={element.position}
          scale={element.scale}
        >
          <meshStandardMaterial
            color={element.color}
            transparent
            opacity={0.6}
            emissive={element.color}
            emissiveIntensity={0.1}
          />
        </Sphere>
      ))}
    </group>
  );
}

// Statistics Counter Animation
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { 
  end: number, 
  duration?: number, 
  suffix?: string 
}) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * end);
            
            setCount(current);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={countRef} className="font-luxury text-3xl sm:text-4xl font-bold text-primary">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const UltraOurStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [threeJSError, setThreeJSError] = useState<Error | null>(null);
  const webgl = useWebGL();
  const isMobile = useIsMobile();

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const logo = logoRef.current;

    // CRITICAL: Store ScrollTrigger references to only kill this component's triggers
    const triggers: ScrollTrigger[] = [];
    
    if (section && image && content && logo) {
      // Optimized parallax effect with reduced frequency
      const parallaxTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        refreshPriority: -1, // Lower priority for better performance
        onUpdate: (self) => {
          // CRITICAL: Don't update if page is hidden
          if (document.hidden) return;
          const progress = self.progress;
          gsap.to(image, {
            duration: 0.1,
            y: progress * -50, // Reduced movement
            scale: 1 + progress * 0.02, // Reduced scale
            ease: "none"
          });
        }
      });
      triggers.push(parallaxTrigger);

      // Optimized staggered reveal animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          refreshPriority: -1
        }
      });
      
      // Store the ScrollTrigger from the timeline (GSAP creates it automatically)
      const revealTrigger = tl.scrollTrigger;
      if (revealTrigger) {
        triggers.push(revealTrigger);
      }

      tl.fromTo(logo, 
        { scale: 0, rotation: -90, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "power2.out" }
      )
      .fromTo(content, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.3"
      )
      .fromTo(image, 
        { x: -50, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 1.0, ease: "power2.out" }, "-=0.2"
      );
    }

    return () => {
      // CRITICAL: Only kill this component's triggers, not all triggers
      triggers.forEach(trigger => trigger.kill());
    };
  }, []);

  const handleThreeJSError = (error: Error) => {
    console.warn('3D Story Error:', error);
    setThreeJSError(error);
  };

  const stats = [
    {
      number: 15000,
      suffix: "+",
      label: "Happy Customers",
      icon: <Users className="w-8 h-8" />
    },
    {
      number: 5,
      suffix: "★",
      label: "Premium Quality",
      icon: <Star className="w-8 h-8" />
    },
    {
      number: 24,
      suffix: "/7",
      label: "Support",
      icon: <Heart className="w-8 h-8" />
    },
    {
      number: 25,
      suffix: "+",
      label: "Years Experience",
      icon: <Award className="w-8 h-8" />
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 px-4 bg-gradient-platinum overflow-hidden"
    >
      {/* 3D Background Elements */}
      {webgl.isReady && !threeJSError && (
        <div className="absolute inset-0 opacity-10">
          <ThreeJSErrorBoundary onError={handleThreeJSError}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <FloatingStoryElements onError={handleThreeJSError} />
            </Canvas>
          </ThreeJSErrorBoundary>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(51 100% 50% / 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, hsl(51 100% 50% / 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div
              ref={logoRef}
              className="w-20 h-20 relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={toImageSrc(logoImage)}
                alt="Bexy Flowers Logo"
                className="w-full h-full object-contain"
              />
              {/* Glow pulse — skipped on mobile to save CPU/battery */}
              {!isMobile && (
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          </div>

          <motion.h2 
            className="font-luxury text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-3d"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            OUR STORY
          </motion.h2>
          
          <div className="w-32 h-px bg-primary mx-auto mb-8" />
          
          <motion.p
            className="font-body text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Crafting luxury floral experiences with architectural precision and artistic excellence since 1999
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-20">
          {/* Image Section */}
          <motion.div
            ref={imageRef}
            className="relative group lg:col-span-7"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden shadow-3d">
              <img
                src={toImageSrc(whoWeAreImage)}
                alt="Who We Are - Bexy Flowers Team"
                className="w-full h-80 sm:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay with logo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Floating logo overlay — static on mobile to save CPU/battery */}
              <motion.div
                className="absolute top-6 right-6 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-luxury"
                animate={isMobile ? {} : {
                  y: [0, -8, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img
                  src={toImageSrc(logoImage)}
                  alt="Bexy Flowers"
                  className="w-10 h-10 object-contain"
                />
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -inset-4 border-4 border-primary/30 rounded-lg -z-10" />
              
              {/* Floating particles around image — skipped on mobile to save CPU/battery */}
              {!isMobile && [...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/60 rounded-full"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i % 2) * 20}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            ref={contentRef}
            className="space-y-8 lg:col-span-5"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            viewport={{ once: true }}
          >
            <div>
              <motion.div
                className="w-24 h-1 bg-primary mb-6"
                initial={{ width: 0 }}
                whileInView={{ width: 96 }}
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
              />
              
              <h3 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3">
                Crafting Dreams
              </h3>
              <p className="text-sm uppercase tracking-widest text-primary/70">Architectural Floristry Excellence</p>
            </div>

            <div className="space-y-6 text-muted-foreground font-body text-base sm:text-lg leading-relaxed">
              <p>
                Founded with an unwavering passion for creating extraordinary floral experiences, 
                <span className="text-primary font-semibold"> Bexy Flowers</span> has become 
                synonymous with luxury and elegance in the world of premium floristry.
              </p>

              <p>
                Our master florists carefully curate each arrangement using only the finest 
                flowers sourced from renowned gardens around the world. Every bouquet tells 
                a story of craftsmanship, beauty, and the profound emotions that flowers 
                can convey.
              </p>

              <p>
                From intimate celebrations to grand occasions, we believe that flowers have 
                the power to transform moments into memories. Our commitment to excellence 
                and attention to detail ensures that every creation exceeds expectations.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6">
              {[
                { icon: <Crown className="w-6 h-6" />, text: "Luxury Collection" },
                { icon: <Sparkles className="w-6 h-6" />, text: "Custom Designs" },
                { icon: <Flower2 className="w-6 h-6" />, text: "Premium Quality" },
                { icon: <Leaf className="w-6 h-6" />, text: "Fresh Daily" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-card shadow-sharp border border-border hover:border-primary transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary) / 0.05)" }}
                >
                  <div className="text-primary">{feature.icon}</div>
                  <span className="font-body font-semibold text-foreground">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Statistics Section */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 lg:p-8 bg-card shadow-sharp hover:shadow-3d transition-all duration-500 border border-border hover:border-primary"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-primary mb-4 flex justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {stat.icon}
              </motion.div>
              <AnimatedCounter end={stat.number} suffix={stat.suffix} />
              <div className="font-body text-xs sm:text-sm text-muted-foreground mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="flex justify-center lg:justify-start mt-16 lg:mt-20 max-w-4xl mx-auto lg:ml-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: true }}
        >
          <Button
            size="lg"
            className="font-body text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 bg-primary text-primary-foreground font-semibold shadow-luxury hover:shadow-3d hover:glow-intense transition-all duration-500 group"
            onClick={() => {
              // Scroll to the Signature Collection section
              const signatureSection = document.querySelector('[data-section="signature-collection"]');
              if (signatureSection) {
                signatureSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
          >
            <span className="mr-4">DISCOVER LUXURY COLLECTION</span>
            <motion.div
              className="group-hover:rotate-90 transition-transform duration-500"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default UltraOurStory;
