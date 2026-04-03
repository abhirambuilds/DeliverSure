import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { user, role, login } = useAuth();

  if (user) {
    if (role === 'admin') return <Redirect href="/admin/dashboard" />;
    return <Redirect href="/(tabs)" />;
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) { setErrorMsg('Please enter both email and password.'); return; }
    setIsLoading(true);
    try {
      await login(email, password);
      // Wait for state to settle or just let the top-level Redirect handles it?
      // Top-level Redirect will handle it once state is updated.
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your coverage</Text>
        </View>
        {errorMsg ? <View style={styles.errorContainer}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#888888" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#888888" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>
        </View>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B' },
  formContainer: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#0F172A', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: '#0F172A', fontSize: 16 },
  loginButton: { backgroundColor: '#16A34A', borderRadius: 12, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 12, boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  loginButtonDisabled: { backgroundColor: '#CBD5E1' },
  errorContainer: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, padding: 12, marginBottom: 24 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', fontWeight: 'bold' },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingBottom: 20 },
  footerText: { color: '#64748B', fontSize: 16 },
  footerLink: { color: '#16A34A', fontSize: 16, fontWeight: 'bold' },
});
