import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

type Filter = 'All' | 'This week' | 'This month';

const MOCK_LOG = [
  { id: '1', who: 'Dr. Niall Horan', hospital: 'Connaught Hospital',
    date: '12 Jun 2025, 09:14 AM', records: 'Orthopedic Report', duration: '4 min', status: 'expired' },
  { id: '2', who: 'Dr. Alexandra Boje', hospital: 'Ola During Hospital',
    date: '10 Jun 2025, 02:30 PM', records: 'All records', duration: '2 min', status: 'expired' },
  { id: '3', who: 'EMERGENCY', hospital: 'Lumley Government Hospital',
    date: '05 Jun 2025, 11:45 PM', records: 'All records', duration: '15 min', status: 'emergency' },
  { id: '4', who: 'Dr. Bashiru Kamara', hospital: 'Freetown Clinic',
    date: '01 Jun 2025, 08:00 AM', records: 'Lab Report', duration: '3 min', status: 'revoked' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: 'Active',     bg: Colors.greenLight,   text: Colors.successDark },
  expired:   { label: 'Expired',    bg: Colors.bg,           text: Colors.textMuted   },
  revoked:   { label: 'Revoked',    bg: Colors.dangerLight,  text: Colors.dangerDark  },
  emergency: { label: 'EMERGENCY',  bg: Colors.orangeLight,  text: Colors.orange      },
};

export default function AccessLogScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('All');

  const logs = filter === 'All' ? MOCK_LOG : MOCK_LOG.slice(0, 2);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who viewed my records</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['All', 'This week', 'This month'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            accessibilityRole="tab"
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {logs.map((entry) => {
          const sc = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.expired;
          const isEmergency = entry.status === 'emergency';
          return (
            <View key={entry.id} style={[styles.logCard, isEmergency && styles.logCardEmergency]}>
              {isEmergency && (
                <View style={styles.emergencyBanner}>
                  <Ionicons name="warning" size={14} color={Colors.orange} />
                  <Text style={styles.emergencyLabel}>EMERGENCY ACCESS — no QR required</Text>
                </View>
              )}
              <View style={styles.logRow}>
                <View style={styles.logIcon}>
                  <Ionicons
                    name={isEmergency ? 'alert-circle' : 'shield-checkmark'}
                    size={20}
                    color={isEmergency ? Colors.orange : Colors.primary}
                  />
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logWho}>{entry.who}</Text>
                  <Text style={styles.logHospital}>{entry.hospital}</Text>
                  <Text style={styles.logMeta}>{entry.date} · {entry.duration} · {entry.records}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                </View>
              </View>
              {entry.status === 'active' && (
                <TouchableOpacity style={styles.revokeBtn} accessibilityRole="button" accessibilityLabel="Revoke access">
                  <Text style={styles.revokeBtnText}>Revoke</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Blockchain notice */}
        <View style={styles.chainNotice}>
          <Ionicons name="lock-closed" size={14} color={Colors.purple} />
          <Text style={styles.chainNoticeText}>All access events are permanently recorded on blockchain.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },

  filterRow: { flexDirection: 'row', backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingVertical: Spacing.sm },
  filterTab: { paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.pill, backgroundColor: Colors.bg },
  filterTabActive: { backgroundColor: Colors.primary },
  filterText:     { fontSize: FontSize.bodySmall, color: Colors.textMuted, fontWeight: FontWeight.medium },
  filterTextActive:{ color: Colors.white },

  scroll:  { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.sm },

  logCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.border, overflow: 'hidden' },
  logCardEmergency: { borderColor: Colors.orange },
  emergencyBanner: { flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.orangeLight, padding: Spacing.sm + 2, paddingHorizontal: Spacing.md },
  emergencyLabel: { fontSize: FontSize.label, color: Colors.orange, fontWeight: FontWeight.bold, letterSpacing: 0.4 },

  logRow:    { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.lg, gap: Spacing.md },
  logIcon:   { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logInfo:   { flex: 1 },
  logWho:    { fontSize: FontSize.h4, fontWeight: FontWeight.medium, color: Colors.dark },
  logHospital:{ fontSize: FontSize.bodySmall, color: Colors.textMuted, marginTop: 2 },
  logMeta:   { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 3 },
  statusBadge:{ borderRadius: Radius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 3 },
  statusText: { fontSize: FontSize.label, fontWeight: FontWeight.medium },

  revokeBtn: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1.5,
    borderColor: Colors.danger, borderRadius: Radius.pill, paddingVertical: 8, alignItems: 'center' },
  revokeBtnText: { fontSize: FontSize.body, color: Colors.danger, fontWeight: FontWeight.medium },

  chainNotice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.purpleLight, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  chainNoticeText: { flex: 1, fontSize: FontSize.bodySmall, color: Colors.purple, lineHeight: 18 },
});
