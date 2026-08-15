import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { useStore } from '../store/useStore';

type Tab = 'login' | 'register';

// ── Field component ──────────────────────────────────────────────────────────
function Field({
  label, value, onChangeText, placeholder, secure, error, keyboardType,
  prefix, hint,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; secure?: boolean; error?: string;
  keyboardType?: any; prefix?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[
        fieldStyles.inputRow,
        focused && fieldStyles.inputFocused,
        !!error && fieldStyles.inputError,
      ]}>
        {prefix ? <Text style={fieldStyles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure && !show}
          keyboardType={keyboardType ?? 'default'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
        />
        {secure ? (
          <TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
      {hint && !error ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group:       { marginBottom: Spacing.lg },
  label:       { fontSize: FontSize.caption, fontWeight: FontWeight.medium, color: Colors.dark, marginBottom: 6 },
  inputRow:    {
    flexDirection:   'row', alignItems: 'center',
    borderWidth:     1.5, borderColor: Colors.border,
    borderRadius:    Radius.md, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white, minHeight: 48,
  },
  inputFocused:  { borderColor: Colors.primary },
  inputError:    { borderColor: Colors.danger, backgroundColor: '#FFF8F8' },
  prefix:        { fontSize: FontSize.body, color: Colors.dark, marginRight: Spacing.xs },
  input:         { flex: 1, fontSize: FontSize.body, color: Colors.dark, paddingVertical: Spacing.md },
  errorText:     { marginTop: 4, fontSize: FontSize.label, color: Colors.danger },
  hint:          { marginTop: 4, fontSize: FontSize.label, color: Colors.textMuted },
});

// ── Main screen ──────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const setUser          = useStore((s) => s.setUser);

  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});

  // Register state
  const [fullName, setFullName]   = useState('');
  const [rPhone, setRPhone]       = useState('');
  const [dob, setDob]             = useState('');
  const [rPassword, setRPassword] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [otpSent, setOtpSent]     = useState(false);
  const [otp, setOtp]             = useState('');

  const handleLogin = () => {
    const errs: Record<string, string> = {};
    if (!phone)    errs.phone    = 'Phone number is required';
    if (!password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // Mock auth success
    setUser({ id: 'patient-001', name: 'Aminata Kamara', email: '', phone, bloodType: 'O+', weight: '', height: '', avatar: undefined });
    setAuthenticated(true);
    navigation.replace('Main');
  };

  const handleRegister = () => {
    if (!otpSent) {
      const errs: Record<string, string> = {};
      if (!fullName)   errs.fullName   = 'Full name is required';
      if (!rPhone)     errs.rPhone     = 'Phone number is required';
      if (!rPassword || rPassword.length < 8) errs.rPassword = 'Password must be at least 8 characters';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setErrors({});
      setOtpSent(true);
      Alert.alert('OTP Sent', 'A 6-digit code has been sent to your phone.');
      return;
    }
    if (otp.length !== 6) { setErrors({ otp: 'Enter the 6-digit code' }); return; }
    // Mock registration success
    setUser({ id: `patient-${Date.now()}`, name: fullName, email: '', phone: rPhone, bloodType: bloodType || 'O+', weight: '', height: '', avatar: undefined });
    setAuthenticated(true);
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <Text style={styles.brand}>MediChain SL</Text>
        <Text style={styles.headline}>{tab === 'login' ? 'Welcome back' : 'Create your account'}</Text>
        <Text style={styles.sub}>{tab === 'login' ? 'Sign in to access your health records.' : 'Set up your secure health vault.'}</Text>

        {/* Tab toggle */}
        <View style={styles.tabRow}>
          {(['login', 'register'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => { setTab(t); setErrors({}); setOtpSent(false); }}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Login form ── */}
        {tab === 'login' && (
          <View style={styles.form}>
            <Field label="Phone number" value={phone} onChangeText={setPhone}
              placeholder="76 000 000" keyboardType="phone-pad" prefix="+232"
              error={errors.phone} />
            <Field label="Password" value={password} onChangeText={setPassword}
              placeholder="Your password" secure error={errors.password} />

            <TouchableOpacity style={styles.forgotLink} accessibilityRole="link">
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cta} onPress={handleLogin} accessibilityRole="button" accessibilityLabel="Sign in">
              <Text style={styles.ctaText}>Sign in</Text>
            </TouchableOpacity>

            <View style={styles.biometricRow}>
              <Ionicons name="finger-print" size={20} color={Colors.primary} />
              <Text style={styles.biometricText}>Or sign in with biometrics</Text>
            </View>
          </View>
        )}

        {/* ── Register form ── */}
        {tab === 'register' && !otpSent && (
          <View style={styles.form}>
            <Field label="Full name" value={fullName} onChangeText={setFullName}
              placeholder="Aminata Kamara" error={errors.fullName} />
            <Field label="Phone number" value={rPhone} onChangeText={setRPhone}
              placeholder="76 000 000" keyboardType="phone-pad" prefix="+232"
              error={errors.rPhone} hint="A 6-digit OTP will be sent to this number" />
            <Field label="Date of birth" value={dob} onChangeText={setDob}
              placeholder="e.g. 15 Mar 1990" />
            <Field label="Password" value={rPassword} onChangeText={setRPassword}
              placeholder="Min. 8 characters" secure error={errors.rPassword} />
            <Field label="National ID number" value={nationalId} onChangeText={setNationalId}
              placeholder="SL-XXXXXXXXX" hint="Hashed for your blockchain identity — never stored raw" />

            {/* Blood type selector (simplified) */}
            <View style={fieldStyles.group}>
              <Text style={fieldStyles.label}>Blood type</Text>
              <View style={styles.bloodRow}>
                {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((bt) => (
                  <TouchableOpacity
                    key={bt}
                    style={[styles.bloodChip, bloodType === bt && styles.bloodChipActive]}
                    onPress={() => setBloodType(bt)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: bloodType === bt }}
                    accessibilityLabel={`Blood type ${bt}`}
                  >
                    <Text style={[styles.bloodChipText, bloodType === bt && styles.bloodChipTextActive]}>{bt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.cta} onPress={handleRegister} accessibilityRole="button" accessibilityLabel="Send OTP and continue">
              <Text style={styles.ctaText}>Send OTP & Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── OTP form ── */}
        {tab === 'register' && otpSent && (
          <View style={styles.form}>
            <View style={styles.otpInfo}>
              <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} />
              <Text style={styles.otpInfoText}>Enter the 6-digit code sent to +232 {rPhone}</Text>
            </View>
            <Field label="OTP code" value={otp} onChangeText={(t) => { if (t.length <= 6) setOtp(t); }}
              placeholder="000000" keyboardType="number-pad" error={errors.otp} />
            <TouchableOpacity style={styles.cta} onPress={handleRegister} accessibilityRole="button" accessibilityLabel="Verify OTP">
              <Text style={styles.ctaText}>Verify & Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendLink} accessibilityRole="button">
              <Text style={styles.resendText}>Resend code</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: Colors.white },
  content:   { paddingHorizontal: Spacing.xl, paddingBottom: 64 },
  brand:     { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: Spacing.sm },
  headline:  { fontSize: FontSize.h1, fontWeight: FontWeight.bold, color: Colors.dark },
  sub:       { fontSize: FontSize.body, color: Colors.textMuted, marginTop: 6, marginBottom: Spacing.xl },

  tabRow:    {
    flexDirection:   'row',
    backgroundColor: Colors.bg,
    borderRadius:    Radius.pill,
    padding:         4,
    marginBottom:    Spacing.xl,
  },
  tab:       {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 10,
    borderRadius:    Radius.pill,
  },
  tabActive: { backgroundColor: Colors.white },
  tabText:   { fontSize: FontSize.body, fontWeight: FontWeight.medium, color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },

  form:      {},
  forgotLink:{ alignSelf: 'flex-end', marginBottom: Spacing.xl, marginTop: -Spacing.sm },
  forgotText:{ fontSize: FontSize.body, color: Colors.primary, fontWeight: FontWeight.medium },

  cta:       {
    backgroundColor: Colors.primary,
    borderRadius:    Radius.pill,
    alignItems:      'center',
    paddingVertical: 14,
    marginTop:       Spacing.sm,
  },
  ctaText:   { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.white },

  biometricRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.sm,
    marginTop:      Spacing.xl,
  },
  biometricText: { fontSize: FontSize.body, color: Colors.textMuted },

  bloodRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  bloodChip:      {
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    borderRadius:      Radius.pill,
    borderWidth:       1.5,
    borderColor:       Colors.border,
    backgroundColor:   Colors.white,
  },
  bloodChipActive:     { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  bloodChipText:       { fontSize: FontSize.bodySmall, color: Colors.textMuted, fontWeight: FontWeight.medium },
  bloodChipTextActive: { color: Colors.primary },

  otpInfo: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius:    Radius.md,
    padding:         Spacing.md,
    marginBottom:    Spacing.xl,
  },
  otpInfoText: { flex: 1, fontSize: FontSize.body, color: Colors.primaryDark, lineHeight: 20 },
  resendLink:  { alignItems: 'center', marginTop: Spacing.lg },
  resendText:  { fontSize: FontSize.body, color: Colors.primary, fontWeight: FontWeight.medium },
});
