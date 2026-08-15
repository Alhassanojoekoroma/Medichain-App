import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

export type BubbleDirection = 'outgoing' | 'incoming';

interface MessageBubbleProps {
  direction:  BubbleDirection;
  text:       string;
  children?:  React.ReactNode; // MiniDocPreview or other inline content
  style?:     ViewStyle;
}

/**
 * MessageBubble — matches HTML Screen D / Screen F .bubble + .msg-row exactly:
 *
 *  Outgoing: white bg, black text, border-bottom-right-radius 4px
 *  Incoming: white bg, black text, border-bottom-left-radius 4px
 *  Both:     border-radius 20px, padding 14 16, font-size 14, line-height 1.4
 *
 * (Screen F outgoing uses grey-100 bg — pass variant="grey" for that)
 */

export function MessageBubble({ direction, text, children, style }: MessageBubbleProps) {
  const isOut = direction === 'outgoing';
  return (
    <View style={[styles.row, isOut ? styles.rowOut : styles.rowIn, style]}>
      <View style={[styles.bubble, isOut ? styles.bubbleOut : styles.bubbleIn]}>
        <Text style={styles.text}>{text}</Text>
        {children ? <View style={styles.childrenWrap}>{children}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', marginVertical: 2 },
  rowOut: { justifyContent: 'flex-end',   paddingLeft:  '20%' },
  rowIn:  { justifyContent: 'flex-start', paddingRight: '20%' },

  bubble: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  bubbleOut: {
    backgroundColor:         Colors.white,
    borderBottomRightRadius: 4,
  },
  bubbleIn: {
    backgroundColor:        Colors.white,
    borderBottomLeftRadius: 4,
  },

  childrenWrap: { marginTop: Spacing.sm },

  text: {
    fontSize:   FontSize.body,
    lineHeight: 19.6,  // 14 × 1.4
    color:      Colors.black,
  },
});

export default MessageBubble;
