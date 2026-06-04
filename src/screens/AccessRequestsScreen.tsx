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
import { Colors } from '../theme';
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
    paddingTop: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  requestsList: {
    padding: 16,
    gap: 16,
  },
  requestCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    marginBottom: 2,
  },
  clinic: {
    fontSize: 13,
  },
  expiryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reasonSection: {
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  requestDate: {
    fontSize: 12,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  denyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  denyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
