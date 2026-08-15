import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';
import { useStore } from '../store/useStore';

type Scope = 'all' | 'recent' | 'single';

export default function QRGenerateScreen({ navigation }: any) {
  const insets      = useSafeAreaInsets();
  const { user }    = useStore();
  const [scope, setScope]         = useState<Scope>('all');
  const [secondsLeft, setSeconds] = useState(300);
  const [token, setToken]         = useState(`MC-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const expired = secondsLeft <= 0;
  const critical = secondsLeft <= 60 && !expired;

  useEffect(() => {
    if (expired) return;
    intervalRef.current = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expired, token]);

  const regenerate = () => {
    setToken(`MC-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
    setSeconds(300);
  };

  const revoke = () => {
    Alert.alert('Revoke access', 'This will immediately invalidate the current QR code.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke now', style: 'destructive', onPress: () => setSeconds(0) },
    ]);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const qrPayload = JSON.stringify({ patientId: user?.id, token, scope, exp: Date.now() + secondsLeft * 1000 });

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Health ID</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Patient identity card */}
        <View style={styles.identityCard}>
          <View style={styles.identityLeft}>
            <Text style={styles.identityLabel}>PATIENT</Text>
            <Text style={styles.identityName}>{user?.name ?? 'Aminata Kamara'}</Text>
            <Text style={styles.identityId}>ID: {user?.id ?? 'PT-001'}</Text>
          </View>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodLabel}>BLOOD</Text>
            <Text style={styles.bloodType}>{user?.bloodType ?? 'O+'}</Text>
          </View>
        </View>

        {/* QR code */}
        <View style={styles.qrContainer}>
          {expired ? (
            <TouchableOpacity style={styles.expiredOverlay} onPress={regenerate}>
              <Ionicons name="refresh" size={32} color={Colors.textMuted} />
              <Text style={styles.expiredText}>Expired — tap to generate new key</Text>
            </TouchableOpacity>
          ) : (
            <QRCode
              value={qrPayload}
              size={240}
              color={Colors.dark}
              backgroundColor={Colors.white}
            />
          )}
        </View>

        {/* Access key + timer */}
        <View style={styles.accessKeyRow}>
          <View style={styles.accessKey}>
            <Text style={styles.accessKeyLabel}>ACCESS KEY</Text>
            <Text style={styles.accessKeyValue}>{token}</Text>
          </View>
          <View style={[styles.timer, critical && styles.timerCritical]}>
            <Ionicons name="time" size={14} color={critical ? Colors.danger : Colors.textMuted} />
            <Text style={[styles.timerText, critical && styles.timerTextCritical]}>{fmt(secondsLeft)}</Text>
          </View>
        </View>

        {/* Scope selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SHARE SCOPE</Text>
          {([
            { value: 'all',    label: 'Share all records',          icon: 'albums' },
            { value: 'recent', label: 'Share records from last 30 days', icon: 'calendar' },
            { value: 'single', label: 'Share specific record',      icon: 'document-text' },
          ] as { value: Scope; label: string; icon: string }[]).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.scopeRow, scope === opt.value && styles.scopeRowActive]}
              onPress={() => setScope(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: scope === opt.value }}
            >
              <Ionicons name={opt.icon as any} size={18} color={scope === opt.value ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.scopeLabel, scope === opt.value && styles.scopeLabelActive]}>{opt.label}</Text>
              <View style={[styles.radioOuter, scope === opt.value && styles.radioOuterActive]}>
                {scope === opt.value && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Warning notice */}
        <View style={styles.notice}>
          <Ionicons name="information-circle" size={16} color={Colors.orange} />
          <Text style={styles.noticeText}>Single use — expires after one scan or 5 minutes</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={regenerate}
          accessibilityRole="button" accessibilityLabel="Generate new key">
          <Ionicons name="refresh" size={18} color={Colors.white} />
          <Text style={styles.primaryBtnText}>Generate new key</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.revokeBtn} onPress={revoke}
          accessibilityRole="button" accessibilityLabel="Revoke access now">
          <Ionicons name="close-circle" size={18} color={Colors.danger} />
          <Text style={styles.revokeBtnText}>Revoke access now</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical:   Spacing.md,
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },

  scroll:  { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg, alignItems: 'center' },

  identityCard: {
    flexDirection:   'row',
    alignItems:      'center',
    width:           '100%',
    backgroundColor: Colors.primary,
    borderRadius:    Radius.xl,
    padding:         Spacing.xl,
    justifyContent:  'space-between',
  },
  identityLeft: {},
  identityLabel: { fontSize: FontSize.label, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.6 },
  identityName:  { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.white, marginTop: 4 },
  identityId:    { fontSize: FontSize.caption, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  bloodBadge:    { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg, padding: Spacing.md },
  bloodLabel: { fontSize: FontSize.label, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.4 },
  bloodType:  { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.white, marginTop: 2 },

  qrContainer: {
    width:           280,
    height:          280,
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     Colors.border,
    ...Shadow.strong,
  },
  expiredOverlay: { alignItems: 'center', gap: Spacing.md },
  expiredText:    { fontSize: FontSize.body, color: Colors.textMuted, textAlign: 'center' },

  accessKeyRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: Spacing.md },
  accessKey: {
    flex:            1,
    backgroundColor: Colors.white,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.md,
  },
  accessKeyLabel: { fontSize: FontSize.label, color: Colors.textMuted, letterSpacing: 0.4, marginBottom: 3 },
  accessKeyValue: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark,
    fontFamily: 'monospace' as any },

  timer: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: Colors.bg,
    borderRadius:    Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical:  Spacing.md,
  },
  timerCritical:     { backgroundColor: Colors.dangerLight },
  timerText:         { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },
  timerTextCritical: { color: Colors.danger },

  card: {
    width:           '100%',
    backgroundColor: Colors.white,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.lg,
  },
  cardLabel: { fontSize: FontSize.label, fontWeight: FontWeight.medium, color: Colors.textMuted,
    letterSpacing: 0.6, marginBottom: Spacing.md },

  scopeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderRadius: Radius.md, paddingHorizontal: Spacing.sm },
  scopeRowActive: { backgroundColor: Colors.primaryLight },
  scopeLabel:     { flex: 1, fontSize: FontSize.body, color: Colors.textBody },
  scopeLabelActive:{ color: Colors.primary, fontWeight: FontWeight.medium },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center' },
  radioOuterActive:{ borderColor: Colors.primary },
  radioInner:      { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },

  notice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, width: '100%',
    backgroundColor: Colors.orangeLight, borderRadius: Radius.md, padding: Spacing.md },
  noticeText: { flex: 1, fontSize: FontSize.bodySmall, color: Colors.warningDark, lineHeight: 18 },

  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.pill,
    paddingVertical: 14, width: '100%' },
  primaryBtnText: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.white },

  revokeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, borderWidth: 1.5, borderColor: Colors.danger, borderRadius: Radius.pill,
    paddingVertical: 14, width: '100%' },
  revokeBtnText: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.danger },
});
