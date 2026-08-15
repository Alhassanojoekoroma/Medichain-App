import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Dimensions } from 'react-native';
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

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.greetingText}>Good morning, Mariatu! 👋</Text>
          <TouchableOpacity style={styles.notificationBtn} accessibilityLabel="Notifications">
            <Feather name="bell" size={20} color={C.brand} />
          </TouchableOpacity>
        </View>

        {/* Status Row */}
        <View style={styles.statusRow}>
          <View style={styles.statusTopRow}>
            <View style={styles.statusIconAndText}>
              <Feather name="shield" size={20} color={C.green600} />
              <Text style={styles.statusText}>All records verified on-chain</Text>
            </View>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.statusSubtitle}>Hyperledger Fabric · Last sync: 2 min ago</Text>
        </View>

        {/* Quick Actions Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsContainer}>
          {[
            { icon: 'calendar', label: 'Book\nAppointment', route: 'Appointments' },
            { icon: 'file-text', label: 'My\nRecords', route: 'Records' },
            { icon: 'maximize', label: 'My\nQR', route: 'Qr' },
            { icon: 'user', label: 'My\nProfile', route: 'Profile' },
          ].map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionChip} onPress={() => navigation.navigate(action.route)}>
              <View style={styles.actionIconContainer}>
                <Feather name={action.icon as any} size={24} color={C.brand} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Health Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.healthCardsContainer}>
          <View style={styles.healthCard}>
            <Text style={styles.cardTitle}>Upcoming Appointment</Text>
            <Text style={styles.cardInfo}>Aug 22, 10:30 AM</Text>
            <Text style={styles.cardInfo2}>Dr. Isatu Kamara - Consultation</Text>
            <View style={[styles.badgeBlue, { alignSelf: 'flex-start', marginTop: 8 }]}>
              <Text style={styles.badgeBlueText}>Confirmed</Text>
            </View>
          </View>
          <View style={styles.healthCard}>
            <Text style={styles.cardTitle}>Recent Record</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              <Feather name="file-text" size={16} color={C.ink700} style={{ marginRight: 6 }} />
              <Text style={styles.cardInfo}>Blood Panel Results</Text>
            </View>
            <Text style={styles.cardInfo2}>20 Aug 2025</Text>
            <View style={[styles.badgeGreen, { alignSelf: 'flex-start', marginTop: 8 }]}>
              <Text style={styles.badgeGreenText}>Verified</Text>
            </View>
          </View>
        </ScrollView>

        {/* Recent Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.recordItem}>
              <View style={styles.recordIconContainer}>
                <Feather name="file" size={20} color={C.brand} />
              </View>
              <View style={styles.recordItemContent}>
                <Text style={styles.recordItemTitle}>Chest X-Ray {item}</Text>
                <Text style={styles.recordItemDate}>15 Aug 2025</Text>
              </View>
              <Feather name="chevron-right" size={20} color={C.gray500} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Access Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Access Requests</Text>
          {[1, 2].map((item) => (
            <View key={item} style={styles.accessRequestCard}>
              <Text style={styles.accessRequestText}>
                <Text style={{ fontWeight: 'bold' }}>Dr. Amadu Williams</Text> wants access to your records - Connaught Hospital.
              </Text>
              <View style={styles.accessRequestActions}>
                <TouchableOpacity style={[styles.btn, styles.btnOutline]}>
                  <Text style={styles.btnOutlineText}>Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
                  <Text style={styles.btnPrimaryText}>Allow</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: C.ink900,
    flex: 1,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    ...C.shadow,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIconAndText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.ink900,
    marginLeft: 8,
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
  statusSubtitle: {
    fontSize: 12,
    color: C.gray500,
  },
  quickActionsContainer: {
    paddingBottom: 24,
  },
  actionChip: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 56,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: C.brandLight,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    color: C.ink700,
    fontWeight: '500',
    textAlign: 'center',
  },
  healthCardsContainer: {
    paddingBottom: 24,
  },
  healthCard: {
    ...C.shadow,
    width: screenWidth * 0.8,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: C.gray500,
    marginBottom: 8,
    fontWeight: '500',
  },
  cardInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.ink900,
    marginBottom: 4,
  },
  cardInfo2: {
    fontSize: 14,
    color: C.ink700,
  },
  badgeBlue: {
    backgroundColor: C.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeBlueText: {
    color: C.brandDark,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.ink900,
    marginBottom: 16,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    ...C.shadow,
  },
  recordIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: C.brandLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordItemContent: {
    flex: 1,
  },
  recordItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.ink900,
    marginBottom: 2,
  },
  recordItemDate: {
    fontSize: 13,
    color: C.gray500,
  },
  accessRequestCard: {
    backgroundColor: C.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...C.shadow,
  },
  accessRequestText: {
    fontSize: 14,
    color: C.ink700,
    lineHeight: 20,
    marginBottom: 16,
  },
  accessRequestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: C.gray200,
  },
  btnOutlineText: {
    color: C.ink700,
    fontWeight: '600',
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: C.brand,
  },
  btnPrimaryText: {
    color: C.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
