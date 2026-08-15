import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

type NotifType = 'record' | 'appointment' | 'access' | 'blockchain' | 'system';
type FilterTab = 'All' | 'Records' | 'Access' | 'System';

interface Notification {
  id:       string;
  type:     NotifType;
  title:    string;
  body:     string;
  time:     string;
  isRead:   boolean;
  icon:     string;
  iconBg:   string;
  iconColor:string;
}

const MOCK_NOTIFS: Notification[] = [
  { id: 'n1', type: 'record',      title: 'New record available',  body: 'Your Orthopedic Report from Connaught Hospital has been secured.', time: '09:14 AM', isRead: false, icon: 'document-text',  iconBg: Colors.primaryLight, iconColor: Colors.primary },
  { id: 'n2', type: 'access',      title: 'Record accessed',       body: 'Dr. Niall Horan viewed your records via QR scan.', time: '09:05 AM', isRead: false, icon: 'eye',           iconBg: Colors.purpleLight,  iconColor: Colors.purple },
  { id: 'n3', type: 'appointment', title: 'Appointment reminder',  body: 'You have an appointment with Dr. Fatima Conteh tomorrow at 10:00 AM.', time: 'Yesterday', isRead: true, icon: 'calendar', iconBg: Colors.greenLight, iconColor: Colors.green },
  { id: 'n4', type: 'blockchain',  title: 'Blockchain confirmed',  body: '12 confirmations — your Lab Report is now immutably secured.', time: 'Yesterday', isRead: true, icon: 'shield-checkmark', iconBg: Colors.greenLight, iconColor: Colors.successDark },
  { id: 'n5', type: 'system',      title: 'Security alert',        body: 'Emergency access was activated at Lumley Government Hospital.', time: 'Mon',      isRead: false, icon: 'warning', iconBg: Colors.orangeLight, iconColor: Colors.orange },
  { id: 'n6', type: 'record',      title: 'AI extraction complete',body: 'MediChain AI has analysed your Blood Test report and found no flags.', time: 'Sun', isRead: true, icon: 'sparkles', iconBg: Colors.purpleLight, iconColor: Colors.purple },
];

const FILTER_TABS: FilterTab[] = ['All', 'Records', 'Access', 'System'];

export default function NotificationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter]      = useState<FilterTab>('All');
  const [notifs, setNotifs]      = useState(MOCK_NOTIFS);

  const filtered = filter === 'All'    ? notifs
    : filter === 'Records' ? notifs.filter((n) => n.type === 'record' || n.type === 'blockchain')
    : filter === 'Access'  ? notifs.filter((n) => n.type === 'access')
    : notifs.filter((n) => n.type === 'system' || n.type === 'appointment');

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const markRead    = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.unreadCount}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} accessibilityRole="button" accessibilityLabel="Mark all as read">
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, filter === t && styles.tabActive]}
            onPress={() => setFilter(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === t }}
          >
            <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications list */}
      <FlatList
        data={filtered}
        keyExtractor={(n) => n.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No notifications here</Text>
          </View>
        }
        renderItem={({ item: notif }) => (
          <TouchableOpacity
            style={[styles.notifItem, !notif.isRead && styles.notifItemUnread]}
            onPress={() => markRead(notif.id)}
            accessibilityRole="button"
            accessibilityLabel={notif.title}
            activeOpacity={0.8}
          >
            <View style={[styles.notifIcon, { backgroundColor: notif.iconBg }]}>
              <Ionicons name={notif.icon as any} size={18} color={notif.iconColor} />
            </View>
            <View style={styles.notifBody}>
              <View style={styles.notifTitleRow}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              <Text style={styles.notifText} numberOfLines={2}>{notif.body}</Text>
            </View>
            {!notif.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  headerTitle:  { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.dark },
  unreadCount:  { fontSize: FontSize.caption, color: Colors.primary, marginTop: 1 },
  markAll:      { fontSize: FontSize.bodySmall, color: Colors.primary, fontWeight: FontWeight.medium },

  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:       { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Colors.bg },
  tabActive: { backgroundColor: Colors.primary },
  tabText:   { fontSize: FontSize.bodySmall, color: Colors.textMuted, fontWeight: FontWeight.medium },
  tabTextActive:{ color: Colors.white },

  list:        { flex: 1 },
  listContent: { paddingVertical: Spacing.sm },
  separator:   { height: 1, backgroundColor: Colors.border },

  notifItem:       { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md, gap: Spacing.md },
  notifItemUnread: { backgroundColor: Colors.primaryLight + '44' },
  notifIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center',
    justifyContent: 'center', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  notifTitle: { flex: 1, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, color: Colors.dark },
  notifTime:  { fontSize: FontSize.label, color: Colors.textMuted, flexShrink: 0 },
  notifText:  { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 3, lineHeight: 16 },
  unreadDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6, flexShrink: 0 },

  empty:     { alignItems: 'center', paddingVertical: 64, gap: Spacing.md },
  emptyText: { fontSize: FontSize.body, color: Colors.textMuted },
});
