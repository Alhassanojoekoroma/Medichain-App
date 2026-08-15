import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';

const MOCK_MEDS = [
  { id: 'm1', name: 'Ibuprofen', dose: '400mg', time: '08:00 AM', session: 'Morning', taken: true },
  { id: 'm2', name: 'Vitamin D3', dose: '1000 IU', time: '08:00 AM', session: 'Morning', taken: true },
  { id: 'm3', name: 'Metformin', dose: '500mg', time: '02:00 PM', session: 'Afternoon', taken: false },
  { id: 'm4', name: 'Lisinopril', dose: '10mg', time: '08:00 PM', session: 'Evening', taken: false },
  { id: 'm5', name: 'Aspirin', dose: '75mg', time: '08:00 PM', session: 'Evening', taken: false },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function MedicineTrackerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [meds, setMeds] = useState(MOCK_MEDS);
  const [selectedDay, setDay] = useState(DAYS[TODAY_IDX]);

  const takenCount = meds.filter((m) => m.taken).length;
  const pct = Math.round((takenCount / meds.length) * 100);

  const toggle = (id: string) =>
    setMeds((prev) => prev.map((m) => m.id === id ? { ...m, taken: !m.taken } : m));

  const sessions = ['Morning', 'Afternoon', 'Evening'];

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Tracker</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add medication">
          <Ionicons name="add-circle" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Week strip */}
        <View style={styles.weekStrip}>
          {DAYS.map((d, idx) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayItem, selectedDay === d && styles.dayItemActive]}
              onPress={() => setDay(d)}
              accessibilityRole="button"
              accessibilityLabel={d}
            >
              <Text style={[styles.dayLabel, selectedDay === d && styles.dayLabelActive]}>{d}</Text>
              <Text style={[styles.dayNum, selectedDay === d && styles.dayNumActive]}>{idx + 9}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Circular progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPct}>{pct}%</Text>
            <Text style={styles.progressLabel}>taken</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>{takenCount} of {meds.length} medications taken today</Text>
            <Text style={styles.progressSub}>{meds.length - takenCount} remaining</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
            </View>
          </View>
        </View>

        {/* Drug interaction warning */}
        <View style={styles.interactionWarning}>
          <Ionicons name="warning" size={18} color={Colors.orange} />
          <View style={styles.interactionText}>
            <Text style={styles.interactionTitle}>Drug interaction check</Text>
            <Text style={styles.interactionSub}>Ibuprofen + Aspirin may increase bleeding risk</Text>
          </View>
        </View>

        {/* Medications by session */}
        {sessions.map((session) => {
          const sessionMeds = meds.filter((m) => m.session === session);
          if (sessionMeds.length === 0) return null;
          return (
            <View key={session}>
              <Text style={styles.sessionTitle}>
                {session === 'Morning' ? '🌅' : session === 'Afternoon' ? '☀️' : '🌙'} {session}
              </Text>
              {sessionMeds.map((med) => (
                <View key={med.id} style={[styles.medCard, med.taken && styles.medCardTaken]}>
                  <View style={styles.medLeft}>
                    <View style={[styles.medIcon, { backgroundColor: med.taken ? Colors.greenLight : Colors.primaryLight }]}>
                      <Ionicons name="medical" size={18} color={med.taken ? Colors.green : Colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.medName, med.taken && styles.medNameTaken]}>{med.name}</Text>
                      <Text style={styles.medDose}>{med.dose} · {med.time}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.checkBtn, med.taken && styles.checkBtnActive]}
                    onPress={() => toggle(med.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: med.taken }}
                    accessibilityLabel={`Mark ${med.name} as ${med.taken ? 'not taken' : 'taken'}`}
                  >
                    {med.taken ? (
                      <Ionicons name="checkmark" size={16} color={Colors.white} />
                    ) : null}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },

  scroll:  { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },

  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.white,
    borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  dayItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.md },
  dayItemActive: { backgroundColor: Colors.primary },
  dayLabel:      { fontSize: 9, fontWeight: FontWeight.medium, color: Colors.textMuted, textTransform: 'uppercase' },
  dayLabelActive:{ color: 'rgba(255,255,255,0.75)' },
  dayNum:        { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark, marginTop: 2 },
  dayNumActive:  { color: Colors.white },

  progressCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.card },
  progressCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  progressPct:    { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.primary },
  progressLabel:  { fontSize: FontSize.label, color: Colors.textMuted },
  progressInfo:   { flex: 1 },
  progressTitle:  { fontSize: FontSize.bodySmall, fontWeight: FontWeight.medium, color: Colors.dark },
  progressSub:    { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 },
  progressBar:    { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginTop: Spacing.sm, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },

  interactionWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.orangeLight, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.warningBorder },
  interactionText:    { flex: 1 },
  interactionTitle:   { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, color: Colors.warningDark },
  interactionSub:     { fontSize: FontSize.caption, color: Colors.warningDark, marginTop: 2, lineHeight: 16 },

  sessionTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark,
    marginTop: Spacing.md, marginBottom: Spacing.sm },

  medCard:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.sm },
  medCardTaken: { opacity: 0.65, borderColor: Colors.greenLight },
  medLeft:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  medIcon:      { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  medName:      { fontSize: FontSize.bodySmall, fontWeight: FontWeight.medium, color: Colors.dark },
  medNameTaken: { textDecorationLine: 'line-through', color: Colors.textMuted },
  medDose:      { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 1 },
  checkBtn:     { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center' },
  checkBtnActive:{ backgroundColor: Colors.green, borderColor: Colors.green },
});
