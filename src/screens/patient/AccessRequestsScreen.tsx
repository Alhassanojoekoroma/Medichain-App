import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  brand: '#3E7BFA', brandDark: '#2F63D9', brandLight: '#E4EDFE',
  ink900: '#10131A', ink700: '#2B303A', gray500: '#8A93A6', gray200: '#E7EAF0',
  gray100: '#F1F3F8', gray50: '#F8F9FC', green100: '#DCF3E1', green600: '#0D9426',
  red100: '#FDEAEA', red600: '#EF4444', amber100: '#FDF3E2', amber600: '#F5A524',
  white: '#FFFFFF', canvas: '#EEF3FF',
  shadow: { shadowColor: '#10131A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3 },
};

const REQUESTS = {
  pending: [
    { id: 'p1', doctor: 'Dr. Amadu Williams', facility: 'Connaught Hospital', time: '10 mins ago', type: 'Full Medical History' },
    { id: 'p2', doctor: 'Dr. Isatu Kamara', facility: 'PCMH Maternity Ward', time: '2 hours ago', type: 'Recent Lab Results' },
    { id: 'p3', doctor: 'Dr. Samuel Bangura', facility: 'Rokupa Government Hospital', time: '5 hours ago', type: 'Prescription History' },
  ],
  active: [
    { id: 'a1', doctor: 'Dr. Fatu Koroma', facility: 'Choithram Memorial Hospital', expires: 'Ends in 2 days', type: 'Full Medical History' },
    { id: 'a2', doctor: 'Dr. Ibrahim Sesay', facility: 'King Harman Road Hospital', expires: 'Ends in 12 hours', type: 'Emergency Access' },
  ],
  expired: [
    { id: 'e1', doctor: 'Dr. Kadiatu Jalloh', facility: 'Lumina Clinic', date: 'Expired 12 Aug 2025', type: 'Recent Lab Results' },
  ]
};

export default function AccessRequestsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'pending'|'active'>('pending');

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={C.ink900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Access</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Privacy Notice */}
        <View style={styles.noticeBox}>
          <Feather name="shield" size={24} color={C.green600} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>You are in control</Text>
            <Text style={styles.noticeText}>
              MediChain SL ensures your records are encrypted. Healthcare providers can only view your data if you grant them access.
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'pending' && styles.tabBtnActive]} onPress={() => setTab('pending')}>
            <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>Pending ({REQUESTS.pending.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]} onPress={() => setTab('active')}>
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active ({REQUESTS.active.length})</Text>
          </TouchableOpacity>
        </View>

        {tab === 'pending' ? (
          <View>
            <Text style={styles.sectionTitle}>Requires Your Approval</Text>
            {REQUESTS.pending.map(req => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardDoctor}>{req.doctor}</Text>
                    <Text style={styles.cardFacility}>{req.facility}</Text>
                  </View>
                  <Text style={styles.cardTime}>{req.time}</Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>Requests: {req.type}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.btn, styles.btnOutline]}>
                    <Text style={styles.btnOutlineText}>Deny</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
                    <Text style={styles.btnPrimaryText}>Allow Access</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Currently Approved</Text>
            {REQUESTS.active.map(req => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardDoctor}>{req.doctor}</Text>
                    <Text style={styles.cardFacility}>{req.facility}</Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.expiresText}>{req.expires} · {req.type}</Text>
                <TouchableOpacity style={[styles.btn, styles.btnDanger]}>
                  <Text style={styles.btnDangerText}>Revoke Access</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Past Access</Text>
            {REQUESTS.expired.map(req => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardDoctor}>{req.doctor}</Text>
                    <Text style={styles.cardFacility}>{req.facility}</Text>
                  </View>
                  <Text style={styles.cardTime}>{req.date}</Text>
                </View>
                <Text style={styles.expiresText}>{req.type}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: C.ink900 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  noticeBox: { flexDirection: 'row', backgroundColor: C.green100, padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'flex-start' },
  noticeTitle: { fontSize: 16, fontWeight: 'bold', color: C.green600, marginBottom: 4 },
  noticeText: { fontSize: 13, color: C.ink700, lineHeight: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: C.gray200, borderRadius: 12, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: C.white, ...C.shadow },
  tabText: { fontSize: 14, fontWeight: '600', color: C.gray500 },
  tabTextActive: { color: C.ink900 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: C.ink900, marginBottom: 16 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 16, ...C.shadow },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardDoctor: { fontSize: 16, fontWeight: 'bold', color: C.ink900, marginBottom: 4 },
  cardFacility: { fontSize: 14, color: C.gray500 },
  cardTime: { fontSize: 12, color: C.gray500 },
  typeBadge: { backgroundColor: C.gray50, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 16 },
  typeBadgeText: { fontSize: 13, color: C.ink700, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { borderWidth: 1, borderColor: C.gray200 },
  btnOutlineText: { fontSize: 14, fontWeight: '600', color: C.ink700 },
  btnPrimary: { backgroundColor: C.brand },
  btnPrimaryText: { fontSize: 14, fontWeight: '600', color: C.white },
  activeBadge: { backgroundColor: C.green100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadgeText: { color: C.green600, fontSize: 12, fontWeight: 'bold' },
  expiresText: { fontSize: 14, color: C.ink700, marginBottom: 16 },
  btnDanger: { backgroundColor: C.red100 },
  btnDangerText: { color: C.red600, fontSize: 14, fontWeight: 'bold' },
});
