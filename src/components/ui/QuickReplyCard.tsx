import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '../../theme';

/**
 * QuickReplyCard — matches HTML Screen D .quick-item exactly:
 *
 *   bg:        white (#FFFFFF)
 *   active bg: black (#0A0A0A)
 *   border-radius: 20px
 *   padding:   16px 8px 14px
 *   min-height: 110px
 *   layout:    flex-direction column, align-items flex-start, gap 14
 *   icon:      22×22 SVG at top
 *   label:     11px, font-weight 600, black (white when active), line-height 1.25
 */

export interface QuickReplyItem {
  id:       string;
  label:    string;
  icon:     string;   // Ionicons name kept for backward compat, but we render SVG icons
  action?:  string;
  active?:  boolean;
}

// ── Inline SVG icons matching HTML exactly ────────────────────────────────────

function LabReportIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M5 4h11l4 4v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M8 11h8M8 15h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function IdCardIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={1.6} />
      <Circle cx={8.5} cy={10.5} r={2} stroke={color} strokeWidth={1.6} />
      <Path d="M5.5 15.5c.6-1.5 1.8-2.3 3-2.3s2.4.8 3 2.3M13 9.5h5M13 12.5h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function PrescriptionIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={3} width={14} height={18} rx={2} stroke={color} strokeWidth={1.6} />
      <Rect x={9} y={2} width={6} height={3} rx={1} fill={color} />
      <Path d="M8.5 12l2 2 4-4M8.5 17l2 2 4-4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function InsuranceIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h13l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" stroke={color} strokeWidth={1.6} />
      <Path d="M17 15l1.5 1.5L21 14" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HospitalIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 4l9 5.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 9.5V19h14V9.5M9.5 19v-6h5v6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ConsentIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={4} width={12} height={14} rx={2} stroke={color} strokeWidth={1.6} />
      <Rect x={8} y={7} width={12} height={14} rx={2} fill={Colors.white} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

function GenericDocIcon({ color }: { color: string }) {
  return <LabReportIcon color={color} />;
}

function getIcon(action: string | undefined, color: string) {
  switch (action) {
    case 'attach_lab':    return <LabReportIcon color={color} />;
    case 'attach_id':     return <IdCardIcon color={color} />;
    case 'attach_rx':     return <PrescriptionIcon color={color} />;
    case 'attach_ins':    return <InsuranceIcon color={color} />;
    case 'attach_hosp':   return <HospitalIcon color={color} />;
    case 'attach_consent':return <ConsentIcon color={color} />;
    default:              return <GenericDocIcon color={color} />;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface QuickReplyCardProps {
  item:     QuickReplyItem;
  onPress:  () => void;
  isActive?: boolean;
  style?:   ViewStyle;
}

export function QuickReplyCard({ item, onPress, isActive = false, style }: QuickReplyCardProps) {
  const active     = isActive || item.active;
  const cardBg     = active ? Colors.black : Colors.white;
  const iconColor  = active ? Colors.white : Colors.black;
  const labelColor = active ? Colors.white : Colors.black;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      {getIcon(item.action, iconColor)}
      <Text style={[styles.label, { color: labelColor }]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius:  20,
    paddingTop:    16,
    paddingBottom: 14,
    paddingHorizontal: 8,
    minHeight:     110,
    flexDirection: 'column',
    alignItems:    'flex-start',
    gap:           14,
  },
  label: {
    fontSize:   FontSize.label,
    fontWeight: FontWeight.medium,
    lineHeight: 13.75,  // 1.25 × 11
  },
});

export default QuickReplyCard;
