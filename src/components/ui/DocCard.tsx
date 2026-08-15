import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface DocCardProps {
  name: string;
  sizeKb: number;
  date: string;
  type?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function DocCard({ name, sizeKb, date, type = 'PDF', onPress, style }: DocCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Document: ${name}`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="document-text" size={20} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta}>{type} · {sizeKb} KB · {date}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} /> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.white,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.md,
    gap:             Spacing.md,
  },
  iconWrap: {
    width:           36,
    height:          36,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  info: { flex: 1 },
  name: {
    fontSize:   FontSize.bodySmall,
    fontWeight: FontWeight.medium,
    color:      Colors.dark,
  },
  meta: {
    marginTop: 2,
    fontSize:  FontSize.caption,
    color:     Colors.textMuted,
  },
});

export default DocCard;
