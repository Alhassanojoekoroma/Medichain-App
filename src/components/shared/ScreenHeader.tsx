/**
 * src/components/shared/ScreenHeader.tsx
 *
 * Consistent screen header component
 * Uses MedChain typography and spacing
 * Optional subtitle, right action button
 *
 * Usage:
 * <ScreenHeader 
 *   title="Medical Records"
 *   subtitle="Manage your health data"
 *   onRightPress={() => console.log('settings')}
 *   rightIcon="settings-outline"
 * />
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: string;
  onRightPress?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  rightIcon,
  onRightPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightIcon && (
        <TouchableOpacity
          onPress={onRightPress}
          style={styles.rightButton}
          accessibilityRole="button"
        >
          <Ionicons name={rightIcon as any} size={24} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  subtitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    color: Colors.neutral600,
    marginTop: 4,
  },
  rightButton: {
    padding: Spacing.sm,
  },
});

export default ScreenHeader;
