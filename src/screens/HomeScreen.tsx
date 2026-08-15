import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../theme';
import { useStore } from '../store/useStore';

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-SL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function syncLabel(lastSyncedAt: string | null, status: string): string {
  if (status === 'syncing') return 'Updating securely…';
  if (!lastSyncedAt) return 'Not synced yet';
  const date = new Date(lastSyncedAt);
  return Number.isNaN(date.getTime()) ? 'Last update unavailable' : `Last updated ${date.toLocaleString('en-SL', { dateStyle: 'medium', timeStyle: 'short' })}`;
}

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, records, accessRequests, syncStatus, syncError, lastSyncedAt, syncPatientData } = useStore();
  const initials = (user?.name ?? 'Patient').split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();
  const recentRecords = useMemo(() => [...records].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 5), [records]);
  const hospitalCount = new Set(records.map(record => record.hospital).filter(Boolean)).size;
  const recordTypeCount = new Set(records.map(record => record.type).filter(Boolean)).size;
  const pendingConsents = accessRequests.filter(request => request.status === 'pending').length;
  const anchoredCount = records.filter(record => Boolean(record.hash)).length;

  return <View style={styles.screen}>
    <StatusBar style="dark" />
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={syncStatus === 'syncing'} onRefresh={() => void syncPatientData()} tintColor={Colors.primary} />}
    >
      <View style={styles.topRow}>
        <View><Text style={styles.brand}>MediChain SL</Text><Text style={styles.eyebrow}>Your verified health record</Text></View>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')} accessibilityRole="button" accessibilityLabel="Open profile"><Text style={styles.avatarText}>{initials}</Text></TouchableOpacity>
      </View>

      <View style={[styles.syncPill, syncStatus === 'error' && styles.syncPillWarning]} accessibilityLiveRegion="polite">
        <View style={[styles.syncDot, syncStatus === 'error' && styles.syncDotWarning]} />
        <Text style={styles.syncText}>{syncLabel(lastSyncedAt, syncStatus)}</Text>
      </View>
      {syncStatus === 'error' ? <TouchableOpacity style={styles.notice} onPress={() => void syncPatientData()} accessibilityRole="button"><Ionicons name="cloud-offline-outline" size={20} color={Colors.warningDark} /><Text style={styles.noticeText}>{syncError || 'We could not refresh. The last confirmed data remains visible.'}</Text><Text style={styles.retryText}>Retry</Text></TouchableOpacity> : null}

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}><View style={styles.profileIcon}><Ionicons name="person" size={23} color={Colors.primary} /></View><View style={styles.profileCopy}><Text style={styles.patientName}>{user?.name || 'Patient'}</Text><Text style={styles.patientId}>Patient ID: {user?.id || 'Not assigned'}</Text></View><View style={styles.verifiedBadge}><Ionicons name="shield-checkmark" size={14} color={Colors.successDark} /><Text style={styles.verifiedText}>Verified</Text></View></View>
        <View style={styles.profileMeta}><View><Text style={styles.metaLabel}>Blood group</Text><Text style={styles.metaValue}>{user?.bloodType || 'Not recorded'}</Text></View><View style={styles.rule} /><View style={styles.grow}><Text style={styles.metaLabel}>Phone</Text><Text style={styles.metaValue}>{user?.phone || 'Not recorded'}</Text></View></View>
      </View>

      <Text style={styles.sectionTitle}>At a glance</Text>
      <View style={styles.statsGrid}>
        <Stat icon="document-text-outline" label="Active records" value={String(records.length)} />
        <Stat icon="business-outline" label="Hospitals" value={String(hospitalCount)} />
        <Stat icon="layers-outline" label="Record types" value={String(recordTypeCount)} />
        <Stat icon="shield-checkmark-outline" label="On-chain anchors" value={String(anchoredCount)} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('Records')} accessibilityRole="button"><Ionicons name="folder-open-outline" size={20} color={Colors.white} /><Text style={styles.primaryActionText}>View records</Text></TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('AccessRequests')} accessibilityRole="button"><Ionicons name="shield-outline" size={20} color={Colors.primary} /><Text style={styles.secondaryActionText}>Consent</Text></TouchableOpacity>
      </View>
      {pendingConsents > 0 ? <TouchableOpacity style={styles.consentNotice} onPress={() => navigation.navigate('AccessRequests')} accessibilityRole="button"><Ionicons name="notifications-outline" size={20} color={Colors.warningDark} /><View style={styles.grow}><Text style={styles.consentTitle}>{pendingConsents} consent request{pendingConsents === 1 ? '' : 's'} awaiting your decision</Text><Text style={styles.consentText}>Review the grantee, purpose, and expiry before approving.</Text></View><Ionicons name="chevron-forward" size={20} color={Colors.warningDark} /></TouchableOpacity> : null}

      <View style={styles.recordsHeader}><View><Text style={styles.sectionTitle}>Recent records</Text><Text style={styles.sectionSubtitle}>Hospital, date, treatment type, and record name</Text></View><TouchableOpacity onPress={() => navigation.navigate('Records')} accessibilityRole="button"><Text style={styles.seeAll}>See all</Text></TouchableOpacity></View>
      {recentRecords.length === 0 ? <View style={styles.emptyCard}><Ionicons name="folder-open-outline" size={38} color={Colors.neutral400} /><Text style={styles.emptyTitle}>No records yet</Text><Text style={styles.emptyText}>When a verified clinician uploads a record, its real lifecycle status will appear here.</Text></View> : <View style={styles.recordList}>{recentRecords.map((record, index) => <TouchableOpacity key={record.id} style={[styles.recordRow, index < recentRecords.length - 1 && styles.recordDivider]} onPress={() => navigation.navigate('RecordDetail', { record })} accessibilityRole="button" accessibilityLabel={`Open ${record.title}`}><View style={styles.recordIcon}><Ionicons name="document-text-outline" size={20} color={Colors.primary} /></View><View style={styles.recordBody}><Text style={styles.recordTitle} numberOfLines={1}>{record.title}</Text><Text style={styles.recordHospital} numberOfLines={1}>{record.hospital || 'Facility not listed'}</Text><Text style={styles.recordMeta}>{record.type} · {formatDate(record.date)}</Text></View>{record.hash ? <View style={styles.chainMark}><Ionicons name="shield-checkmark" size={15} color={Colors.successDark} /></View> : <View style={styles.pendingMark}><Text>Pending</Text></View>}</TouchableOpacity>)}</View>}
    </ScrollView>
  </View>;
}

function Stat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.statCard}><View style={styles.statIcon}><Ionicons name={icon} size={20} color={Colors.primary} /></View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg }, content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl }, topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }, brand: { color: Colors.neutral900, fontSize: FontSize.h3, fontWeight: FontWeight.bold }, eyebrow: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.bodySmall }, avatar: { width: 48, height: 48, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }, avatarText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.bodyLarge },
  syncPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, backgroundColor: Colors.successLight, marginBottom: Spacing.md }, syncPillWarning: { backgroundColor: Colors.warningLight }, syncDot: { width: 7, height: 7, borderRadius: Radius.pill, backgroundColor: Colors.success }, syncDotWarning: { backgroundColor: Colors.warning }, syncText: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: FontWeight.medium },
  notice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.warningBorder, backgroundColor: Colors.warningLight, marginBottom: Spacing.md }, noticeText: { flex: 1, color: Colors.warningDark, fontSize: FontSize.bodySmall, lineHeight: 18 }, retryText: { color: Colors.warningDark, fontWeight: FontWeight.bold, fontSize: FontSize.bodySmall },
  profileCard: { padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, ...Shadow.card }, profileHeader: { flexDirection: 'row', alignItems: 'center' }, profileIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight }, profileCopy: { flex: 1, marginLeft: Spacing.md }, patientName: { color: Colors.neutral900, fontSize: FontSize.h3, fontWeight: FontWeight.bold }, patientId: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.caption }, verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 5, backgroundColor: Colors.successLight }, verifiedText: { color: Colors.successDark, fontSize: FontSize.label, fontWeight: FontWeight.bold }, profileMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border }, metaLabel: { color: Colors.textMuted, fontSize: FontSize.label, textTransform: 'uppercase' }, metaValue: { marginTop: 3, color: Colors.neutral900, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold }, rule: { width: 1, height: 32, marginHorizontal: Spacing.xl, backgroundColor: Colors.border }, grow: { flex: 1 },
  sectionTitle: { marginTop: Spacing.xl, color: Colors.neutral900, fontSize: FontSize.h3, fontWeight: FontWeight.bold }, sectionSubtitle: { marginTop: 3, color: Colors.textMuted, fontSize: FontSize.caption }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.md }, statCard: { width: '47%', minHeight: 122, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white }, statIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight }, statValue: { marginTop: Spacing.sm, color: Colors.neutral900, fontSize: FontSize.h2, fontWeight: FontWeight.bold }, statLabel: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.caption },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }, primaryAction: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderRadius: Radius.pill, backgroundColor: Colors.primary }, primaryActionText: { color: Colors.white, fontSize: FontSize.body, fontWeight: FontWeight.bold }, secondaryAction: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderRadius: Radius.pill, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.primaryMid }, secondaryActionText: { color: Colors.primary, fontSize: FontSize.body, fontWeight: FontWeight.bold }, consentNotice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.warningBorder, backgroundColor: Colors.warningLight }, consentTitle: { color: Colors.warningDark, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold }, consentText: { marginTop: 2, color: Colors.warningDark, fontSize: FontSize.caption },
  recordsHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, seeAll: { color: Colors.primary, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold }, emptyCard: { alignItems: 'center', marginTop: Spacing.md, padding: Spacing.xxl, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white }, emptyTitle: { marginTop: Spacing.sm, color: Colors.neutral900, fontSize: FontSize.h4, fontWeight: FontWeight.bold }, emptyText: { marginTop: Spacing.xs, color: Colors.textMuted, fontSize: FontSize.bodySmall, lineHeight: 18, textAlign: 'center' }, recordList: { marginTop: Spacing.md, overflow: 'hidden', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white }, recordRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md }, recordDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border }, recordIcon: { width: 42, height: 42, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight }, recordBody: { flex: 1, marginHorizontal: Spacing.md }, recordTitle: { color: Colors.neutral900, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold }, recordHospital: { marginTop: 2, color: Colors.textBody, fontSize: FontSize.caption }, recordMeta: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.label }, chainMark: { width: 30, height: 30, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successLight }, pendingMark: { borderRadius: Radius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4, backgroundColor: Colors.warningLight },
});
