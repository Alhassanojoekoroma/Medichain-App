import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
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

const DUMMY_RECORDS = [
  { id: '1', name: 'Blood Panel Results', date: '20 Aug 2025', hospital: 'Connaught Hospital', type: 'Lab', status: 'Verified' },
  { id: '2', name: 'Chest X-Ray', date: '15 Aug 2025', hospital: 'Ola During Hospital', type: 'Imaging', status: 'Verified' },
  { id: '3', name: 'Amoxicillin Prescription', date: '10 Aug 2025', hospital: 'Connaught Hospital', type: 'Prescriptions', status: 'Pending' },
  { id: '4', name: 'ECG Report', date: '01 Aug 2025', hospital: 'King Harman Road Hospital', type: 'Lab', status: 'Verified' },
  { id: '5', name: 'MRI Scan', date: '25 Jul 2025', hospital: 'Connaught Hospital', type: 'Imaging', status: 'Verified' },
  { id: '6', name: 'General Checkup', date: '12 Jul 2025', hospital: 'Macauley Street Hospital', type: 'All', status: 'Verified' },
  { id: '7', name: 'Malaria Test', date: '05 Jul 2025', hospital: 'Connaught Hospital', type: 'Lab', status: 'Verified' },
  { id: '8', name: 'Paracetamol Prescription', date: '01 Jul 2025', hospital: 'Ola During Hospital', type: 'Prescriptions', status: 'Verified' },
];

export default function RecordsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Lab', 'Prescriptions', 'Imaging'];

  const filteredRecords = DUMMY_RECORDS.filter(r => filter === 'All' || r.type === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={24} color={C.ink900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Medical Records</Text>
        <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Download records">
          <Feather name="download" size={24} color={C.ink900} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        {/* Chain Badge */}
        <View style={styles.chainBadge}>
          <Feather name="shield" size={16} color={C.green600} />
          <Text style={styles.chainBadgeText}>All records verified on-chain</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {filters.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="folder" size={48} color={C.gray200} />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredRecords.map(item => (
              <TouchableOpacity key={item.id} style={styles.recordCard}>
                <View style={styles.recordIconContainer}>
                  <Feather name="file-text" size={20} color={C.brand} />
                </View>
                <View style={styles.recordContent}>
                  <Text style={styles.recordName}>{item.name}</Text>
                  <Text style={styles.recordSubtext}>{item.date} · {item.hospital}</Text>
                </View>
                <View style={item.status === 'Verified' ? styles.badgeGreen : styles.badgeAmber}>
                  <Text style={item.status === 'Verified' ? styles.badgeGreenText : styles.badgeAmberText}>{item.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.white,
    ...C.shadow,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.ink900,
  },
  scrollContent: {
    padding: 20,
  },
  chainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.green100,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  chainBadgeText: {
    color: C.green600,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.white,
    marginRight: 12,
    borderWidth: 1,
    borderColor: C.gray200,
    minHeight: 44,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: C.brandDark,
    borderColor: C.brandDark,
  },
  filterChipText: {
    fontSize: 14,
    color: C.ink700,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: C.white,
  },
  listContainer: {
    gap: 12,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    padding: 16,
    borderRadius: 16,
    ...C.shadow,
  },
  recordIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: C.brandLight,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recordContent: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.ink900,
    marginBottom: 4,
  },
  recordSubtext: {
    fontSize: 13,
    color: C.gray500,
  },
  badgeGreen: {
    backgroundColor: C.green100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeGreenText: {
    color: C.green600,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeAmber: {
    backgroundColor: C.amber100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAmberText: {
    color: C.amber600,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: C.gray500,
  },
});
