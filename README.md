# 🌸 BexyFlowers - AI-Powered Bouquet Designer

[![Built with pollinations.ai](https://img.shields.io/badge/Built%20with-pollinations.ai-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwyIDdsMTAgNSAxMC01LTEwLTV6TTIgMTdsMTAgNSAxMC01TTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+)](https://pollinations.ai)
[![Live Site](https://img.shields.io/badge/Live-bexyflowers.shop-E91E63?style=for-the-badge)](https://bexyflowers.shop)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

> A luxury floral e-commerce platform with **AI-powered bouquet visualization** and **real-time customization** powered by [pollinations.ai](https://pollinations.ai)

## 🎯 Overview

BexyFlowers is a full-stack e-commerce platform for a luxury florist in Lebanon, combining cutting-edge **AI image generation**, elegant UI/UX, and advanced performance optimizations. Users can browse signature collections, customize their own bouquets, and see **photorealistic AI-generated previews** before ordering.

### ✨ Key Features

- 🤖 **AI-Powered Bouquet Previews** - Generate photorealistic bouquet images using pollinations.ai
- 🎨 **Interactive Bouquet Designer** - Multi-step customization with live previews
- 🛒 **Full E-Commerce Experience** - Cart, favorites, checkout, and order management
- 📱 **Mobile-First Design** - Optimized for all devices with excellent Core Web Vitals
- 🔒 **Secure Architecture** - Serverless API proxies, RLS policies, and credential protection
- 🎭 **3D Visualizations** - WebGL-powered product displays with Three.js
- ⚡ **Performance Optimized** - Route-based code splitting, image optimization, service workers

---

## 🤖 AI Integration with pollinations.ai

This project is built around the **pollinations.ai API** to deliver stunning, AI-generated bouquet visualizations.

### How We Use pollinations.ai

1. **Custom Bouquet Designer** (`/customize`)
   - Users select flowers, colors, sizes, and arrangements
   - AI generates photorealistic preview images based on their selections
   - Users can iterate with "Generate Variation" for different styles

2. **Zodiac Bouquet Quiz** 
   - Personalized bouquet recommendations with AI-generated imagery
   - Cached results for faster repeat experiences

3. **Dynamic Product Visuals**
   - Generate marketing-ready images for new arrangements
   - A/B testing different bouquet compositions

### Technical Implementation

```typescript
// Secure serverless proxy prevents API key exposure
// Frontend → Netlify Function → pollinations.ai
const result = await fetch('/.netlify/functions/generate-image', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Luxury rose bouquet with pink roses, soft lighting...",
    model: "gptimage",
    width: 768,
    height: 768
  })
});
```

**Why pollinations.ai?**
- ✅ High-quality photorealistic image generation (GPT Image 1 Mini model)
- ✅ Fast generation times (~20-40 seconds)
- ✅ No complex setup or model hosting required
- ✅ Reliable API with excellent uptime
- ✅ Perfect for e-commerce product visualization

Learn more: [pollinations.ai Documentation](https://pollinations.ai) | [API Docs](https://github.com/pollinations/pollinations/blob/main/APIDOCS.md)

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **UI Components** | Radix UI, Framer Motion, GSAP, Three.js |
| **Backend** | Supabase (PostgreSQL), Row Level Security |
| **AI/ML** | [pollinations.ai](https://pollinations.ai) (GPT Image 1 Mini) |
| **Deployment** | Netlify, Serverless Functions |
| **State Management** | React Query, Context API |
| **Payments** | Integration-ready checkout system |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account ([supabase.com](https://supabase.com))
- pollinations.ai API key ([enter.pollinations.ai](https://enter.pollinations.ai))
- Netlify account (for serverless functions)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/bexyflowers-ai-powered-system.git
cd bexyflowers-ai-powered-system/bexyflowers-ai-powered-system-main

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - POLLINATIONS_SECRET_KEY (serverless only)
# - POLLINATIONS_SECRET_KEY2 (backup, optional)

# Run development server
npm run dev
```

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# pollinations.ai (Server-side only - NEVER expose in frontend)
POLLINATIONS_SECRET_KEY=your-pollinations-api-key
POLLINATIONS_SECRET_KEY2=your-backup-key

# Frontend Security
FRONTEND_API_SECRET=random-secret-for-hmac-validation
```

**🔒 Security Note:** API keys are handled server-side via Netlify Functions to prevent exposure. The frontend never has direct access to the pollinations.ai API key.

---

## 📂 Project Structure

```
bexyflowers-ai-powered-system-main/
├── src/
│   ├── components/         # React components
│   │   ├── bouquet/       # Bouquet canvas, 3D viewer
│   │   ├── cart/          # Shopping cart
│   │   └── Footer.tsx     # Footer with pollinations.ai credit
│   ├── views/             # Page components
│   │   ├── Customize.tsx  # AI bouquet designer (main feature)
│   │   └── Index.tsx      # Homepage
│   ├── lib/
│   │   ├── api/
│   │   │   ├── imageGeneration.ts   # pollinations.ai client
│   │   │   ├── aiConfig.ts          # AI configuration
│   │   │   └── promptEngine.ts      # Prompt engineering
│   │   └── supabase.ts    # Database client
│   └── contexts/          # React contexts (cart, favorites)
├── netlify/
│   └── functions/
│       ├── generate-image.ts    # pollinations.ai proxy (primary)
│       └── database.ts          # Supabase proxy
├── docs/                  # Technical documentation
└── public/               # Static assets
```

---

## 🎨 Features Deep Dive

### 1. AI Bouquet Designer

The `/customize` page is the core feature, allowing users to:

- Select from 20+ flower types
- Choose package styles (luxury box, vase, wrapped)
- Pick color themes and arrangement styles
- Add accessories (ribbons, greeting cards)
- **Generate AI preview** with pollinations.ai
- Create variations for different looks
- Save and share designs via WhatsApp

**Prompt Engineering:** We use a sophisticated prompt engine (`promptEngine.ts`) that translates user selections into detailed prompts optimized for the pollinations.ai GPT Image model:

```
Elegant luxury rose bouquet in a premium black velvet box, featuring 
12 pink roses, soft romantic lighting, professional product photography, 
high detail, shallow depth of field...
```

### 2. Performance Optimizations

- **Route-based code splitting** - Reduces initial bundle by ~68%
- **Lazy loading** - Components load on-demand
- **Image optimization** - WebP/AVIF with next/image
- **Service workers** - Offline caching
- **Mobile-first** - Separate prefetch strategies for mobile/desktop

### 3. Security Architecture

- **Serverless API proxies** - All sensitive operations go through Netlify Functions
- **HMAC request signing** - Prevents unauthorized API access
- **Row Level Security** - Supabase RLS policies protect data
- **No client-side secrets** - API keys never exposed to browser

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits & Acknowledgments

### AI Technology
- **[pollinations.ai](https://pollinations.ai)** - AI image generation API powering all bouquet visualizations
  - Model: GPT Image 1 Mini
  - Use case: Photorealistic bouquet preview generation
  - Integration: Serverless proxy with secure API key handling

### UI/UX Libraries
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

### Backend & Infrastructure
- [Supabase](https://supabase.com/) - PostgreSQL database and storage
- [Netlify](https://www.netlify.com/) - Serverless hosting and functions

---

## 📞 Contact & Support

- **Website:** [bexyflowers.shop](https://bexyflowers.shop)
- **Email:** mohammadashkar11@gmail.com
- **Instagram:** [@bexyflowers](https://www.instagram.com/bexyflowers)
- **WhatsApp:** [+961 76 104 882](https://api.whatsapp.com/send/?phone=96176104882)

---

## 🎯 Powered By

<div align="center">

[![pollinations.ai](https://img.shields.io/badge/AI%20by-pollinations.ai-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwyIDdsMTAgNSAxMC01LTEwLTV6TTIgMTdsMTAgNSAxMC01TTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+)](https://pollinations.ai)

**BexyFlowers uses [pollinations.ai](https://pollinations.ai) for AI-powered image generation**

</div>

---

<div align="center">
  Made with 💜 by the BexyFlowers team
</div>
