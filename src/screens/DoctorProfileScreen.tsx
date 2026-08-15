import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';

const TABS = ['About', 'Schedule', 'Experience', 'Reviews'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'];

export default function DoctorProfileScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const doctor = route?.params?.doctor ?? {
    id: '1', name: 'Prof. Dr. Niall Horan', specialty: 'Orthopedic Specialist',
    exp: 5, patients: 9845, rating: 4.9, price: 36, available: true, initials: 'NH',
  };
  const [activeTab, setActiveTab] = useState('About');
  const [selectedSlot, setSlot]   = useState('');

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={[styles.hero, { paddingTop: insets.top + Spacing.xl }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}
            accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{doctor.initials}</Text>
          </View>
          <Text style={styles.heroName}>{doctor.name}</Text>
          <Text style={styles.heroSpec}>{doctor.specialty}</Text>
          <Text style={styles.heroPrice}>Le {doctor.price.toLocaleString()} / consultation</Text>
          {doctor.available ? (
            <View style={styles.availPill}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Available today</Text>
            </View>
          ) : null}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Patients',  value: `${(doctor.patients / 1000).toFixed(1)}K` },
            { label: 'Experience',value: `${doctor.exp} yrs` },
            { label: 'Rating',    value: `${doctor.rating} ★` },
          ].map((stat, i) => (
            <View key={stat.label} style={[styles.statItem, i < 2 && styles.statDivider]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, activeTab === t && styles.tabActive]}
                onPress={() => setActiveTab(t)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === t }}
              >
                <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab contents */}
        <View style={styles.tabContent}>
          {activeTab === 'About' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>ABOUT</Text>
              <Text style={styles.about}>
                {doctor.name} is a board-certified {doctor.specialty} with {doctor.exp}+ years of experience at Connaught Hospital, Freetown. Specializing in complex joint conditions, sports injuries, and rehabilitation programmes for Sierra Leone's patient population.
              </Text>
              <View style={styles.infoRows}>
                <View style={styles.infoRow}><Ionicons name="business" size={16} color={Colors.textMuted} />
                  <Text style={styles.infoText}>Connaught Hospital, Freetown</Text></View>
                <View style={styles.infoRow}><Ionicons name="language" size={16} color={Colors.textMuted} />
                  <Text style={styles.infoText}>English, Krio</Text></View>
                <View style={styles.infoRow}><Ionicons name="shield-checkmark" size={16} color={Colors.textMuted} />
                  <Text style={styles.infoText}>NRA Registered · Board Certified</Text></View>
              </View>
            </View>
          )}

          {activeTab === 'Schedule' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>AVAILABLE SLOTS — TODAY</Text>
              <View style={styles.slotGrid}>
                {TIME_SLOTS.map((t, i) => {
                  const taken = i % 4 === 3;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.slot, selectedSlot === t && styles.slotActive, taken && styles.slotTaken]}
                      onPress={() => !taken && setSlot(t)}
                      disabled={taken}
                    >
                      <Text style={[styles.slotText, selectedSlot === t && styles.slotTextActive, taken && styles.slotTextTaken]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {activeTab === 'Experience' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>EDUCATION & TRAINING</Text>
              {[
                { year: '2010', title: 'MBBS, Fourah Bay College', desc: 'University of Sierra Leone' },
                { year: '2013', title: 'MSc Orthopaedic Surgery', desc: 'University of Ghana Medical School' },
                { year: '2016', title: 'Fellowship in Sports Medicine', desc: `King's College Hospital, London` },
              ].map((e, i) => (
                <View key={i} style={styles.expRow}>
                  <Text style={styles.expYear}>{e.year}</Text>
                  <View style={styles.expBody}>
                    <Text style={styles.expTitle}>{e.title}</Text>
                    <Text style={styles.expDesc}>{e.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>PATIENT REVIEWS</Text>
              {[
                { name: 'Aminata K.', rating: 5, text: 'Excellent doctor. Very thorough, explained everything clearly.', date: '10 Jun 2025' },
                { name: 'Ibrahim S.', rating: 4, text: 'Professional and friendly. Waited a bit but worth it.', date: '5 May 2025' },
              ].map((r, i) => (
                <View key={i} style={[styles.reviewRow, i > 0 && styles.reviewDivider]}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                  <Text style={styles.reviewText}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('BookAppointment', { doctor })}
          accessibilityRole="button"
          accessibilityLabel="Book appointment"
        >
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  hero:     { backgroundColor: Colors.primary, alignItems: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  backBtn:  { position: 'absolute', top: 56, left: Spacing.xl, width: 40, height: 40,
    borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center' },
  heroAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg },
  heroAvatarText: { fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white },
  heroName:   { fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.white, textAlign: 'center' },
  heroSpec:   { fontSize: FontSize.body, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  heroPrice:  { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.white, marginTop: 8 },
  availPill:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: 5 },
  availDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.green },
  availText:  { fontSize: FontSize.bodySmall, color: Colors.white },

  statsRow:   { flexDirection: 'row', backgroundColor: Colors.white, marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg, marginTop: -Spacing.xl, ...Shadow.card, overflow: 'hidden' },
  statItem:   { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg },
  statDivider:{ borderRightWidth: 1, borderRightColor: Colors.border },
  statValue:  { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.primary },
  statLabel:  { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 4 },

  tabRow:    { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingVertical: Spacing.sm },
  tab:       { paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg },
  tabActive: { backgroundColor: Colors.primary },
  tabText:   { fontSize: FontSize.bodySmall, fontWeight: FontWeight.medium, color: Colors.textMuted },
  tabTextActive: { color: Colors.white },

  tabContent: { padding: Spacing.lg },
  card:       { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.lg, ...Shadow.card },
  cardLabel:  { fontSize: FontSize.label, fontWeight: FontWeight.medium, color: Colors.textMuted,
    letterSpacing: 0.6, marginBottom: Spacing.md },
  about:      { fontSize: FontSize.body, color: Colors.textBody, lineHeight: 22 },
  infoRows:   { marginTop: Spacing.lg, gap: Spacing.md },
  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoText:   { fontSize: FontSize.bodySmall, color: Colors.textBody },

  slotGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot:          { paddingHorizontal: Spacing.lg, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  slotActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotTaken:     { backgroundColor: Colors.bg, borderColor: Colors.bg },
  slotText:      { fontSize: FontSize.bodySmall, color: Colors.dark, fontWeight: FontWeight.medium },
  slotTextActive:{ color: Colors.white },
  slotTextTaken: { color: Colors.textMuted },

  expRow:   { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.sm },
  expYear:  { fontSize: FontSize.caption, fontWeight: FontWeight.bold, color: Colors.primary, width: 36 },
  expBody:  { flex: 1 },
  expTitle: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.medium, color: Colors.dark },
  expDesc:  { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 },

  reviewRow:    { paddingVertical: Spacing.md },
  reviewDivider:{ borderTopWidth: 1, borderTopColor: Colors.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewName:   { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, color: Colors.dark },
  reviewDate:   { fontSize: FontSize.caption, color: Colors.textMuted },
  reviewStars:  { fontSize: FontSize.body, color: '#FFA800', marginBottom: 4 },
  reviewText:   { fontSize: FontSize.bodySmall, color: Colors.textBody, lineHeight: 18 },

  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, alignItems: 'center', paddingVertical: 14 },
  bookBtnText: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.white },
});
