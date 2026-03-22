/**
 * Zodiac Signs Data — Deeply Researched Astrological Database
 *
 * Sources:
 *   - Traditional Western astrology (Ptolemy, Lilly, Placidus)
 *   - Modern floral astrology guides (Kelsey Lush, Katie Elks)
 *   - Victorian "Language of Flowers" (floriography)
 *   - Color psychology per ruling planet and element
 *   - Each sign's birth flowers, sacred colors, and personality traits
 *     cross-referenced with multiple astrological databases.
 */

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  modality: 'cardinal' | 'fixed' | 'mutable';
  dates: string;
  rulingPlanet: string;
  traits: string[];

  /** CSS hex color values for UI swatches */
  colors: string[];
  /** Human-readable color names matching the hex values above */
  colorNames: string[];

  /** Traditional birth flowers */
  flowers: string[];

  /** Rich, poetic personality description */
  personality: string;

  /** Brief style note used in the AI prompt */
  bouquetStyle: string;

  /**
   * Detailed AI prompt ingredients — used to build the generation prompt.
   * Describes flowers with texture/shade, color atmosphere, arrangement shape,
   * packaging, and emotional tone for maximum AI fidelity.
   */
  aiPromptDetails: {
    flowers: string;       // "deep crimson velvety garden roses, sculptural peonies…"
    colorAtmosphere: string; // "rich scarlet bleeding into flame-orange…"
    arrangementShape: string; // "bold asymmetric cascading shape"
    packaging: string;     // "wrapped in matte charcoal paper with a leather cord"
    mood: string;          // "fierce, passionate, triumphant"
  };

  recommendedBouquets: ZodiacBouquet[];
  compatibility: string[];
  luckyNumbers: number[];
  gemstone: string;
}

export interface ZodiacBouquet {
  id: string;
  name: string;
  description: string;
  flowers: string[];
  colors: string[];
  price: number;
  image: string;
  occasion: string;
  meaning: string;
  specialFeatures: string[];
}

export const zodiacSigns: ZodiacSign[] = [
  // ── ARIES ────────────────────────────────────────────────────────────────
  {
    id: 'aries',
    name: 'Aries',
    symbol: '♈',
    element: 'fire',
    modality: 'cardinal',
    dates: 'March 21 – April 19',
    rulingPlanet: 'Mars',
    traits: ['bold', 'courageous', 'passionate', 'competitive', 'spontaneous', 'pioneering'],
    colors: ['#C0392B', '#E74C3C', '#FF6B35', '#FF4500'],
    colorNames: ['Crimson', 'Scarlet', 'Flame Orange', 'Red-Orange'],
    flowers: ['honeysuckle', 'tiger lily', 'red tulip', 'thistle', 'geranium'],
    personality:
      'Bold, fierce, and first in everything — Aries is the warrior of the zodiac. Ruled by Mars, the planet of action and desire, you charge forward where others hesitate. Your energy is magnetic, your confidence infectious. You feel most alive when pursuing a challenge and most beautiful surrounded by vivid, unapologetic reds.',
    bouquetStyle: 'Bold, asymmetric, vibrant red arrangements that command the room',
    aiPromptDetails: {
      flowers:
        'flame-red tiger lilies with spotted petals, deep crimson garden roses, vivid red tulips, orange ranunculus, golden marigolds',
      colorAtmosphere:
        'bold crimson and scarlet palette bleeding into flame orange and deep red, vivid and unapologetic',
      arrangementShape:
        'dynamic asymmetric upward-reaching shape with tall dramatic stems and bold irregular silhouette',
      packaging:
        'wrapped in matte black paper with a bright scarlet silk ribbon, structured and striking',
      mood: 'fierce, triumphant, passionate, powerful',
    },
    recommendedBouquets: [
      {
        id: 'aries-fire-passion',
        name: 'Fire & Passion',
        description:
          'A commanding arrangement of tiger lilies, crimson roses, and red tulips — bold as the Aries spirit.',
        flowers: ['Tiger Lily', 'Crimson Rose', 'Red Tulip', 'Orange Ranunculus'],
        colors: ['Crimson', 'Flame Orange', 'Scarlet'],
        price: 189,
        image: '/assets/bouquet-1.jpg',
        occasion: 'New Beginnings, Courage, Leadership',
        meaning: 'Ignites passion, boldness, and pioneering spirit',
        specialFeatures: ['Dynamic asymmetric shape', 'Vivid red palette', 'Bold statement piece'],
      },
    ],
    compatibility: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    luckyNumbers: [1, 8, 17],
    gemstone: 'Diamond',
  },

  // ── TAURUS ───────────────────────────────────────────────────────────────
  {
    id: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    element: 'earth',
    modality: 'fixed',
    dates: 'April 20 – May 20',
    rulingPlanet: 'Venus',
    traits: ['sensual', 'patient', 'reliable', 'devoted', 'luxury-loving', 'grounded'],
    colors: ['#27AE60', '#A8D5A2', '#F1948A', '#F5CBA7'],
    colorNames: ['Emerald Green', 'Sage', 'Dusty Rose', 'Warm Peach'],
    flowers: ['garden rose', 'peony', 'foxglove', 'poppy', 'daisy', 'violet'],
    personality:
      'Sensual, patient, and devoted — Taurus is the connoisseur of the zodiac. Ruled by Venus, the planet of beauty and pleasure, you have an innate gift for surrounding yourself with luxurious things. You love long, slow meals, silky textures, and blooms so fragrant they stop you mid-sentence. Your bouquet should feel like stepping into a private garden.',
    bouquetStyle:
      'Lush, full, garden-style arrangements with rich textures and romantic dusty rose and sage tones',
    aiPromptDetails: {
      flowers:
        'garden roses in blush and dusty rose, full lush peonies, delicate ranunculus, sage-green eucalyptus sprigs, soft white daisies',
      colorAtmosphere:
        'warm dusty rose blending into sage green and cream, rich earthy warmth, lush and romantic',
      arrangementShape:
        'full rounded garden-style bouquet, densely packed with flowing foliage, soft and abundant',
      packaging:
        'loosely wrapped in sage-green tissue paper with a wide dusty rose velvet ribbon, soft and tactile',
      mood: 'sensual, luxurious, grounded, comforting',
    },
    recommendedBouquets: [
      {
        id: 'taurus-earth-luxury',
        name: 'Earthly Luxury',
        description:
          'Lush garden roses, soft peonies, and eucalyptus in warm dusty rose and sage — pure Taurus indulgence.',
        flowers: ['Garden Rose', 'Peony', 'Ranunculus', 'Eucalyptus'],
        colors: ['Dusty Rose', 'Sage Green', 'Cream', 'Peach'],
        price: 225,
        image: '/assets/bouquet-2.jpg',
        occasion: 'Romance, Self-Love, Celebration',
        meaning: 'Embodies sensuality, enduring beauty, and abundant joy',
        specialFeatures: ['Full garden style', 'Rich texture', 'Earthy luxury palette'],
      },
    ],
    compatibility: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    luckyNumbers: [2, 6, 9, 24],
    gemstone: 'Emerald',
  },

  // ── GEMINI ───────────────────────────────────────────────────────────────
  {
    id: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    element: 'air',
    modality: 'mutable',
    dates: 'May 21 – June 20',
    rulingPlanet: 'Mercury',
    traits: ['curious', 'witty', 'versatile', 'communicative', 'playful', 'intellectual'],
    colors: ['#F9E547', '#C8E6C9', '#E8D5F5', '#B3D9FF'],
    colorNames: ['Sunny Yellow', 'Mint Green', 'Soft Lilac', 'Sky Blue'],
    flowers: ['lavender', 'lily of the valley', 'yellow rose', 'freesia', 'sweet pea', 'orchid'],
    personality:
      'Quick-witted, curious, and endlessly charming — Gemini lives in a world of ideas and conversations. Ruled by Mercury, the messenger planet, you think faster than most people talk. You need variety the way others need air. Your perfect bouquet mirrors your nature: a joyful, mixed medley of contrasts that somehow works beautifully together.',
    bouquetStyle:
      'Eclectic, mixed-texture arrangements with cheerful yellows, lilacs, and playful asymmetry',
    aiPromptDetails: {
      flowers:
        'sunny yellow roses, slender lily of the valley sprigs, purple lavender wands, pale freesia, delicate sweet peas in lilac and pink',
      colorAtmosphere:
        'cheerful yellow and soft lilac dancing with mint green and sky blue, light and breezy',
      arrangementShape:
        'playful mixed asymmetric bouquet with varied stem heights, airy and eclectic',
      packaging:
        'wrapped in white craft paper with a printed botanical illustration ribbon and curling yellow ribbons',
      mood: 'playful, curious, joyful, airy, spontaneous',
    },
    recommendedBouquets: [
      {
        id: 'gemini-air-versatility',
        name: 'Air & Wit',
        description:
          'Yellow roses, lavender, lily of the valley, and freesia — a playful, versatile mix for the dual-natured Gemini.',
        flowers: ['Yellow Rose', 'Lavender', 'Lily of the Valley', 'Freesia'],
        colors: ['Sunny Yellow', 'Lavender', 'Mint', 'White'],
        price: 165,
        image: '/assets/bouquet-3.jpg',
        occasion: 'Friendship, Learning, Celebration',
        meaning: 'Celebrates curiosity, adaptability, and joyful connections',
        specialFeatures: ['Mixed textures', 'Airy asymmetric design', 'Cheerful color variety'],
      },
    ],
    compatibility: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    luckyNumbers: [5, 7, 14, 23],
    gemstone: 'Agate',
  },

  // ── CANCER ───────────────────────────────────────────────────────────────
  {
    id: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    element: 'water',
    modality: 'cardinal',
    dates: 'June 21 – July 22',
    rulingPlanet: 'Moon',
    traits: ['nurturing', 'intuitive', 'protective', 'emotional', 'loyal', 'empathetic'],
    colors: ['#FFFFFF', '#C9D6DF', '#D5E8F0', '#E8E8E8'],
    colorNames: ['Pearl White', 'Silver Mist', 'Pale Blue', 'Moonlight Grey'],
    flowers: ['white rose', 'hydrangea', 'delphinium', 'white lily', 'jasmine', 'water lily'],
    personality:
      'Deeply intuitive and nurturing, Cancer is the heart of the zodiac. Ruled by the Moon, your emotions ebb and flow like the tides. You create safe, beautiful spaces for the people you love. Your ideal bouquet evokes the softness of moonlight on still water — white, silver-blue, and quietly breathtaking.',
    bouquetStyle:
      'Soft, flowing, romantic arrangements in whites, silver, and pale blue with moonlit elegance',
    aiPromptDetails: {
      flowers:
        'white garden roses with pearl-soft petals, large white hydrangea clusters, delicate white jasmine stars, pale blue delphinium spires, silver dusty miller foliage',
      colorAtmosphere:
        'pure white and pearl merging into silver-blue and moonlight grey, ethereal and soft',
      arrangementShape:
        'flowing rounded bouquet with trailing white jasmine vines, soft and organic like sea foam',
      packaging:
        'wrapped in translucent white organza tied with a silver satin ribbon, delicate and luminous',
      mood: 'tender, romantic, protective, moonlit, ethereal',
    },
    recommendedBouquets: [
      {
        id: 'cancer-water-nurture',
        name: 'Moon & Water',
        description:
          'White roses, hydrangeas, jasmine, and delphinium in luminous whites and pale silver — as calming as moonlight.',
        flowers: ['White Rose', 'Hydrangea', 'Jasmine', 'Delphinium'],
        colors: ['Pearl White', 'Silver', 'Pale Blue', 'Cream'],
        price: 199,
        image: '/assets/bouquet-4.jpg',
        occasion: 'Family, Healing, Emotional Support',
        meaning: 'Nurtures emotional well-being and deepens loving bonds',
        specialFeatures: ['Flowing romantic silhouette', 'Soft white palette', 'Calming presence'],
      },
    ],
    compatibility: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    luckyNumbers: [2, 7, 11, 16, 25],
    gemstone: 'Pearl',
  },

  // ── LEO ──────────────────────────────────────────────────────────────────
  {
    id: 'leo',
    name: 'Leo',
    symbol: '♌',
    element: 'fire',
    modality: 'fixed',
    dates: 'July 23 – August 22',
    rulingPlanet: 'Sun',
    traits: ['confident', 'charismatic', 'generous', 'theatrical', 'loyal', 'radiant'],
    colors: ['#F39C12', '#E67E22', '#F1C40F', '#E74C3C'],
    colorNames: ['Royal Gold', 'Amber', 'Bright Yellow', 'Warm Red'],
    flowers: ['sunflower', 'marigold', 'dahlia', 'red rose', 'heliotrope', 'yellow lily'],
    personality:
      'Radiant, generous, and impossible to ignore — Leo is the royalty of the zodiac. Ruled by the Sun itself, you carry warmth and light everywhere you go. You love grandly, laugh loudly, and deserve a bouquet as magnificent as you are. Gold sunflowers and amber dahlias are your flowers — they literally follow the sun, just like you.',
    bouquetStyle:
      'Dramatic, regal arrangements with gold, amber, and warm reds that announce themselves boldly',
    aiPromptDetails: {
      flowers:
        'giant golden sunflowers with rich brown centers, deep amber dahlias with layered petals, blood-orange marigolds, golden-yellow roses, warmred carnations',
      colorAtmosphere:
        'royal gold and amber blazing into warm red and burnt orange, radiant and theatrical',
      arrangementShape:
        'grand dramatic arrangement with tall sunflowers rising above a full lush base, regal and imposing',
      packaging:
        'wrapped in deep gold metallic paper with a wide burgundy velvet ribbon, opulent and majestic',
      mood: 'regal, radiant, generous, theatrical, celebratory',
    },
    recommendedBouquets: [
      {
        id: 'leo-sun-royalty',
        name: 'Sun & Royalty',
        description:
          'Grand sunflowers, amber dahlias, and golden roses — a regal arrangement worthy of Leo\'s natural magnificence.',
        flowers: ['Sunflower', 'Amber Dahlia', 'Golden Rose', 'Marigold'],
        colors: ['Royal Gold', 'Amber', 'Warm Red', 'Deep Orange'],
        price: 245,
        image: '/assets/bouquet-5.jpg',
        occasion: 'Celebration, Achievement, Self-Expression',
        meaning: 'Radiates confidence, generosity, and royal warmth',
        specialFeatures: ['Grand dramatic height', 'Gold and amber palette', 'Regal presence'],
      },
    ],
    compatibility: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    luckyNumbers: [1, 3, 10, 19],
    gemstone: 'Ruby',
  },

  // ── VIRGO ────────────────────────────────────────────────────────────────
  {
    id: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    element: 'earth',
    modality: 'mutable',
    dates: 'August 23 – September 22',
    rulingPlanet: 'Mercury',
    traits: ['analytical', 'perfectionist', 'practical', 'helpful', 'modest', 'detail-oriented'],
    colors: ['#7F8C8D', '#BDC3C7', '#D5C7A3', '#A9C47F'],
    colorNames: ['Cool Grey', 'Silver', 'Warm Sand', 'Soft Green'],
    flowers: ['chrysanthemum', 'aster', 'morning glory', 'lavender', 'cornflower', 'buttercup'],
    personality:
      'Precise, analytical, and quietly brilliant — Virgo is the master craftsperson of the zodiac. Ruled by Mercury, you notice the details everyone else misses. You find beauty in order, elegance in restraint, and perfection in the smallest gestures. Your bouquet should be impeccably composed: not loud, but undeniably correct.',
    bouquetStyle:
      'Clean, symmetrical, precisely arranged with cool greys, sage, and soft neutrals — understated perfection',
    aiPromptDetails: {
      flowers:
        'white chrysanthemums with precise petal layers, pale lavender aster blooms, purple cornflowers, sage-green eucalyptus, delicate white baby\'s breath',
      colorAtmosphere:
        'soft grey-white with sage green and muted lavender, crisp and orderly, calming precision',
      arrangementShape:
        'perfectly symmetrical round arrangement with even stem heights and geometric precision',
      packaging:
        'wrapped in clean grey linen paper with a thin sage green silk ribbon, restrained and refined',
      mood: 'calm, precise, elegant, modest, orderly',
    },
    recommendedBouquets: [
      {
        id: 'virgo-earth-precision',
        name: 'Earth & Precision',
        description:
          'White chrysanthemums, aster, and lavender in a perfectly balanced arrangement — every stem exactly right.',
        flowers: ['Chrysanthemum', 'Aster', 'Lavender', 'Cornflower'],
        colors: ['Cool White', 'Grey', 'Soft Lavender', 'Sage'],
        price: 175,
        image: '/assets/bouquet-6.jpg',
        occasion: 'Success, Health, Organisation',
        meaning: 'Promotes attention to detail, clarity, and quiet excellence',
        specialFeatures: ['Perfect symmetry', 'Restrained palette', 'Precise composition'],
      },
    ],
    compatibility: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    luckyNumbers: [5, 14, 15, 23],
    gemstone: 'Sapphire',
  },

  // ── LIBRA ────────────────────────────────────────────────────────────────
  {
    id: 'libra',
    name: 'Libra',
    symbol: '♎',
    element: 'air',
    modality: 'cardinal',
    dates: 'September 23 – October 22',
    rulingPlanet: 'Venus',
    traits: ['diplomatic', 'charming', 'romantic', 'fair', 'aesthetic', 'social'],
    colors: ['#F8BBD9', '#AED6F1', '#E8DAEF', '#A8E6CF'],
    colorNames: ['Blush Pink', 'Powder Blue', 'Soft Lavender', 'Mint'],
    flowers: ['rose', 'peony', 'hydrangea', 'bluebell', 'cosmos', 'pink dahlia'],
    personality:
      'Romantic, charming, and endlessly aesthetic — Libra is Venus\'s most beautiful creation. You were born knowing that life should be beautiful, relationships should be balanced, and flowers should never be an afterthought. Soft roses and bluebells are yours; they are graceful, balanced, and impossible not to love.',
    bouquetStyle:
      'Perfectly balanced, romantic arrangements in soft pinks and powder blues with effortless elegance',
    aiPromptDetails: {
      flowers:
        'blush pink garden roses, soft lilac peonies, pale blue hydrangea clusters, pink cosmos daisies, white sweet peas',
      colorAtmosphere:
        'blush pink and powder blue melting into soft lavender and mint, perfectly balanced and romantic',
      arrangementShape:
        'balanced symmetrical bouquet with equal visual weight on both sides, harmonious and graceful',
      packaging:
        'wrapped in pale pink tissue with a pastel blue wide satin bow, elegant and perfectly proportioned',
      mood: 'romantic, balanced, charming, graceful, beautiful',
    },
    recommendedBouquets: [
      {
        id: 'libra-balance-harmony',
        name: 'Balance & Harmony',
        description:
          'Blush roses, soft peonies, and hydrangeas in a beautifully balanced arrangement — harmony made visible.',
        flowers: ['Blush Rose', 'Lilac Peony', 'Blue Hydrangea', 'Cosmos'],
        colors: ['Blush Pink', 'Powder Blue', 'Soft Lavender', 'White'],
        price: 195,
        image: '/assets/bouquet-1.jpg',
        occasion: 'Romance, Partnership, Beauty',
        meaning: 'Brings harmony, romantic connection, and aesthetic joy',
        specialFeatures: ['Perfect balance', 'Soft romantic palette', 'Elegant symmetry'],
      },
    ],
    compatibility: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    luckyNumbers: [6, 15, 24, 33],
    gemstone: 'Opal',
  },

  // ── SCORPIO ──────────────────────────────────────────────────────────────
  {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    element: 'water',
    modality: 'fixed',
    dates: 'October 23 – November 21',
    rulingPlanet: 'Pluto',
    traits: ['intense', 'passionate', 'mysterious', 'loyal', 'perceptive', 'transformative'],
    colors: ['#7B241C', '#512E5F', '#1B2631', '#922B21'],
    colorNames: ['Deep Burgundy', 'Dark Plum', 'Near Black', 'Dark Crimson'],
    flowers: ['dark red rose', 'black dahlia', 'orchid', 'geranium', 'chrysanthemum', 'anemone'],
    personality:
      'Intense, magnetic, and profoundly perceptive — Scorpio feels everything ten times deeper than others. Ruled by Pluto, the planet of death and rebirth, you are drawn to the hidden, the complex, and the transformative. Your bouquet should feel like a secret: deep burgundy roses so dark they are almost black, mysterious orchids, and shadows that beckon.',
    bouquetStyle:
      'Dark, intense, dramatic arrangements with deep burgundy, black, and jewel-toned purples',
    aiPromptDetails: {
      flowers:
        'near-black velvet dark red roses with deepest crimson petals, deep plum orchids with speckled lips, black dahlias, deep burgundy calla lilies, dark anemones with black centers',
      colorAtmosphere:
        'near-black and deep burgundy melting into dark plum and midnight purple, mysterious and intense',
      arrangementShape:
        'dramatic loose arrangement with deep shadows between blooms, architectural and moody',
      packaging:
        'wrapped in matte black paper with a dark burgundy silk cord, mysterious and striking',
      mood: 'intense, mysterious, passionate, transformative, magnetic',
    },
    recommendedBouquets: [
      {
        id: 'scorpio-water-passion',
        name: 'Depth & Passion',
        description:
          'Near-black roses, deep plum orchids, and black dahlias — a dramatic arrangement as intense as Scorpio itself.',
        flowers: ['Dark Red Rose', 'Black Dahlia', 'Plum Orchid', 'Dark Anemone'],
        colors: ['Near Black', 'Deep Burgundy', 'Dark Plum', 'Midnight Purple'],
        price: 215,
        image: '/assets/bouquet-2.jpg',
        occasion: 'Transformation, Deep Love, Mystery',
        meaning: 'Embodies depth, intense passion, and powerful transformation',
        specialFeatures: ['Dramatic dark tones', 'Mysterious allure', 'Intense emotional resonance'],
      },
    ],
    compatibility: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    luckyNumbers: [8, 11, 18, 22],
    gemstone: 'Topaz',
  },

  // ── SAGITTARIUS ──────────────────────────────────────────────────────────
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    element: 'fire',
    modality: 'mutable',
    dates: 'November 22 – December 21',
    rulingPlanet: 'Jupiter',
    traits: ['adventurous', 'optimistic', 'philosophical', 'free-spirited', 'generous', 'honest'],
    colors: ['#8E44AD', '#2980B9', '#E67E22', '#27AE60'],
    colorNames: ['Royal Purple', 'Cobalt Blue', 'Bright Orange', 'Vivid Green'],
    flowers: ['bird of paradise', 'carnation', 'narcissus', 'crocus', 'peony', 'wild iris'],
    personality:
      'Free-spirited, optimistic, and in love with the world — Sagittarius is the adventurer of the zodiac. Ruled by Jupiter, the planet of expansion and wisdom, you are always chasing the next horizon. Your bouquet should feel exotic and wide-open, like a market in Marrakech or a field in Tuscany — vivid, unexpected, and impossible to confine.',
    bouquetStyle:
      'Exotic, vibrant arrangements with rich purples, cobalt blues, and bold unexpected flower choices',
    aiPromptDetails: {
      flowers:
        'exotic bird of paradise in vivid orange and purple, rich purple lisianthus, cobalt blue delphinium towers, bright carnations in orange and magenta, yellow narcissus',
      colorAtmosphere:
        'royal purple and cobalt blue blazing with bright orange and vivid green, exotic and adventurous',
      arrangementShape:
        'tall open arrangement with exotic bird of paradise rising high, free and expansive',
      packaging:
        'wrapped in turquoise kraft paper with a wide purple satin ribbon, adventurous and vibrant',
      mood: 'adventurous, free-spirited, vibrant, philosophical, joyful',
    },
    recommendedBouquets: [
      {
        id: 'sagittarius-fire-adventure',
        name: 'Adventure & Freedom',
        description:
          'Bird of paradise, purple lisianthus, and cobalt delphinium — a bouquet that captures Sagittarius\'s boundless wanderlust.',
        flowers: ['Bird of Paradise', 'Purple Lisianthus', 'Blue Delphinium', 'Orange Carnation'],
        colors: ['Royal Purple', 'Cobalt Blue', 'Vivid Orange', 'Bright Yellow'],
        price: 185,
        image: '/assets/bouquet-3.jpg',
        occasion: 'Adventure, Travel, Freedom',
        meaning: 'Encourages exploration, optimism, and big-picture thinking',
        specialFeatures: ['Exotic flowers', 'Tall open silhouette', 'Vivid world-traveler palette'],
      },
    ],
    compatibility: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    luckyNumbers: [3, 9, 12, 21],
    gemstone: 'Turquoise',
  },

  // ── CAPRICORN ────────────────────────────────────────────────────────────
  {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    element: 'earth',
    modality: 'cardinal',
    dates: 'December 22 – January 19',
    rulingPlanet: 'Saturn',
    traits: ['ambitious', 'disciplined', 'traditional', 'responsible', 'patient', 'strategic'],
    colors: ['#2C3E50', '#27AE60', '#7F8C8D', '#6D4C41'],
    colorNames: ['Deep Charcoal', 'Forest Green', 'Steel Grey', 'Rich Brown'],
    flowers: ['camellia', 'pansy', 'carnation', 'ivy', 'holly', 'white rose'],
    personality:
      'Disciplined, strategic, and quietly powerful — Capricorn is the CEO of the zodiac. Ruled by Saturn, the planet of structure and mastery, you understand that greatness is earned through patience and persistence. You don\'t need flash — you need quality. Your bouquet is classical, long-lasting, and composed with architectural precision.',
    bouquetStyle:
      'Classic, structured, timeless arrangements with forest greens, deep charcoal, and ivory whites',
    aiPromptDetails: {
      flowers:
        'pristine white camellias with perfect waxy petals, deep forest green ivy trailing gracefully, charcoal-edge white roses, dark green holly berries, classic white carnations',
      colorAtmosphere:
        'deep forest green and charcoal with ivory white accents, classic and authoritative',
      arrangementShape:
        'structured formal arrangement with clear architectural lines and precise proportions',
      packaging:
        'wrapped in forest green matte paper with a thin charcoal grey grosgrain ribbon, classic and professional',
      mood: 'ambitious, timeless, authoritative, classical, refined',
    },
    recommendedBouquets: [
      {
        id: 'capricorn-earth-ambition',
        name: 'Ambition & Tradition',
        description:
          'White camellias, ivy, and forest-toned roses in a structured classical arrangement — achievement in floral form.',
        flowers: ['White Camellia', 'Forest Ivy', 'White Rose', 'Carnation'],
        colors: ['Ivory White', 'Forest Green', 'Charcoal', 'Deep Brown'],
        price: 205,
        image: '/assets/bouquet-4.jpg',
        occasion: 'Career Achievement, Tradition, Respect',
        meaning: 'Honours ambition, discipline, and lasting success',
        specialFeatures: ['Architectural structure', 'Timeless colour palette', 'Professional elegance'],
      },
    ],
    compatibility: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    luckyNumbers: [4, 8, 13, 22],
    gemstone: 'Garnet',
  },

  // ── AQUARIUS ─────────────────────────────────────────────────────────────
  {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    element: 'air',
    modality: 'fixed',
    dates: 'January 20 – February 18',
    rulingPlanet: 'Uranus',
    traits: ['innovative', 'independent', 'humanitarian', 'eccentric', 'visionary', 'progressive'],
    colors: ['#1ABC9C', '#3498DB', '#9B59B6', '#ECF0F1'],
    colorNames: ['Electric Teal', 'Bright Blue', 'Violet', 'Silver White'],
    flowers: ['orchid', 'bird of paradise', 'snowdrop', 'gladiolus', 'anthurium', 'protea'],
    personality:
      'Visionary, eccentric, and years ahead of everyone else — Aquarius is the rebel genius of the zodiac. Ruled by Uranus, the planet of revolution, you see the world as it could be rather than as it is. Your flowers must be unusual, your colours must be electric, and the whole arrangement should feel like something from 2050.',
    bouquetStyle:
      'Avant-garde, unconventional arrangements with electric teals, violets, and architectural exotic flowers',
    aiPromptDetails: {
      flowers:
        'electric blue tropical agapanthus, teal-violet anthuriums with waxy sculptural bracts, silver-white proteas, pale snowdrops, architectural steel-blue thistles',
      colorAtmosphere:
        'electric teal and bright cobalt blue fusing with violet and silver white, futuristic and bold',
      arrangementShape:
        'avant-garde architectural arrangement with geometric angles and unexpected negative space',
      packaging:
        'wrapped in metallic silver paper with an electric blue holographic ribbon, futuristic and striking',
      mood: 'innovative, visionary, eccentric, progressive, free',
    },
    recommendedBouquets: [
      {
        id: 'aquarius-air-innovation',
        name: 'Innovation & Freedom',
        description:
          'Electric agapanthus, teal anthuriums, and silver proteas — an avant-garde arrangement as original as Aquarius.',
        flowers: ['Blue Agapanthus', 'Teal Anthurium', 'Silver Protea', 'Snowdrop'],
        colors: ['Electric Teal', 'Bright Blue', 'Violet', 'Silver White'],
        price: 275,
        image: '/assets/bouquet-5.jpg',
        occasion: 'Innovation, Friendship, Independence',
        meaning: 'Celebrates originality, progress, and visionary thinking',
        specialFeatures: ['Avant-garde structure', 'Electric colour palette', 'Architecturally unique'],
      },
    ],
    compatibility: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    luckyNumbers: [4, 7, 11, 22, 29],
    gemstone: 'Amethyst',
  },

  // ── PISCES ───────────────────────────────────────────────────────────────
  {
    id: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    element: 'water',
    modality: 'mutable',
    dates: 'February 19 – March 20',
    rulingPlanet: 'Neptune',
    traits: ['dreamy', 'empathetic', 'artistic', 'intuitive', 'spiritual', 'compassionate'],
    colors: ['#AED6F1', '#D7BDE2', '#A2D9CE', '#F9E4B7'],
    colorNames: ['Dream Blue', 'Soft Violet', 'Sea Green', 'Warm Coral'],
    flowers: ['water lily', 'jasmine', 'violet', 'lilac', 'peony', 'forget-me-not'],
    personality:
      'Dreamy, empathetic, and swimming in a world of feelings — Pisces is the mystic poet of the zodiac. Ruled by Neptune, the planet of illusion and spirituality, you feel the invisible threads connecting all living things. Your bouquet should feel like a dream you don\'t want to wake from: soft violets, sea greens, and the faint scent of jasmine at dusk.',
    bouquetStyle:
      'Ethereal, romantic, flowing arrangements in soft sea green, dreamy lavender, and watercolour purples',
    aiPromptDetails: {
      flowers:
        'soft lilac wisteria cascades, pale blue forget-me-nots, blush pink ranunculus, lavender sea hollies, white jasmine stars with trailing vines',
      colorAtmosphere:
        'dreamy sea green and soft violet bleeding into lavender and pale coral, watercolour and ethereal',
      arrangementShape:
        'loose flowing bouquet with cascading elements and trailing vines, organic and dreamlike',
      packaging:
        'loosely wrapped in translucent sea-green tissue with a wide soft violet chiffon ribbon, dreamy and romantic',
      mood: 'dreamy, ethereal, empathetic, romantic, spiritual',
    },
    recommendedBouquets: [
      {
        id: 'pisces-water-dreams',
        name: 'Dreams & Intuition',
        description:
          'Wisteria, forget-me-nots, ranunculus, and jasmine in a flowing dream-like arrangement — pure Piscean magic.',
        flowers: ['Wisteria', 'Forget-me-not', 'Ranunculus', 'White Jasmine'],
        colors: ['Dream Blue', 'Soft Violet', 'Sea Green', 'Blush Pink'],
        price: 225,
        image: '/assets/bouquet-6.jpg',
        occasion: 'Creativity, Spiritual Connection, Self-Care',
        meaning: 'Enhances intuition, creativity, and emotional depth',
        specialFeatures: ['Ethereal flowing silhouette', 'Watercolour palette', 'Dreamy romance'],
      },
    ],
    compatibility: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    luckyNumbers: [3, 7, 12, 16, 25],
    gemstone: 'Aquamarine',
  },
];

// ── Helper functions ─────────────────────────────────────────────────────────

export const getZodiacSign = (month: number, day: number): ZodiacSign | null => {
  const dateRanges: Record<string, { start: [number, number]; end: [number, number] }> = {
    aries:       { start: [3, 21], end: [4, 19] },
    taurus:      { start: [4, 20], end: [5, 20] },
    gemini:      { start: [5, 21], end: [6, 20] },
    cancer:      { start: [6, 21], end: [7, 22] },
    leo:         { start: [7, 23], end: [8, 22] },
    virgo:       { start: [8, 23], end: [9, 22] },
    libra:       { start: [9, 23], end: [10, 22] },
    scorpio:     { start: [10, 23], end: [11, 21] },
    sagittarius: { start: [11, 22], end: [12, 21] },
    capricorn:   { start: [12, 22], end: [1, 19] },
    aquarius:    { start: [1, 20], end: [2, 18] },
    pisces:      { start: [2, 19], end: [3, 20] },
  };

  for (const sign of zodiacSigns) {
    const range = dateRanges[sign.id];
    if (!range) continue;
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;

    if (startMonth > endMonth) {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      )
        return sign;
    } else {
      if (month === startMonth && month === endMonth) {
        if (day >= startDay && day <= endDay) return sign;
      } else if (month === startMonth && day >= startDay) {
        return sign;
      } else if (month === endMonth && day <= endDay) {
        return sign;
      } else if (month > startMonth && month < endMonth) {
        return sign;
      }
    }
  }
  return null;
};

export const getElementColors = (element: string): string[] => {
  const map: Record<string, string[]> = {
    fire:  ['#FF6B35', '#F7931E', '#FFD700', '#DC143C'],
    earth: ['#8B4513', '#228B22', '#DEB887', '#A0522D'],
    air:   ['#87CEEB', '#DDA0DD', '#F0F8FF', '#E6E6FA'],
    water: ['#4682B4', '#5F9EA0', '#20B2AA', '#008B8B'],
  };
  return map[element] || ['#666666'];
};

export const getCompatibilitySigns = (sign: ZodiacSign): ZodiacSign[] =>
  zodiacSigns.filter((z) => sign.compatibility.includes(z.name));
