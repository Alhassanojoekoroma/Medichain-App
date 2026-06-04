import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ConsentServiceClient } from '../services/consentService';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';
import { Card, CardBody, Badge, Button, Toast } from '../components';

export default function ConsentManagerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [consents, setConsents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConsents = async () => {
    setIsLoading(true);
    try {
      const result = await ConsentServiceClient.getMyConsents();
      setConsents(result.consents || []);
    } catch (error) {
      console.error(error);
      toastRef.current?.show({
        message: 'Failed to load active consents',
        type: 'error',
      });
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
              toastRef.current?.show({
                message: 'Access revoked successfully',
                type: 'success',
              });
              fetchConsents();
            } catch (err) {
              toastRef.current?.show({
                message: 'Failed to revoke access.',
                type: 'error',
              });
            }
          }
        }
      ]
    );
  };

  const renderConsentItem = ({ item }: { item: any }) => {
    let badgeVariant: any = 'primary';
    let badgeText = 'Active';
    let iconName = 'shield-check-outline';

    if (item.expires_at) {
      badgeVariant = 'warning';
      badgeText = 'Temporary';
      iconName = 'clock-outline';
    } else if (item.is_one_time) {
      badgeVariant = 'blockchain';
      badgeText = 'One-Time';
      iconName = 'onepassword';
    }

    return (
      <Card style={styles.card}>
        <CardBody>
          <View style={styles.cardHeader}>
            <View style={styles.doctorInfo}>
              <MaterialCommunityIcons name={iconName as any} size={22} color={Colors.primary} />
              <Text style={styles.doctorName}>
                {item.grantee_type === 'doctor' ? `Dr. ID: ${item.grantee_id.substring(0, 8)}...` : `Clinic ID: ${item.grantee_id.substring(0, 8)}...`}
              </Text>
            </View>
            <Badge variant={badgeVariant}>{badgeText}</Badge>
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

          {item.expires_at && (
            <View style={[styles.statusBox, styles.warningBox]}>
              <MaterialCommunityIcons name="clock-alert-outline" size={16} color={Colors.warningDark} />
              <Text style={styles.warningBoxText}>Expires: {new Date(item.expires_at).toLocaleString()}</Text>
            </View>
          )}

          <Button
            label="Revoke Access"
            variant="danger"
            size="small"
            onPress={() => handleRevoke(item.id)}
            style={styles.revokeBtn}
          />
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
        <Text style={styles.headerTitle}>Data Consent</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Manage who has access to your health records.</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
        ) : consents.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="shield-off-outline" size={64} color={Colors.neutral300} />
            <Text style={styles.emptyTitle}>No Active Consents</Text>
            <Text style={styles.emptyDesc}>You haven't granted any doctors or clinics access to your records yet.</Text>
          </View>
        ) : (
          <FlatList
            data={consents}
            keyExtractor={(item) => item.id}
            renderItem={renderConsentItem}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  doctorName: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    fontWeight: FontWeight.regular,
  },
  detailValue: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral900,
    fontWeight: FontWeight.bold,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  warningBox: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
  },
  warningBoxText: {
    color: Colors.warningDark,
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
  },
  revokeBtn: {
    marginTop: Spacing.md,
  },
});
