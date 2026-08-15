import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`label_${size}`],
    styles[`labelColor_${variant}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' || variant === 'success' ? Colors.white : Colors.primary}
        />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.4 },

  // Sizes
  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  size_md: { paddingVertical: 12, paddingHorizontal: Spacing.xl },
  size_lg: { paddingVertical: Spacing.lg, paddingHorizontal: 32 },

  // Variant backgrounds
  variant_primary:   { backgroundColor: Colors.primary },
  variant_secondary: { backgroundColor: Colors.primaryLight },
  variant_outline:   { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
  variant_ghost:     { backgroundColor: 'transparent' },
  variant_danger:    { backgroundColor: Colors.dangerLight },
  variant_success:   { backgroundColor: Colors.greenLight },

  // Label sizes
  label:      { fontWeight: FontWeight.medium },
  label_sm:   { fontSize: FontSize.caption },
  label_md:   { fontSize: FontSize.body },
  label_lg:   { fontSize: FontSize.h4 },

  // Label colours per variant
  labelColor_primary:   { color: Colors.white },
  labelColor_secondary: { color: Colors.primary },
  labelColor_outline:   { color: Colors.primary },
  labelColor_ghost:     { color: Colors.textMuted },
  labelColor_danger:    { color: Colors.dangerDark },
  labelColor_success:   { color: Colors.successDark },
});

export default PrimaryButton;
