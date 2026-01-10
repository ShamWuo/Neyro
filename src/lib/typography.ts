/**
 * Typography utilities for improved font hierarchy, readability, and spacing
 */

export const typography = {
  // Font sizes with proper scale
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },

  // Line heights for optimal readability
  lineHeights: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Letter spacing for better legibility
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Font weights
  weights: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};

/**
 * Typography classes for common text patterns
 */
export const textStyles = {
  // Headings
  h1: "text-4xl font-semibold leading-tight tracking-tight",
  h2: "text-3xl font-semibold leading-tight tracking-tight",
  h3: "text-2xl font-semibold leading-snug tracking-tight",
  h4: "text-xl font-semibold leading-snug",
  h5: "text-lg font-semibold leading-normal",
  h6: "text-base font-semibold leading-normal",

  // Body text
  body: "text-base leading-relaxed",
  bodyLarge: "text-lg leading-relaxed",
  bodySmall: "text-sm leading-normal",

  // UI text
  caption: "text-xs leading-normal",
  label: "text-sm font-medium leading-normal",
  button: "text-sm font-semibold leading-none tracking-wide",

  // Special
  code: "font-mono text-sm",
  quote: "text-lg leading-loose italic",
};

/**
 * Spacing scale for consistent vertical rhythm
 */
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
};
