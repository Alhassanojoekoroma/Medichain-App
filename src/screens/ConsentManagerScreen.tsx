import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Shield, XCircle, Clock, CheckCircle } from 'lucide-react-native';
import { ConsentServiceClient } from '../services/consentService';

export default function ConsentManagerScreen() {
  const [consents, setConsents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConsents = async () => {
    setIsLoading(true);
    try {
      const result = await ConsentServiceClient.getMyConsents();
      setConsents(result.consents || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load active consents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const handleRevoke = (consentId: string) => {
    Alert.alert(
      'Revoke Access',
      'Are you sure you want to revoke this access immediately? The doctor will be disconnected from your records.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ConsentServiceClient.revokeConsent(consentId, 'Patient revoked manually');
              // Refresh list
              fetchConsents();
            } catch (err) {
              Alert.alert('Error', 'Failed to revoke access.');
            }
          }
        }
      ]
    );
  };

  const renderConsentItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.doctorInfo}>
          <Shield size={20} color="#0D9426" />
          <Text style={styles.doctorName}>
            {item.grantee_type === 'doctor' ? `Dr. ID: ${item.grantee_id}` : `Clinic ID: ${item.grantee_id}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.revokeBtn} onPress={() => handleRevoke(item.id)}>
          <XCircle size={18} color="#ef4444" />
          <Text style={styles.revokeText}>Revoke</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Access Type:</Text>
        <Text style={styles.detailValue}>{item.access_type.toUpperCase()}</Text>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Data Shared:</Text>
        <Text style={styles.detailValue}>
          {item.data_categories.includes('all') ? 'Full Medical Record' : item.data_categories.join(', ')}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Granted On:</Text>
        <Text style={styles.detailValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>

      {item.expires_at ? (
        <View style={styles.badgeWarning}>
          <Clock size={14} color="#d97706" />
          <Text style={styles.badgeWarningText}>Expires: {new Date(item.expires_at).toLocaleString()}</Text>
        </View>
      ) : item.is_one_time ? (
        <View style={styles.badgeInfo}>
          <CheckCircle size={14} color="#0ea5e9" />
          <Text style={styles.badgeInfoText}>One-Time Access (Used once scanned)</Text>
        </View>
      ) : (
        <View style={styles.badgeSuccess}>
          <Shield size={14} color="#16a34a" />
          <Text style={styles.badgeSuccessText}>Permanent Access (Until Revoked)</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Data Consent</Text>
        <Text style={styles.subtitle}>Manage who has access to your health records.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0D9426" style={{ marginTop: 40 }} />
      ) : consents.length === 0 ? (
        <View style={styles.emptyState}>
          <Shield size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Active Consents</Text>
          <Text style={styles.emptyDesc}>You haven't granted any doctors or clinics access to your records yet.</Text>
        </View>
      ) : (
        <FlatList
          data={consents}
          keyExtractor={(item) => item.id}
          renderItem={renderConsentItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', lineHeight: 24 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#475569', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12, marginBottom: 12 },
  doctorInfo: { flexDirection: 'row', alignItems: 'center' },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginLeft: 8 },
  revokeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  revokeText: { color: '#ef4444', fontWeight: '600', fontSize: 13, marginLeft: 4 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#334155', fontWeight: '600' },
  badgeWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', padding: 8, borderRadius: 6, marginTop: 8 },
  badgeWarningText: { color: '#b45309', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  badgeInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe', padding: 8, borderRadius: 6, marginTop: 8 },
  badgeInfoText: { color: '#0369a1', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  badgeSuccess: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', padding: 8, borderRadius: 6, marginTop: 8 },
  badgeSuccessText: { color: '#166534', fontSize: 12, fontWeight: '600', marginLeft: 6 },
});
