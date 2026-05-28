import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Toast, Button } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import QRCode from 'react-native-qrcode-svg';
import { useStore } from '../store/useStore';

export default function SecurityScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { user } = useStore();
  const [privacySettings, setPrivacySettings] = useState({
    twoFactor: true,
    biometric: true,
    dataSharing: false,
    marketingEmails: false,
    activityLog: true,
  });

  const handleToggle = (key: string) => {
    setPrivacySettings({ ...privacySettings, [key]: !privacySettings[key as keyof typeof privacySettings] });
    toastRef.current?.show({
      message: 'Setting updated',
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
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ MY MEDICAL ID (QR) ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Medical ID</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.qrContainer}>
                <QRCode
                  value={user?.id || 'medichain-user'}
                  size={150}
                  color={Colors.primary}
                  backgroundColor={Colors.white}
                />
                <Text style={styles.qrText}>
                  Show this QR code to healthcare providers to grant them temporary access to your medical records.
                </Text>
                <Button
                  label="Generate New ID"
                  variant="outline"
                  onPress={() => {
                    toastRef.current?.show({
                      message: 'New Medical ID generated',
                      type: 'success',
                    });
                  }}
                  style={{ marginTop: Spacing.md, width: '100%' }}
                />
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ SECURITY SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDesc}>Extra security for your account</Text>
                </View>
                <Switch
                  value={privacySettings.twoFactor}
                  onValueChange={() => handleToggle('twoFactor')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.twoFactor ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Biometric Authentication</Text>
                  <Text style={styles.settingDesc}>Fingerprint or face ID</Text>
                </View>
                <Switch
                  value={privacySettings.biometric}
                  onValueChange={() => handleToggle('biometric')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.biometric ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDesc}>Update your account password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>
        </View>

        {/* ═══ PRIVACY SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Share My Data</Text>
                  <Text style={styles.settingDesc}>Help improve healthcare research</Text>
                </View>
                <Switch
                  value={privacySettings.dataSharing}
                  onValueChange={() => handleToggle('dataSharing')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.dataSharing ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Marketing Emails</Text>
                  <Text style={styles.settingDesc}>Receive tips and special offers</Text>
                </View>
                <Switch
                  value={privacySettings.marketingEmails}
                  onValueChange={() => handleToggle('marketingEmails')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.marketingEmails ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ DATA SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('DataPrivacy')}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="document-text" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <Text style={styles.settingDesc}>How we protect your data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Activity Log</Text>
                  <Text style={styles.settingDesc}>Review your account activity</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Ionicons name="trash" size={20} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Delete Account</Text>
                  <Text style={styles.settingDesc}>Permanently delete all data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>
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

  // ═══ SECTIONS ═══
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.md,
  },

  // ═══ CARDS ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },

  // ═══ QR CODE ═══
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  qrText: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 20,
  },

  // ═══ SETTING ITEMS ═══
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  settingDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
  },
});
