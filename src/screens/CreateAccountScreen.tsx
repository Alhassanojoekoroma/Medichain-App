import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthService } from '../services/authService';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const BLOOD_TYPES = [
  { value: '', label: "I don't know" },
  ...['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((value) => ({ value, label: value })),
];

export default function CreateAccountScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+232 ');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<{ patientId: string; nextStep: string } | null>(null);

  const handleCreateAccount = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !dateOfBirth.trim()) {
      setError('Please complete every field.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const registration = await AuthService.register({ fullName, email, phone, dateOfBirth, bloodType });
      setPendingVerification({ patientId: registration.patientId, nextStep: registration.nextStep });
    } catch (registrationError: any) {
      setError(registrationError?.message || 'Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!AuthService.isSandboxPasswordLoginEnabled) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.neutral900} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.managedCard}>
          <Ionicons name="shield-checkmark-outline" size={38} color={Colors.primary} />
          <Text style={styles.managedTitle}>Secure registration is being connected</Text>
          <Text style={styles.managedText}>Production accounts require the approved Sierra Leone identity verification service. This prevents someone else from opening your medical record.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" />
        <View style={styles.pendingCard}>
          <View style={styles.pendingIcon}><Ionicons name="person-add-outline" size={32} color={Colors.warningDark} /></View>
          <Text style={styles.pendingEyebrow}>Account created · verification pending</Text>
          <Text style={styles.managedTitle}>Visit a participating hospital before records can be used</Text>
          <Text style={styles.managedText}>{pendingVerification.nextStep}</Text>
          <View style={styles.patientIdCard}><Text style={styles.patientIdLabel}>Patient reference</Text><Text selectable style={styles.patientIdValue}>{pendingVerification.patientId}</Text></View>
          <Text style={styles.pendingHelp}>Bring your national ID, voter card, or another accepted identity document. The hospital must confirm that the account belongs to you.</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.goBack()}><Text style={styles.createButtonText}>Return to sign in</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.neutral900} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>MediChain SL</Text>
          <Text style={styles.title}>Create your patient account</Text>
          <Text style={styles.subtitle}>Enter your basic details once. Your records will appear after the hospital uploads them.</Text>
          <View style={styles.sandboxNotice}>
            <Ionicons name="flask-outline" size={18} color={Colors.warningDark} />
            <Text style={styles.sandboxText}>Testing mode: use synthetic details only.</Text>
          </View>

          <View style={styles.form}>
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Example: Mariama Conteh" />
            <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="+232 76 123 456" keyboardType="phone-pad" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Date of birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" />
            <Text style={styles.label}>Blood group</Text>
            <View style={styles.bloodTypes}>
              {BLOOD_TYPES.map((type) => (
                <TouchableOpacity key={type.label} onPress={() => setBloodType(type.value)} style={[styles.bloodType, bloodType === type.value && styles.bloodTypeActive]}>
                  <Text style={[styles.bloodTypeText, bloodType === type.value && styles.bloodTypeTextActive]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity disabled={isLoading} style={[styles.createButton, isLoading && styles.disabledButton]} onPress={handleCreateAccount}>
              {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.createButtonText}>Create account and continue</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps} style={styles.input} placeholderTextColor={Colors.neutral500} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  backButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, alignSelf: 'flex-start' },
  backText: { color: Colors.neutral900, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  eyebrow: { marginTop: Spacing.xl, color: Colors.primary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  title: { marginTop: Spacing.sm, color: Colors.neutral900, fontSize: FontSize.h1, fontWeight: FontWeight.bold },
  subtitle: { marginTop: Spacing.sm, color: Colors.textMuted, fontSize: FontSize.bodyLarge, lineHeight: 22 },
  sandboxNotice: { marginTop: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.warningLight, borderWidth: 1, borderColor: Colors.warningBorder, padding: Spacing.md },
  sandboxText: { color: Colors.warningDark, fontSize: FontSize.bodySmall },
  form: { marginTop: Spacing.xl, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, padding: Spacing.lg },
  field: { marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.sm, color: Colors.neutral700, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold },
  input: { minHeight: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.neutral50, paddingHorizontal: Spacing.md, color: Colors.neutral900, fontSize: FontSize.bodyLarge },
  bloodTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  bloodType: { minWidth: 54, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  bloodTypeActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  bloodTypeText: { color: Colors.textBody, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  bloodTypeTextActive: { color: Colors.primaryDark },
  error: { marginBottom: Spacing.md, color: Colors.dangerDark, fontSize: FontSize.bodySmall },
  createButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, backgroundColor: Colors.primary },
  disabledButton: { opacity: 0.6 },
  createButtonText: { color: Colors.white, fontSize: FontSize.bodyLarge, fontWeight: FontWeight.bold },
  managedCard: { margin: Spacing.lg, marginTop: Spacing.xxxl, alignItems: 'center', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.primaryMid, backgroundColor: Colors.white, padding: Spacing.xxl },
  managedTitle: { marginTop: Spacing.lg, color: Colors.neutral900, fontSize: FontSize.h2, fontWeight: FontWeight.bold, textAlign: 'center' },
  managedText: { marginTop: Spacing.sm, color: Colors.textMuted, fontSize: FontSize.body, lineHeight: 20, textAlign: 'center' },
  pendingCard: { margin: Spacing.lg, marginTop: Spacing.xxxl, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.warningBorder, backgroundColor: Colors.white, padding: Spacing.xl },
  pendingIcon: { width: 56, height: 56, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.warningLight },
  pendingEyebrow: { marginTop: Spacing.lg, color: Colors.warningDark, fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  patientIdCard: { marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.neutral50 },
  patientIdLabel: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  patientIdValue: { marginTop: Spacing.xs, color: Colors.neutral900, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  pendingHelp: { marginVertical: Spacing.lg, color: Colors.textBody, fontSize: FontSize.body, lineHeight: 21 },
});
