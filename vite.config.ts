import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    strictPort: false, // If 8080 is taken, try next available port (8081, etc.)
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.WebM", "**/*.webm", "**/*.mp4"],
  build: {
    // Optimize build for better caching
    rollupOptions: {
      output: {
        // Generate consistent chunk names for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-swiper': ['swiper'],
          // Supabase in separate chunk - only loaded when needed (admin pages, data fetching)
          'supabase': ['@supabase/supabase-js'],
          // ⚡ PERFORMANCE: Isolate Three.js in its own chunk - only loaded when 3D components are used
          // This prevents Three.js from being included in the main bundle (~500KB savings)
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          // ⚡ PERFORMANCE: Isolate GSAP/Lenis - only needed for animations
          'vendor-animation': ['gsap', '@studio-freight/lenis'],
          // ⚡ PERFORMANCE: Isolate recharts - only needed for admin dashboard
          'vendor-charts': ['recharts'],
        },
        // Use content hash for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
