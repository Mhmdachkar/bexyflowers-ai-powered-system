/**
 * Advanced Prompt Engine for AI Image Generation
 * 
 * Features:
 * - Negative prompts for better results
 * - Exact flower arrangement positions
 * - Style presets (romantic, minimal, luxury)
 * - Prompt templates for common combinations
 * - Variation generation
 */

import { EnhancedFlower } from '@/data/flowers';

// Flower-specific visual characteristics for accurate AI rendering
const FLOWER_VISUALS: Record<string, {
  petalStyle: string;
  bloomShape: string;
  texture: string;
  arrangement: string;
}> = {
  'roses': {
    petalStyle: 'layered spiral petals with velvety soft texture',
    bloomShape: 'classic cup-shaped bloom with tightly packed petals unfurling from center',
    texture: 'smooth velvety petals with delicate edges',
    arrangement: 'elegant long stems with glossy dark green leaves'
  },
  'tulips': {
    petalStyle: 'smooth oval petals with pointed tips',
    bloomShape: 'elegant cup-shaped or goblet bloom',
    texture: 'satiny smooth waxy petals',
    arrangement: 'single straight stem with broad lance-shaped leaves'
  },
  'peonies': {
    petalStyle: 'densely packed ruffled petals in layers',
    bloomShape: 'large lush ball-shaped fluffy bloom',
    texture: 'soft delicate paper-thin petals with romantic ruffles',
    arrangement: 'sturdy stems with deeply lobed dark green foliage'
  },
  'chrysanthemum': {
    petalStyle: 'numerous thin elongated ray petals',
    bloomShape: 'pompon or daisy-like radial bloom',
    texture: 'firm slightly waxy petals',
    arrangement: 'branching stems with aromatic serrated leaves'
  },
  'gypsum': {
    petalStyle: 'tiny delicate star-shaped florets',
    bloomShape: 'cloud-like clusters of miniature blooms',
    texture: 'airy light feathery texture',
    arrangement: 'wispy branching sprays perfect as filler'
  },
  'daisies': {
    petalStyle: 'simple white ray petals around yellow center',
    bloomShape: 'classic flat circular bloom with prominent center disc',
    texture: 'crisp fresh petals',
    arrangement: 'cheerful upright stems'
  },
  'sunflower': {
    petalStyle: 'large golden yellow ray petals',
    bloomShape: 'large circular head with dark brown seed center',
    texture: 'slightly rough textured petals',
    arrangement: 'tall thick sturdy stems with large leaves'
  },
  'lily': {
    petalStyle: 'six elegant recurved petals with spots or plain',
    bloomShape: 'trumpet or star-shaped dramatic bloom',
    texture: 'smooth waxy petals often with speckles',
    arrangement: 'tall stems with multiple blooms and lance leaves'
  },
  'orchid': {
    petalStyle: 'exotic bilateral symmetry with distinctive lip petal',
    bloomShape: 'intricate exotic bloom with unique labellum',
    texture: 'waxy smooth almost artificial-looking perfection',
    arrangement: 'arching sprays of multiple blooms'
  },
  'hydrangea': {
    petalStyle: 'clusters of four-petaled small florets',
    bloomShape: 'large round mophead or lacecap cluster',
    texture: 'papery delicate florets',
    arrangement: 'dense rounded flower heads on sturdy stems'
  },
  'gerbera': {
    petalStyle: 'bold daisy-like ray petals in vibrant colors',
    bloomShape: 'large flat circular bloom with contrasting center',
    texture: 'smooth velvety petals',
    arrangement: 'single long straight leafless stems'
  },
  'lavender': {
    petalStyle: 'tiny tubular flowers in dense spikes',
    bloomShape: 'slender elongated flower spikes',
    texture: 'soft aromatic fuzzy texture',
    arrangement: 'multiple stems with narrow silvery-green leaves'
  },
  'carnation': {
    petalStyle: 'fringed ruffled petals with serrated edges',
    bloomShape: 'rounded fluffy bloom with layered petals',
    texture: 'slightly stiff clove-scented petals',
    arrangement: 'sturdy stems with narrow gray-green leaves'
  }
};

// Color-specific descriptions for accurate rendering
const COLOR_VISUALS: Record<string, string> = {
  'red': 'deep crimson red, rich ruby color',
  'white': 'pure pristine white, snow-white, ivory cream',
  'pink': 'soft blush pink, delicate rose pink',
  'yellow': 'bright sunny yellow, golden yellow',
  'blue': 'serene sky blue, soft periwinkle blue',
  'peach': 'warm peach, soft apricot orange',
  'purple': 'rich royal purple, deep violet',
  'orange': 'vibrant tangerine orange, warm sunset orange',
  'fushia': 'vivid hot pink fuchsia, magenta',
  'terracotta': 'warm earthy terracotta, burnt sienna',
  'dark blue': 'deep navy blue, midnight blue'
};

// Style Presets
export type StylePreset = 'classic' | 'romantic' | 'minimal' | 'luxury' | 'modern' | 'vintage';

export interface StylePresetConfig {
  id: StylePreset;
  name: string;
  description: string;
  icon: string;
  promptModifiers: string;
  colorPalette: string;
  lightingStyle: string;
  backgroundStyle: string;
}

export const STYLE_PRESETS: Record<StylePreset, StylePresetConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless elegance',
    icon: '🎩',
    promptModifiers: 'classic elegant timeless traditional refined sophisticated',
    colorPalette: 'rich deep colors, traditional palette',
    lightingStyle: 'soft warm studio lighting, gentle shadows',
    backgroundStyle: 'clean white seamless background'
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    description: 'Soft & dreamy',
    icon: '💕',
    promptModifiers: 'romantic dreamy soft ethereal delicate feminine',
    colorPalette: 'soft pastel colors, blush pink, cream white, dusty rose',
    lightingStyle: 'soft diffused golden hour lighting, warm glow, bokeh effect',
    backgroundStyle: 'soft blurred pink gradient background, dreamy atmosphere'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean & simple',
    icon: '◻️',
    promptModifiers: 'minimalist clean simple modern sleek understated',
    colorPalette: 'monochromatic, white, cream, single accent color',
    lightingStyle: 'bright even lighting, no harsh shadows, high key',
    backgroundStyle: 'pure white background, negative space, isolated'
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'Opulent & rich',
    icon: '👑',
    promptModifiers: 'luxurious opulent premium high-end exclusive prestigious',
    colorPalette: 'rich jewel tones, gold accents, deep burgundy, emerald',
    lightingStyle: 'dramatic studio lighting, rim light, golden highlights',
    backgroundStyle: 'dark elegant background, subtle texture, vignette'
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary style',
    icon: '🔷',
    promptModifiers: 'modern contemporary trendy stylish fresh innovative',
    colorPalette: 'bold contrasting colors, geometric patterns',
    lightingStyle: 'sharp directional lighting, strong contrast',
    backgroundStyle: 'gradient background, abstract elements'
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    description: 'Nostalgic charm',
    icon: '📜',
    promptModifiers: 'vintage retro nostalgic antique classic old-world charm',
    colorPalette: 'muted sepia tones, faded pastels, warm browns',
    lightingStyle: 'soft warm lighting, film grain effect, slight vignette',
    backgroundStyle: 'textured paper background, aged look'
  }
};

// Negative Prompts - things to avoid in generation
// Optimized for Flux model with Flux-specific exclusions
export const NEGATIVE_PROMPTS = {
  // Flux-specific general negatives (based on Flux model best practices)
  general: [
    'lowres', 'bad anatomy', 'bad hands', 'text', 'error', 'missing fingers',
    'extra digit', 'fewer digits', 'cropped', 'worst quality', 'low quality',
    'normal quality', 'jpeg artifacts', 'signature', 'watermark', 'username',
    'blurry', 'bad feet', 'blur', 'bad proportions', 'gross proportions',
    'missing arms', 'missing legs', 'extra arms', 'extra legs', 'fused fingers',
    'too many fingers', 'long neck', 'duplicate', 'morbid', 'mutilated',
    'out of frame', 'ugly', 'bad anatomy', 'bad proportions', 'deformed',
    'disfigured', 'mutated', 'malformed', 'extra limbs', 'missing limbs',
    'floating limbs', 'disconnected limbs', 'malformed hands', 'out of focus',
    'long body', 'long neck', 'jpeg artifacts', 'compression artifacts',
    'dark shadows', 'overexposed', 'underexposed', 'noise', 'grain'
  ],
  // Flux-specific style exclusions
  style: [
    '3d render', '3d model', 'illustration', 'cartoon', 'anime', 'manga',
    'painting', 'drawing', 'sketch', 'digital art', 'vector art', 'cg art',
    'unreal engine', 'blender', 'maya', '3ds max', 'rendered', 'cgi',
    'computer graphics', 'synthetic', 'artificial', 'fake', 'unrealistic'
  ],
  flowers: [
    'wilted flowers', 'dead flowers', 'brown petals', 'damaged petals',
    'messy arrangement', 'scattered petals', 'drooping stems',
    'yellow leaves', 'brown leaves', 'insects', 'bugs',
    'artificial flowers', 'fake flowers', 'plastic flowers', 'silk flowers',
    'eternal flowers', 'preserved flowers', 'foam flowers', 'paper flowers',
    'synthetic flowers', 'fabric flowers', 'dried flowers', 'wax flowers',
    'unrealistic flowers', 'cartoon flowers', '3d rendered flowers',
    'too few flowers', 'sparse arrangement', 'empty spaces', 'gaps in arrangement',
    'incomplete bouquet', 'missing flowers', 'wrong flower count'
  ],
  packaging: [
    'torn paper', 'damaged box', 'dirty packaging', 'wrinkled ribbon',
    'cheap materials', 'plastic wrap visible', 'tape visible',
    'empty box', 'box without flowers', 'closed box', 'box lid on',
    'cardboard texture visible', 'unfinished box edges', 'dented box',
    'loose ribbon', 'ribbon hanging down', 'untied ribbon', 'messy ribbon',
    'ribbon at bottom', 'ribbon on floor', 'fallen ribbon', 'draped ribbon',
    'wrong box shape', 'incorrect packaging', 'mismatched packaging'
  ],
  composition: [
    'cluttered', 'busy background', 'distracting elements',
    'multiple products', 'hands visible', 'people visible',
    'wrong background', 'colored background', 'patterned background'
  ]
};

// Build negative prompt string optimized for Flux model
export function buildNegativePrompt(categories: (keyof typeof NEGATIVE_PROMPTS)[] = ['general', 'style', 'flowers', 'packaging', 'composition']): string {
  const negatives: string[] = [];
  categories.forEach(cat => {
    negatives.push(...NEGATIVE_PROMPTS[cat]);
  });
  // Flux model responds well to comma-separated negative prompts
  return negatives.join(', ');
}

// Flower Arrangement Positions
export interface FlowerPosition {
  position: 'center' | 'outer' | 'accent' | 'filler';
  description: string;
}

export function getFlowerArrangementPositions(
  flowers: Array<{ flower: EnhancedFlower; quantity: number }>,
  packageType: 'box' | 'wrap',
  boxShape?: string
): string {
  if (flowers.length === 0) return '';

  const totalFlowers = flowers.reduce((sum, f) => sum + f.quantity, 0);
  const sortedFlowers = [...flowers].sort((a, b) => b.quantity - a.quantity);
  
  const positions: string[] = [];
  
  if (packageType === 'box') {
    // Box arrangement - concentric circles from center
    const shape = boxShape || 'square';
    
    if (shape === 'round' || shape === 'heart') {
      // Circular/heart arrangement
      sortedFlowers.forEach((f, index) => {
        if (index === 0) {
          // Most prominent flower in center
          positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} arranged prominently in the center cluster`);
        } else if (index === 1) {
          // Second most in inner ring
          positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} forming an inner ring around the center`);
        } else {
          // Others in outer ring
          positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} placed in the outer ring`);
        }
      });
    } else {
      // Square arrangement - grid-like
      sortedFlowers.forEach((f, index) => {
        if (index === 0) {
          positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} as the focal point in the center`);
        } else if (index === 1) {
          positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} positioned at the four corners`);
        } else {
          positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} filling the spaces between`);
        }
      });
    }
  } else {
    // Wrap arrangement - cascading bouquet
    sortedFlowers.forEach((f, index) => {
      if (index === 0) {
        positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} as the main focal flowers in the front center`);
      } else if (index === 1) {
        positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} cascading around the sides`);
      } else {
        positions.push(`${f.quantity} ${f.flower.colorName} ${f.flower.family} as accent flowers throughout`);
      }
    });
  }

  return positions.join(', ');
}

// Prompt Templates for Common Combinations
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'occasion' | 'style' | 'season';
  basePrompt: string;
  suggestedFlowers: string[];
  suggestedColors: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'valentines',
    name: "Valentine's Day",
    description: 'Romantic red roses arrangement',
    category: 'occasion',
    basePrompt: 'romantic Valentine\'s Day bouquet, passionate red color scheme, heart-shaped arrangement, love and romance theme',
    suggestedFlowers: ['rose-red', 'rose-pink', 'tulip-red'],
    suggestedColors: ['red', 'pink']
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Elegant bridal arrangement',
    category: 'occasion',
    basePrompt: 'elegant bridal wedding bouquet, pure white and cream colors, sophisticated and graceful, timeless beauty',
    suggestedFlowers: ['rose-white', 'peony-white', 'orchid-white', 'lily-white'],
    suggestedColors: ['white', 'gold']
  },
  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Colorful celebration bouquet',
    category: 'occasion',
    basePrompt: 'cheerful birthday celebration bouquet, vibrant mixed colors, joyful and festive arrangement',
    suggestedFlowers: ['gerbera-yellow', 'sunflower-big', 'tulip-yellow', 'rose-pink'],
    suggestedColors: ['pink', 'gold']
  },
  {
    id: 'sympathy',
    name: 'Sympathy',
    description: 'Peaceful memorial arrangement',
    category: 'occasion',
    basePrompt: 'peaceful sympathy arrangement, serene white and soft colors, respectful and comforting',
    suggestedFlowers: ['lily-white', 'rose-white', 'chrys-white', 'carnation-white'],
    suggestedColors: ['white', 'blue']
  },
  {
    id: 'spring-garden',
    name: 'Spring Garden',
    description: 'Fresh spring blooms',
    category: 'season',
    basePrompt: 'fresh spring garden bouquet, pastel colors, new growth and renewal theme, light and airy',
    suggestedFlowers: ['tulip-pink', 'tulip-yellow', 'daisy-white', 'lavender'],
    suggestedColors: ['pink', 'white']
  },
  {
    id: 'summer-sunshine',
    name: 'Summer Sunshine',
    description: 'Bright summer arrangement',
    category: 'season',
    basePrompt: 'bright summer sunshine bouquet, warm golden yellows and oranges, radiant and cheerful',
    suggestedFlowers: ['sunflower-big', 'gerbera-yellow', 'gerbera-orange', 'rose-yellow'],
    suggestedColors: ['gold', 'white']
  },
  {
    id: 'autumn-harvest',
    name: 'Autumn Harvest',
    description: 'Warm fall colors',
    category: 'season',
    basePrompt: 'warm autumn harvest bouquet, rich orange and burgundy tones, cozy fall atmosphere',
    suggestedFlowers: ['chrys-orange', 'rose-peach', 'gerbera-orange', 'carnation-red'],
    suggestedColors: ['gold', 'red']
  },
  {
    id: 'winter-elegance',
    name: 'Winter Elegance',
    description: 'Sophisticated winter arrangement',
    category: 'season',
    basePrompt: 'elegant winter bouquet, crisp whites and deep reds, sophisticated holiday theme',
    suggestedFlowers: ['rose-red', 'rose-white', 'orchid-white', 'lily-white'],
    suggestedColors: ['white', 'red']
  }
];

// Generate variation prompts
export function generateVariationPrompts(basePrompt: string, count: number = 3): string[] {
  const variations: string[] = [];
  
  const variationModifiers = [
    { angle: 'slightly different camera angle, unique perspective', lighting: 'warmer lighting tone' },
    { angle: 'alternative composition, fresh arrangement', lighting: 'cooler lighting tone' },
    { angle: 'creative framing, artistic view', lighting: 'dramatic lighting contrast' },
    { angle: 'close-up detail shot, intimate view', lighting: 'soft diffused lighting' },
    { angle: 'wider shot showing full arrangement', lighting: 'natural daylight simulation' }
  ];

  for (let i = 0; i < Math.min(count, variationModifiers.length); i++) {
    const mod = variationModifiers[i];
    variations.push(`${basePrompt}, ${mod.angle}, ${mod.lighting}`);
  }

  return variations;
}

// Main Prompt Builder
export interface PromptBuilderOptions {
  packageType: 'box' | 'wrap';
  boxShape?: string;
  size: string;
  color: string;
  flowers: Array<{ flower: EnhancedFlower; quantity: number }>;
  withGlitter: boolean;
  withRibbon?: boolean;
  accessories: string[];
  stylePreset?: StylePreset;
  template?: string;
  includeNegative?: boolean;
  seed?: number; // Random seed for generating variations - each seed produces different image
  letterText?: string; // For letter-shaped bouquets
  numberText?: string; // For number-shaped bouquets
  // New arrangement preferences for more accurate AI generation
  arrangementStyle?: 'dome' | 'flat' | 'cascading';
  densityPreference?: 'tight' | 'medium' | 'airy';
  bloomStage?: 'full' | 'semi' | 'mixed';
  flowerPositions?: Record<string, 'center' | 'edges' | 'scattered' | 'accent'>;
}

export interface BuiltPrompt {
  positive: string;
  negative: string;
  preview: string; // Human-readable preview
  hash: string; // For caching
}

// Generate hash for caching - includes seed for unique variations
function generatePromptHash(options: PromptBuilderOptions): string {
  const hashData = JSON.stringify({
    packageType: options.packageType,
    boxShape: options.boxShape,
    size: options.size,
    color: options.color,
    flowers: options.flowers.map(f => ({ id: f.flower.id, qty: f.quantity })),
    withGlitter: options.withGlitter,
    withRibbon: options.withRibbon,
    accessories: options.accessories.sort(),
    stylePreset: options.stylePreset,
    template: options.template,
    letterText: options.letterText,
    numberText: options.numberText,
    seed: options.seed // Include seed so different seeds = different hashes
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < hashData.length; i++) {
    const char = hashData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function buildAdvancedPrompt(options: PromptBuilderOptions): BuiltPrompt {
  const {
    packageType,
    boxShape,
    size,
    color,
    flowers,
    withGlitter,
    withRibbon = false,
    accessories,
    includeNegative = true,
    seed = Date.now(),
    arrangementStyle = 'dome',
    densityPreference = 'tight',
    bloomStage = 'full',
    flowerPositions = {}
  } = options;

  const totalFlowers = flowers.reduce((sum, f) => sum + f.quantity, 0);
  const isMixFlowers = flowers.length > 1;
  
  // ========================================
  // SIMPLIFIED PROMPT BUILDER FOR GPT IMAGE
  // ========================================
  // GPT Image models work better with natural, simple prompts
  // Avoid weighted keywords - they don't work with GPT models
  // Keep prompts concise (under 600 chars for best results)
  
  return buildSimplifiedPrompt(options, totalFlowers, isMixFlowers);
  
  // Generate variation phrases based on seed to ensure each generation is unique
  // This prevents API-side caching from returning identical images
  const variationPhrases = [
    'unique artistic composition',
    'distinctive arrangement style', 
    'creative floral design',
    'original presentation',
    'fresh artistic interpretation',
    'elegant variation',
    'beautiful unique styling',
    'distinctive composition'
  ];
  const variationIndex = seed % variationPhrases.length;
  const variationPhrase = variationPhrases[variationIndex];
  
  // Build DETAILED flower descriptions with exact quantities and visual characteristics
  const sortedFlowers = [...flowers].sort((a, b) => b.quantity - a.quantity);
  const flowerDescriptions: string[] = [];
  
  // Track unique colors and flower types for strict enforcement
  const uniqueColors = new Set<string>();
  const uniqueFlowerTypes = new Set<string>();
  const isMixAndMatch = flowers.length > 1;
  
  // Position descriptions for clarity
  const positionDescriptions: Record<string, string> = {
    'center': 'placed prominently in the CENTER of the arrangement as the main focal point',
    'edges': 'arranged around the OUTER EDGES forming a beautiful border ring',
    'scattered': 'distributed EVENLY THROUGHOUT the entire arrangement',
    'accent': 'placed as small ACCENT TOUCHES between other flowers'
  };
  
  sortedFlowers.forEach(f => {
    const colorName = f.flower.colorName.toLowerCase();
    const flowerFamily = f.flower.family.toLowerCase();
    const qty = f.quantity;
    
    // Track this color and flower type
    uniqueColors.add(colorName);
    uniqueFlowerTypes.add(flowerFamily);
    
    // Get detailed visual for this flower type
    const visual = FLOWER_VISUALS[flowerFamily];
    const colorVisual = COLOR_VISUALS[colorName] || colorName;
    
    // Get position for this flower (if specified)
    const position = flowerPositions[f.flower.id];
    const positionText = position ? `, ${positionDescriptions[position]}` : '';
    
    if (visual && qty > 0) {
      // Include bloom shape, petal style, AND position for mix flowers
      // STRICT: Use weighted keywords for Flux model emphasis
      // Flux format: (keyword:weight) where weight > 1.0 increases emphasis
      if (isMixFlowers && position) {
        flowerDescriptions.push(`(exactly ${qty} ${colorVisual} ${flowerFamily}${positionText}:1.4), ${visual.bloomShape}, ${visual.petalStyle}`);
      } else {
        flowerDescriptions.push(`(exactly ${qty} ${colorVisual} ${flowerFamily}:1.3), ${visual.bloomShape}, ${visual.petalStyle}`);
      }
    } else if (qty > 0) {
      // Use weighted emphasis for quantity accuracy
      if (isMixFlowers && position) {
        flowerDescriptions.push(`(exactly ${qty} ${colorVisual} ${flowerFamily}${positionText}:1.4)`);
      } else {
        flowerDescriptions.push(`(exactly ${qty} ${colorVisual} ${flowerFamily}:1.3)`);
      }
    }
  });
  
  const flowersText = flowerDescriptions.join(', ');
  
  // Build strict color enforcement text
  const colorList = Array.from(uniqueColors);
  const flowerTypeList = Array.from(uniqueFlowerTypes);
  const isSingleColor = colorList.length === 1;
  
  // Enhanced enforcement for mix & match - MUST include ALL selected flower types
  // Use weighted keywords for Flux model to emphasize importance
  let colorEnforcement: string;
  if (isMixAndMatch) {
    // MIX & MATCH: Strictly enforce ALL selected flower types and colors
    const flowerBreakdown = sortedFlowers.map(f => {
      const pos = flowerPositions[f.flower.id];
      const posText = pos ? ` (${pos})` : '';
      return `${f.quantity} ${f.flower.colorName.toLowerCase()} ${f.flower.family.toLowerCase()}${posText}`;
    }).join(', ');
    colorEnforcement = `(CRITICAL MIX & MATCH: arrangement MUST contain ALL of these flowers visible: ${flowerBreakdown}:1.4), (each flower type MUST be clearly visible and distinguishable:1.3), (do NOT substitute or omit any flower type:1.3)`;
  } else if (isSingleColor) {
    // Use weighted emphasis for single color enforcement
    const selectedColor = colorList[0];
    colorEnforcement = `(ALL flowers must be exactly ${selectedColor} color only:1.4), (no other colors:1.3), (uniform ${selectedColor} color throughout:1.3), (no pink, no white, no variations:1.2)`;
  } else {
    colorEnforcement = `(flowers in these exact colors only: ${colorList.join(', ')}:1.3), (no other colors:1.2)`;
  }
  
  // Build arrangement style description
  const arrangementStyleDescriptions: Record<string, string> = {
    'dome': 'flowers arranged in a beautiful rounded dome shape rising above the container',
    'flat': 'flowers arranged with an even flat top surface at uniform height',
    'cascading': 'flowers flowing naturally in a cascading waterfall effect'
  };
  const arrangementDesc = arrangementStyleDescriptions[arrangementStyle] || arrangementStyleDescriptions['dome'];
  
  // Build density description
  const densityDescriptions: Record<string, string> = {
    'tight': 'very tightly packed with no gaps or spaces between flowers',
    'medium': 'balanced spacing with flowers touching but not crowded',
    'airy': 'loose and airy arrangement with visible space between flowers'
  };
  const densityDesc = densityDescriptions[densityPreference] || densityDescriptions['tight'];
  
  // Build bloom stage description
  const bloomDescriptions: Record<string, string> = {
    'full': 'all flowers fully open and bloomed showing complete petals',
    'semi': 'flowers partially opened in semi-bloom stage',
    'mixed': 'variety of bloom stages from buds to fully open'
  };
  const bloomDesc = bloomDescriptions[bloomStage] || bloomDescriptions['full'];
  
  // Build PRECISE prompt focused on user inputs only
  // Pollinations Flux model works best with clear, structured descriptions
  // Flux prompt structure: [main subject], [composition], [packaging], [quality], [style], [technical]
  const parts: string[] = [];
  
  // Start with Flux quality boosters (most important first for Flux)
  parts.push(`masterpiece, best quality, highly detailed`);
  
  if (packageType === 'box') {
    const shape = boxShape || 'square';
    
    // ENHANCED BOX DESCRIPTIONS for realistic generation
    // Box material and finish descriptions - premium leather-like finish
    const boxMaterials: Record<string, string> = {
      'black': 'matte black premium leather-textured',
      'white': 'elegant white smooth matte finish',
      'gold': 'luxurious champagne gold satin finish',
      'pink': 'soft blush pink leather-textured',
      'blue': 'navy blue premium leather-textured',
      'red': 'deep burgundy velvet-textured'
    };
    const boxMaterial = boxMaterials[color.toLowerCase()] || `${color} premium`;
    
    // Box shape specific descriptions - optimized for 3/4 angle view
    const shapeDescriptions: Record<string, { shape: string; interior: string; arrangement: string; viewAngle: string }> = {
      'round': {
        shape: 'perfectly circular cylinder hatbox',
        interior: 'round opening',
        arrangement: 'flowers arranged in a beautiful dome shape overflowing slightly above the box rim, tightly packed roses filling the entire circular space',
        viewAngle: 'elegant three-quarter angle view from slightly above, showing both the flower dome and the curved box side with Bexy Flowers logo'
      },
      'square': {
        shape: 'square luxury gift box with sharp clean edges',
        interior: 'square opening',
        arrangement: 'flowers arranged in neat rows creating a lush dome shape rising above the box edges, tightly packed grid pattern',
        viewAngle: 'elegant three-quarter angle view from slightly above, showing both the flower arrangement and box corner with Bexy Flowers logo'
      },
      'heart': {
        shape: 'romantic heart-shaped gift box with smooth curved edges',
        interior: 'heart-shaped opening',
        arrangement: 'flowers densely packed following the heart contour, roses standing upright filling the entire heart shape with blooms facing upward',
        viewAngle: 'elegant three-quarter angle view from slightly above, showing the heart shape clearly with flowers and the curved box side with Bexy Flowers logo'
      },
      'rectangle': {
        shape: 'elegant rectangular gift box',
        interior: 'rectangular opening',
        arrangement: 'flowers arranged in rows along the length creating a dome shape, tightly packed',
        viewAngle: 'elegant three-quarter angle view from slightly above, showing both the flower arrangement and box side with Bexy Flowers logo'
      }
    };
    const shapeConfig = shapeDescriptions[shape.toLowerCase()] || shapeDescriptions['square'];
    
    // Size descriptions for boxes
    const sizeDescriptions: Record<string, string> = {
      'small': 'compact 15cm',
      'medium': 'standard 25cm',
      'large': 'grand 35cm'
    };
    const sizeDesc = sizeDescriptions[size.toLowerCase()] || 'medium-sized';
    
    // Build strict shape enforcement for boxes
    const allBoxShapes = ['round', 'square', 'heart', 'rectangle', 'circular', 'cylinder'];
    const excludedShapes = allBoxShapes.filter(s => s !== shape.toLowerCase() && !shapeConfig.shape.toLowerCase().includes(s));
    const shapeEnforcement = `IMPORTANT: box must be exactly ${shape} shape only, not ${excludedShapes.join(', not ')}`;
    
    // Build detailed box prompt - 3/4 angle view like reference images
    // CRITICAL: Emphasize REAL FRESH flowers, not artificial
    // Use weighted keywords for Flux model emphasis
    parts.push(`ultra realistic professional florist product photo`);
    parts.push(`${sizeDesc} ${shapeConfig.shape} made of ${boxMaterial} material`);
    parts.push(`(${shapeEnforcement}:1.3)`);
    parts.push(`luxury flower box arrangement, lid removed showing interior`);
    
    // STRONG emphasis on REAL FRESH flowers with weighted keywords
    parts.push(`(${totalFlowers} REAL fresh-cut natural flowers from a florist shop: ${flowersText}:1.4)`);
    parts.push(`(flowers must look 100% real and natural, freshly cut from garden:1.3)`);
    parts.push(`natural organic flower petals with realistic texture and subtle imperfections`);
    parts.push(`visible natural petal veins, soft dewy appearance, lifelike colors`);
    parts.push(`${colorEnforcement}`);
    parts.push(`${shapeConfig.arrangement}`);
    
    // Add user-specified arrangement preferences for better accuracy
    parts.push(`(${arrangementDesc}:1.3)`);
    parts.push(`(${densityDesc}:1.3)`);
    parts.push(`(${bloomDesc}:1.2)`);
    
    parts.push(`(all ${totalFlowers} flowers clearly visible:1.3), (filling the entire box:1.2)`);
    parts.push(`flower heads facing upward showing beautiful blooms`);
    parts.push(`${shapeConfig.viewAngle}`);
    
    // Add ribbon wrap if selected - PRECISE placement instructions
    if (withRibbon) {
      const ribbonColors: Record<string, string> = {
        'red': 'red satin',
        'pink': 'soft pink satin',
        'white': 'white satin',
        'purple': 'lavender satin',
        'blue': 'navy blue satin',
        'yellow': 'gold satin',
        'orange': 'coral satin',
        'peach': 'champagne satin',
        'burgundy': 'deep burgundy satin',
        'cream': 'ivory satin',
        'lavender': 'lavender satin',
        'coral': 'coral satin'
      };
      const firstFlowerColor = flowers[0]?.flower.colorName.toLowerCase() || 'gold';
      const ribbonColor = ribbonColors[firstFlowerColor] || 'satin';
      // PRECISE ribbon placement - wrapped AROUND middle, bow on FRONT
      parts.push(`IMPORTANT: elegant ${ribbonColor} ribbon wrapped tightly around the MIDDLE circumference of the box exterior`);
      parts.push(`ribbon bow tied neatly on the FRONT CENTER of the box, NOT hanging loose, NOT at bottom`);
      parts.push(`ribbon stays in place wrapped around box middle section`);
    }
    
    parts.push(`elegant gold "Bexy Flowers" logo printed on the box front`);
    parts.push(`box placed on clean white surface`);
    
  } else {
    // ENHANCED WRAP/BOUQUET DESCRIPTIONS - including heart shape option
    const wrapShape = boxShape || 'classic'; // boxShape can be 'heart' for wrap too
    
    const wrapMaterials: Record<string, string> = {
      'black': 'elegant matte black Korean-style wrapping paper with pleated ruffled edges',
      'white': 'crisp white tissue paper with kraft backing',
      'gold': 'champagne gold metallic wrapping paper',
      'pink': 'soft blush pink tissue paper',
      'blue': 'dusty blue kraft paper',
      'red': 'deep burgundy tissue paper'
    };
    const wrapMaterial = wrapMaterials[color.toLowerCase()] || `${color} wrapping paper`;
    
    const sizeDescriptions: Record<string, string> = {
      'small': 'petite hand-held',
      'medium': 'standard presentation',
      'large': 'grand luxury oversized'
    };
    const sizeDesc = sizeDescriptions[size.toLowerCase()] || 'elegant';
    
    // Check if heart-shaped wrap bouquet
    if (wrapShape === 'heart') {
      // Heart-shaped wrapped bouquet
      parts.push(`ultra realistic professional florist product photo`);
      parts.push(`${sizeDesc} heart-shaped flower bouquet arrangement`);
      parts.push(`IMPORTANT: bouquet must be arranged in heart shape only, not round, not oval, not traditional bouquet shape`);
      
      // STRONG emphasis on REAL FRESH flowers with weighted keywords
      parts.push(`(${totalFlowers} REAL fresh-cut natural flowers from a florist shop: ${flowersText}:1.4)`);
      parts.push(`(flowers must look 100% real and natural, freshly cut from garden:1.3)`);
      parts.push(`natural organic flower petals with realistic texture and subtle imperfections`);
      parts.push(`visible natural petal veins, soft dewy appearance, lifelike colors`);
      parts.push(`${colorEnforcement}`);
      parts.push(`(all ${totalFlowers} flowers clearly visible in the arrangement:1.3)`);
      parts.push(`(flowers arranged in a perfect heart shape when viewed from above:1.3)`);
      
      // Add user-specified arrangement preferences
      parts.push(`(${densityDesc}:1.3)`);
      parts.push(`(${bloomDesc}:1.2)`);
      
      parts.push(`roses forming a romantic heart silhouette`);
      parts.push(`wrapped in ${wrapMaterial} with decorative pleated ruffled border around the heart`);
      parts.push(`the wrapping paper forms an elegant frame around the heart-shaped flowers`);
      parts.push(`front view showing the full heart shape of the flower arrangement`);
      parts.push(`small satin ribbon with message banner across the flowers`);
      parts.push(`small gold "BEXY" brand tag on ribbon`);
    } else {
      // Classic wrapped bouquet
      parts.push(`ultra realistic professional florist product photo`);
      parts.push(`${sizeDesc} hand-tied flower bouquet`);
      parts.push(`IMPORTANT: traditional round dome-shaped bouquet, not heart-shaped, not box arrangement`);
      
      // STRONG emphasis on REAL FRESH flowers with weighted keywords
      parts.push(`(${totalFlowers} REAL fresh-cut natural flowers from a florist shop: ${flowersText}:1.4)`);
      parts.push(`(flowers must look 100% real and natural, freshly cut from garden:1.3)`);
      parts.push(`natural organic flower petals with realistic texture and subtle imperfections`);
      parts.push(`visible natural petal veins, soft dewy appearance, lifelike colors`);
      parts.push(`${colorEnforcement}`);
      parts.push(`(all ${totalFlowers} flowers clearly visible:1.3)`);
      
      // Add user-specified arrangement preferences
      parts.push(`(${arrangementDesc}:1.3)`);
      parts.push(`(${densityDesc}:1.3)`);
      parts.push(`(${bloomDesc}:1.2)`);
      
      parts.push(`flowers with focal flowers in center`);
      parts.push(`professionally wrapped in ${wrapMaterial}`);
      parts.push(`paper gathered and tied with matching satin ribbon bow`);
      parts.push(`stems neatly trimmed and visible below wrap`);
      parts.push(`front three-quarter angle view showing full bouquet face`);
      parts.push(`small gold "BEXY" brand tag hanging from ribbon`);
    }
  }
  
  // Add glitter only if selected
  if (withGlitter) {
    parts.push(`subtle fine glitter dust sparkling on flower petals catching the light`);
  }
  
  // Add accessories PROMINENTLY - they must be visible in the final image
  if (accessories.length > 0) {
    const accDescriptions: Record<string, string> = {
      'crown': 'a shiny golden crown sitting on top of the flowers',
      'graduation-hat': 'a black graduation cap with gold tassel on the arrangement',
      'bear': 'a cute plush teddy bear toy next to the flowers',
      'chocolate': 'an elegant chocolate box beside the arrangement',
      'balloons': 'colorful helium balloons (red, pink, gold) floating above tied with ribbons',
      'number-candles': 'birthday number candles standing among the flowers',
      'photo-frame': 'a small photo frame beside the flowers',
      'candles': 'tall elegant taper candles in holders next to the arrangement',
      'stickers': 'decorative celebration stickers on the wrapping',
      'banner': 'a celebration banner draped across the front',
      'stars': 'sparkly star confetti scattered around the base',
      'ribbon-bow': 'a large luxurious satin ribbon bow on the front',
    };
    const accessoryTexts = accessories
      .map(acc => accDescriptions[acc])
      .filter(Boolean);
    if (accessoryTexts.length > 0) {
      // Add at beginning of parts for emphasis
      parts.unshift(`MUST include these visible accessories: ${accessoryTexts.join(', ')}`);
    }
  }
  
  // Technical quality - optimized for Flux model with Flux-specific quality keywords
  // Flux responds well to these specific quality boosters
  parts.push(`masterpiece, best quality, highly detailed, dslr, soft lighting, high quality, film grain`);
  parts.push(`Fujifilm XT3, professional photography`);
  parts.push(`photograph taken with professional DSLR camera`);
  parts.push(`pure white seamless studio background`);
  parts.push(`soft diffused natural studio lighting with gentle shadows`);
  parts.push(`sharp focus on all flowers, high resolution detail`);
  parts.push(`photorealistic, hyperrealistic, lifelike`);
  parts.push(`real photograph, not illustration, not 3D render, not digital art`);
  
  // Add variation phrase and seed to ensure unique generation each time
  parts.push(`${variationPhrase}, variation seed ${seed}`);
  
  const positivePrompt = parts.join(', ');
  
  // Build negative prompt with color exclusions for single-color arrangements
  let negativePrompt = includeNegative ? buildNegativePrompt() : '';
  
  // Add strict color exclusions when only one flower color is selected
  // Flux model responds well to explicit color exclusions
  if (isSingleColor && includeNegative) {
    const selectedColor = colorList[0].toLowerCase();
    const allColors = ['red', 'pink', 'white', 'yellow', 'blue', 'purple', 'orange', 'peach', 'burgundy', 'cream', 'lavender', 'coral', 'fushia', 'terracotta', 'dark blue'];
    const excludedColors = allColors.filter(c => c !== selectedColor);
    // More comprehensive color exclusions for Flux
    const colorExclusions = excludedColors.map(c => 
      `${c} flowers, ${c} roses, ${c} petals, ${c} color, ${c} tint, ${c} hue, ${c} shade`
    ).join(', ');
    negativePrompt = `${negativePrompt}, mixed colors, multicolored flowers, different colored flowers, color variations, color mixing, ${colorExclusions}`;
  }
  
  // Add strict shape exclusions for boxes
  // Flux model benefits from explicit shape exclusions
  if (packageType === 'box' && includeNegative) {
    const selectedShape = (boxShape || 'square').toLowerCase();
    const shapeExclusions: Record<string, string> = {
      'round': 'square box, rectangular box, heart-shaped box, sharp corners, angular box, octagonal box',
      'square': 'round box, circular box, cylinder box, heart-shaped box, curved edges, oval box',
      'heart': 'square box, round box, rectangular box, circular box, sharp corners, angular box',
      'rectangle': 'square box, round box, circular box, heart-shaped box, cylinder box'
    };
    const excludeShapes = shapeExclusions[selectedShape] || '';
    if (excludeShapes) {
      negativePrompt = `${negativePrompt}, wrong box shape, incorrect shape, ${excludeShapes}`;
    }
  }
  
  // Add strict wrap shape exclusions
  // Flux model benefits from explicit shape exclusions
  if (packageType === 'wrap' && includeNegative) {
    const wrapShape = (boxShape || 'classic').toLowerCase();
    if (wrapShape === 'heart') {
      negativePrompt = `${negativePrompt}, round bouquet, traditional bouquet, oval arrangement, circular arrangement, wrong shape, incorrect shape`;
    } else {
      negativePrompt = `${negativePrompt}, heart-shaped bouquet, heart arrangement, box arrangement, wrong shape, incorrect shape`;
    }
  }
  
  // Add quantity-related negatives for Flux
  if (includeNegative) {
    negativePrompt = `${negativePrompt}, too few flowers, sparse arrangement, empty spaces, gaps in arrangement, incomplete bouquet, missing flowers, wrong flower count, incorrect quantity`;
  }
  
  // Build simple flower list for preview
  const flowerListSimple = flowers.map(f => `${f.quantity} ${f.flower.colorName} ${f.flower.family}`).join(', ');
  
  // Build human-readable preview
  const wrapShapeDisplay = packageType === 'wrap' && boxShape === 'heart' ? 'Heart-Shaped Bouquet' : 'Wrapped Bouquet';
  const boxDisplay = packageType === 'box' ? `${boxShape || 'Square'} Box${withRibbon ? ' with Ribbon' : ''}` : wrapShapeDisplay;
  const previewParts: string[] = [
    `📦 ${boxDisplay} (${size}, ${color})`,
    `🌸 ${totalFlowers} flowers: ${flowerListSimple}`,
  ];
  if (withGlitter) previewParts.push('✨ With glitter');
  if (withRibbon && packageType === 'box') previewParts.push('🎀 With satin ribbon');
  if (accessories.length > 0) previewParts.push(`🎁 Accessories: ${accessories.join(', ')}`);
  
  return {
    positive: positivePrompt,
    negative: negativePrompt,
    preview: previewParts.join('\n'),
    hash: generatePromptHash(options)
  };
}

/**
 * SIMPLIFIED PROMPT BUILDER
 * Creates clean, natural prompts optimized for GPT Image models
 * Much shorter and more effective than complex weighted prompts
 */
function buildSimplifiedPrompt(
  options: PromptBuilderOptions,
  totalFlowers: number,
  isMixFlowers: boolean
): BuiltPrompt {
  const {
    packageType,
    boxShape,
    size,
    color,
    flowers,
    withGlitter,
    withRibbon = false,
    accessories,
    includeNegative = true,
    seed = Date.now(),
    letterText,
    numberText,
    arrangementStyle = 'dome',
    densityPreference = 'tight',
    bloomStage = 'full',
    flowerPositions = {}
  } = options;
  
  // Build simple flower description
  const flowerList = flowers.map(f => {
    const colorName = f.flower.colorName.toLowerCase();
    const flowerType = f.flower.family.toLowerCase();
    const position = flowerPositions[f.flower.id];
    if (isMixFlowers && position) {
      const posText = position === 'center' ? 'in center' : 
                      position === 'edges' ? 'around edges' : 
                      position === 'accent' ? 'as accents' : 'throughout';
      return `${f.quantity} ${colorName} ${flowerType} ${posText}`;
    }
    return `${f.quantity} ${colorName} ${flowerType}`;
  }).join(', ');
  
  // Simple style descriptions
  const styleText = arrangementStyle === 'dome' ? 'dome-shaped' : 
                    arrangementStyle === 'flat' ? 'flat-top' : 'cascading';
  const densityText = densityPreference === 'tight' ? 'tightly packed' : 
                      densityPreference === 'airy' ? 'loosely arranged' : 'well-spaced';
  const bloomText = bloomStage === 'full' ? 'fully bloomed' : 
                    bloomStage === 'semi' ? 'semi-open' : 'mixed blooms';
  
  let prompt = '';
  
  // Color descriptions for richer prompts
  const colorDescriptions: Record<string, string> = {
    black: 'matte black',
    white: 'pristine white',
    gold: 'luxurious gold',
    pink: 'soft blush pink',
    blue: 'sky blue',
    red: 'deep crimson red',
    purple: 'rich purple',
    green: 'forest green',
    beige: 'warm beige',
    burgundy: 'deep burgundy',
  };
  const colorDesc = colorDescriptions[color] || color;

  if (packageType === 'box') {
    const shape = boxShape || 'round';
    const shapeText = shape === 'round' ? 'round hatbox' : 
                      shape === 'heart' ? 'heart-shaped box' : 
                      shape === 'square' ? 'square box' :
                      shape === 'rectangle' ? 'rectangular box' : 'round hatbox';
    
    prompt = `Professional product photo of a luxury ${colorDesc} ${shapeText} flower arrangement. `;
    prompt += `Contains ${totalFlowers} ${bloomText} real fresh flowers: ${flowerList}. `;
    prompt += `Flowers arranged in ${styleText} formation, ${densityText}, filling the entire box. `;
    prompt += `Box has "BEXY FLOWERS" logo printed in gold on the front. `;
    
    if (withRibbon) {
      prompt += `Elegant satin ribbon wrapped around the middle of the box with a decorative bow on front. `;
    }
    
    if (withGlitter) {
      prompt += `Fine glitter sparkle on flower petals. `;
    }
    
    prompt += `White studio background, soft natural lighting, high-end florist photography. `;
    prompt += `Real photograph, not 3D render, photorealistic.`;
    
  } else {
    // Wrap/bouquet with extended shape support
    const bouquetShapeText = 
      boxShape === 'heart' ? 'heart-shaped' :
      boxShape === 'letter' ? `letter-shaped (shaped like the letter "${letterText || 'A'}")` :
      boxShape === 'number' ? `number-shaped (shaped like the number "${numberText || '18'}")` :
      boxShape === 'cascade' ? 'cascading waterfall-style' :
      boxShape === 'sunburst' ? 'sunburst star-shaped' :
      'hand-tied';

    const wrapStyle = boxShape === 'cascade' ? 'long cascading' :
                      boxShape === 'sunburst' ? 'exploding starburst' :
                      styleText;
    
    prompt = `Professional product photo of a ${bouquetShapeText} flower bouquet. `;
    prompt += `Contains ${totalFlowers} ${bloomText} real fresh flowers: ${flowerList}. `;
    if (boxShape === 'letter' && letterText) {
      prompt += `Flowers meticulously arranged to form the letter "${letterText}" shape. `;
    } else if (boxShape === 'number' && numberText) {
      prompt += `Flowers meticulously arranged to form the number "${numberText}" shape. `;
    }
    prompt += `Wrapped in elegant ${colorDesc} paper. `;
    prompt += `Flowers ${densityText} in ${wrapStyle} arrangement. `;
    prompt += `Small "BEXY" gold tag on ribbon. `;
    
    if (withGlitter) {
      prompt += `Fine glitter on petals. `;
    }
    
    prompt += `White background, professional florist photography, photorealistic.`;
  }
  
  // Add accessories PROMINENTLY to ensure they appear in the generated image
  // Accessories must be described clearly and placed at the START of the prompt for emphasis
  if (accessories.length > 0) {
    const accDescriptions: Record<string, string> = {
      'crown': 'a small shiny golden crown accessory sitting on top of the flowers',
      'graduation-hat': 'a black graduation cap with gold tassel placed prominently on the flower arrangement',
      'bear': 'a cute small plush teddy bear toy sitting next to the flower arrangement',
      'chocolate': 'an elegant box of chocolates placed beside the flower arrangement',
      'balloons': 'colorful helium balloons (red, pink, gold) floating above and tied to the flower arrangement with ribbons',
      'number-candles': 'decorative birthday number candles standing upright among the flowers',
      'photo-frame': 'a small elegant photo frame standing beside the flower arrangement',
      'candles': 'tall elegant taper candles in holders placed next to the flower arrangement',
      'stickers': 'decorative celebration stickers on the wrapping paper',
      'banner': 'a small "Happy Birthday" or celebration banner draped across the front of the arrangement',
      'stars': 'sparkly star-shaped confetti scattered around the base of the arrangement',
      'ribbon-bow': 'a large luxurious satin ribbon bow prominently displayed on the front of the arrangement',
    };
    const accTexts = accessories.map(a => accDescriptions[a]).filter(Boolean);
    if (accTexts.length > 0) {
      // Insert accessories at the BEGINNING of the prompt for maximum emphasis
      const accessoryPrompt = `IMPORTANT: The arrangement includes these accessories that MUST be visible in the image: ${accTexts.join('. ')}. `;
      prompt = accessoryPrompt + prompt;
    }
  }
  
  // Simple negative prompt for GPT Image
  const negativePrompt = includeNegative ? 
    'blurry, low quality, 3D render, CGI, illustration, cartoon, anime, artificial flowers, fake flowers, plastic, synthetic, wilted, dead flowers, watermark, text overlay' : '';
  
  // Build preview
  const flowerListSimple = flowers.map(f => `${f.quantity} ${f.flower.colorName} ${f.flower.family}`).join(', ');
  const wrapShapeLabels: Record<string, string> = {
    classic: 'Classic Bouquet', heart: 'Heart-Shaped Bouquet',
    letter: letterText ? `Letter "${letterText}" Bouquet` : 'Letter-Shaped Bouquet',
    number: numberText ? `Number "${numberText}" Bouquet` : 'Number-Shaped Bouquet',
    cascade: 'Cascade Bouquet', sunburst: 'Sunburst Bouquet',
  };
  const wrapShapeDisplay = packageType === 'wrap'
    ? (wrapShapeLabels[boxShape || 'classic'] || 'Wrapped Bouquet')
    : 'Wrapped Bouquet';
  const boxDisplay = packageType === 'box' ? `${boxShape || 'Round'} Box${withRibbon ? ' with Ribbon' : ''}` : wrapShapeDisplay;
  const previewParts: string[] = [
    `📦 ${boxDisplay} (${size}, ${color})`,
    `🌸 ${totalFlowers} flowers: ${flowerListSimple}`,
    `🎨 Style: ${styleText}, ${densityText}`,
  ];
  if (withGlitter) previewParts.push('✨ With glitter');
  if (accessories.length > 0) previewParts.push(`🎁 Accessories: ${accessories.join(', ')}`);
  
  // Generate hash
  const hashData = JSON.stringify({
    packageType, boxShape, size, color,
    flowers: flowers.map(f => ({ id: f.flower.id, qty: f.quantity })),
    withGlitter, withRibbon, accessories: accessories.sort(),
    letterText, numberText,
    arrangementStyle, densityPreference, bloomStage, flowerPositions, seed
  });
  let hash = 0;
  for (let i = 0; i < hashData.length; i++) {
    hash = ((hash << 5) - hash) + hashData.charCodeAt(i);
    hash = hash & hash;
  }
  
  return {
    positive: prompt,
    negative: negativePrompt,
    preview: previewParts.join('\n'),
    hash: Math.abs(hash).toString(16).padStart(8, '0')
  };
}

// Export all for use
export default {
  STYLE_PRESETS,
  NEGATIVE_PROMPTS,
  PROMPT_TEMPLATES,
  buildAdvancedPrompt,
  buildNegativePrompt,
  getFlowerArrangementPositions,
  generateVariationPrompts
};
