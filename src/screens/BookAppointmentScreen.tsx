import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';
import { Stepper } from '../components/ui/Stepper';
import { PrimaryButton } from '../components/ui/PrimaryButton';

type Step = 0 | 1 | 2;

const STEPS = ['Details', 'Schedule', 'Payment'];

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const PAYMENT_METHODS = [
  { id: 'mc',     label: 'Mastercard',     icon: 'card', suffix: '****3184' },
  { id: 'visa',   label: 'Visa',           icon: 'card', suffix: '****0921' },
  { id: 'orange', label: 'Orange Money',   icon: 'phone-portrait', suffix: '' },
  { id: 'africell',label: 'Africell Money',icon: 'phone-portrait', suffix: '' },
];

export default function BookAppointmentScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const doctor = route?.params?.doctor ?? { name: 'Dr. Niall Horan', specialty: 'Orthopedic Specialist', price: 36 };

  const [step, setStep]           = useState<Step>(0);
  const [apptType, setApptType]   = useState<'In-person' | 'Video'>('In-person');
  const [duration, setDuration]   = useState<'30 min' | '45 min' | '60 min'>('30 min');
  const [selectedTime, setTime]   = useState('');
  const [selectedDay, setDay]     = useState('');
  const [payment, setPayment]     = useState('mc');

  const goNext = () => { if (step < 2) setStep((step + 1) as Step); };
  const goBack = () => {
    if (step > 0) setStep((step - 1) as Step);
    else navigation.goBack();
  };

  const confirm = () => navigation.replace('BookingConfirm', { doctor, apptType, time: selectedTime, payment });

  const days = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21'];

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepperWrap}>
        <Stepper steps={STEPS} currentStep={step} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Step 0 — Details */}
        {step === 0 && (
          <>
            {/* Doctor summary */}
            <View style={styles.card}>
              <View style={styles.docRow}>
                <View style={styles.docAvatar}>
                  <Text style={styles.docAvatarText}>{doctor.name.slice(4, 6).toUpperCase()}</Text>
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doctor.name}</Text>
                  <Text style={styles.docSpec}>{doctor.specialty}</Text>
                  <Text style={styles.docPrice}>Le {(doctor.price ?? 36).toLocaleString()} / hr</Text>
                </View>
              </View>
            </View>

            {/* Appointment type */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>APPOINTMENT TYPE</Text>
              <View style={styles.toggleRow}>
                {(['In-person', 'Video'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toggleBtn, apptType === t && styles.toggleBtnActive]}
                    onPress={() => setApptType(t)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: apptType === t }}
                  >
                    <Ionicons name={t === 'Video' ? 'videocam' : 'business'} size={16}
                      color={apptType === t ? Colors.white : Colors.textMuted} />
                    <Text style={[styles.toggleText, apptType === t && styles.toggleTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>DURATION</Text>
              <View style={styles.durationRow}>
                {(['30 min', '45 min', '60 min'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.durationChip, duration === d && styles.durationChipActive]}
                    onPress={() => setDuration(d)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: duration === d }}
                  >
                    <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Step 1 — Schedule */}
        {step === 1 && (
          <>
            {/* Day strip */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>SELECT DATE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayItem, selectedDay === d && styles.dayItemActive]}
                    onPress={() => setDay(d)}
                    accessibilityRole="button"
                    accessibilityLabel={d}
                  >
                    <Text style={[styles.dayText, selectedDay === d && styles.dayTextActive]}>
                      {d.slice(0, 3)}</Text>
                    <Text style={[styles.dayNum, selectedDay === d && styles.dayNumActive]}>
                      {d.slice(4)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Time slots */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>SELECT TIME</Text>
              <View style={styles.slotGrid}>
                {TIME_SLOTS.map((t, i) => {
                  const taken = i % 3 === 2;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.slot, selectedTime === t && styles.slotActive, taken && styles.slotTaken]}
                      onPress={() => !taken && setTime(t)}
                      disabled={taken}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedTime === t, disabled: taken }}
                    >
                      <Text style={[styles.slotText, selectedTime === t && styles.slotTextActive,
                        taken && styles.slotTextTaken]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Step 2 — Payment */}
        {step === 2 && (
          <>
            {/* Order summary */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>ORDER SUMMARY</Text>
              <View style={styles.summaryRow}><Text style={styles.summaryKey}>Doctor</Text><Text style={styles.summaryVal}>{doctor.name}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryKey}>Type</Text><Text style={styles.summaryVal}>{apptType}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryKey}>Date & Time</Text><Text style={styles.summaryVal}>{selectedDay} {selectedTime || '—'}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryKey}>Duration</Text><Text style={styles.summaryVal}>{duration}</Text></View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalKey}>Total</Text>
                <Text style={styles.totalVal}>Le {((doctor.price ?? 36) * (duration === '60 min' ? 1 : duration === '45 min' ? 0.75 : 0.5)).toFixed(0)}</Text>
              </View>
            </View>

            {/* Payment methods */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>PAYMENT METHOD</Text>
              {PAYMENT_METHODS.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  style={[styles.payOpt, payment === pm.id && styles.payOptActive]}
                  onPress={() => setPayment(pm.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: payment === pm.id }}
                >
                  <Ionicons name={pm.icon as any} size={22} color={Colors.dark} />
                  <View style={styles.payInfo}>
                    <Text style={styles.payLabel}>{pm.label}</Text>
                    {pm.suffix ? <Text style={styles.paySuffix}>{pm.suffix}</Text> : null}
                  </View>
                  <View style={[styles.radio, payment === pm.id && styles.radioActive]}>
                    {payment === pm.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        {step < 2 ? (
          <PrimaryButton label="Continue" onPress={goNext} fullWidth />
        ) : (
          <PrimaryButton label="Confirm & Pay" onPress={confirm} fullWidth />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },
  stepperWrap: { backgroundColor: Colors.white, paddingVertical: Spacing.xl,
    borderBottomWidth: 1, borderBottomColor: Colors.border },
  scroll:  { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },
  card:    { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.lg, ...Shadow.card },
  cardLabel:{ fontSize: FontSize.label, fontWeight: FontWeight.medium, color: Colors.textMuted,
    letterSpacing: 0.6, marginBottom: Spacing.md },

  docRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  docAvatar:{ width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center' },
  docAvatarText: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.primary },
  docInfo:  { flex: 1 },
  docName:  { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },
  docSpec:  { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 },
  docPrice: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 4 },

  toggleRow: { flexDirection: 'row', backgroundColor: Colors.bg, borderRadius: Radius.pill, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 10, borderRadius: Radius.pill },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText:      { fontSize: FontSize.body, fontWeight: FontWeight.medium, color: Colors.textMuted },
  toggleTextActive:{ color: Colors.white },

  durationRow: { flexDirection: 'row', gap: Spacing.sm },
  durationChip:{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  durationChipActive:{ borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  durationText:     { fontSize: FontSize.bodySmall, color: Colors.textMuted, fontWeight: FontWeight.medium },
  durationTextActive:{ color: Colors.primary },

  dayScroll: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  dayItem:   { width: 52, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center',
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border },
  dayItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayText:       { fontSize: FontSize.label, color: Colors.textMuted },
  dayTextActive: { color: 'rgba(255,255,255,0.8)' },
  dayNum:        { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark, marginTop: 2 },
  dayNumActive:  { color: Colors.white },

  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot:     { paddingHorizontal: Spacing.lg, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  slotActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotTaken:     { backgroundColor: Colors.bg, borderColor: Colors.bg },
  slotText:      { fontSize: FontSize.bodySmall, color: Colors.dark, fontWeight: FontWeight.medium },
  slotTextActive:{ color: Colors.white },
  slotTextTaken: { color: Colors.textMuted },

  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryKey:   { fontSize: FontSize.bodySmall, color: Colors.textMuted },
  summaryVal:   { fontSize: FontSize.bodySmall, color: Colors.dark, fontWeight: FontWeight.medium },
  summaryTotal: { borderBottomWidth: 0, marginTop: Spacing.sm },
  totalKey:     { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },
  totalVal:     { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.primary },

  payOpt:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.white, marginBottom: Spacing.sm },
  payOptActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  payInfo:      { flex: 1 },
  payLabel:     { fontSize: FontSize.body, fontWeight: FontWeight.medium, color: Colors.dark },
  paySuffix:    { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 1 },
  radio:        { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center' },
  radioActive:  { borderColor: Colors.primary },
  radioInner:   { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },

  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
