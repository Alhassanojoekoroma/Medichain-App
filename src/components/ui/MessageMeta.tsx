import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../../theme';

interface MessageMetaProps {
  timestamp: string;
  isRead?: boolean;
  isOutgoing?: boolean;
}

export function MessageMeta({ timestamp, isRead = false, isOutgoing = false }: MessageMetaProps) {
  return (
    <View style={[styles.row, isOutgoing ? styles.rowOut : styles.rowIn]}>
      <Text style={styles.time}>{timestamp} {isRead ? '✓✓' : '✓'}</Text>
      {null /* checkmark folded into timestamp text above */
      /* isOutgoing ? (
        <Ionicons
          name={isRead ? 'checkmark-done' : 'checkmark'}
          size={12}
          color={isRead ? Colors.lime : Colors.textSecondary}
          style={styles.check}
        />
      ) : null */ }
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', marginTop: 3, marginBottom: Spacing.sm },
  rowOut: { justifyContent: 'flex-end',   paddingRight: Spacing.sm },
  rowIn:  { justifyContent: 'flex-start', paddingLeft:  Spacing.sm },
  time:   { fontSize: FontSize.label, color: Colors.textSecondary },
  check:  { marginLeft: 3 },
});

export default MessageMeta;
