import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { QuickReplyCard, QuickReplyItem } from './QuickReplyCard';
import { Colors } from '../../theme';

/**
 * QuickReplyGrid — matches HTML Screen D .quick-grid exactly:
 *
 *   display: grid; grid-template-columns: repeat(3,1fr); gap: 10px
 *   background: rgba(255,255,255,0.14)
 *   border-radius: 28px
 *   padding: 16px
 *
 * Items render in a 3-column grid (not 2-column as before).
 * First item is rendered as active by default when activeId matches.
 */

interface QuickReplyGridProps {
  items:     QuickReplyItem[];
  onSelect:  (item: QuickReplyItem) => void;
  activeId?: string;
  style?:    ViewStyle;
}

export function QuickReplyGrid({ items, onSelect, activeId, style }: QuickReplyGridProps) {
  // Chunk into rows of 3
  const rows: QuickReplyItem[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3));
  }

  return (
    <View style={[styles.grid, style]}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((item) => (
            <QuickReplyCard
              key={item.id}
              item={item}
              isActive={item.id === activeId || !!item.active}
              onPress={() => onSelect(item)}
              style={styles.card}
            />
          ))}
          {/* Pad last row with invisible placeholders */}
          {row.length === 2 && <View style={styles.card} />}
          {row.length === 1 && (
            <>
              <View style={styles.card} />
              <View style={styles.card} />
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius:    28,
    padding:         16,
    gap:             10,
  },
  row: {
    flexDirection: 'row',
    gap:           10,
  },
  card: {
    flex: 1,
  },
});

export default QuickReplyGrid;
