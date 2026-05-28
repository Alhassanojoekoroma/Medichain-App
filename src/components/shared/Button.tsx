/**
 * src/components/shared/Button.tsx
 * 
 * Unified button component with variants:
 * - primary: solid blue (main CTAs)
 * - outline: bordered blue (secondary actions)
 * - ghost: transparent gray (tertiary actions)
 * - accent: lime green (single prominent CTA per screen)
 * - danger: red (destructive actions)
 * 
 * Sizes:
 * - small: 34px height
 * - normal: 44px height (default)
 * - large: 52px height (prominent CTAs)
 */

import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'accent' | 'danger';
  size?: 'normal' | 'small' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  loading = false,
  icon,
  style,
  testID,
  accessibilityLabel,
}) => {
  const height = size === 'small' ? 34 : size === 'large' ? 52 : 44;

  const containerStyle: ViewStyle = {
    ...getContainerStyle(variant),
    height,
    ...(disabled && { opacity: 0.5 }),
    ...(style as object),
  };

  const textStyle: TextStyle = {
    fontSize: size === 'small' ? FontSize.bodySmall : FontSize.body,
    fontWeight: FontWeight.bold,
    color: getTextColor(variant),
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
    >
      {icon ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          {icon}
          <Text style={textStyle}>{label}</Text>
        </View>
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

Button.displayName = 'Button';

function getContainerStyle(variant: string): ViewStyle {
  const baseStyle: ViewStyle = {
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: Colors.primary,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.primary,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: Colors.neutral100,
        borderWidth: 0.5,
        borderColor: Colors.border,
      };
    case 'accent':
      return {
        ...baseStyle,
        backgroundColor: Colors.accent,
      };
    case 'danger':
      return {
        ...baseStyle,
        backgroundColor: Colors.dangerLight,
        borderWidth: 0.5,
        borderColor: Colors.dangerBorder,
      };
    default:
      return baseStyle;
  }
}

function getTextColor(variant: string): string {
  switch (variant) {
    case 'primary':
      return Colors.white;
    case 'accent':
      return Colors.neutral900;
    case 'danger':
      return Colors.dangerDark;
    case 'ghost':
    case 'outline':
    default:
      return Colors.neutral900;
  }
}

export default Button;
