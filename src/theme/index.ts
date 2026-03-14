// Design System Theme Exports
// This file serves as the central hub for all design system tokens and utilities

// ============================================================
// Color Tokens
// ============================================================

export const colors = {
  // Primary brand colors
  primary: {
    DEFAULT: '#4CAF50',
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4CAF50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  // Semantic colors
  success: {
    DEFAULT: '#4CAF50',
    light: '#e8f5e9',
  },
  warning: {
    DEFAULT: '#FF9800',
    light: '#fff3e0',
  },
  danger: {
    DEFAULT: '#ef5350',
    light: '#ffebee',
  },
  info: {
    DEFAULT: '#2196F3',
    light: '#e3f2fd',
    dark: '#1976d2',
  },
  // Neutral colors
  neutral: {
    50: '#f8f9fa',
    100: '#f5f5f5',
    200: '#e0e0e0',
    300: '#bdbdbd',
    400: '#9e9e9e',
    500: '#757575',
    600: '#666',
    700: '#424242',
    800: '#333',
    900: '#1a1a1a',
  },
  // Background colors
  background: {
    DEFAULT: '#f8f9fa',
    card: '#ffffff',
    input: '#f5f5f5',
  },
  // Text colors
  text: {
    DEFAULT: '#1a1a1a',
    secondary: '#666',
    muted: '#9e9e9e',
    inverse: '#ffffff',
  },
  // Border colors
  border: {
    DEFAULT: '#e0e0e0',
    light: '#f5f5f5',
    focus: '#4CAF50',
  },
} as const;

// ============================================================
// Typography Tokens
// ============================================================

export const typography = {
  sizes: {
    '2xs': { size: 10, lineHeight: 14 },
    xs: { size: 11, lineHeight: 16 },
    sm: { size: 13, lineHeight: 18 },
    base: { size: 15, lineHeight: 22 },
    lg: { size: 16, lineHeight: 24 },
    xl: { size: 18, lineHeight: 26 },
    '2xl': { size: 20, lineHeight: 28 },
    '3xl': { size: 24, lineHeight: 32 },
    '4xl': { size: 28, lineHeight: 36 },
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  variants: {
    h1: { size: 28, lineHeight: 36, weight: '700' },
    h2: { size: 24, lineHeight: 32, weight: '700' },
    h3: { size: 20, lineHeight: 28, weight: '700' },
    h4: { size: 18, lineHeight: 26, weight: '600' },
    body: { size: 15, lineHeight: 22, weight: '400' },
    'body-small': { size: 13, lineHeight: 18, weight: '400' },
    caption: { size: 11, lineHeight: 16, weight: '400' },
    label: { size: 13, lineHeight: 18, weight: '600' },
    stat: { size: 24, lineHeight: 32, weight: '800' },
    button: { size: 15, lineHeight: 22, weight: '600' },
  },
} as const;

// ============================================================
// Spacing Tokens
// ============================================================

export const spacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '10': 40,
  '12': 48,
  '14': 56,
  '16': 64,
} as const;

// ============================================================
// Border Radius Tokens
// ============================================================

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ============================================================
// Shadow Tokens
// ============================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  card: '0 4px 12px rgba(0, 0, 0, 0.08)',
  'card-hover': '0 8px 20px rgba(0, 0, 0, 0.12)',
  button: '0 4px 8px rgba(76, 175, 80, 0.3)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
} as const;

// ============================================================
// Z-Index Scale
// ============================================================

export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 100,
  sticky: 110,
  banner: 120,
  overlay: 130,
  modal: 140,
  popover: 150,
  tooltip: 180,
} as const;

// ============================================================
// Theme Type
// ============================================================

export type Theme = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
};

// ============================================================
// Complete Theme Object
// ============================================================

export const theme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get a color value by path (e.g., 'primary.500', 'neutral.100')
 */
export function getColor(path: string): string | undefined {
  const parts = path.split('.');
  let value: unknown = colors;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

/**
 * Get spacing value in pixels
 */
export function getSpacing(key: keyof typeof spacing): number {
  return spacing[key];
}

/**
 * Convert spacing key to style object
 */
export function spacingToStyle(key: keyof typeof spacing): { value: number } {
  return { value: spacing[key] };
}

// ============================================================
// Re-exports from UI Components
// ============================================================

// These will be properly re-exported once the components are created
export { Button } from '../components/ui/Button';
export { Card, CardHeader, CardContent, CardFooter, Badge } from '../components/ui/Card';
export { Text, Heading, Subheading, BodyText, Caption, Label } from '../components/ui/Text';
export { Modal, ModalHeader, ModalContent, ModalFooter, ActionMenu } from '../components/ui/Modal';

// ============================================================
// Utility Re-exports
// ============================================================

export { cn } from '../utils/cn';
