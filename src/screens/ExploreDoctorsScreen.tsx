import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Image, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Badge, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    rating: 4.8,
    reviews: 245,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    experience: '12 years',
    availability: 'Available Today',
    price: '$50',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    rating: 4.6,
    reviews: 189,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    experience: '8 years',
    availability: 'Available Tomorrow',
    price: '$45',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Neurologist',
    rating: 4.9,
    reviews: 312,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    experience: '15 years',
    availability: 'Available in 2 days',
    price: '$60',
  },
  {
    id: '4',
    name: 'Dr. James Anderson',
    specialty: 'Orthopedic',
    rating: 4.7,
    reviews: 267,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c006b310?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    experience: '10 years',
    availability: 'Available Today',
    price: '$55',
  },
];

const SPECIALTIES = ['All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedic'];

export default function ExploreDoctorsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState(DOCTORS);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = (doctorName: string) => {
    toastRef.current?.show({
      message: `Appointment with ${doctorName} booked!`,
      type: 'success',
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Doctor</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ SEARCH BAR ═══ */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.neutral500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, specialties..."
              placeholderTextColor={Colors.neutral500}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ═══ SPECIALTY FILTER ═══ */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtiesScroll}
          >
            {SPECIALTIES.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.specialtyChip,
                  selectedSpecialty === specialty && styles.activeSpecialtyChip,
                ]}
                onPress={() => setSelectedSpecialty(specialty)}
              >
                <Text
                  style={[
                    styles.specialtyText,
                    selectedSpecialty === specialty && styles.activeSpecialtyText,
                  ]}
                >
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ═══ DOCTORS LIST ═══ */}
        <View style={styles.section}>
          {filteredDoctors.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="doctor"
                size={64}
                color={Colors.neutral300}
              />
              <Text style={styles.emptyTitle}>No Doctors Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredDoctors.map((doctor) => (
              <Card key={doctor.id} style={styles.flatCard}>
                <CardBody>
                  <TouchableOpacity
                    style={styles.doctorCard}
                    onPress={() => navigation.navigate('DoctorProfile', { doctor })}
                    activeOpacity={0.7}
                  >
                    {/* Doctor Info */}
                    <View style={styles.doctorHeader}>
                      <Image
                        source={{ uri: doctor.avatar }}
                        style={styles.doctorAvatar}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <View style={styles.ratingRow}>
                          <MaterialCommunityIcons name="star" size={16} color={Colors.warning} />
                          <Text style={styles.rating}>{doctor.rating}</Text>
                          <Text style={styles.reviews}>({doctor.reviews} reviews)</Text>
                        </View>
                      </View>
                      <Text style={styles.price}>{doctor.price}</Text>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="briefcase" size={16} color={Colors.neutral600} />
                        <Text style={styles.detailText}>{doctor.experience}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color={Colors.neutral600} />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {doctor.availability}
                        </Text>
                      </View>
                    </View>

                    {/* Book Button */}
                    <Button
                      label="Book Appointment"
                      variant="primary"
                      size="small"
                      onPress={() => handleBookAppointment(doctor.name)}
                      style={styles.bookButton}
                    />
                  </TouchableOpacity>
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

  // ═══ SEARCH ═══
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.body,
    color: Colors.neutral900,
  },

  // ═══ FILTER ═══
  filterSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  specialtiesScroll: {
    gap: Spacing.sm,
  },
  specialtyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    backgroundColor: Colors.white,
  },
  activeSpecialtyChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specialtyText: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.neutral600,
  },
  activeSpecialtyText: {
    color: Colors.white,
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

  // ═══ DOCTOR CARD ═══
  doctorCard: {
    gap: Spacing.md,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
  },
  doctorName: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  doctorSpecialty: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rating: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  reviews: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
  },
  price: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  // ═══ DETAILS ═══
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral200,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.neutral200,
  },
  detailText: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    fontWeight: FontWeight.medium,
  },

  // ═══ BUTTON ═══
  bookButton: {
    marginTop: Spacing.md,
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
  },
});
