import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors, Radius, Spacing, FontSize } from '../../theme';

/**
 * ChatInputBar — matches medichain-app-screens.html Screen D .input-bar exactly:
 *
 * variant="blue"  (Screen D, default):
 *   - transparent bg, 1.5px white border, border-radius 28, height 52
 *   - Left:  emoji icon (white stroke)
 *   - Divider: 1px rgba(255,255,255,0.4)
 *   - Middle: placeholder text rgba(255,255,255,0.85)
 *   - Right:  mic icon (white stroke)
 *   - Send button: black circle, white send arrow
 *
 * variant="white" (Screen F):
 *   - grey-100 bg, no border
 *   - All icons in #b5b5bb
 *   - Send button: #d8d8dc circle
 */

function EmojiIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Path d="M9 10h.01M15 10h.01M8.5 14.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function MicIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={9} y={3} width={6} height={11} rx={3} stroke={color} strokeWidth={1.6} />
      <Path d="M6 11a6 6 0 0012 0M12 19v2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12l16-7-6 16-3-6-7-3z" fill={Colors.white} />
    </Svg>
  );
}

interface ChatInputBarProps {
  value:          string;
  onChangeText:   (text: string) => void;
  onSend:         () => void;
  onAttach?:      () => void;
  placeholder?:   string;
  variant?:       'blue' | 'white';
}

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  placeholder = 'Type something…',
  variant = 'blue',
}: ChatInputBarProps) {
  const isBlue = variant === 'blue';

  const iconColor       = isBlue ? Colors.white : '#b5b5bb';
  const dividerColor    = isBlue ? 'rgba(255,255,255,0.4)' : '#d8d8dc';
  const placeholderColor= isBlue ? 'rgba(255,255,255,0.85)' : '#b5b5bb';
  const inputColor      = isBlue ? Colors.white : Colors.black;
  const barBg           = isBlue ? 'transparent' : Colors.grey100;
  const barBorder       = isBlue
    ? { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)' }
    : {};
  const sendBg          = isBlue ? Colors.black : '#d8d8dc';

  return (
    <View style={[styles.bar, { backgroundColor: barBg }, barBorder]}>
      <EmojiIcon color={iconColor} />

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <TextInput
        style={[styles.input, { color: inputColor }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        multiline={false}
        maxLength={1000}
        returnKeyType="send"
        onSubmitEditing={onSend}
      />

      <MicIcon color={iconColor} />

      <TouchableOpacity
        onPress={onSend}
        style={[styles.sendBtn, { backgroundColor: sendBg }]}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <SendIcon />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    borderRadius:  28,
    height:        52,
    paddingLeft:   18,
    paddingRight:  8,
  },
  divider: {
    width:  1,
    height: 22,
  },
  input: {
    flex:     1,
    fontSize: FontSize.body,
  },
  sendBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    alignItems:      'center',
    justifyContent:  'center',
  },
});

export default ChatInputBar;
