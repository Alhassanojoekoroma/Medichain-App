import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { ManagedSession, SessionManagementService } from '../services/sessionManagementService';

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
}

export default function SessionManagementScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<ManagedSession[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStatus('loading');
      setSessions(await SessionManagementService.list());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const revoke = (session: ManagedSession) => {
    if (session.current) {
      Alert.alert('This device', 'Use Sign out from your profile to end the session on this device.');
      return;
    }
    Alert.alert('Revoke this session?', 'The device will lose access as soon as the server confirms this action.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke', style: 'destructive', onPress: async () => {
          try {
            setRevokingId(session.id);
            await SessionManagementService.revoke(session.id);
            setSessions((items) => items.map((item) => item.id === session.id ? { ...item, revokedAt: new Date().toISOString() } : item));
          } catch (error) {
            Alert.alert('Could not revoke session', error instanceof Error && error.message === 'SESSION_EXPIRED'
              ? 'Your session has expired. Please sign in again.'
              : 'The server did not confirm the revoke. This device may still have access. Please try again.');
          } finally {
            setRevokingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerCopy}><Text style={styles.title}>Devices & sessions</Text><Text style={styles.subtitle}>Manage where your account is signed in.</Text></View>
      </View>
      {status === 'error' ? (
        <View style={styles.center}><Ionicons name="cloud-offline-outline" size={36} color={Colors.textMuted} /><Text style={styles.errorTitle}>Sessions could not be loaded</Text><Text style={styles.errorText}>Check your connection and try again. No session has been changed.</Text><TouchableOpacity style={styles.retry} onPress={load}><Text style={styles.retryText}>Try again</Text></TouchableOpacity></View>
      ) : status === 'loading' ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading sessions…</Text></View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={Colors.primary} />}
          ListHeaderComponent={<View style={styles.notice}><Ionicons name="shield-checkmark-outline" size={20} color={Colors.primaryDark} /><Text style={styles.noticeText}>If a phone is lost or shared, revoke its session. The change only takes effect after the server confirms it.</Text></View>}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No active sessions found</Text><Text style={styles.emptyText}>Sign in again if you expected to see this device.</Text></View>}
          renderItem={({ item }) => {
            const revoked = Boolean(item.revokedAt);
            return <View style={[styles.card, revoked && styles.revokedCard]}>
              <View style={styles.cardTop}><View style={styles.deviceIcon}><Ionicons name={item.current ? 'phone-portrait-outline' : 'laptop-outline'} size={23} color={Colors.primary} /></View><View style={styles.cardCopy}><Text style={styles.cardTitle}>{item.current ? 'This device' : 'Signed-in device'}</Text><Text style={styles.cardMeta}>Last active {formatTime(item.lastActivityAt)}</Text></View>{item.current ? <View style={styles.currentBadge}><Text style={styles.currentText}>Current</Text></View> : null}</View>
              <Text style={styles.expiry}>Session expires {formatTime(item.expiresAt)}</Text>
              {revoked ? <Text style={styles.revokedText}>Revoked {formatTime(item.revokedAt!)}</Text> : !item.current ? <TouchableOpacity disabled={revokingId === item.id} style={styles.revokeButton} onPress={() => revoke(item)} accessibilityRole="button" accessibilityLabel="Revoke this session"><Text style={styles.revokeText}>{revokingId === item.id ? 'Revoking…' : 'Revoke session'}</Text></TouchableOpacity> : <Text style={styles.currentHelp}>To end this session, return to your profile and sign out.</Text>}
            </View>;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.neutral100 },
  headerCopy: { flex: 1 }, title: { color: Colors.dark, fontSize: FontSize.h3, fontWeight: FontWeight.bold }, subtitle: { color: Colors.textMuted, fontSize: FontSize.bodySmall, marginTop: 2 },
  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  notice: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primaryMid, alignItems: 'flex-start' }, noticeText: { flex: 1, color: Colors.primaryDark, fontSize: FontSize.bodySmall, lineHeight: 19 },
  card: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.lg }, revokedCard: { opacity: .72 }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, deviceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, cardCopy: { flex: 1 }, cardTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.dark }, cardMeta: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 }, currentBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: Colors.successLight }, currentText: { fontSize: FontSize.caption, color: Colors.successDark, fontWeight: FontWeight.bold }, expiry: { marginTop: Spacing.md, fontSize: FontSize.caption, color: Colors.textBody }, currentHelp: { marginTop: Spacing.md, fontSize: FontSize.caption, color: Colors.textMuted }, revokeButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.danger, backgroundColor: Colors.dangerLight }, revokeText: { color: Colors.danger, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold }, revokedText: { marginTop: Spacing.md, fontSize: FontSize.caption, color: Colors.dangerDark, fontWeight: FontWeight.bold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl, gap: Spacing.md }, loadingText: { color: Colors.textMuted, fontSize: FontSize.body }, errorTitle: { color: Colors.dark, fontSize: FontSize.h4, fontWeight: FontWeight.bold, textAlign: 'center' }, errorText: { color: Colors.textMuted, fontSize: FontSize.bodySmall, textAlign: 'center', lineHeight: 20 }, retry: { minHeight: 44, paddingHorizontal: Spacing.xl, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill, backgroundColor: Colors.primary }, retryText: { color: Colors.white, fontWeight: FontWeight.bold }, empty: { paddingVertical: Spacing.xxxl, alignItems: 'center' }, emptyTitle: { color: Colors.dark, fontSize: FontSize.h4, fontWeight: FontWeight.bold }, emptyText: { color: Colors.textMuted, fontSize: FontSize.bodySmall, textAlign: 'center', marginTop: Spacing.sm },
});
