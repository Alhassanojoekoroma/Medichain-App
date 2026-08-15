import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

/**
 * VerificationSplitCard — Visual Signature Component
 *
 * Matches medichain-app-screens.html Screen B / Screen C exactly:
 *
 *  TOP  (.summary-card): blue #1E3AE0 background, border-radius 24 24 0 0
 *    - Avatar (orange gradient initials)
 *    - Patient name (18px bold white)
 *    - Meta rows: key in blueLight, value in white bold
 *
 *  BOTTOM (.cost-row): two half-cards side by side, no gap
 *    - LEFT  (.cost-card.pays): black #0A0A0A bg, border-radius 0 0 0 24
 *        icon-circle (dark grey bg) + label (grey) + big white number
 *    - RIGHT (.cost-card.owe): lime #D4FF3F bg, border-radius 0 0 24 0
 *        icon-circle (rgba dark bg) + label (dark olive) + big black number
 */

interface MetaRow {
  key:   string;
  value: string;
}

interface StatCard {
  icon:   React.ReactNode;
  label:  string;
  value:  string | number;
}

interface VerificationSplitCardProps {
  // Top section
  patientName:  string;
  initials:     string;
  metaRows?:    MetaRow[];
  // Bottom cost-row
  leftStat:     StatCard;
  rightStat:    StatCard;

  style?: ViewStyle;
}

// ── Embedded icon SVGs ────────────────────────────────────────────────────────

function RecordsIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h13l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" stroke={color} strokeWidth={1.6} />
      <Path d="M17 15l1.5 1.5L21 14" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PendingIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12a8 8 0 0113.5-5.8M20 12a8 8 0 01-13.5 5.8" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M17.5 4v3h-3M6.5 20v-3h3" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VerificationSplitCard({
  patientName,
  initials,
  metaRows = [],
  leftStat,
  rightStat,
  style,
}: VerificationSplitCardProps) {
  return (
    <View style={[styles.wrapper, style]}>

      {/* ── Top: Summary card (blue) ── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.patientName}>{patientName}</Text>
        </View>
        {metaRows.map((row) => (
          <View key={row.key} style={styles.metaRow}>
            <Text style={styles.metaKey}>{row.key}</Text>
            <Text style={styles.metaValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* ── Bottom: Cost row ── */}
      <View style={styles.costRow}>

        {/* Left — black half */}
        <View style={styles.costCardLeft}>
          <View style={styles.iconCircleDark}>
            {leftStat.icon}
          </View>
          <View>
            <Text style={styles.costLabelDark}>{leftStat.label}</Text>
            <Text style={styles.costAmtDark}>{leftStat.value}</Text>
          </View>
        </View>

        {/* Right — lime half */}
        <View style={styles.costCardRight}>
          <View style={styles.iconCircleLime}>
            {rightStat.icon}
          </View>
          <View>
            <Text style={styles.costLabelLime}>{rightStat.label}</Text>
            <Text style={styles.costAmtLime}>{rightStat.value}</Text>
          </View>
        </View>

      </View>
    </View>
  );
}

// ── Convenience default that matches Screen B exactly ─────────────────────────

interface VerificationSplitCardDefaultProps {
  patientName:     string;
  initials:        string;
  dateOfVisit:     string;
  recordId:        string;
  recordsVerified: number;
  pendingReview:   number;
  style?:          ViewStyle;
}

export function VerificationSplitCardDefault({
  patientName,
  initials,
  dateOfVisit,
  recordId,
  recordsVerified,
  pendingReview,
  style,
}: VerificationSplitCardDefaultProps) {
  return (
    <VerificationSplitCard
      patientName={patientName}
      initials={initials}
      metaRows={[
        { key: 'Date of visit', value: dateOfVisit },
        { key: 'Record ID',     value: recordId },
      ]}
      leftStat={{
        icon:  <RecordsIcon color={Colors.white} />,
        label: 'Records verified',
        value: recordsVerified,
      }}
      rightStat={{
        icon:  <PendingIcon color={Colors.black} />,
        label: 'Pending review',
        value: pendingReview,
      }}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',  // clips children to outer radius
  },

  // ── Summary card (blue top) ─────────────────────────────────────────────
  summaryCard: {
    backgroundColor: Colors.blue,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:              Spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
    marginBottom:  Spacing.lg,
  },
  avatar: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: Colors.warningLight,
    alignItems:      'center',
    justifyContent:  'center',
    // warm peachy gradient approximated:
    borderWidth:     0,
  },
  avatarText: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.bold,
    color:      Colors.warningDark,
  },
  patientName: {
    fontSize:   18,
    fontWeight: FontWeight.bold,
    color:      Colors.white,
  },
  metaRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      Spacing.xs,
  },
  metaKey: {
    fontSize:   FontSize.bodySmall,
    color:      Colors.blueLight,
  },
  metaValue: {
    fontSize:   FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color:      Colors.white,
  },

  // ── Cost row (bottom) ───────────────────────────────────────────────────
  costRow: {
    flexDirection: 'row',
  },

  costCardLeft: {
    flex:            1,
    backgroundColor: Colors.black,
    borderBottomLeftRadius: 24,
    padding:         Spacing.lg,
    height:          118,
    justifyContent:  'space-between',
  },
  iconCircleDark: {
    width:           34,
    height:          34,
    borderRadius:    17,
    backgroundColor: '#1c1c22',
    alignItems:      'center',
    justifyContent:  'center',
  },
  costLabelDark: {
    fontSize:   FontSize.caption,
    fontWeight: FontWeight.medium,
    color:      '#c9c9cf',
    marginTop:  Spacing.sm,
  },
  costAmtDark: {
    fontSize:   26,
    fontWeight: FontWeight.black,
    color:      Colors.white,
    marginTop:  2,
  },

  costCardRight: {
    flex:             1,
    backgroundColor:  Colors.lime,
    borderBottomRightRadius: 24,
    padding:          Spacing.lg,
    height:           118,
    justifyContent:   'space-between',
  },
  iconCircleLime: {
    width:           34,
    height:          34,
    borderRadius:    17,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  costLabelLime: {
    fontSize:   FontSize.caption,
    fontWeight: FontWeight.medium,
    color:      '#3a3f0f',
    marginTop:  Spacing.sm,
  },
  costAmtLime: {
    fontSize:   26,
    fontWeight: FontWeight.black,
    color:      Colors.black,
    marginTop:  2,
  },
});

export default VerificationSplitCard;
