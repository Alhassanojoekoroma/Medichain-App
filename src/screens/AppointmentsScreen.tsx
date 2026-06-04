import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Animated, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, CardBody, Badge, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const APPOINTMENTS = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    date: 'Apr 30, 2026',
    time: '10:30 AM',
    type: 'Hospital Visit',
    status: 'Confirmed',
    location: 'City Hospital',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    date: 'May 2, 2026',
    time: '2:00 PM',
    type: 'Video Consult',
    status: 'Pending',
    location: 'Online',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '3',
    doctorName: 'Dr. Emily Rodriguez',
    specialty: 'Neurologist',
    date: 'May 5, 2026',
    time: '3:30 PM',
    type: 'Follow-up',
    status: 'Confirmed',
    location: 'Wellness Center',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  },
];

export default function AppointmentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');

  const upcomingAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const pastAppointments = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');
  const displayedAppointments = activeTab === 'Upcoming' ? upcomingAppointments : pastAppointments;

  const handleReschedule = (id: string) => {
    toastRef.current?.show({
      message: 'Reschedule feature coming soon',
      type: 'info',
    });
  };

  const handleCancel = (id: string) => {
    setAppointments(appointments.map(appt =>
      appt.id === id ? { ...appt, status: 'Cancelled' } : appt
    ));
    toastRef.current?.show({
      message: 'Appointment cancelled',
      type: 'info',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ HEADER ═══ */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toastRef.current?.show({ message: 'Book new appointment', type: 'info' })}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ═══ TABS ═══ */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('Upcoming')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Upcoming' && styles.activeTabText,
              ]}
            >
              Upcoming
            </Text>
            {activeTab === 'Upcoming' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
            onPress={() => setActiveTab('Past')}
          >
            <Text
              style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}
            >
              Past
            </Text>
            {activeTab === 'Past' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* ═══ APPOINTMENTS LIST ═══ */}
        <View style={styles.section}>
          {displayedAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={64}
                color={Colors.neutral300}
              />
              <Text style={styles.emptyTitle}>No {activeTab} Appointments</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any {activeTab.toLowerCase()} appointments scheduled
              </Text>
              {activeTab === 'Upcoming' && (
                <Button
                  label="Book Appointment"
                  variant="primary"
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('ExploreDoctors')}
                />
              )}
            </View>
          ) : (
            displayedAppointments.map((appointment) => (
              <Card key={appointment.id} style={styles.flatCard}>
                <CardBody>
                  {/* Doctor Info */}
                  <View style={styles.appointmentHeader}>
                    <Image
                      source={{ uri: appointment.avatar }}
                      style={styles.doctorAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                      <Text style={styles.doctorSpec}>{appointment.specialty}</Text>
                      <Badge variant={appointment.status === 'Confirmed' ? 'primary' : 'warning'}>
                        {appointment.status}
                      </Badge>
                    </View>
                    <TouchableOpacity
                      style={styles.phoneButton}
                      onPress={() =>
                        toastRef.current?.show({
                          message: 'Call feature coming soon',
                          type: 'info',
                        })
                      }
                    >
                      <MaterialCommunityIcons
                        name="phone-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Details */}
                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={Colors.neutral600}
                      />
                      <Text style={styles.detailText}>
                        {appointment.date} at {appointment.time}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={Colors.neutral600}
                      />
                      <Text style={styles.detailText}>{appointment.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={Colors.neutral600}
                      />
                      <Text style={styles.detailText}>{appointment.type}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  {activeTab === 'Upcoming' && (
                    <View style={styles.actionButtons}>
                      <Button
                        label="Reschedule"
                        variant="ghost"
                        size="small"
                        onPress={() => handleReschedule(appointment.id)}
                        style={{ flex: 1, marginRight: Spacing.sm }}
                      />
                      <Button
                        label="Cancel"
                        variant="danger"
                        size="small"
                        onPress={() => handleCancel(appointment.id)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },

  // ═══ HEADER ═══
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ═══ TABS ═══
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
  tab: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.neutral600,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },

  // ═══ SECTIONS ═══
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },

  // ═══ CARDS ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },

  // ═══ APPOINTMENT CONTENT ═══
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  doctorAvatar: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
  },
  doctorName: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  doctorSpec: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.sm,
  },
  phoneButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ═══ DETAILS ═══
  detailsSection: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.neutral900,
  },

  // ═══ ACTIONS ═══
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  // ═══ EMPTY STATE ═══
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    marginTop: Spacing.lg,
  },
});
