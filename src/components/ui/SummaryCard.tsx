import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../theme';

interface SummaryCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: { label: string; color: string; background: string };
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function SummaryCard({ icon, title, subtitle, badge, right, style }: SummaryCardProps) {
  return (
    <View style={[styles.card, style]}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: badge.background }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.white,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.lg,
    ...Shadow.card,
  },
  iconWrap: {
    width:           44,
    height:          44,
    borderRadius:    Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     Spacing.md,
    flexShrink:      0,
  },
  content:  { flex: 1 },
  title:    { fontSize: FontSize.h4, fontWeight: FontWeight.medium, color: Colors.dark },
  subtitle: { marginTop: 3, fontSize: FontSize.bodySmall, color: Colors.textMuted },
  badge:    {
    alignSelf:    'flex-start',
    marginTop:    Spacing.sm,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   3,
  },
  badgeText: { fontSize: FontSize.label, fontWeight: FontWeight.medium },
  right:     { marginLeft: Spacing.sm },
});

export default SummaryCard;
