import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
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

const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'New Access Request', message: 'Dr. Amadu Williams (Connaught Hospital) requested access to your records.', time: '2m ago', type: 'amber', read: false },
  { id: '2', title: 'Record Verified', message: 'Your recent blood panel results have been verified on-chain.', time: '1h ago', type: 'green', read: false },
  { id: '3', title: 'Appointment Reminder', message: 'Upcoming consultation at Choithram Hospital tomorrow at 10:30 AM.', time: '3h ago', type: 'brand', read: true },
  { id: '4', title: 'Access Revoked', message: 'You revoked access for PCMH Maternity Ward.', time: '1d ago', type: 'red', read: true },
  { id: '5', title: 'New Prescription', message: 'Dr. Isatu Kamara added a new prescription to your profile.', time: '2d ago', type: 'brand', read: true },
  { id: '6', title: 'System Update', message: 'MediChain SL network maintenance completed successfully.', time: '3d ago', type: 'gray', read: true },
  { id: '7', title: 'Record Shared', message: 'Emergency access granted to King Harman Road Hospital.', time: '1w ago', type: 'red', read: true },
  { id: '8', title: 'Account Secured', message: 'Two-factor authentication successfully enabled.', time: '2w ago', type: 'green', read: true },
];

const getTypeStyles = (type: string) => {
  switch(type) {
    case 'green': return { bg: C.green100, color: C.green600, icon: 'check-circle' };
    case 'red': return { bg: C.red100, color: C.red600, icon: 'alert-triangle' };
    case 'amber': return { bg: C.amber100, color: C.amber600, icon: 'clock' };
    case 'brand': return { bg: C.brandLight, color: C.brand, icon: 'calendar' };
    default: return { bg: C.gray200, color: C.gray500, icon: 'bell' };
  }
};

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const renderItem = ({ item }: any) => {
    const style = getTypeStyles(item.type);
    return (
      <TouchableOpacity style={[styles.notificationCard, !item.read && styles.unreadCard]}>
        {!item.read && <View style={styles.unreadDot} />}
        <View style={[styles.iconContainer, { backgroundColor: style.bg }]}>
          <Feather name={style.icon as any} size={20} color={style.color} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
          <Text style={styles.cardMessage}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={C.ink900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={markAllRead}>
          <Feather name="check-circle" size={24} color={C.brand} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: C.ink900 },
  listContent: { padding: 16 },
  notificationCard: { flexDirection: 'row', backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, ...C.shadow },
  unreadCard: { backgroundColor: '#FAFCFF', borderColor: C.brandLight, borderWidth: 1 },
  unreadDot: { position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: C.ink900, flex: 1, marginRight: 12 },
  cardTime: { fontSize: 12, color: C.gray500 },
  cardMessage: { fontSize: 14, color: C.ink700, lineHeight: 20 },
});
