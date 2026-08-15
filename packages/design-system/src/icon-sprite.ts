/**
 * MediChain SL — Symptra Icon SVG Sprite
 * All icons as inline SVG path strings for use in React components.
 * Stroke: 1.8px, rounded caps/joins, 24×24 viewBox.
 */

export const ICONS = {
  bell:        `<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>`,
  settings:    `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`,
  chevronDown: `<path d="M6 9l6 6 6-6"/>`,
  chevronLeft: `<path d="M15 18l-6-6 6-6"/>`,
  chevronRight:`<path d="M9 18l6-6-6-6"/>`,
  chevronUp:   `<path d="M18 15l-6-6-6 6"/>`,
  search:      `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>`,
  calendar:    `<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/>`,
  download:    `<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>`,
  phone:       `<path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.7a2 2 0 0 1-.5 2.1L7.1 8.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2.2z"/>`,
  more:        `<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>`,
  eye:         `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>`,
  file:        `<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>`,
  check:       `<path d="M20 6L9 17l-5-5"/>`,
  x:           `<path d="M18 6L6 18M6 6l12 12"/>`,
  sort:        `<path d="M7 3v18M4 6l3-3 3 3M17 21V3M14 18l3 3 3-3"/>`,
  filter:      `<path d="M4 6h16M7 12h10M10 18h4"/>`,
  grid:        `<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>`,
  list:        `<path d="M4 6h16M4 12h16M4 18h16"/>`,
  plus:        `<path d="M12 5v14M5 12h14"/>`,
  plusMed:     `<path d="M12 5v14M5 12h14" stroke-width="3"/>`,
  edit:        `<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>`,
  trash:       `<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>`,
  info:        `<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>`,
  alert:       `<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>`,
  clock:       `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>`,
  users:       `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>`,
  arrowUp:     `<path d="M12 19V5M5 12l7-7 7 7"/>`,
  arrowDown:   `<path d="M12 5v14M19 12l-7 7-7-7"/>`,
  move:        `<path d="M8 3l-3 3 3 3M16 3l3 3-3 3M8 21l-3-3 3-3M16 21l3-3-3-3M3 8h18M3 16h18"/>`,
  reset:       `<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>`,
  shield:      `<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>`,
  activity:    `<path d="M3 12h4l2-6 4 12 2-6h6"/>`,
  lock:        `<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>`,
  upload:      `<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 15v5h14v-5"/>`,
  database:    `<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>`,
  qr:          `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 17h3M17 14v3M17 20h3M20 17v3"/>`,
  wifi:        `<path d="M5 12.5a9.9 9.9 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>`,
  wifiOff:     `<path d="M1 1l22 22"/><path d="M16.7 16.7A7 7 0 0 1 19 18.5"/><path d="M5 12.5a10 10 0 0 1 5.2-2.8"/><path d="M10.7 10.7a5 5 0 0 1 6.6 6.6"/><path d="M8.5 16A5 5 0 0 1 12 14.7"/><circle cx="12" cy="19" r="1"/>`,
  sparkles:    `<path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M5 14.5l.75 2.25L8 17.5l-2.25.75L5 20.5l-.75-2.25L2 17.5l2.25-.75z"/>`,
} as const;

export type IconId = keyof typeof ICONS;
