import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

export default function AccountRecoveryScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color={Colors.dark} /></TouchableOpacity>
        <View><Text style={styles.title}>Account recovery</Text><Text style={styles.subtitle}>Keep your health records protected.</Text></View>
      </View>
      <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="shield-checkmark-outline" size={38} color={Colors.primary} /></View><Text style={styles.heroTitle}>Recover safely</Text><Text style={styles.heroText}>MediChain never uses security questions. Account recovery is verified through your phone number and, when a device changes, a facility visit.</Text></View>
      <View style={styles.steps}>
        <Step number="1" title="Confirm your phone number" detail="Receive a one-time SMS code from the approved identity provider." />
        <Step number="2" title="Verify the new device" detail="Enter the code only in the official MediChain app." />
        <Step number="3" title="Visit a facility if required" detail="Staff will check an approved identity document before records are made available on a changed device." />
      </View>
      <View style={styles.notice}><Ionicons name="information-circle-outline" size={20} color={Colors.warningDark} /><Text style={styles.noticeText}>Recovery enrollment is not connected yet because it must be enabled by the approved SMS/OIDC identity provider. Do not send passwords or identity documents through support channels.</Text></View>
      <TouchableOpacity style={styles.supportButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Return to profile"><Text style={styles.supportText}>Return to profile</Text></TouchableOpacity>
    </ScrollView>
  );
}

function Step({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <View style={styles.step}><View style={styles.number}><Text style={styles.numberText}>{number}</Text></View><View style={styles.stepCopy}><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepDetail}>{detail}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg }, content: { paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, paddingTop: Spacing.xxl, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }, back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.neutral100, justifyContent: 'center', alignItems: 'center' }, title: { color: Colors.dark, fontSize: FontSize.h3, fontWeight: FontWeight.bold }, subtitle: { color: Colors.textMuted, fontSize: FontSize.bodySmall, marginTop: 2 },
  hero: { alignItems: 'center', margin: Spacing.lg, padding: Spacing.xl, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border }, heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }, heroTitle: { color: Colors.dark, fontSize: FontSize.h3, fontWeight: FontWeight.bold }, heroText: { color: Colors.textBody, fontSize: FontSize.bodySmall, textAlign: 'center', lineHeight: 20, marginTop: Spacing.sm },
  steps: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.lg }, step: { flexDirection: 'row', gap: Spacing.md }, number: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }, numberText: { color: Colors.white, fontSize: FontSize.caption, fontWeight: FontWeight.bold }, stepCopy: { flex: 1 }, stepTitle: { color: Colors.dark, fontSize: FontSize.body, fontWeight: FontWeight.bold }, stepDetail: { color: Colors.textMuted, fontSize: FontSize.bodySmall, lineHeight: 19, marginTop: 3 },
  notice: { flexDirection: 'row', gap: Spacing.sm, margin: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.warningLight, borderWidth: 1, borderColor: Colors.warningBorder, alignItems: 'flex-start' }, noticeText: { flex: 1, color: Colors.warningDark, fontSize: FontSize.bodySmall, lineHeight: 19 }, supportButton: { minHeight: 48, borderRadius: Radius.pill, marginHorizontal: Spacing.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, supportText: { color: Colors.white, fontSize: FontSize.body, fontWeight: FontWeight.bold },
});
