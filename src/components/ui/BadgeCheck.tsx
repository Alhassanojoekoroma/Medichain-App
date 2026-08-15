import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme';

interface BadgeCheckProps {
  size?: number;
}

export function BadgeCheck({ size = 20 }: BadgeCheckProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="checkmark-circle" size={size} color={Colors.successDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

export default BadgeCheck;
