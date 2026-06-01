/**
 * TradeMind Motion Design System
 * 
 * Centralized motion configuration inspired by Linear, Vercel, and Apple.
 * All animation values are defined here — components import from this file
 * instead of hardcoding Framer Motion values.
 */

// ─── Spring Presets ──────────────────────────────────────────────
// Named springs for different interaction types

export const spring = {
  /** Fast, precise interactions (buttons, toggles, tabs) */
  snappy: { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.5 },
  
  /** Standard UI transitions (modals, cards, panels) */
  gentle: { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 },
  
  /** Playful, energetic motion (celebrations, streaks) */
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15, mass: 0.8 },
  
  /** Slow, luxurious motion (page transitions, hero elements) */
  smooth: { type: "spring" as const, stiffness: 100, damping: 20, mass: 1 },

  /** Sidebar, panel resize */
  layout: { type: "spring" as const, stiffness: 250, damping: 25, mass: 0.8 },
} as const;


// ─── Duration Presets ────────────────────────────────────────────

export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  dramatic: 0.8,
} as const;


// ─── Animation Variants ─────────────────────────────────────────
// Reusable Framer Motion variant objects

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

export const collapseRow = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 },
};


// ─── Stagger Presets ─────────────────────────────────────────────

export const stagger = {
  /** Container variant — staggers children */
  container: (staggerDelay = 0.05) => ({
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }),

  /** Item variant — used on each child */
  item: fadeUp,
};


// ─── Interaction Presets ─────────────────────────────────────────

export const hover = {
  /** Subtle lift on hover */
  lift: { y: -2, transition: spring.snappy },
  
  /** Scale up slightly */
  grow: { scale: 1.02, transition: spring.snappy },
  
  /** Glow border intensification */
  glow: { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)", transition: spring.gentle },
};

export const tap = {
  /** Standard button press */
  press: { scale: 0.97, transition: spring.snappy },
  
  /** Soft press for ghost buttons */
  soft: { scale: 0.98, transition: spring.snappy },
};


// ─── Page Transition ─────────────────────────────────────────────

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { ...spring.gentle, staggerChildren: 0.06 },
  },
  exit: { opacity: 0, y: -4 },
};

/** Respect user motion preferences */
export const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const fadeOnly = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function motionSafe<T extends Record<string, unknown>>(variants: T): T {
  if (reducedMotion) return fadeOnly as unknown as T;
  return variants;
}
