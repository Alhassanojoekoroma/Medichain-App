import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { Avatar } from '../components/ui/Avatar';
import { useStore } from '../store/useStore';
import { AuthService } from '../services/authService';

type ProfileRow = { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; screen: string };

const SECURITY: ProfileRow[] = [
  { icon: 'phone-portrait-outline', title: 'Devices & sessions', description: 'Review or revoke signed-in devices', screen: 'Sessions' },
  { icon: 'key-outline', title: 'Account recovery', description: 'SMS OTP and re-verification guidance', screen: 'AccountRecovery' },
];
const SETTINGS: ProfileRow[] = [
  { icon: 'language-outline', title: 'Language', description: 'English', screen: 'Language' },
];

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const user = useStore((state) => state.user);
  const storeLogout = useStore((state) => state.logout);
  const [signingOut, setSigningOut] = useState(false);
  const initials = (user?.name ?? 'P').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const signOut = () => Alert.alert('Sign out?', 'Your encrypted local record cache will be removed from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: async () => {
      try {
        setSigningOut(true);
        await AuthService.logout();
        await storeLogout();
      } catch {
        await storeLogout();
      } finally {
        setSigningOut(false);
      }
    } },
  ]);

  return <View style={styles.screen}>
    <StatusBar style="light" />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <Avatar initials={initials} size="xl" color="blue" style={styles.avatar as any} />
        <Text style={styles.name}>{user?.name ?? 'Patient'}</Text>
        <Text style={styles.phone}>{user?.phone || 'Phone number not available'}</Text>
        <View style={styles.verified}><Ionicons name="shield-checkmark" size={14} color={Colors.white} /><Text style={styles.verifiedText}>Verified patient account</Text></View>
      </View>

      <View style={styles.identityCard}>
        <Text style={styles.identityTitle}>Your identity</Text>
        <Text style={styles.identityText}>Identity details are read-only after facility verification. Contact the verifying facility if a correction is needed.</Text>
      </View>

      <Section title="Security" rows={SECURITY} navigation={navigation} />
      <Section title="Settings" rows={SETTINGS} navigation={navigation} />

      <TouchableOpacity style={[styles.signOut, signingOut && styles.disabled]} onPress={signOut} disabled={signingOut} accessibilityRole="button" accessibilityLabel="Sign out">
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} /><Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
      </TouchableOpacity>
      <Text style={styles.version}>MediChain SL · v2.0</Text>
    </ScrollView>
  </View>;
}

function Section({ title, rows, navigation }: { title: string; rows: ProfileRow[]; navigation: any }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.menu}>{rows.map((row, index) => <TouchableOpacity key={row.title} style={[styles.row, index > 0 && styles.divider]} onPress={() => navigation.navigate(row.screen)} accessibilityRole="button" accessibilityLabel={row.title}><View style={styles.iconWrap}><Ionicons name={row.icon} size={20} color={Colors.primary} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{row.title}</Text><Text style={styles.rowDescription}>{row.description}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.textMuted} /></TouchableOpacity>)}</View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg }, content: { paddingBottom: Spacing.xxxl },
  header: { backgroundColor: Colors.primary, alignItems: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl }, avatar: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.45)' }, name: { fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.white, marginTop: Spacing.md }, phone: { fontSize: FontSize.bodySmall, color: 'rgba(255,255,255,0.78)', marginTop: 3 }, verified: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.sm, paddingVertical: 5, marginTop: Spacing.md, borderRadius: Radius.pill, backgroundColor: 'rgba(0,0,0,0.18)' }, verifiedText: { color: Colors.white, fontSize: FontSize.caption, fontWeight: FontWeight.bold },
  identityCard: { margin: Spacing.lg, marginBottom: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.primaryMid, backgroundColor: Colors.primaryLight }, identityTitle: { color: Colors.primaryDark, fontSize: FontSize.body, fontWeight: FontWeight.bold }, identityText: { color: Colors.primaryDark, fontSize: FontSize.bodySmall, lineHeight: 20, marginTop: 4 },
  section: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg }, sectionTitle: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: .7, paddingHorizontal: Spacing.sm, marginBottom: Spacing.sm }, menu: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, overflow: 'hidden' }, row: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }, divider: { borderTopWidth: 1, borderTopColor: Colors.border }, iconWrap: { width: 38, height: 38, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' }, rowCopy: { flex: 1 }, rowTitle: { color: Colors.dark, fontSize: FontSize.body, fontWeight: FontWeight.bold }, rowDescription: { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: 2 },
  signOut: { minHeight: 48, marginHorizontal: Spacing.lg, marginTop: Spacing.xxl, borderWidth: 1, borderColor: Colors.danger, borderRadius: Radius.pill, backgroundColor: Colors.dangerLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }, signOutText: { color: Colors.danger, fontSize: FontSize.body, fontWeight: FontWeight.bold }, disabled: { opacity: .6 }, version: { color: Colors.textMuted, fontSize: FontSize.label, textAlign: 'center', marginTop: Spacing.lg },
});
