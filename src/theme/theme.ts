import { Platform } from 'react-native';

// Paleta de colores Premium y Minimalista basada en tonos HSL refinados y estética Apple/SF.
export const colors = {
  light: {
    background: '#FFFFFF',
    stepBackground: '#F5F5F7',
    card: '#FBFBFD',
    text: '#1D1D1F',
    textSecondary: '#86868B',
    primary: '#000000',
    primaryContrast: '#FFFFFF',
    accent: '#0066CC', // Azul SF
    border: '#E5E5EA',
    notification: '#FF3B30',
    shadow: 'rgba(0, 0, 0, 0.04)',
    tint: '#000000',
  },
  dark: {
    background: '#000000',
    stepBackground: '#1C1C1E',
    card: '#161617',
    text: '#F5F5F7',
    textSecondary: '#86868B',
    primary: '#FFFFFF',
    primaryContrast: '#000000',
    accent: '#0A84FF', // Azul SF Dark
    border: '#2C2C2E',
    notification: '#FF453A',
    shadow: 'rgba(0, 0, 0, 0.5)',
    tint: '#FFFFFF',
  },
};

// Tipografía limpia emulando SF Pro Display y SF Pro Text
export const typography = {
  fonts: {
    regular: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'system-ui',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'system-ui',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'sans-serif-condensed-bold',
      default: 'system-ui',
    }),
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 44,
    xxxl: 52,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Radios y Espaciados consistentes para una interfaz pulida
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Tema completo exportado
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
};

export type Theme = typeof theme;
