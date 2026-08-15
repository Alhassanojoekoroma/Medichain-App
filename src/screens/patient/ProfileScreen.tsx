import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const C = {
  brand:       '#3E7BFA',
  brandDark:   '#2F63D9',
  brandLight:  '#E4EDFE',
  ink900:      '#10131A',
  ink700:      '#2B303A',
  gray500:     '#8A93A6',
  gray200:     '#E7EAF0',
  gray100:     '#F1F3F8',
  gray50:      '#F8F9FC',
  green100:    '#DCF3E1',
  green600:    '#0D9426',
  red100:      '#FDEAEA',
  red600:      '#EF4444',
  amber100:    '#FDF3E2',
  amber600:    '#F5A524',
  white:       '#FFFFFF',
  canvas:      '#EEF3FF',
  shadow: { shadowColor: '#10131A', shadowOffset: {width:0,height:4}, shadowOpacity:0.06, shadowRadius:14, elevation:3 },
};

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const Row = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.kvRow}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
      
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MK</Text>
        </View>
        <Text style={styles.name}>Mariatu Kamara</Text>
        <Text style={styles.idText}>ID: MC-994821</Text>
        
        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('Qr')}>
          <Feather name="maximize" size={20} color={C.white} style={{ marginRight: 8 }} />
          <Text style={styles.qrButtonText}>My QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <Row label="Full name" value="Mariatu Kamara" />
          <Row label="Date of birth" value="12 May 1988" />
          <Row label="Gender" value="Female" />
          <Row label="Blood type" value="O+" />
          <Row label="Phone" value="+232 77 123456" />
          <Row label="National ID" value="NIN-332994-SL" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Summary</Text>
        <View style={styles.card}>
          <Row label="Allergies" value="Penicillin, Peanuts" />
          <Row label="Pre-existing conditions" value="Hypertension" />
          <Row label="Emergency contact" value="Amadu Kamara (+232 78 987654)" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linked Hospitals</Text>
        <View style={styles.card}>
          <Text style={styles.hospitalItem}>• Connaught Hospital</Text>
          <Text style={styles.hospitalItem}>• Ola During Children's Hospital</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: C.brand,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: C.ink900,
    marginBottom: 4,
  },
  idText: {
    fontSize: 14,
    color: C.gray500,
    marginBottom: 16,
  },
  qrButton: {
    flexDirection: 'row',
    backgroundColor: C.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
  },
  qrButtonText: {
    color: C.white,
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.ink900,
    marginBottom: 12,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    ...C.shadow,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.gray50,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  kvLabel: {
    fontSize: 14,
    color: C.gray500,
  },
  kvValue: {
    fontSize: 14,
    fontWeight: '500',
    color: C.ink900,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  hospitalItem: {
    fontSize: 15,
    color: C.ink700,
    marginBottom: 8,
    fontWeight: '500',
  },
  signOutBtn: {
    backgroundColor: C.red100,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    minHeight: 44,
  },
  signOutText: {
    color: C.red600,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
