import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

const config = withUt({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Color System ──────────────────────────────────────────
      colors: {
        background: "#09090B",
        foreground: "#FAFAFA",
        card: {
          DEFAULT: "#0F1119",
          foreground: "#FAFAFA",
        },
        popover: {
          DEFAULT: "#131620",
          foreground: "#FAFAFA",
        },
        primary: {
          DEFAULT: "#6366F1",
          foreground: "#FFFFFF",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        accent: {
          green: "#10B981",
          red: "#F43F5E",
          yellow: "#F59E0B",
          blue: "#3B82F6",
        },
        muted: {
          DEFAULT: "#18181B",
          foreground: "#A1A1AA",
        },
        border: "#27272A",
        input: "#27272A",
        ring: "#6366F1",
        destructive: {
          DEFAULT: "#F43F5E",
          foreground: "#FFFFFF",
        },

        // Glass tokens
        glass: {
          DEFAULT: "rgba(15, 17, 25, 0.80)",
          light: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
          "border-hover": "rgba(255, 255, 255, 0.12)",
        },
      },

      // ─── Typography ────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },

      // ─── Spacing (strict 4px grid) ─────────────────────────────
      spacing: {
        "4.5": "1.125rem",   // 18px
        "13": "3.25rem",     // 52px
        "15": "3.75rem",     // 60px
        "18": "4.5rem",      // 72px
        "22": "5.5rem",      // 88px
      },

      // ─── Border Radius ─────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",       // 16px
        "3xl": "1.25rem",    // 20px
        "4xl": "1.5rem",     // 24px
      },

      // ─── Elevation System ──────────────────────────────────────
      boxShadow: {
        // Ambient shadows (soft, diffused)
        "elevation-1": "0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)",
        "elevation-2": "0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)",
        "elevation-3": "0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2)",
        "elevation-4": "0 16px 48px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3)",
        
        // Glass shadows
        "glass": "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "glass-hover": "0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        
        // Glow effects
        "glow": "0 0 20px rgba(99, 102, 241, 0.25), 0 0 60px rgba(99, 102, 241, 0.1)",
        "glow-sm": "0 0 10px rgba(99, 102, 241, 0.2)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.25)",
        "glow-red": "0 0 20px rgba(244, 63, 94, 0.25)",
        
        // Inner highlight
        "inner-highlight": "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      },

      // ─── Backdrop Blur ─────────────────────────────────────────
      backdropBlur: {
        glass: "16px",
        "glass-heavy": "24px",
      },

      // ─── Animations ────────────────────────────────────────────
      animation: {
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.25)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
});
export default config;
