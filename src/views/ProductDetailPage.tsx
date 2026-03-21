'use client';

import { useState, useEffect, useMemo } from 'react';
import SEO from '@/components/SEO';
import { productSchema, breadcrumbSchema, SITE_URL } from '@/lib/seo';
import { getProductImageAlt } from '@/lib/imageAltUtils';
import { useParams, useNavigate, Link } from '@/lib/navigation-compat';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  ArrowLeft,
  ChevronRight,
  Truck,
  Shield,
  Leaf,
  Sparkles,
  Star,
  Clock
} from 'lucide-react';
import { useCartWithToast } from '@/hooks/useCartWithToast';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useIsMobile } from '@/hooks/use-mobile';
import UltraNavigation from '@/components/UltraNavigation';
import BackToTop from '@/components/BackToTop';
import { useCollectionProduct, useCollectionProducts } from '@/hooks/useCollectionProducts';
import { useQueryClient } from '@tanstack/react-query';
import { collectionQueryKeys } from '@/hooks/useCollectionProducts';
import { useSignatureCollection } from '@/hooks/useSignatureCollection';
import { PriceDisplay } from '@/components/PriceDisplay';
import type { Bouquet } from '@/types/bouquet';
import { encodeImageUrl, toImageSrc } from '@/lib/imageUtils';

import bouquet1 from '@/assets/bouquet-1.jpg';
import bouquet2 from '@/assets/bouquet-2.jpg';
import bouquet3 from '@/assets/bouquet-3.jpg';

interface ProductData {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  images?: string[];
  category?: string;
  inStock?: boolean;
}

interface SizeOption {
  id: string;
  name: string;
  priceModifier: number;
  description: string;
}

const sizeOptions: SizeOption[] = [
  { id: 'standard', name: 'Standard', priceModifier: 0, description: '20–25 stems' },
  { id: 'deluxe', name: 'Deluxe', priceModifier: 50, description: '35–40 stems' },
  { id: 'premium', name: 'Premium', priceModifier: 100, description: '50+ stems' }
];

// ── Image Gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({
  images,
  currentImageIndex,
  onImageChange,
  discountPercentage,
  productName,
  isFav,
  onToggleFav
}: {
  images: string[];
  currentImageIndex: number;
  onImageChange: (index: number) => void;
  discountPercentage?: number | null;
  productName?: string;
  isFav: boolean;
  onToggleFav: () => void;
}) => (
  <div className="flex flex-col gap-4">
    {/* Main Image */}
    <div
      className="relative overflow-hidden rounded-2xl bg-[#f8f5f0] aspect-[3/4] shadow-md"
      style={{ boxShadow: '0 8px 40px rgba(199,158,72,0.10)' }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImageIndex}
          src={encodeImageUrl(images[currentImageIndex])}
          alt={productName ? `${productName} - luxury bouquet from Bexy Flowers Lebanon` : 'Product image'}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35 }}
        />
      </AnimatePresence>

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-2xl" />

      {/* Discount badge */}
      {discountPercentage && discountPercentage > 0 && (
        <div
          className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold tracking-widest uppercase text-white rounded-full"
          style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 14px rgba(220,38,38,0.45)' }}
        >
          {discountPercentage}% OFF
        </div>
      )}

      {/* Wishlist button on image */}
      <button
        onClick={onToggleFav}
        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
          isFav
            ? 'bg-pink-500 text-white shadow-pink-300/50'
            : 'bg-white/90 text-stone-400 hover:text-pink-500'
        }`}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <Heart className={`w-4.5 h-4.5 ${isFav ? 'fill-white' : ''}`} size={18} />
      </button>
    </div>

    {/* Thumbnails */}
    {images.length > 1 && (
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onImageChange(index)}
            className={`relative flex-shrink-0 w-[72px] h-[90px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              index === currentImageIndex
                ? 'border-[#C79E48] shadow-[0_0_0_2px_rgba(199,158,72,0.25)]'
                : 'border-transparent opacity-60 hover:opacity-90 hover:border-[#C79E48]/40'
            }`}
          >
            <img
              src={encodeImageUrl(image)}
              alt={productName ? `${productName} – view ${index + 1}` : `View ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    )}
  </div>
);

// ── Size Selector ─────────────────────────────────────────────────────────────
const SizeSelector = ({
  selectedSize,
  onSizeChange,
}: {
  selectedSize: string;
  onSizeChange: (size: string) => void;
}) => (
  <div className="space-y-2.5">
    <p className="text-xs uppercase tracking-widest text-stone-400" style={{ fontFamily: "'EB Garamond', serif" }}>
      Select Size
    </p>
    <div className="grid grid-cols-3 gap-2.5">
      {sizeOptions.map((option) => {
        const isSelected = selectedSize === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSizeChange(option.id)}
            className={`relative py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
              isSelected
                ? 'border-[#C79E48] bg-[#C79E48]/8 shadow-sm'
                : 'border-stone-200 hover:border-[#C79E48]/50 bg-white'
            }`}
          >
            <div
              className="font-semibold text-sm"
              style={{ color: isSelected ? '#C79E48' : '#2c2d2a', fontFamily: "'EB Garamond', serif" }}
            >
              {option.name}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">{option.description}</div>
            {option.priceModifier > 0 && (
              <div
                className="text-[11px] font-semibold mt-0.5"
                style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}
              >
                +${option.priceModifier}
              </div>
            )}
            {isSelected && (
              <motion.div
                layoutId="sizeIndicator"
                className="absolute inset-0 rounded-[10px] border-2 border-[#C79E48] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// ── Quantity Selector ─────────────────────────────────────────────────────────
const QuantitySelector = ({
  quantity,
  onQuantityChange,
}: {
  quantity: number;
  onQuantityChange: (qty: number) => void;
}) => (
  <div className="flex items-center justify-between">
    <p className="text-xs uppercase tracking-widest text-stone-400" style={{ fontFamily: "'EB Garamond', serif" }}>
      Quantity
    </p>
    <div
      className="flex items-center gap-0 rounded-xl overflow-hidden border border-stone-200 bg-white"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <button
        className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-[#C79E48] hover:bg-[#C79E48]/5 transition-colors disabled:opacity-30"
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
      >
        <Minus size={14} />
      </button>
      <span
        className="w-10 text-center text-sm font-semibold border-x border-stone-200 py-2"
        style={{ fontFamily: "'EB Garamond', serif", color: '#2c2d2a' }}
      >
        {quantity}
      </span>
      <button
        className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-[#C79E48] hover:bg-[#C79E48]/5 transition-colors"
        onClick={() => onQuantityChange(quantity + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
);

// ── Trust Badges ──────────────────────────────────────────────────────────────
const TrustBadges = () => (
  <div className="grid grid-cols-2 gap-3">
    {[
      { icon: Truck, label: 'Free Delivery', sub: 'Within Beirut' },
      { icon: Leaf, label: 'Fresh Flowers', sub: 'Guaranteed' },
      { icon: Sparkles, label: 'Handcrafted', sub: 'By Artisans' },
      { icon: Shield, label: 'Secure Order', sub: '100% Safe' },
    ].map(({ icon: Icon, label, sub }) => (
      <div
        key={label}
        className="flex items-center gap-2.5 p-3 rounded-xl bg-[#faf8f5] border border-[#ede9e3]"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C79E48]/10 flex-shrink-0">
          <Icon size={15} style={{ color: '#C79E48' }} />
        </div>
        <div>
          <p className="text-xs font-semibold text-stone-700" style={{ fontFamily: "'EB Garamond', serif" }}>
            {label}
          </p>
          <p className="text-[10px] text-stone-400">{sub}</p>
        </div>
      </div>
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToCart } = useCartWithToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isMobile = useIsMobile();

  const { data: product, isLoading: isLoadingProduct, error } = useCollectionProduct(id);
  const { data: signatureCollections } = useSignatureCollection();
  const signatureItem = signatureCollections?.find(item => item.product_id === id);
  const { data: allProducts } = useCollectionProducts({ isActive: true });

  const productData: ProductData = useMemo(() => {
    if (product) {
      if (signatureItem) {
        const customImages = signatureItem.custom_image_urls && signatureItem.custom_image_urls.length > 0
          ? signatureItem.custom_image_urls
          : product.image_urls || [];
        return {
          id: product.id,
          title: signatureItem.custom_title || product.title,
          price: signatureItem.custom_price ?? product.price,
          description: signatureItem.custom_description || product.description || '',
          imageUrl: encodeImageUrl(customImages[0] || ''),
          images: customImages.map((url: string) => encodeImageUrl(url)),
          category: product.display_category || product.category || '',
          inStock: !signatureItem.is_out_of_stock && !product.is_out_of_stock
        };
      }
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description || '',
        imageUrl: encodeImageUrl(product.image_urls?.[0] || ''),
        images: product.image_urls?.map(url => encodeImageUrl(url)) || [],
        category: product.display_category || product.category || '',
        inStock: !product.is_out_of_stock
      };
    }
    return {
      id: id || 'ember-rose-symphony',
      title: 'Ember Rose Symphony',
      price: 125.00,
      description: 'A passionate arrangement of crimson Grand Prix roses and rich burgundy snapdragons, accented with delicate seeded eucalyptus. Each stem is carefully selected to create a dramatic, textural masterpiece that speaks of timeless romance and devotion. Handcrafted by our artisans in Sidon.',
      imageUrl: toImageSrc(bouquet1),
      images: [toImageSrc(bouquet1), toImageSrc(bouquet2), toImageSrc(bouquet3)],
      category: 'Premium Bouquets',
      inStock: true
    };
  }, [product, signatureItem, id]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('standard');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const selectedSizeOption = sizeOptions.find(option => option.id === selectedSize);
  const basePrice = productData.price + (selectedSizeOption?.priceModifier || 0);
  const discountPercentage = signatureItem?.discount_percentage ?? product?.discount_percentage ?? null;
  const currentPrice = discountPercentage && discountPercentage > 0
    ? basePrice * (1 - discountPercentage / 100)
    : basePrice;

  const recommendedBouquets = useMemo((): Bouquet[] => {
    if (!allProducts || !product) return [];
    const currentCategory = productData.category;
    const currentId = productData.id;
    const currentPriceVal = productData.price;

    const availableBouquets: Bouquet[] = allProducts
      .filter(p => p.id !== currentId)
      .map(p => ({
        id: p.id,
        name: p.title,
        price: p.price,
        image: encodeImageUrl(p.image_urls?.[0] || ''),
        description: p.description || '',
        category: p.category || '',
        displayCategory: p.display_category || p.category || '',
        featured: p.featured || false,
        is_out_of_stock: p.is_out_of_stock || false,
        discount_percentage: p.discount_percentage || null
      }));

    let result = availableBouquets.filter(b => b.displayCategory === currentCategory);
    if (result.length < 4) result = [...result, ...availableBouquets.filter(b => Math.abs(b.price - currentPriceVal) <= 50)];
    if (result.length < 4) result = [...result, ...availableBouquets.filter(b => b.featured)];
    return Array.from(new Map(result.map(b => [b.id, b])).values()).slice(0, 4);
  }, [allProducts, product, productData]);

  useEffect(() => {
    recommendedBouquets.forEach((bouquet) => {
      queryClient.prefetchQuery({
        queryKey: collectionQueryKeys.detail(bouquet.id),
        queryFn: async () => {
          const { getCollectionProduct } = await import('@/lib/api/collection-products');
          return getCollectionProduct(bouquet.id);
        },
        staleTime: 5 * 60 * 1000,
      });
    });
  }, [recommendedBouquets, queryClient]);

  const handleAddToCart = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const cartItems = Array.from({ length: quantity }, () => ({
      id: productData.id,
      title: productData.title,
      price: currentPrice,
      image: productData.imageUrl,
      size: selectedSizeOption?.name || 'Standard'
    }));
    try {
      for (const item of cartItems) {
        await addToCart(item);
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      id: productData.id,
      title: productData.title,
      name: productData.title,
      price: productData.price,
      image: productData.imageUrl,
      imageUrl: productData.imageUrl,
      description: productData.description,
      category: productData.category || 'Premium Bouquets',
      featured: false
    });
  };

  const productUrl = `${SITE_URL}/product/${productData.id}`;
  const ogImage = productData.images?.[0] || productData.imageUrl;

  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Collection', url: '/collection' },
    { name: productData.title, url: `/product/${productData.id}` }
  ]);
  const productSchemaData = productSchema({
    name: productData.title,
    description: productData.description || '',
    image: ogImage,
    price: currentPrice,
    currency: 'USD',
    url: productUrl,
    inStock: productData.inStock,
    sku: productData.id,
    brand: 'Bexy Flowers'
  });

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <UltraNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
          <div className="h-5 w-32 bg-stone-200 rounded-full animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div className="aspect-[3/4] rounded-2xl bg-stone-200 animate-pulse" />
            <div className="space-y-5 pt-4">
              <div className="h-3 w-24 bg-stone-200 rounded-full animate-pulse" />
              <div className="h-9 w-3/4 bg-stone-200 rounded-full animate-pulse" />
              <div className="h-7 w-28 bg-stone-200 rounded-full animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-stone-100 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-stone-100 rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-stone-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #ffffff 60%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SEO
        title={productData.title}
        description={productData.description || `${productData.title} - Premium floral arrangement from Bexy Flowers. Luxury bouquets in Lebanon.`}
        canonical={`/product/${productData.id}`}
        ogImage={ogImage}
        ogType="product"
        keywords={`${productData.title}, ${productData.category}, luxury flowers Lebanon, premium bouquet, flower delivery Lebanon`}
        jsonLd={[breadcrumbs, productSchemaData]}
      />

      <UltraNavigation />

      {/* ── Breadcrumb + Back ── */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex items-center gap-1.5 text-xs text-stone-400" style={{ fontFamily: "'EB Garamond', serif" }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 hover:text-[#C79E48] transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          <ChevronRight size={12} className="opacity-40" />
          <Link to="/collection" className="hover:text-[#C79E48] transition-colors">Collection</Link>
          <ChevronRight size={12} className="opacity-40" />
          <span className="text-stone-600 line-clamp-1 max-w-[180px]">{productData.title}</span>
        </div>
      </motion.div>

      {/* ── Main Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">

          {/* Left — Image Gallery */}
          <motion.div
            className="lg:sticky lg:top-24"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <ImageGallery
              images={productData.images?.length ? productData.images : [productData.imageUrl]}
              currentImageIndex={currentImageIndex}
              onImageChange={setCurrentImageIndex}
              discountPercentage={discountPercentage}
              productName={productData.title}
              isFav={isFavorite(productData.id)}
              onToggleFav={handleToggleFavorite}
            />
          </motion.div>

          {/* Right — Product Info */}
          <motion.div
            className="space-y-6 pt-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >

            {/* Category + availability */}
            <div className="flex items-center justify-between">
              {productData.category && (
                <span
                  className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full"
                  style={{
                    background: 'linear-gradient(135deg,rgba(199,158,72,0.12),rgba(199,158,72,0.06))',
                    color: '#C79E48',
                    border: '1px solid rgba(199,158,72,0.25)',
                    fontFamily: "'EB Garamond', serif"
                  }}
                >
                  {productData.category}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${productData.inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span
                  className="text-xs"
                  style={{
                    color: productData.inStock ? '#10b981' : '#ef4444',
                    fontFamily: "'EB Garamond', serif"
                  }}
                >
                  {productData.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1
                className="text-3xl lg:text-[2.6rem] leading-tight font-normal"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1c1a17' }}
              >
                {productData.title}
              </h1>
            </div>

            {/* Rating row (decorative) */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-[#C79E48] text-[#C79E48]" />
                ))}
              </div>
              <span className="text-xs text-stone-400" style={{ fontFamily: "'EB Garamond', serif" }}>
                5.0 · Handcrafted in Lebanon
              </span>
            </div>

            {/* Price */}
            <div className="py-1">
              <PriceDisplay
                price={basePrice}
                discountPercentage={discountPercentage}
                size="lg"
              />
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-[#C79E48]/30 to-transparent" />
              <Sparkles size={12} style={{ color: '#C79E48', opacity: 0.5 }} />
              <div className="flex-1 h-px bg-gradient-to-l from-[#C79E48]/30 to-transparent" />
            </div>

            {/* Description */}
            <p
              className="text-base leading-relaxed text-stone-600"
              style={{ fontFamily: "'EB Garamond', serif", fontSize: '1.05rem' }}
            >
              {productData.description}
            </p>

            {/* Tags */}
            {signatureItem?.tags && signatureItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {signatureItem.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full"
                    style={{
                      background: '#f5f0e8',
                      color: '#C79E48',
                      fontFamily: "'EB Garamond', serif",
                      border: '1px solid rgba(199,158,72,0.2)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Size & Quantity */}
            <div
              className="space-y-4 p-5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg,#faf8f5,#ffffff)',
                border: '1px solid #ede9e3',
                boxShadow: '0 2px 12px rgba(199,158,72,0.06)'
              }}
            >
              <SizeSelector selectedSize={selectedSize} onSizeChange={setSelectedSize} />
              <div className="h-px bg-[#ede9e3]" />
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <motion.button
                className="relative w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2.5 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: productData.inStock
                    ? 'linear-gradient(135deg, #C79E48 0%, #d4af52 50%, #C79E48 100%)'
                    : '#d1d5db',
                  boxShadow: productData.inStock ? '0 6px 24px rgba(199,158,72,0.38)' : 'none',
                  fontFamily: "'EB Garamond', serif",
                  backgroundSize: '200% 100%',
                  letterSpacing: '0.04em'
                }}
                onClick={handleAddToCart}
                disabled={isLoading || isLoadingProduct || !productData.inStock}
                whileHover={{ scale: 1.012, boxShadow: '0 8px 30px rgba(199,158,72,0.48)' }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                    <span>Adding to Cart…</span>
                  </>
                ) : addedToCart ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                    <span>Added to Cart!</span>
                  </>
                ) : !productData.inStock ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                    {quantity > 1 && (
                      <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        ×{quantity}
                      </span>
                    )}
                  </>
                )}
              </motion.button>

              <button
                className={`w-full py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all border ${
                  isFavorite(productData.id)
                    ? 'bg-pink-50 border-pink-200 text-pink-600'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-[#C79E48]/50 hover:text-[#C79E48]'
                }`}
                style={{ fontFamily: "'EB Garamond', serif", fontSize: '0.95rem' }}
                onClick={handleToggleFavorite}
              >
                <Heart
                  size={16}
                  className={isFavorite(productData.id) ? 'fill-pink-500 text-pink-500' : ''}
                />
                <span>{isFavorite(productData.id) ? 'Saved to Favorites' : 'Save to Favorites'}</span>
              </button>
            </div>

            {/* Delivery note */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
              style={{ background: '#f5f8f0', border: '1px solid #deebd0' }}
            >
              <Clock size={14} style={{ color: '#4a9c2d', flexShrink: 0 }} />
              <p className="text-xs text-stone-600" style={{ fontFamily: "'EB Garamond', serif" }}>
                <strong className="text-stone-700">Order before 2 PM</strong> for same-day delivery within Beirut
              </p>
            </div>

            {/* Trust Badges */}
            <TrustBadges />
          </motion.div>
        </div>
      </div>

      {/* ── You Might Also Like ── */}
      {recommendedBouquets.length > 0 && (
        <section
          className="py-20"
          style={{ background: 'linear-gradient(180deg, #f8f5f0 0%, #fdfcfa 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section header */}
            <div className="text-center mb-12">
              <p
                className="text-[11px] uppercase tracking-[0.25em] mb-3"
                style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}
              >
                Curated for You
              </p>
              <h2
                className="text-3xl lg:text-4xl font-normal mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1c1a17' }}
              >
                You Might Also Love
              </h2>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C79E48]/50" />
                <Sparkles size={12} style={{ color: '#C79E48' }} />
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C79E48]/50" />
              </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendedBouquets.map((bouquet, index) => (
                <motion.div
                  key={bouquet.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Link to={`/product/${bouquet.id}`} className="group block">
                    <div
                      className="bg-white rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-xl"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ece6' }}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden aspect-[3/4] bg-[#f8f5f0]">
                        <img
                          src={bouquet.image}
                          alt={getProductImageAlt(bouquet)}
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
                        {/* Quick view pill */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                          <span
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white whitespace-nowrap"
                            style={{ background: 'rgba(199,158,72,0.92)', backdropFilter: 'blur(8px)' }}
                          >
                            View Details
                          </span>
                        </div>
                        {/* Discount badge */}
                        {bouquet.discount_percentage && bouquet.discount_percentage > 0 && (
                          <div
                            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
                          >
                            -{bouquet.discount_percentage}%
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1"
                          style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}
                        >
                          {bouquet.displayCategory || bouquet.category}
                        </p>
                        <h3
                          className="text-sm font-normal mb-2 line-clamp-1 group-hover:text-[#C79E48] transition-colors"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1c1a17' }}
                        >
                          {bouquet.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: '#C79E48', fontFamily: "'EB Garamond', serif" }}
                          >
                            ${bouquet.price}
                          </p>
                          <ShoppingCart size={13} className="text-stone-300 group-hover:text-[#C79E48] transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View all CTA */}
            <div className="text-center mt-12">
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:shadow-lg"
                style={{
                  border: '1.5px solid #C79E48',
                  color: '#C79E48',
                  fontFamily: "'EB Garamond', serif",
                  letterSpacing: '0.06em',
                  background: 'transparent'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#C79E48';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#C79E48';
                }}
              >
                <span>Explore Full Collection</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <BackToTop />
    </motion.div>
  );
};

export default ProductDetailPage;
