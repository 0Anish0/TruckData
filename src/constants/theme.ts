export const COLORS = {
  // Primary colors
  primary: '#2563EB', // Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  
  // Secondary colors
  secondary: '#059669', // Green
  secondaryDark: '#047857',
  secondaryLight: '#10B981',
  
  // Background colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  textPrimary: '#0F172A', // Darker for better contrast
  textSecondary: '#475569', // Better contrast
  textTertiary: '#64748B',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Border colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowStrong: 'rgba(0, 0, 0, 0.12)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.4)',
  overlayStrong: 'rgba(0, 0, 0, 0.5)',
  overlayStronger: 'rgba(0, 0, 0, 0.8)',
  
  // Transparent
  transparent: 'transparent',
  
  // Fuel related colors
  fuel: '#F59E0B', // Orange for fuel costs
  cost: '#EF4444', // Red for costs
  profit: '#10B981', // Green for profits
};

export const SIZES = {
  // Font sizes
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 20,
  fontSizeXxl: 24,
  fontSizeXxxl: 30,
  
  // Spacing
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 32,
  spacingXxl: 48,
  
  // Border radius
  radius: 8,
  radiusLg: 12,
  radiusXl: 16,
  
  // Shadows
  shadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowStrong: {
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  shadowSubtle: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};
