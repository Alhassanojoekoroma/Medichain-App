import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  brand: '#3E7BFA', brandDark: '#2F63D9', brandLight: '#E4EDFE',
  ink900: '#10131A', ink700: '#2B303A', gray500: '#8A93A6', gray200: '#E7EAF0',
  gray100: '#F1F3F8', gray50: '#F8F9FC', green100: '#DCF3E1', green600: '#0D9426',
  red100: '#FDEAEA', red600: '#EF4444', amber100: '#FDF3E2', amber600: '#F5A524',
  white: '#FFFFFF', canvas: '#EEF3FF',
  shadow: { shadowColor: '#10131A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3 },
};

export default function CreateAccountScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', dob: '', gender: '', phone: '', nationalId: '', email: '', password: ''
  });

  const updateForm = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
    else navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={C.ink900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.title}>{step === 1 ? 'Personal Details' : 'Account Security'}</Text>
          <Text style={styles.subtitle}>{step === 1 ? 'Tell us a bit about yourself.' : 'Secure your medical identity.'}</Text>

          <View style={styles.formContainer}>
            {step === 1 ? (
              <>
                <InputGroup label="Full Name" icon="user" placeholder="e.g. Mariatu Kamara" value={formData.fullName} onChangeText={(v) => updateForm('fullName', v)} />
                <InputGroup label="Date of Birth" icon="calendar" placeholder="YYYY-MM-DD" value={formData.dob} onChangeText={(v) => updateForm('dob', v)} />
                <InputGroup label="Gender" icon="users" placeholder="Male / Female / Other" value={formData.gender} onChangeText={(v) => updateForm('gender', v)} />
                <InputGroup label="Phone Number" icon="phone" placeholder="+232 76 123 456" value={formData.phone} onChangeText={(v) => updateForm('phone', v)} keyboardType="phone-pad" />
              </>
            ) : (
              <>
                <InputGroup label="National ID (NIN)" icon="credit-card" placeholder="Enter your NIN" value={formData.nationalId} onChangeText={(v) => updateForm('nationalId', v)} />
                <InputGroup label="Email Address" icon="mail" placeholder="m.kamara@example.com" value={formData.email} onChangeText={(v) => updateForm('email', v)} keyboardType="email-address" />
                <InputGroup label="Password" icon="lock" placeholder="Create a strong password" value={formData.password} onChangeText={(v) => updateForm('password', v)} secureTextEntry />
                
                <View style={styles.consentBox}>
                  <Feather name="info" size={20} color={C.brand} style={{ marginRight: 12, marginTop: 2 }} />
                  <Text style={styles.consentText}>
                    By creating an account, you agree that your medical records will be secured on the <Text style={{ fontWeight: 'bold' }}>MediChain</Text> blockchain. You have full control over who accesses your data.
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={nextStep}>
              <Text style={styles.primaryBtnText}>{step === 1 ? 'Continue' : 'Complete Registration'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputGroup = ({ label, icon, placeholder, value, onChangeText, secureTextEntry, keyboardType }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Feather name={icon} size={20} color={C.gray500} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={C.gray500}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: C.ink900 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, backgroundColor: C.canvas },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.gray200 },
  stepDotActive: { backgroundColor: C.brand },
  stepLine: { width: 40, height: 2, backgroundColor: C.gray200, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: C.brand },
  scrollContent: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: C.ink900, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.gray500, marginBottom: 24 },
  formContainer: { backgroundColor: C.white, borderRadius: 24, padding: 20, ...C.shadow },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: C.ink900, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.gray200, borderRadius: 12, backgroundColor: C.gray50, minHeight: 48 },
  inputIcon: { paddingHorizontal: 12 },
  input: { flex: 1, height: 48, color: C.ink900, fontSize: 16, paddingRight: 12 },
  consentBox: { flexDirection: 'row', backgroundColor: C.brandLight, padding: 16, borderRadius: 12, marginBottom: 24 },
  consentText: { flex: 1, fontSize: 13, color: C.ink700, lineHeight: 20 },
  primaryBtn: { backgroundColor: C.brand, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: 'bold' },
});
