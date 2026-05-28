/**
 * src/components/shared/Badge.tsx
 *
 * Status badge component with semantic color variants
 * All badges are pill-shaped, using design system colors
 *
 * Variants:
 * - verified, active: Green (success)
 * - pending, warning: Amber (warning)
 * - revoked, danger: Red (danger)
 * - blockchain, primary: Purple (brand)
 * - onChain: Dark with lime dot
 * - expired, gray: Neutral
 *
 * Usage:
 * <Badge variant="verified">Verified</Badge>
 * <Badge variant="blockchain" withDot>On-chain</Badge>
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, BadgePresets } from '../../theme';

type BadgeVariant = keyof typeof BadgePresets;

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  withDot?: boolean; // Lime dot for on-chain badge
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', withDot = false }) => {
  const preset = BadgePresets[variant] || BadgePresets.primary;

  const containerStyle: ViewStyle = {
    backgroundColor: preset.backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: withDot ? Spacing.xs : 0,
  };

  return (
    <View style={[styles.badge, containerStyle]}>
      {withDot && <View style={styles.dot} />}
      <Text style={[styles.text, { color: preset.color }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  text: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});

export default Badge;
