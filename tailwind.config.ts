import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      /**
       * Mobile-first container padding – keeps content comfortably inside
       * the viewport from 320px upwards while preserving desktop spacing.
       */
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        md: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        'luxury': ['EB Garamond', 'serif'],
        'body': ['EB Garamond', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      letterSpacing: {
        "ultra-wide": "0.4em",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        "glow": {
          "0%": {
            boxShadow: "0 0 20px hsl(var(--primary))",
          },
          "100%": {
            boxShadow: "0 0 40px hsl(var(--primary)), 0 0 60px hsl(var(--primary))",
          },
        },
        "particle-float": {
          "0%": {
            transform: "translateY(0px) translateX(0px)",
            opacity: "0.3",
          },
          "50%": {
            transform: "translateY(-100px) translateX(50px)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-200px) translateX(0px)",
            opacity: "0",
          },
        },
        "tilt-3d": {
          "0%": {
            transform: "rotateX(0deg) rotateY(0deg)",
          },
          "100%": {
            transform: "rotateX(5deg) rotateY(5deg)",
          },
        },
        "scale-in-3d": {
          "0%": {
            transform: "scale3d(0.8, 0.8, 0.8) rotateX(-10deg)",
            opacity: "0",
          },
          "100%": {
            transform: "scale3d(1, 1, 1) rotateX(0deg)",
            opacity: "1",
          },
        },
        "liquid-morph": {
          "0%": {
            borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%",
          },
          "50%": {
            borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%",
          },
          "100%": {
            borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%",
          },
        },
        "text-reveal": {
          "0%": {
            transform: "translateY(100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0%)",
            opacity: "1",
          },
        },
        "border-glow": {
          "0%": {
            borderColor: "hsl(var(--primary) / 0.2)",
            boxShadow: "0 0 0 1px hsl(var(--primary) / 0.2)",
          },
          "100%": {
            borderColor: "hsl(var(--primary))",
            boxShadow: "0 0 20px hsl(var(--primary) / 0.4), 0 0 0 1px hsl(var(--primary))",
          },
        },
        "rotate-slow": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        "pulse-gold": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "particle-float": "particle-float 8s linear infinite",
        "tilt-3d": "tilt-3d 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
        "scale-in-3d": "scale-in-3d 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
        "liquid-morph": "liquid-morph 4s ease-in-out infinite",
        "text-reveal": "text-reveal 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
        "border-glow": "border-glow 0.6s ease-in-out forwards",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Better responsive typography & content defaults
    require("@tailwindcss/typography"),
    // Helpful for media that must keep its aspect ratio on all breakpoints
    require("@tailwindcss/aspect-ratio"),
    // Note: @tailwindcss/line-clamp is now included by default in Tailwind v3.3+
  ],
} satisfies Config;
