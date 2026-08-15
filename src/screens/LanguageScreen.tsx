import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

export default function LanguageScreen({ navigation }: any) {
  return <View style={styles.screen}>
    <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color={Colors.dark} /></TouchableOpacity><View><Text style={styles.title}>Language</Text><Text style={styles.subtitle}>Choose how MediChain is displayed.</Text></View></View>
    <View style={styles.content}>
      <View style={styles.option}><View style={styles.optionCopy}><Text style={styles.optionTitle}>English</Text><Text style={styles.optionText}>Available now</Text></View><Ionicons name="checkmark-circle" size={25} color={Colors.success} /></View>
      <View style={styles.notice}><Ionicons name="information-circle-outline" size={21} color={Colors.primaryDark} /><Text style={styles.noticeText}>English is the only supported language at launch. Additional Sierra Leone language support requires an approved clinical-translation and accessibility plan before it is offered.</Text></View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg }, header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, paddingTop: Spacing.xxl, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }, back: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral100 }, title: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.dark }, subtitle: { fontSize: FontSize.bodySmall, color: Colors.textMuted, marginTop: 2 }, content: { padding: Spacing.lg, gap: Spacing.lg }, option: { minHeight: 68, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border }, optionCopy: { gap: 2 }, optionTitle: { color: Colors.dark, fontSize: FontSize.body, fontWeight: FontWeight.bold }, optionText: { color: Colors.textMuted, fontSize: FontSize.bodySmall }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.primaryMid }, noticeText: { flex: 1, color: Colors.primaryDark, fontSize: FontSize.bodySmall, lineHeight: 20 },
});
