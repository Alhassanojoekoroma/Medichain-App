import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
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

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Feather name="activity" size={32} color={C.brand} />
            </View>
            <Text style={styles.brandName}>MediChain SL</Text>
            <View style={styles.chainBadge}>
              <Feather name="link" size={14} color={C.green600} />
              <Text style={styles.chainBadgeText}>Secured by Hyperledger</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to access your health records</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or National ID</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={20} color={C.gray500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. mariatu@example.com"
                  placeholderTextColor={C.gray500}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={20} color={C.gray500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={C.gray500}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={C.gray500} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')} style={styles.signupBtn}>
                <Text style={styles.signupText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...C.shadow },
  brandName: { fontSize: 28, fontWeight: 'bold', color: C.ink900, marginBottom: 8 },
  chainBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.green100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chainBadgeText: { marginLeft: 6, fontSize: 12, fontWeight: '600', color: C.green600 },
  formContainer: { backgroundColor: C.white, borderRadius: 24, padding: 24, ...C.shadow },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: C.ink900, marginBottom: 8 },
  subtitleText: { fontSize: 14, color: C.gray500, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: C.ink900, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.gray200, borderRadius: 12, backgroundColor: C.gray50, minHeight: 48 },
  inputIcon: { paddingHorizontal: 12 },
  input: { flex: 1, height: 48, color: C.ink900, fontSize: 16 },
  eyeBtn: { padding: 12, minHeight: 48, justifyContent: 'center' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24, minHeight: 44, justifyContent: 'center' },
  forgotPasswordText: { color: C.brand, fontSize: 14, fontWeight: '600' },
  primaryBtn: { backgroundColor: C.brand, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: C.ink700, fontSize: 14 },
  signupBtn: { minHeight: 44, justifyContent: 'center' },
  signupText: { color: C.brand, fontSize: 14, fontWeight: 'bold' },
});
