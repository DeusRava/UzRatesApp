export const COLORS = {
  // Backgrounds - deep space
  bg: '#06090F',
  bgCard: '#0D1520',
  bgCardAlt: '#111E2E',
  bgGlass: 'rgba(255,255,255,0.04)',
  bgGlassBorder: 'rgba(255,255,255,0.08)',

  // Accent - cosmic purple-blue gradient colors
  accent: '#6C8EF5',
  accentSecondary: '#A855F7',
  accentGlow: '#4F6BDB',
  accentSoft: 'rgba(108,142,245,0.15)',
  accentPurple: '#9B6DFF',
  accentPink: '#E879A0',

  // Status
  green: '#34D399',
  greenSoft: 'rgba(52,211,153,0.12)',
  red: '#F87171',
  redSoft: 'rgba(248,113,113,0.12)',
  gold: '#FBBF24',

  // Text
  text: '#EEF2FF',
  textSecondary: '#8B9EC7',
  textMuted: '#4A5A80',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.12)',

  white: '#FFFFFF',
};

// Google Fonts — loaded via metro bundler or system fallback
// Using platform-available fonts that look premium
export const FONTS = {
  // Use these in fontFamily
  display: 'Georgia', // elegant serif for big numbers/titles
  body: 'System',
  mono: 'Courier New',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

// Gradient configs (for use with inline styles / descriptions)
export const GRADIENTS = {
  cosmic: ['#6C8EF5', '#A855F7', '#E879A0'],
  card: ['#0D1520', '#111E2E'],
  accent: ['#4F6BDB', '#9B6DFF'],
};
