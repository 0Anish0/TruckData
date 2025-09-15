export const COLORS = {
  // Primary colors - Modern blue gradient
  primary: '#667EEA',
  primaryLight: '#E0E7FF',
  primaryDark: '#4F46E5',
  primaryGradient: ['#667EEA', '#764BA2'] as const,
  
  // Secondary colors - Purple gradient
  secondary: '#8B5CF6',
  secondaryLight: '#F3E8FF',
  secondaryDark: '#7C3AED',
  secondaryGradient: ['#8B5CF6', '#EC4899'] as const,
  
  // Accent colors - Green gradient
  accent: '#10B981',
  accentLight: '#D1FAE5',
  accentDark: '#059669',
  accentGradient: ['#10B981', '#34D399'] as const,
  
  // Status colors with gradients
  success: '#10B981',
  successGradient: ['#10B981', '#34D399'] as const,
  warning: '#F59E0B',
  warningGradient: ['#F59E0B', '#FBBF24'] as const,
  error: '#EF4444',
  errorGradient: ['#EF4444', '#F87171'] as const,
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoGradient: ['#3B82F6', '#60A5FA'] as const,
  
  // Modern neutral colors
  background: '#FAFBFC',
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  
  // Text colors with better contrast
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textMuted: '#64748B',
  
  // Border colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  borderAccent: '#E0E7FF',
  
  // Overlay and shadows
  overlay: 'rgba(15, 23, 42, 0.6)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
  
  // Fuel specific colors with gradient
  fuel: '#F59E0B',
  fuelLight: '#FEF3C7',
  fuelGradient: ['#F59E0B', '#FBBF24'] as const,
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.25)',
  glassDark: 'rgba(0, 0, 0, 0.1)',
  glassLight: 'rgba(255, 255, 255, 0.2)',
  glassVeryLight: 'rgba(255, 255, 255, 0.1)',
  
  // Chart colors
  chart1: '#667EEA',
  chart2: '#8B5CF6',
  chart3: '#10B981',
  chart4: '#F59E0B',
  chart5: '#EF4444',
  
  // Legacy support
  card: '#FFFFFF',
  cost: '#EF4444',
  profit: '#10B981',
  transparent: 'transparent',
};

export const SIZES = {
  // Font sizes - Modern typography scale
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 20,
  fontSizeXxl: 24,
  fontSizeXxxl: 30,
  fontSizeDisplay: 36,
  
  // Spacing - 8px grid system
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 32,
  spacingXxl: 48,
  spacingXxxl: 64,
  
  // Border radius - Modern rounded corners
  radius: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusXxl: 24,
  radiusRound: 9999,
  
  // Component sizes
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 60,
  tabBarHeight: 80,
  
  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 28,
  iconXl: 32,
  
  // Shadows - Modern elevation system
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  shadowSubtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowStrong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
};

export const FONTS = {
  // Modern font weights
  light: 'System',
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
};

// Animation configurations
export const ANIMATIONS = {
  // Timing
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Easing
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Spring configurations
  spring: {
    damping: 15,
    stiffness: 150,
  },
  springGentle: {
    damping: 20,
    stiffness: 100,
  },
  springBouncy: {
    damping: 10,
    stiffness: 200,
  },
};

// Layout configurations
export const LAYOUT = {
  // Screen padding
  screenPadding: SIZES.spacingLg,
  
  // Card configurations
  cardPadding: SIZES.spacingLg,
  cardMargin: SIZES.spacingMd,
  
  // List configurations
  listItemHeight: 72,
  listItemPadding: SIZES.spacingMd,
  
  // Grid configurations
  gridSpacing: SIZES.spacingMd,
  gridColumns: 2,
};