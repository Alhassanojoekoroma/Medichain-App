import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { Avatar } from '../components/ui/Avatar';

const MOCK_THREADS = [
  { id: 't1', name: 'Dr. Niall Horan',    specialty: 'Orthopedic',   initials: 'NH', unread: 2,
    lastMsg: 'Your lab results look good. Keep taking the ibuprofen.',  time: '09:14 AM',  online: true },
  { id: 't2', name: 'Dr. Fatima Conteh',  specialty: 'General',      initials: 'FC', unread: 0,
    lastMsg: 'Appointment confirmed for Monday at 10:00 AM.',          time: 'Yesterday', online: false },
  { id: 't3', name: 'Dr. Alexandra Boje', specialty: 'Cardiology',   initials: 'AB', unread: 1,
    lastMsg: 'Please share your last ECG report when you get a chance.',time: 'Tue',      online: false },
  { id: 't4', name: 'Dr. Samuel Sesay',   specialty: 'Neurology',    initials: 'SS', unread: 0,
    lastMsg: 'No further follow-up needed at this time.',              time: 'Mon',      online: false },
];

export default function ProviderChatListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Chat</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="New message">
          <Ionicons name="create-outline" size={22} color={Colors.blue} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_THREADS}
        keyExtractor={(t) => t.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        renderItem={({ item: thread }) => (
          <TouchableOpacity
            style={styles.thread}
            onPress={() => navigation.navigate('ProviderChatThread', { thread })}
            accessibilityRole="button"
            accessibilityLabel={`Open chat with ${thread.name}`}
            activeOpacity={0.8}
          >
            <Avatar
              initials={thread.initials}
              size="lg"
              color="blue"
              statusColor={thread.online ? Colors.lime : undefined}
            />
            <View style={styles.threadInfo}>
              <View style={styles.threadTopRow}>
                <Text style={styles.threadName}>{thread.name}</Text>
                <Text style={[styles.threadTime, thread.unread > 0 && styles.threadTimeUnread]}>
                  {thread.time}
                </Text>
              </View>
              <Text style={styles.threadSpec}>{thread.specialty}</Text>
              <Text style={[styles.threadMsg, thread.unread > 0 && styles.threadMsgUnread]}
                numberOfLines={1}>{thread.lastMsg}</Text>
            </View>
            {thread.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{thread.unread}</Text>
              </View>
            ) : null}
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
    borderBottomWidth: 1, borderBottomColor: Colors.grey300 },
  headerTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.black },

  list:      { paddingVertical: Spacing.sm },
  separator: { height: 1, backgroundColor: Colors.grey300, marginLeft: 52 + Spacing.xl + Spacing.md },

  thread: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    gap: Spacing.md },
  threadInfo:    { flex: 1 },
  threadTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadName:    { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.black },
  threadTime:    { fontSize: FontSize.caption, color: Colors.textSecondary },
  threadTimeUnread:{ color: Colors.blue, fontWeight: FontWeight.medium },
  threadSpec:    { fontSize: FontSize.caption, color: Colors.textSecondary, marginTop: 2 },
  threadMsg:     { fontSize: FontSize.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  threadMsgUnread:{ color: Colors.black, fontWeight: FontWeight.medium },

  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center' },
  unreadText:  { fontSize: FontSize.label, fontWeight: FontWeight.bold, color: Colors.white },
});
