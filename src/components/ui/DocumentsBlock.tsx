import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';
import { DocCard } from './DocCard';

interface Document {
  id: string;
  name: string;
  sizeKb: number;
  date: string;
  type?: string;
}

interface DocumentsBlockProps {
  documents: Document[];
  style?: ViewStyle;
}

export function DocumentsBlock({ documents, style }: DocumentsBlockProps) {
  return (
    <View style={[styles.block, style]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Attached documents</Text>
        <Text style={styles.count}>{documents.length}</Text>
      </View>
      {documents.map((doc, idx) => (
        <DocCard
          key={doc.id}
          name={doc.name}
          sizeKb={doc.sizeKb}
          date={doc.date}
          type={doc.type}
          style={idx > 0 ? styles.docGap : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: Colors.bg,
    borderRadius:    Radius.lg,
    padding:         Spacing.lg,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   Spacing.md,
  },
  headerText: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.medium,
    color:      Colors.dark,
  },
  count: {
    fontSize:        FontSize.label,
    fontWeight:      FontWeight.bold,
    color:           Colors.primary,
    backgroundColor: Colors.primaryLight,
    borderRadius:    Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  docGap: { marginTop: Spacing.sm },
});

export default DocumentsBlock;
