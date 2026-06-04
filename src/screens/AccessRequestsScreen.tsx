/**
 * src/screens/AccessRequestsScreen.tsx
 * GAP 5: Patient views and manages doctor access requests
 * Doctors request access → Patient approves/denies asynchronously
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { AuthService, BACKEND_URL } from '../services/authService';

interface AccessRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  clinicName?: string;
  reason: string;
  dataCategories: string[];
  createdAt: string;
  expiresAt: string;
}

export const AccessRequestsScreen: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = await AuthService.getToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      // Call backend API to fetch pending requests
      const response = await fetch(`${BACKEND_URL}/api/access-requests/patient/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      Alert.alert('Error', 'Failed to load access requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const token = await AuthService.getToken();
      const response = await fetch(
        `${BACKEND_URL}/api/access-requests/${requestId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dataCategories: ['all'] }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Access approved for this doctor');
        // Remove from pending requests
        setRequests(requests.filter(r => r.id !== requestId));
      } else {
        Alert.alert('Error', data.error || 'Failed to approve request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    Alert.prompt(
      'Deny Request',
      'Reason (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny',
          style: 'destructive',
          onPress: async (reason?: string) => {
            setProcessingId(requestId);
            try {
              const token = await AuthService.getToken();
              const response = await fetch(
                `${BACKEND_URL}/api/access-requests/${requestId}/deny`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ denialReason: reason || 'Patient denied access' }),
                }
              );

              const data = await response.json();
              if (response.ok) {
                Alert.alert('Denied', 'Access request has been denied');
                setRequests(requests.filter(r => r.id !== requestId));
              } else {
                Alert.alert('Error', data.error || 'Failed to deny request');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to deny request');
              console.error(error);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const daysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.bg }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadRequests();
          }}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors.neutral900 }]}>Access Requests</Text>
        <Text style={[styles.headerSubtitle, { color: Colors.textMuted }]}>
          Doctors requesting access to your medical records
        </Text>
      </View>

      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: Colors.textMuted }]}>
            No pending access requests
          </Text>
        </View>
      ) : (
        <View style={styles.requestsList}>
          {requests.map((request) => (
            <View key={request.id} style={[styles.requestCard, { backgroundColor: Colors.white }]}>
              {/* Doctor Info */}
              <View style={styles.doctorInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: Colors.primaryLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: Colors.primary },
                    ]}
                  >
                    {request.doctorName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Text>
                </View>

                <View style={styles.doctorDetails}>
                  <Text style={[styles.doctorName, { color: Colors.neutral900 }]}>
                    {request.doctorName}
                  </Text>
                  {request.specialty && (
                    <Text style={[styles.specialty, { color: Colors.textMuted }]}>
                      {request.specialty}
                    </Text>
                  )}
                  {request.clinicName && (
                    <Text style={[styles.clinic, { color: Colors.textMuted }]}>
                      {request.clinicName}
                    </Text>
                  )}
                </View>

                <View style={styles.expiryBadge}>
                  <Text style={[styles.expiryText, { color: Colors.warning }]}>
                    {daysUntilExpiry(request.expiresAt)}d left
                  </Text>
                </View>
              </View>

              {/* Request Reason */}
              <View style={styles.reasonSection}>
                <Text style={[styles.reasonLabel, { color: Colors.textMuted }]}>Reason</Text>
                <Text style={[styles.reasonText, { color: Colors.neutral900 }]}>
                  {request.reason}
                </Text>
              </View>

              {/* Request Date */}
              <Text style={[styles.requestDate, { color: Colors.textMuted }]}>
                Requested {formatDate(request.createdAt)}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.denyButton,
                    { borderColor: Colors.danger },
                    processingId === request.id && styles.disabledButton,
                  ]}
                  onPress={() => handleDenyRequest(request.id)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <ActivityIndicator size="small" color={Colors.danger} />
                  ) : (
                    <Text style={[styles.denyButtonText, { color: Colors.danger }]}>
                      Deny
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.approveButton,
                    { backgroundColor: Colors.success },
                    processingId === request.id && styles.disabledButton,
                  ]}
                  onPress={() => handleApproveRequest(request.id)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.approveButtonText}>Approve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
  },
  headerTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
    color: Colors.neutral500,
  },
  requestsList: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  requestCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
  },
  avatarText: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  specialty: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.xs,
  },
  clinic: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
  },
  expiryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.warningLight,
    borderWidth: 0.5,
    borderColor: Colors.warningBorder,
  },
  expiryText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.warningDark,
  },
  reasonSection: {
    marginBottom: Spacing.md,
  },
  reasonLabel: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.neutral600,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    lineHeight: 20,
    fontWeight: FontWeight.medium,
  },
  requestDate: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
    marginBottom: Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  denyButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  denyButtonText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.danger,
  },
  approveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    color: Colors.white,
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
