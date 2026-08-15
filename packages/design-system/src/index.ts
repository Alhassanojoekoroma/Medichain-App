/**
 * MediChain SL — Design System Package Index
 * Single import point for all portals and the mobile app.
 */

// CSS (import in each portal's globals.css)
// @import '@medichain/design-system/src/symptra-components.css';

// Web components
export * from './web';

// i18n
export { t, setLocale, getLocale } from './i18n';
export type { Locale } from './i18n';

// Icon sprite
export { ICONS } from './icon-sprite';
export type { IconId } from './icon-sprite';

// Mobile theme
export { mobileTheme } from './mobile';
export type { MobileTheme } from './mobile';

// Token constants
export * from './tokens';
