// App-wide constants
// Design System: Neyro "Deep Ocean"
// High-contrast, premium, focus-oriented.

// 1. The Color System
const PALETTE = {
  // Brand Colors (User Provided)
  primary: {
    500: '#ff6b00',
  },
  secondary: {
    500: '#ffc56d',
  },

  // Semantic / Utility
  utility: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    highlight: '#ffdea5',
  },

  // Dark Scheme
  dark: {
    bg: '#040302',      // --bg-dark
    surface: '#0d0b09', // --bg
    elevated: '#181514',// --bg-light
    border: '#4c4643',  // --border
    borderMuted: '#322d29', // --border-muted
    text: '#f7f0eb',    // --text
    textSec: '#b6b0ab', // --text-muted
    textMuted: '#68625e', // Using highlight for very muted text / secondary elements
  },

  // Light Scheme (Placeholder / Derived - Keeping generic for now as user only verified dark)
  light: {
    bg: '#fff8ec',
    surface: '#ffffff',
    elevated: '#fff0d3',
    border: '#ffdea5',
    text: '#461704',
    textSec: '#82330c',
    textMuted: '#a13c0b',
  }
};

// 2. The Shadow System (Dual Shadows)
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  inset: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 0,
  }
};

export const COMMON_COLORS = {
  primary: PALETTE.primary[500],
  accent: PALETTE.secondary[500],
  success: PALETTE.utility.success,
  warning: PALETTE.utility.warning,
  error: PALETTE.utility.error,
  info: PALETTE.utility.info,
  highlight: PALETTE.utility.highlight,
};

// 3. Theme Definitions
export const DARK_THEME = {
  ...COMMON_COLORS,
  background: PALETTE.dark.bg,
  surface: PALETTE.dark.surface,
  surfaceLight: PALETTE.dark.elevated,
  border: PALETTE.dark.border,
  borderMuted: PALETTE.dark.borderMuted,
  textPrimary: PALETTE.dark.text,
  textSecondary: PALETTE.dark.textSec,
  textMuted: PALETTE.dark.textMuted,
  isDark: true,
  shadows: SHADOWS,
};

export const LIGHT_THEME = {
  ...COMMON_COLORS,
  background: PALETTE.light.bg,
  surface: PALETTE.light.surface,
  surfaceLight: PALETTE.light.elevated,
  border: PALETTE.light.border,
  borderMuted: PALETTE.light.border, // Fallback
  textPrimary: PALETTE.light.text,
  textSecondary: PALETTE.light.textSec,
  textMuted: PALETTE.light.textMuted,
  isDark: false,
  shadows: SHADOWS, // Might need adjustment for light mode
};

// Legacy compatibility
export const LEGACY_COLORS = {
  ...DARK_THEME,
  light: LIGHT_THEME
};

/** @deprecated Use useTheme() hook instead of static COLORS */
export const COLORS = LEGACY_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  timer: 72,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const TIMER = {
  UPDATE_INTERVAL_MS: 1000,
} as const;

export const DEFAULTS = {
  DAILY_GOAL_MINUTES: 30,
  MIN_SESSION_SECONDS: 10,
  MAX_CURRENT_PIECES: 5,
} as const;

export const STORAGE_KEYS = {
  SETTINGS: 'neyro_settings',
  TIMER_STATE: 'neyro_timer_state',
} as const;
