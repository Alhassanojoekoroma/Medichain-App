import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';

const SPECIALTIES = ['All', 'General', 'Cardio', 'Neuro', 'Ortho', 'Dental', 'Pediatric', 'Therapy'];

const MOCK_DOCTORS = [
  { id: '1', name: 'Prof. Dr. Niall Horan', specialty: 'Orthopedic Specialist',
    exp: 5, patients: 9845, rating: 4.9, price: 36, available: true, initials: 'NH' },
  { id: '2', name: 'Dr. Alexandra Boje', specialty: 'Cardiologist',
    exp: 8, patients: 12200, rating: 4.8, price: 65, available: true, initials: 'AB' },
  { id: '3', name: 'Dr. Samuel Sesay', specialty: 'Neurologist',
    exp: 12, patients: 7400, rating: 4.7, price: 55, available: false, initials: 'SS' },
  { id: '4', name: 'Dr. Fatima Conteh', specialty: 'General Practitioner',
    exp: 6, patients: 15000, rating: 4.9, price: 25, available: true, initials: 'FC' },
];

export default function FindDoctorsScreen({ navigation }: any) {
  const insets   = useSafeAreaInsets();
  const [search, setSearch]  = useState('');
  const [spec, setSpec]      = useState('All');

  const filtered = MOCK_DOCTORS.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec   = spec === 'All' || d.specialty.toLowerCase().includes(spec.toLowerCase());
    return matchSearch && matchSpec;
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Blue header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.location}>
            <Ionicons name="location" size={14} color={Colors.white} />
            <Text style={styles.locationText}>Freetown, Sierra Leone</Text>
          </View>
          <Ionicons name="options" size={22} color={Colors.white} />
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, specialty…"
            placeholderTextColor={Colors.textMuted}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Specialty filter chips */}
      <View style={styles.specWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specScroll}>
          {SPECIALTIES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.specChip, spec === s && styles.specChipActive]}
              onPress={() => setSpec(s)}
              accessibilityRole="tab"
              accessibilityState={{ selected: spec === s }}
            >
              <Text style={[styles.specText, spec === s && styles.specTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.resultCount}>{filtered.length} specialists found</Text>
      </View>

      {/* Doctor list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={styles.docCard}
            onPress={() => navigation.navigate('DoctorProfile', { doctor })}
            accessibilityRole="button"
            accessibilityLabel={`View profile: ${doctor.name}`}
            activeOpacity={0.8}
          >
            {/* Avatar */}
            <View style={styles.docAvatar}>
              <Text style={styles.docAvatarText}>{doctor.initials}</Text>
            </View>

            {/* Info */}
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doctor.name}</Text>
              <Text style={styles.docSpec}>{doctor.specialty}</Text>
              <Text style={styles.docPrice}>Le {doctor.price.toLocaleString()} / hr</Text>
              <View style={styles.docStats}>
                <Text style={styles.docStat}><Text style={styles.docStatBold}>{doctor.exp} yrs</Text> exp.</Text>
                <Text style={styles.docStat}><Text style={styles.docStatBold}>{doctor.patients.toLocaleString()}</Text> patients</Text>
                <Text style={styles.docStat}><Text style={styles.docStatBold}>{doctor.rating}</Text> ★</Text>
              </View>
            </View>

            {/* Availability */}
            <View style={[styles.availBadge, { backgroundColor: doctor.available ? Colors.greenLight : Colors.bg }]}>
              <View style={[styles.availDot, { backgroundColor: doctor.available ? Colors.green : Colors.textMuted }]} />
              <Text style={[styles.availText, { color: doctor.available ? Colors.successDark : Colors.textMuted }]}>
                {doctor.available ? 'Available' : 'Busy'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  header:    { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  location:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FontSize.body, color: Colors.white, fontWeight: FontWeight.medium },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.pill, paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.dark },

  specWrap:   { backgroundColor: Colors.white, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  specScroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, gap: Spacing.sm },
  specChip:   { paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  specChipActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  specText:     { fontSize: FontSize.bodySmall, color: Colors.textMuted, fontWeight: FontWeight.medium },
  specTextActive:{ color: Colors.white },
  resultCount:  { fontSize: FontSize.caption, color: Colors.textMuted, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },

  list:        { flex: 1 },
  listContent: { padding: Spacing.lg, gap: Spacing.md },

  docCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
    gap: Spacing.md, ...Shadow.card },
  docAvatar:     { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docAvatarText: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.primary },
  docInfo:       { flex: 1 },
  docName:       { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },
  docSpec:       { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 },
  docPrice:      { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 4 },
  docStats:      { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
  docStat:       { fontSize: FontSize.label, color: Colors.textMuted },
  docStatBold:   { fontWeight: FontWeight.bold, color: Colors.dark },
  availBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  availDot:  { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: FontSize.label, fontWeight: FontWeight.medium },
});
