import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

/**
 * ChatHeader — two visual variants matching the HTML reference
 *
 * variant="blue"  → Screen D: blue background, white icon-buttons (back + close)
 *                   Large "Provider\nChat" heading in white (22px, 800 weight)
 *
 * variant="white" → Screen F: white background, grey-100 icon-buttons (back + phone)
 *                   Smaller "Provider chat" heading in black (19px, 800 weight)
 */

function BackArrow({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4c0 8 6 14 14 14l1-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round"
      />
    </Svg>
  );
}

interface ChatHeaderProps {
  title?:         string;
  variant?:       'blue' | 'white';
  onBack:         () => void;
  onAction?:      () => void;
  // Legacy props (still accepted for backward compat)
  doctorName?:    string;
  specialty?:     string;
  avatarInitials?: string;
  isOnline?:      boolean;
  onInfo?:        () => void;
}

export function ChatHeader({
  title,
  variant = 'blue',
  onBack,
  onAction,
  doctorName,
}: ChatHeaderProps) {

  const isBlue = variant === 'blue';

  // Resolve heading text
  const heading = title ?? doctorName ?? 'Provider\nChat';

  const bgColor       = isBlue ? 'transparent' : Colors.white;
  const btnBg         = isBlue ? 'rgba(255,255,255,0.15)' : Colors.grey100;
  const iconColor     = isBlue ? Colors.white : Colors.black;
  const titleColor    = isBlue ? Colors.white : Colors.black;
  const titleSize     = isBlue ? 22 : 19;

  return (
    <View style={[styles.header, { backgroundColor: bgColor }]}>
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={[styles.iconBtn, { backgroundColor: btnBg }]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <BackArrow color={iconColor} />
      </TouchableOpacity>

      {/* Heading */}
      <Text style={[styles.title, { color: titleColor, fontSize: titleSize }]}>
        {heading}
      </Text>

      {/* Action button (close or phone) */}
      <TouchableOpacity
        onPress={onAction}
        style={[styles.iconBtn, { backgroundColor: btnBg }]}
        accessibilityRole="button"
        accessibilityLabel={isBlue ? 'Close chat' : 'Call provider'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isBlue ? <CloseIcon color={iconColor} /> : <PhoneIcon color={iconColor} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  iconBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    alignItems:      'center',
    justifyContent:  'center',
  },
  title: {
    fontWeight: FontWeight.black,
    lineHeight: 27,
    textAlign:  'center',
  },
});

export default ChatHeader;
