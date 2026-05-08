import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

export default function DataPrivacyScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ═══ HEADER ═══ */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ CONTENT ═══ */}
        <View style={styles.section}>
          <Card style={styles.flatCard}>
            <CardBody>
              <Text style={styles.title}>Data Privacy & Protection</Text>
              <Text style={styles.paragraph}>
                At Medichain, we take your privacy and the security of your health data very seriously. 
                Our platform utilizes Hyperledger Fabric blockchain technology to ensure that your medical 
                records are immutable, traceable, and secure.
              </Text>
              <Text style={styles.paragraph}>
                Your Personal Identifiable Information (PII) is kept strictly off-chain, ensuring compliance 
                with GDPR and HIPAA regulations. Only encrypted hashes and metadata are stored on the blockchain, 
                giving you complete control over who can access your actual records.
              </Text>
              
              <Text style={styles.subtitle}>Your Rights</Text>
              <Text style={styles.paragraph}>
                • Right to Access: You can view and manage your data at any time.
                {'\n'}• Right to Revoke: You can revoke access from any healthcare provider instantly.
                {'\n'}• Right to Erasure: You may request deletion of your off-chain personal data.
              </Text>

              <Text style={styles.subtitle}>Data Sharing</Text>
              <Text style={styles.paragraph}>
                If you opt-in to data sharing, your records are completely anonymized before being shared 
                for medical research. You will be compensated with MTK tokens for contributing to the 
                advancement of healthcare.
              </Text>
            </CardBody>
          </Card>
        </View>
      </ScrollView>
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
  title: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
});
