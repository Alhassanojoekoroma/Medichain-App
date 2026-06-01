import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Shield, ShieldAlert, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { ConsentServiceClient } from '../services/consentService';

export default function AccessHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const result = await ConsentServiceClient.getAuditHistory(50);
      setHistory(result.history || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load access history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isGranted = item.outcome === 'granted';
    const Icon = isGranted ? CheckCircle : XCircle;
    const color = isGranted ? '#10b981' : '#ef4444';

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.actionInfo}>
            {item.is_emergency ? (
              <ShieldAlert size={18} color="#f59e0b" style={{ marginRight: 8 }} />
            ) : (
              <Shield size={18} color="#3b82f6" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.actionText}>
              {item.access_type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={[styles.outcomeBadge, { backgroundColor: isGranted ? '#d1fae5' : '#fee2e2' }]}>
            <Icon size={14} color={color} />
            <Text style={[styles.outcomeText, { color }]}>
              {item.outcome.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Actor:</Text>
            <Text style={styles.detailValue}>
              {item.doctor_name || item.clinic_name || item.actor_id} ({item.actor_role})
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>

          {item.data_categories && item.data_categories.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data:</Text>
              <Text style={styles.detailValue}>
                {item.data_categories.join(', ')}
              </Text>
            </View>
          )}

          {!isGranted && item.denial_reason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>Reason: {item.denial_reason}</Text>
            </View>
          )}

          <View style={styles.chainRow}>
            <Clock size={12} color={item.chain_tx_hash ? '#10b981' : '#94a3b8'} />
            <Text style={[styles.chainText, { color: item.chain_tx_hash ? '#10b981' : '#94a3b8' }]}>
              {item.chain_tx_hash ? 'Synced to Blockchain' : 'Pending Blockchain Sync'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Access Log</Text>
        <Text style={styles.subtitle}>Immutable audit trail of who accessed your data.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0D9426" style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <Shield size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Access History</Text>
          <Text style={styles.emptyDesc}>Your medical records have not been accessed yet.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  actionInfo: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  outcomeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  outcomeText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  detailsContainer: { gap: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: '#64748b', width: 60 },
  detailValue: { fontSize: 13, color: '#1e293b', flex: 1, fontWeight: '500' },
  reasonBox: { backgroundColor: '#fef2f2', padding: 8, borderRadius: 6, marginTop: 4 },
  reasonText: { color: '#b91c1c', fontSize: 12 },
  chainRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  chainText: { fontSize: 11, marginLeft: 4, fontWeight: '500' }
});
