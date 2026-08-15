/**
 * MediChain SL — TypeScript Token Constants
 * Re-exports all design token values as typed constants.
 * Both web and mobile can import from here.
 */

export const colors = {
  primary: {
    900: '#0B2A6B', 800: '#1948B3', 700: '#2F63D9', 600: '#3E7BFA',
    500: '#5C93FB', 400: '#83AEFC', 300: '#AAC5FD', 200: '#C9DAFE',
    100: '#E4EDFE', 50:  '#F2F6FE',
  },
  ink:  { 900: '#10131A', 700: '#2B303A', 500: '#565F6E' },
  gray: {
    600: '#6B7280', 500: '#8A93A6', 400: '#AEB5C2', 300: '#D8DEE9',
    200: '#E7EAF0', 100: '#F1F3F8', 50: '#F8F9FC',
  },
  status: {
    red600: '#EF4444', red100: '#FDEAEA',
    purple600: '#7C6AEF', purple100: '#EFEAFE',
    amber600: '#F5A524', amber100: '#FDF3E2',
    green600: '#0D9426', green100: '#DCF3E1',
  },
  white:  '#FFFFFF',
  canvas: '#EEF3FF',
} as const;

export const accents = {
  doctor:   { 900: '#064216', 700: '#0A7621', 600: '#0D9426', 100: '#DCF3E1', 200: '#BDE8C5', 50: '#F0FAF2' },
  nurse:    { 900: '#073B3A', 700: '#087570', 600: '#0E938B', 100: '#DDF3F1', 200: '#B9E7E3', 50: '#EFFAF9' },
  pharmacy: { 900: '#4A1D75', 700: '#7A31BA', 600: '#9141D1', 100: '#F0E3FA', 200: '#E1C8F5', 50: '#F8F1FC' },
  lab:      { 900: '#27246A', 700: '#4540C1', 600: '#5753DB', 100: '#E8E7FC', 200: '#CFCEF9', 50: '#F5F4FE' },
  admin:    { 900: '#0B2A6B', 700: '#2F63D9', 600: '#3E7BFA', 100: '#E4EDFE', 200: '#C9DAFE', 50: '#F2F6FE' },
  ministry: { 900: '#071B33', 700: '#113A61', 600: '#174D7A', 100: '#D7E4EF', 200: '#AEC6DC', 50: '#F0F5F9' },
  patient:  { 900: '#0B2A6B', 700: '#2F63D9', 600: '#3E7BFA', 100: '#E4EDFE', 200: '#C9DAFE', 50: '#F2F6FE' },
} as const;

export const radii = { sm: 10, md: 16, lg: 24, xl: 32, full: 999 } as const;
export const shadows = {
  card: '0 1px 2px rgba(16,19,26,.04), 0 10px 28px rgba(16,19,26,.05)',
  pop:  '0 12px 32px rgba(16,19,26,.14)',
} as const;
export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export const type = { display: 42, h1: 32, h2: 26, h3: 18, body: 14.5, caption: 12, metric: 30 } as const;
export const MIN_TOUCH_TARGET = 44;
