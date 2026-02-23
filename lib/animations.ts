import { type Variants } from "motion/react";

// ══════════════════════════════════════════════════════════════════════════
// OBSIDIAN FINANCE - Animation System
// Premium, dramatic animations for editorial trading platform
// ══════════════════════════════════════════════════════════════════════════

// ── Refined easing curves ──
const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const easeOutQuart = [0.25, 1, 0.5, 1] as const;
const easeInOutCubic = [0.65, 0, 0.35, 1] as const;
const easeOutBack = [0.34, 1.56, 0.64, 1] as const;

// ══════════════════════════════════════════════════════════════════════════
// FADE ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: easeOutQuart } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOutExpo } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOutExpo } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOutExpo } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.3 } },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOutExpo } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.3 } },
};

// ══════════════════════════════════════════════════════════════════════════
// SCALE ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easeOutBack } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.25 } },
};

export const scaleInSoft: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

// ══════════════════════════════════════════════════════════════════════════
// HERO ANIMATIONS - Dramatic entrance for landing
// ══════════════════════════════════════════════════════════════════════════

export const heroContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const heroTitle: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: easeOutExpo,
    },
  },
};

export const heroSubtitle: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOutExpo,
    },
  },
};

export const heroElement: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easeOutExpo,
    },
  },
};

// Line draw animation for decorative elements
export const lineReveal: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      duration: 1.2,
      ease: easeOutExpo,
    },
  },
};

export const lineRevealRight: Variants = {
  initial: { scaleX: 0, originX: 1 },
  animate: {
    scaleX: 1,
    transition: {
      duration: 1.2,
      ease: easeOutExpo,
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════
// STAGGER SYSTEM
// ══════════════════════════════════════════════════════════════════════════

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOutExpo,
    },
  },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: easeOutExpo,
    },
  },
};

export const staggerItemLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeOutExpo,
    },
  },
};

export const staggerItemRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeOutExpo,
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════
// CARD ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════

export const cardHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: { scale: 0.98 },
};

export const cardReveal: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOutExpo,
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════
// SLIDE ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════

export const slideInFromLeft: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { x: "-100%", transition: { duration: 0.3, ease: easeInOutCubic } },
};

export const slideInFromRight: Variants = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { x: "100%", transition: { duration: 0.3, ease: easeInOutCubic } },
};

export const slideInFromBottom: Variants = {
  initial: { y: "100%" },
  animate: {
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { y: "100%", transition: { duration: 0.3, ease: easeInOutCubic } },
};

// ══════════════════════════════════════════════════════════════════════════
// PAGE TRANSITIONS
// ══════════════════════════════════════════════════════════════════════════

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.3 },
  },
};

// ══════════════════════════════════════════════════════════════════════════
// PROGRESS & DATA ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════

export const progressFill: Variants = {
  initial: { width: 0 },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    transition: { duration: 1.2, ease: easeOutExpo },
  }),
};

export const numberCount: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

// ══════════════════════════════════════════════════════════════════════════
// SPECIAL EFFECTS
// ══════════════════════════════════════════════════════════════════════════

export const pulse: Variants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const goldGlow: Variants = {
  initial: { boxShadow: "0 0 0px rgba(212, 165, 116, 0)" },
  animate: {
    boxShadow: "0 0 40px rgba(212, 165, 116, 0.2)",
    transition: { duration: 0.5 },
  },
};

export const goldPulse: Variants = {
  initial: { boxShadow: "0 0 0 0 rgba(212, 165, 116, 0.4)" },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(212, 165, 116, 0.4)",
      "0 0 0 10px rgba(212, 165, 116, 0)",
      "0 0 0 0 rgba(212, 165, 116, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Chart line drawing effect
export const drawLine: Variants = {
  initial: { pathLength: 0 },
  animate: {
    pathLength: 1,
    transition: {
      duration: 2,
      ease: easeOutExpo,
    },
  },
};

// Ticker tape for numbers
export const tickerNumber: Variants = {
  initial: { y: "100%" },
  animate: {
    y: "0%",
    transition: {
      duration: 0.8,
      ease: easeOutExpo,
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════
// TRANSITION PRESETS
// ══════════════════════════════════════════════════════════════════════════

export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.5,
  ease: easeOutExpo,
};

export const fastTransition = {
  duration: 0.25,
  ease: "easeOut" as const,
};

export const slowTransition = {
  duration: 0.8,
  ease: easeOutExpo,
};

// Keep legacy name for backward compat
export const glowEffect = goldGlow;
