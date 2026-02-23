import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, memo, useState, useCallback } from "react";
import { useNavigate } from '@/lib/navigation-compat';

interface ArtItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
}

const artItems: ArtItem[] = [
  {
    id: 1,
    title: "ANGEL",
    subtitle: "Divine Heritage",
    description: "Limited edition hand-crafted piece. Only 50 made worldwide.",
    price: "$899",
    image: "your-image-path/arts.webp",
    badge: "1/50"
  },
  {
    id: 2,
    title: "ETHEREAL",
    subtitle: "Celestial Collection",
    description: "Museum-grade quality with premium finishing.",
    price: "$799",
    image: "your-image-path/arts1.webp",
    badge: "EXCLUSIVE"
  },
  {
    id: 3,
    title: "ASCENSION",
    subtitle: "Legacy Edition",
    description: "Collector's masterpiece with certificate of authenticity.",
    price: "$999",
    image: "your-image-path/art2.webp",
    badge: "COLLECTOR'S"
  }
];

const ArtCard = memo(({ item, index }: { item: ArtItem; index: number }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    navigate(`/product/${item.id}`, {
      state: {
        id: String(item.id),
        name: item.title,
        price: item.price,
        category: "Arts",
        description: item.description,
        fullDescription: `${item.subtitle} • ${item.description}`,
        origin: "Limited Edition",
        images: [item.image],
        sizes: ["One Size"],
      },
    });
  }, [navigate, item.id, item.description, item.image, item.price, item.subtitle, item.title]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 1.2,
        delay: index * 0.2,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="group relative cursor-pointer"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-black">
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isHovered ? 1.08 : 1,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform' }}
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            style={{ willChange: 'transform' }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />

        {item.badge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.4 }}
            className="absolute top-4 right-4 z-10"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm">
              <span className="text-white text-xs font-bold tracking-widest">
                {item.badge}
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          className="absolute inset-0 flex flex-col justify-end p-6 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ willChange: 'opacity' }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: isHovered ? 0 : 20,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-2"
            style={{ willChange: 'transform, opacity' }}
          >
            <p className="text-white/80 text-xs tracking-widest uppercase">
              {item.subtitle}
            </p>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {item.description}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.4 }}
          style={{ willChange: 'transform, opacity' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/30"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.4 }}
          style={{ willChange: 'transform, opacity' }}
        />
      </div>

      <motion.div
        className="mt-6 space-y-2"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 + 0.5, duration: 0.6 }}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-ultra-wide text-foreground">
              {item.title}
            </h3>
            <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground mt-1">
              {item.subtitle}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold tracking-wider text-foreground">
              {item.price}
            </p>
          </div>
        </div>

        <motion.div
          className="h-px bg-gradient-to-r from-foreground via-foreground/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            originX: 0,
            willChange: 'transform'
          }}
        />
      </motion.div>
    </motion.div>
  );
});

const ArtsSection = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0.8]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-24 md:py-32 bg-background overflow-hidden"
      style={{
        transform: 'translateZ(0)',
        willChange: 'auto'
      }}
    >
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-foreground rounded-full blur-3xl" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          style={{ y, opacity }}
          className="text-center mb-20 md:mb-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.span
              className="inline-block text-xs tracking-ultra-wide uppercase text-muted-foreground mb-4"
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              Exclusive Collection
            </motion.span>

            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black tracking-ultra-wide mb-4 sm:mb-6 px-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              THE ARTS
            </motion.h2>

            <motion.div
              className="w-24 sm:w-32 h-px bg-foreground mx-auto mb-4 sm:mb-6"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{ willChange: 'transform' }}
            />

            <motion.p
              className="text-sm sm:text-base md:text-lg tracking-wider text-muted-foreground max-w-2xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Three masterpieces. Hand-selected. Museum-quality craftsmanship.
              <br />
              <span className="text-xs sm:text-sm">Each piece tells a story of excellence.</span>
            </motion.p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {artItems.map((item, index) => (
            <ArtCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 1 }}
          className="text-center mt-20 md:mt-32"
        >
          <p className="text-xs tracking-ultra-wide uppercase text-muted-foreground/50">
            Limited quantities available
          </p>
        </motion.div>
      </div>
    </section>
  );
});

export default ArtsSection;

