/**
 * MediChain SL — Design Tokens
 *
 * Source of truth: medichain-app-screens.html CSS variables (exact match)
 *
 * Core palette — do not alter:
 *   black          #0A0A0A
 *   electric blue  #1E3AE0
 *   blue-dark      #152B9E
 *   blue-light     #C9D3FF
 *   lime           #D4FF3F
 *   white          #FFFFFF
 *   grey-100       #F4F4F5
 *   grey-300       #E7E7EA
 *   text-secondary #8E8E93
 *
 * This file is the ONLY place where raw colour/size values should appear.
 * Every component and screen must import from here — no hardcoded hex anywhere else.
 */

// ─── Core Palette (exact HTML variables) ────────────────────────────────────

export const Colors = {
  // Brand blues
  blue:        '#1E3AE0',   // --blue
  blueDark:    '#152B9E',   // --blue-dark
  blueLight:   '#C9D3FF',   // --blue-light (text on blue cards)

  // Lime (accent — blockchain verified, completed steps, lime CTA)
  lime:        '#D4FF3F',   // --lime
  limeDark:    '#a8cc1f',   // derived — for text on lime bg

  // Neutrals
  black:       '#0A0A0A',   // --black
  white:       '#FFFFFF',   // --white
  grey100:     '#F4F4F5',   // --grey-100
  grey300:     '#E7E7EA',   // --grey-300
  textSecondary: '#8E8E93', // --text-secondary

  // ── Aliases used across the existing codebase ──────────────────────────
  // These map legacy token names → new HTML-correct values so we don't
  // have to touch every single import site immediately.

  primary:      '#1E3AE0',  // = blue
  primaryDark:  '#152B9E',  // = blueDark
  primaryLight: '#C9D3FF',  // = blueLight
  primaryMid:   '#C9D3FF',  // = blueLight

  dark:         '#0A0A0A',  // = black
  textBody:     '#0A0A0A',  // = black (body text)
  textMuted:    '#8E8E93',  // = textSecondary
  border:       '#E7E7EA',  // = grey-300
  bg:           '#F4F4F5',  // = grey-100
  canvas:       '#F4F4F5',  // = grey-100
  white_alias:  '#FFFFFF',

  // Neutral scale (for backward compat)
  neutral900:   '#0A0A0A',
  neutral700:   '#3D4259',
  neutral600:   '#5D6582',
  neutral500:   '#8E8E93',
  neutral400:   '#E7E7EA',
  neutral300:   '#F4F4F5',
  neutral200:   '#E7E7EA',
  neutral100:   '#C9D3FF',
  neutral50:    '#F4F4F5',

  // Success / green aliases (now mapped to lime)
  green:        '#D4FF3F',  // = lime (renamed — keeps old references working)
  greenLight:   '#f5ffc7',  // lime tint for badge backgrounds
  success:      '#D4FF3F',
  successDark:  '#20260a',  // dark text on lime bg
  successLight: '#f5ffc7',
  successBorder:'#D4FF3F',

  // Warning / danger (kept from original — not in HTML ref but used in other screens)
  orange:       '#FA6E3C',
  orangeLight:  '#FEF0EB',
  warning:      '#FA6E3C',
  warningDark:  '#B45309',
  warningLight: '#FFF7ED',
  warningBorder:'#FED7AA',

  danger:       '#DC2626',
  dangerDark:   '#DC2626',
  dangerLight:  '#FEF2F2',
  dangerBorder: '#FECACA',

  // Purple (blockchain/AI — kept for non-HTML screens)
  purple:       '#8F76FF',
  purpleLight:  '#EDE9FF',

  // Accent aliases
  accent:       '#1E3AE0',
  accentLight:  '#C9D3FF',

  // Chat gradient (Screen D header)
  chatGradStart:'#274bf0',
  chatGradEnd:  '#1226a0',

  // Lavender (backward compat)
  lavender:     '#EDE9FF',
  lavendarDark: '#6644CC',
  mint:         '#f5ffc7',
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────
// Font: system (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica)

export const FontFamily = {
  base: 'System',
} as const;

export const FontSize = {
  h1:        30,   // Screen A h2 / Screen D h1
  h2:        24,
  h3:        20,
  h4:        16,
  bodyLarge: 16,
  body:      14,
  bodySmall: 13,
  caption:   12,
  label:     11,
  tiny:      10.5, // .step .lbl, .doc-tile .date
} as const;

export const FontWeight = {
  black:   '800' as const,  // headings in HTML
  bold:    '700' as const,
  medium:  '600' as const,
  regular: '400' as const,
  light:   '400' as const,
} as const;

export const LineHeight = {
  h1:        36,
  h2:        31,
  h3:        26,
  h4:        22,
  bodyLarge: 26,
  body:      22,
  bodySmall: 20,
  caption:   18,
} as const;

// ─── Spacing (base unit: 4 px) ───────────────────────────────────────────────

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
  xxxxl:64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
// Taken directly from HTML class values

export const Radius = {
  xs:   4,
  sm:   8,
  md:   10,   // .doc-thumb border-radius
  lg:   16,   // .doc-card, .bubble
  xl:   20,   // .quick-item, .doc-tile
  xxl:  24,   // .sheet, .summary-card, .btn-primary, .input-bar
  xxxl: 28,   // .quick-grid
  pill: 100,
  full: 9999,
} as const;

// ─── Shadow Scale ────────────────────────────────────────────────────────────

export const Shadow = {
  sm: {
    shadowColor:   '#0A0A0A',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius:  3,
    elevation:     1,
  },
  card: {
    shadowColor:   '#0A0A0A',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius:  16,
    elevation:     2,
  },
  lg: {
    shadowColor:   '#0A0A0A',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius:  24,
    elevation:     4,
  },
  strong: {
    shadowColor:   '#0A0A0A',
    shadowOffset:  { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius:  50,
    elevation:     8,
  },
  lime: {
    shadowColor:   '#D4FF3F',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius:  20,
    elevation:     4,
  },
} as const;

// ─── Component Tokens ────────────────────────────────────────────────────────

export const Components = {
  buttonHeight:      56,   // .btn-primary height:56px
  buttonSmallHeight: 36,
  inputHeight:       52,   // .input-bar height:52px
  headerHeight:      56,
  tabBarHeight:      64,
  cardBorder:        { borderWidth: 1, borderColor: Colors.border },
  cardBase:          {
    backgroundColor: Colors.white,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.lg,
  },
  inputBase:         {
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    Radius.xxl,
    height:          52,
    paddingHorizontal: Spacing.xl,
    fontSize:        FontSize.body,
    color:           Colors.black,
  },
  separator:         { height: 1, backgroundColor: Colors.border },
} as const;

// ─── Badge Presets ───────────────────────────────────────────────────────────

export const BadgePresets = {
  verified:    { backgroundColor: Colors.greenLight,  color: Colors.successDark },
  active:      { backgroundColor: Colors.primaryLight, color: Colors.primaryDark },
  pending:     { backgroundColor: Colors.warningLight, color: Colors.warningDark },
  warning:     { backgroundColor: Colors.warningLight, color: Colors.warningDark },
  revoked:     { backgroundColor: Colors.dangerLight,  color: Colors.dangerDark  },
  danger:      { backgroundColor: Colors.dangerLight,  color: Colors.dangerDark  },
  blockchain:  { backgroundColor: Colors.blueLight,    color: Colors.blueDark    },
  primary:     { backgroundColor: Colors.blueLight,    color: Colors.blueDark    },
  onChain:     { backgroundColor: Colors.black,        color: Colors.white       },
  expired:     { backgroundColor: Colors.neutral200,   color: Colors.neutral600  },
} as const;

// ─── Default export (backward compat) ───────────────────────────────────────

export default {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  Radius,
  Spacing,
  Shadow,
  Components,
  BadgePresets,
};
