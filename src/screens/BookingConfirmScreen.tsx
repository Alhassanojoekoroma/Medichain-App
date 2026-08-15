import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

export default function BookingConfirmScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const doctor    = route?.params?.doctor     ?? { name: 'Dr. Niall Horan', specialty: 'Orthopedic Specialist' };
  const apptType  = route?.params?.apptType  ?? 'In-person';
  const time      = route?.params?.time      ?? '10:00 AM';
  const payment   = route?.params?.payment   ?? 'mc';

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xxl }]} showsVerticalScrollIndicator={false}>

        {/* Animated checkmark */}
        <Animated.View style={[styles.checkWrap, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color={Colors.white} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
          <Text style={styles.headline}>Appointment Booked!</Text>
          <Text style={styles.sub}>Your appointment has been confirmed and a calendar invite has been sent.</Text>
        </Animated.View>

        {/* Confirmation card */}
        <Animated.View style={[styles.card, { opacity: opacityAnim }]}>
          <Text style={styles.cardLabel}>CONFIRMATION</Text>
          <View style={styles.bookingId}>
            <Text style={styles.bookingIdLabel}>Booking ID</Text>
            <Text style={styles.bookingIdValue}>MC-{Math.floor(100000 + Math.random() * 900000)}</Text>
          </View>
          {[
            { icon: 'person', label: 'Doctor',     value: doctor.name },
            { icon: 'medkit', label: 'Specialty',  value: doctor.specialty },
            { icon: 'time',   label: 'Time',       value: time || '10:00 AM, Mon 16 Jun' },
            { icon: 'videocam', label: 'Type',     value: apptType },
          ].map((row) => (
            <View key={row.label} style={styles.detailRow}>
              <Ionicons name={row.icon as any} size={16} color={Colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.calendarBtn}
          accessibilityRole="button"
          accessibilityLabel="Add to calendar"
        >
          <Ionicons name="calendar" size={18} color={Colors.primary} />
          <Text style={styles.calendarBtnText}>Add to Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: Spacing.xl, alignItems: 'center', gap: Spacing.xl },

  checkWrap:   { marginBottom: Spacing.sm },
  checkCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 6 },

  headline: { fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.dark, textAlign: 'center' },
  sub:      { fontSize: FontSize.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: 6 },

  card:      { width: '100%', backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl },
  cardLabel: { fontSize: FontSize.label, fontWeight: FontWeight.medium, color: Colors.textMuted,
    letterSpacing: 0.6, marginBottom: Spacing.md },
  bookingId: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  bookingIdLabel:{ fontSize: FontSize.caption, color: Colors.primary },
  bookingIdValue:{ fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.primaryDark,
    fontFamily: 'monospace' as any },

  detailRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailIcon: { marginRight: Spacing.md },
  detailLabel:{ width: 72, fontSize: FontSize.bodySmall, color: Colors.textMuted },
  detailValue:{ flex: 1, fontSize: FontSize.bodySmall, fontWeight: FontWeight.medium, color: Colors.dark },

  calendarBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 14 },
  calendarBtnText: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.primary },

  homeBtn: { width: '100%', backgroundColor: Colors.primary, borderRadius: Radius.pill,
    alignItems: 'center', paddingVertical: 14 },
  homeBtnText: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.white },
});
