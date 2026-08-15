import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface MiniDocPreviewProps {
  filename: string;
  sizeKb: number;
  onTap?: () => void;
}

export function MiniDocPreview({ filename, sizeKb, onTap }: MiniDocPreviewProps) {
  const Wrapper = onTap ? TouchableOpacity : View;
  return (
    <Wrapper
      style={styles.wrap}
      onPress={onTap}
      activeOpacity={0.8}
      accessibilityRole={onTap ? 'button' : undefined}
      accessibilityLabel={`Attached: ${filename}`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="document-text" size={16} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{filename}</Text>
        <Text style={styles.size}>{sizeKb} KB</Text>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    Radius.sm,
    padding:         Spacing.sm,
    gap:             Spacing.sm,
  },
  iconWrap: {
    width:           28,
    height:          28,
    borderRadius:    Radius.xs,
    backgroundColor: Colors.white,
    alignItems:      'center',
    justifyContent:  'center',
  },
  info: { flex: 1 },
  name: {
    fontSize:   FontSize.caption,
    fontWeight: FontWeight.medium,
    color:      Colors.white,
  },
  size: {
    fontSize: FontSize.label,
    color:    'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
});

export default MiniDocPreview;
