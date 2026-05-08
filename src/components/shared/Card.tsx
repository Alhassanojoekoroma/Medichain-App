/**
 * src/components/shared/Card.tsx
 * 
 * Unified card component following MedChain design system
 * - Subtle borders (0.5px)
 * - Minimal shadows
 * - Consistent padding
 * - Optional header area
 * 
 * Usage:
 * <Card>
 *   <CardTitle>Title</CardTitle>
 *   <CardBody>Content here</CardBody>
 * </Card>
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow, Components } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = false }) => {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const CardTitle: React.FC<{ children: string }> = ({ children }) => (
  <Text style={styles.title}>{children}</Text>
);

export const CardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.body}>{children}</View>
);

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.footer}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
  elevated: {
    borderRadius: Radius.xl,
    ...Shadow.strong,
  },
  title: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
});

export default Card;
