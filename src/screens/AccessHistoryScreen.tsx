import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ConsentServiceClient } from '../services/consentService';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { Card, CardBody, Badge, Toast } from '../components';

export default function AccessHistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const result = await ConsentServiceClient.getAuditHistory(50);
      setHistory(result.history || []);
    } catch (error) {
      console.error(error);
      toastRef.current?.show({
        message: 'Failed to load access history',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isGranted = item.outcome === 'granted';
    const badgeVariant = isGranted ? 'verified' : 'revoked';
    const iconName = item.is_emergency ? 'shield-alert-outline' : 'shield-outline';
    const iconColor = item.is_emergency ? Colors.warning : Colors.primary;

    return (
      <Card style={styles.card}>
        <CardBody>
          <View style={styles.headerRow}>
            <View style={styles.actionInfo}>
              <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
              <Text style={styles.actionText}>
                {item.access_type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Badge variant={badgeVariant}>{item.outcome.toUpperCase()}</Badge>
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
              <View style={[styles.statusBox, styles.dangerBox]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={Colors.dangerDark} />
                <Text style={styles.dangerBoxText}>Reason: {item.denial_reason}</Text>
              </View>
            )}

            <View style={styles.chainRow}>
              <MaterialCommunityIcons 
                name="link" 
                size={16} 
                color={item.chain_tx_hash ? Colors.success : Colors.neutral400} 
              />
              <Text style={[styles.chainText, { color: item.chain_tx_hash ? Colors.success : Colors.neutral500 }]}>
                {item.chain_tx_hash ? 'Synced to Blockchain' : 'Pending Blockchain Sync'}
              </Text>
            </View>
          </View>
        </CardBody>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ═══ HEADER ═══ */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Access Log</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Immutable audit trail of who accessed your data.</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="shield-lock-outline" size={64} color={Colors.neutral300} />
            <Text style={styles.emptyTitle}>No Access History</Text>
            <Text style={styles.emptyDesc}>Your medical records have not been accessed yet.</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral700,
    marginTop: Spacing.md,
  },
  emptyDesc: {
    fontSize: FontSize.body,
    color: Colors.neutral500,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.neutral700,
  },
  detailsContainer: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    width: 60,
  },
  detailValue: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral900,
    flex: 1,
    fontWeight: FontWeight.medium,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  dangerBox: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  dangerBoxText: {
    color: Colors.dangerDark,
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral100,
    gap: Spacing.sm,
  },
  chainText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
  },
});
