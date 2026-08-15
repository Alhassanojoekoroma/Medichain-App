/**
 * src/components/shared/TextInput.tsx
 * 
 * Unified text input following MedChain design system
 * - 44px height
 * - Subtle 1px border (neutral-200 default)
 * - Border color changes to primary on focus
 * - Proper padding and alignment
 */

import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ label, error, containerStyle, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const inputBorderColor = isFocused ? Colors.primary : error ? Colors.danger : Colors.border;

    return (
      <View style={containerStyle}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <RNTextInput
          ref={ref}
          style={[
            styles.input,
            {
              borderColor: inputBorderColor,
            },
          ]}
          placeholderTextColor={Colors.neutral400}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    color: Colors.neutral900,
  },
  error: {
    fontSize: FontSize.label,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});

export default TextInput;
