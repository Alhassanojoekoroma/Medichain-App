import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Shield, Clock, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { QRServiceClient } from '../services/qrService';

export default function QRGenerateScreen() {
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
        // Generate a 1-hour, one-time use token
        const result = await QRServiceClient.generateNormalQR(3600, true);
        setQrPayload(JSON.stringify(result.qrPayload));
        setQrTokenId(result.tokenId);
      } else {
        // Generate permanent emergency token
        const result = await QRServiceClient.generateEmergencyQR();
        setQrPayload(JSON.stringify(result.qrPayload));
        setQrTokenId(result.tokenId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR code. Check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeCurrentToken = async () => {
    if (!qrTokenId) return;
    try {
      await QRServiceClient.revokeToken(qrTokenId);
      Alert.alert('Success', 'QR Code has been revoked. It can no longer be scanned.');
      setQrPayload(null);
      setQrTokenId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to revoke token.');
    }
  };

  // Generate when tab switches
  React.useEffect(() => {
    generateQR();
  }, [activeTab]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Secure Access QR</Text>
        <Text style={styles.subtitle}>Let doctors scan this code to access your medical records.</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'NORMAL' && styles.activeTab]}
          onPress={() => setActiveTab('NORMAL')}
        >
          <Text style={[styles.tabText, activeTab === 'NORMAL' && styles.activeTabText]}>Doctor Visit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'EMERGENCY' && styles.emergencyTab]}
          onPress={() => setActiveTab('EMERGENCY')}
        >
          <Text style={[styles.tabText, activeTab === 'EMERGENCY' ? styles.activeEmergencyTabText : (activeTab === 'NORMAL' && styles.activeTabText)]}>Emergency</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.qrCard}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9426" />
            <Text style={styles.loadingText}>Generating secure token...</Text>
          </View>
        ) : qrPayload ? (
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrPayload}
              size={220}
              color={activeTab === 'EMERGENCY' ? '#DC2626' : '#0D9426'}
              backgroundColor="white"
            />
            {activeTab === 'NORMAL' ? (
              <View style={styles.infoBadge}>
                <Clock size={16} color="#0D9426" />
                <Text style={styles.infoText}>Expires in 1 Hour • One-time use</Text>
              </View>
            ) : (
              <View style={[styles.infoBadge, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                <AlertTriangle size={16} color="#DC2626" />
                <Text style={[styles.infoText, { color: '#DC2626' }]}>Bracelet QR • Read Only • Critical Data</Text>
              </View>
            )}
          </View>
        ) : null}

        {!isLoading && qrPayload && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnOutline} onPress={generateQR}>
              <RefreshCw size={20} color="#0D9426" style={{ marginRight: 8 }} />
              <Text style={styles.btnOutlineText}>Refresh QR</Text>
            </TouchableOpacity>
            {activeTab === 'NORMAL' && (
               <TouchableOpacity style={styles.btnDanger} onPress={revokeCurrentToken}>
                 <Shield size={20} color="#fff" style={{ marginRight: 8 }} />
                 <Text style={styles.btnDangerText}>Revoke Now</Text>
               </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.securityNote}>
        <Shield size={24} color="#64748b" />
        <View style={styles.noteText}>
          <Text style={styles.noteTitle}>Blockchain Secured</Text>
          <Text style={styles.noteDesc}>
            This QR code contains no personal data. It acts as a secure cryptographic key that verifies your consent on the Hyperledger Fabric network.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', lineHeight: 24 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  emergencyTab: { backgroundColor: '#DC2626' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#0D9426' },
  activeEmergencyTabText: { color: '#fff' },
  qrCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 24 },
  loadingContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 15 },
  qrWrapper: { alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12 },
  infoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginTop: 24, borderWidth: 1, borderColor: '#BBF7D0' },
  infoText: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: '#166534' },
  actionButtons: { flexDirection: 'row', width: '100%', gap: 12, marginTop: 24 },
  btnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#0D9426' },
  btnOutlineText: { color: '#0D9426', fontWeight: '600', fontSize: 15 },
  btnDanger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, backgroundColor: '#ef4444' },
  btnDangerText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  securityNote: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, alignItems: 'center' },
  noteText: { marginLeft: 16, flex: 1 },
  noteTitle: { fontWeight: '700', color: '#334155', marginBottom: 4 },
  noteDesc: { fontSize: 13, color: '#64748b', lineHeight: 20 },
});
