import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';

export type IconButtonVariant = 'primary' | 'purple' | 'success' | 'warning' | 'danger' | 'neutral';
export type IconButtonSize = 'sm' | 'md' | 'fab';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export function IconButton({
  icon,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[`size_${size}`], styles[`variant_${variant}`], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.75}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:     { borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },

  size_sm:  { width: 32, height: 32 },
  size_md:  { width: 40, height: 40 },
  size_fab: { width: 56, height: 56 },

  variant_primary: { backgroundColor: Colors.primaryLight },
  variant_purple:  { backgroundColor: Colors.purpleLight },
  variant_success: { backgroundColor: Colors.greenLight },
  variant_warning: { backgroundColor: Colors.warningLight },
  variant_danger:  { backgroundColor: Colors.dangerLight },
  variant_neutral: { backgroundColor: Colors.bg },
});

export default IconButton;
