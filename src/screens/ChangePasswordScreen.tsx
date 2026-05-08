import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

export default function ChangePasswordScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toastRef.current?.show({ message: 'Please fill all fields', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toastRef.current?.show({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    
    toastRef.current?.show({ message: 'Password changed successfully', type: 'success' });
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ═══ HEADER ═══ */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ CONTENT ═══ */}
        <View style={styles.section}>
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.neutral400}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.neutral400}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.neutral400}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <Button
                label="Update Password"
                variant="primary"
                onPress={handleChangePassword}
                style={{ marginTop: Spacing.md }}
              />
            </CardBody>
          </Card>
        </View>
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
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.body,
    color: Colors.neutral900,
    fontWeight: FontWeight.medium,
  },
});
