import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import { QRServiceClient } from '../services/qrService';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';
import { Card, CardBody, Badge, Button, Toast } from '../components';

export default function QRGenerateScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<'NORMAL' | 'EMERGENCY'>('NORMAL');
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrTokenId, setQrTokenId] = useState<string | null>(null);

  const generateQR = async () => {
    setIsLoading(true);
    setQrPayload(null);
    setQrTokenId(null);
    try {
      if (activeTab === 'NORMAL') {
        const result = await QRServiceClient.generateNormalQR(3600, true);
        setQrPayload(JSON.stringify(result.qrPayload));
        setQrTokenId(result.tokenId);
      } else {
        const result = await QRServiceClient.generateEmergencyQR();
        setQrPayload(JSON.stringify(result.qrPayload));
        setQrTokenId(result.tokenId);
      }
    } catch (error) {
      toastRef.current?.show({
        message: 'Failed to generate secure QR code.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeCurrentToken = async () => {
    if (!qrTokenId) return;
    try {
      await QRServiceClient.revokeToken(qrTokenId);
      toastRef.current?.show({
        message: 'QR Code has been revoked successfully.',
        type: 'success',
      });
      setQrPayload(null);
      setQrTokenId(null);
    } catch (error) {
      toastRef.current?.show({
        message: 'Failed to revoke token.',
        type: 'error',
      });
    }
  };

  React.useEffect(() => {
    generateQR();
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ═══ HEADER ═══ */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Access QR</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Let doctors scan this code to access your medical records.</Text>

        {/* ═══ TABS ═══ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'NORMAL' && styles.activeTab]}
            onPress={() => setActiveTab('NORMAL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'NORMAL' && styles.activeTabText]}>Doctor Visit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'EMERGENCY' && styles.emergencyTab]}
            onPress={() => setActiveTab('EMERGENCY')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'EMERGENCY' ? styles.activeEmergencyTabText : styles.inactiveEmergencyTabText]}>Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ QR CARD ═══ */}
        <Card style={styles.qrCard}>
          <CardBody>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Generating secure token...</Text>
              </View>
            ) : qrPayload ? (
              <View style={styles.qrWrapper}>
                <QRCode
                  value={qrPayload}
                  size={220}
                  color={activeTab === 'EMERGENCY' ? Colors.danger : Colors.primary}
                  backgroundColor="white"
                />
                
                {activeTab === 'NORMAL' ? (
                  <View style={[styles.infoBadge, styles.successBadge]}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.successDark} />
                    <Text style={[styles.infoText, { color: Colors.successDark }]}>Expires in 1 Hour • One-time use</Text>
                  </View>
                ) : (
                  <View style={[styles.infoBadge, styles.dangerBadge]}>
                    <MaterialCommunityIcons name="alert-decagram-outline" size={16} color={Colors.dangerDark} />
                    <Text style={[styles.infoText, { color: Colors.dangerDark }]}>Bracelet QR • Read Only • Critical Data</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No active secure token</Text>
              </View>
            )}

            {!isLoading && qrPayload && (
              <View style={styles.actionButtons}>
                <Button
                  label="Refresh QR"
                  variant="outline"
                  size="normal"
                  onPress={generateQR}
                  style={styles.actionBtn}
                  icon={<MaterialCommunityIcons name="refresh" size={18} color={Colors.primary} />}
                />
                {activeTab === 'NORMAL' && (
                  <Button
                    label="Revoke Now"
                    variant="danger"
                    size="normal"
                    onPress={revokeCurrentToken}
                    style={styles.actionBtn}
                    icon={<MaterialCommunityIcons name="shield-off" size={18} color={Colors.dangerDark} />}
                  />
                )}
              </View>
            )}
          </CardBody>
        </Card>

        {/* ═══ BLOCKCHAIN NOTE ═══ */}
        <View style={styles.securityNote}>
          <MaterialCommunityIcons name="link-variant" size={24} color={Colors.neutral600} />
          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>Blockchain Secured</Text>
            <Text style={styles.noteDesc}>
              This QR code contains no personal data. It acts as a secure cryptographic key that verifies your consent on the Hyperledger Fabric network.
            </Text>
          </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral100,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  activeTab: {
    backgroundColor: Colors.white,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  emergencyTab: {
    backgroundColor: Colors.danger,
  },
  tabText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral600,
  },
  activeTabText: {
    color: Colors.primary,
  },
  activeEmergencyTabText: {
    color: Colors.white,
  },
  inactiveEmergencyTabText: {
    color: Colors.neutral600,
  },
  qrCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.neutral600,
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
  },
  qrWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    marginTop: Spacing.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  successBadge: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.successBorder,
  },
  dangerBadge: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.dangerBorder,
  },
  infoText: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral100,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  noteText: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  noteTitle: {
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    fontSize: FontSize.body,
    marginBottom: Spacing.xs,
  },
  noteDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    lineHeight: 18,
    fontWeight: FontWeight.regular,
  },
});
