import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontWeight, Radius } from '../../theme';

export type AvatarSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type AvatarColor = 'blue' | 'purple' | 'green' | 'orange';

const SIZE_MAP: Record<AvatarSize, number> = { xl: 64, lg: 52, md: 40, sm: 32, xs: 24 };
const FONT_MAP: Record<AvatarSize, number> = { xl: 22, lg: 18, md: 14, sm: 12, xs: 10 };
const BG_MAP: Record<AvatarColor, string> = {
  blue:   Colors.blue,
  purple: Colors.purple,
  green:  Colors.lime,
  orange: Colors.orange,
};

interface AvatarProps {
  initials?: string;
  imageUri?: string;
  size?: AvatarSize;
  color?: AvatarColor;
  statusColor?: string;
  style?: ViewStyle;
}

export function Avatar({
  initials = '?',
  imageUri,
  size = 'md',
  color = 'blue',
  statusColor,
  style,
}: AvatarProps) {
  const dim = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const dotSize = Math.round(dim * 0.19);

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.circle,
          { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: BG_MAP[color] },
        ]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
        ) : (
          <Text style={[styles.initials, { fontSize }]}>{initials.slice(0, 2).toUpperCase()}</Text>
        )}
      </View>
      {statusColor ? (
        <View
          style={[
            styles.statusDot,
            { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: statusColor },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { position: 'relative', display: 'flex' },
  circle:    { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials:  { color: Colors.white, fontWeight: FontWeight.bold },
  statusDot: { position: 'absolute', bottom: 1, right: 1, borderWidth: 2, borderColor: Colors.white },
});

export default Avatar;
