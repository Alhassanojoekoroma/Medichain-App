/**
 * MediChain SL — Mobile Theme (Expo / React Native)
 * Uses same values as tokens.ts — no CSS variables, plain RN-safe values.
 */
import { colors, accents, radii, shadows, spacing, type MIN_TOUCH_TARGET } from './tokens';

export interface MobileTheme {
  colors: typeof colors;
  accents: typeof accents;
  radii: typeof radii;
  spacing: typeof spacing;
  minTouchTarget: 44;
  fonts: {
    display: string;
    body: string;
  };
  fontSizes: {
    display: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    metric: number;
    micro: number;
  };
  fontWeights: {
    regular: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
    extrabold: '800';
  };
  canvas: string;
  surface: string;
  border: string;
  shadowCard: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  shadowPop: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export const mobileTheme: MobileTheme = {
  colors,
  accents,
  radii,
  spacing,
  minTouchTarget: 44,
  fonts: {
    display: 'Sora',
    body: 'PlusJakartaSans',
  },
  fontSizes: {
    display: 32,
    h1:      26,
    h2:      22,
    h3:      18,
    body:    14,
    caption: 12,
    metric:  28,
    micro:   11,
  },
  fontWeights: {
    regular:   '400',
    medium:    '500',
    semibold:  '600',
    bold:      '700',
    extrabold: '800',
  },
  canvas:  '#EEF3FF',
  surface: '#FFFFFF',
  border:  colors.gray[200],
  shadowCard: {
    shadowColor: '#10131A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  shadowPop: {
    shadowColor: '#10131A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
  },
};

/** Get accent colors for a given portal role */
export function getAccent(role: keyof typeof accents) {
  return accents[role];
}
