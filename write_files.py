import os

auth_context = r"""import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI, profileAPI } from '@/src/services/api';
import { Language } from '@/utils/translations';

type Role = 'admin' | 'user' | null;

export interface CoverageOption {
  id: string; name: string; description: string; price: number; icon: string;
}
export interface Claim {
  id: string; title: string; amount: string; date: string;
  status: 'Under Review' | 'Approved & Paid' | 'Denied - Below Deductible';
  proofImage?: string | null;
}
interface User {
  email: string; name?: string; phone?: string; dob?: string; gender?: string;
  activeCoverages?: CoverageOption[]; claims?: Claim[];
}
interface AuthContextType {
  user: User | null; role: Role; token: string | null; language: Language;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void; updateUser: (data: Partial<User>) => void;
  addCoverage: (coverage: CoverageOption) => void; addClaim: (claim: Claim) => void;
  changeLanguage: (lang: Language) => void; isRideActive: boolean;
  setIsRideActive: (active: boolean) => void; hasPromptedLocation: boolean;
  setHasPromptedLocation: (val: boolean) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isRideActive, setIsRideActive] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);

  useEffect(() => {
    const restore = async () => {
      const savedToken = await SecureStore.getItemAsync('userToken');
      const savedRole = await SecureStore.getItemAsync('userRole');
      if (savedToken) {
        setToken(savedToken);
        setRole((savedRole as Role) || 'user');
        try {
          const res = await profileAPI.getMe();
          const profile = res.data.profile;
          setUser({ email: profile.full_name, name: profile.full_name });
        } catch {}
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { access_token } = res.data;
    const userRole: Role = email === 'admin@ws.com' ? 'admin' : 'user';
    await SecureStore.setItemAsync('userToken', access_token);
    await SecureStore.setItemAsync('userRole', userRole);
    setToken(access_token); setRole(userRole);
    setUser({ email }); setHasPromptedLocation(false);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userRole');
    setUser(null); setRole(null); setToken(null);
  };

  const updateUser = (data: Partial<User>) => { if (user) setUser({ ...user, ...data }); };
  const addCoverage = (coverage: CoverageOption) => {
    if (user) {
      const current = user.activeCoverages || [];
      if (!current.find(c => c.id === coverage.id))
        setUser({ ...user, activeCoverages: [...current, coverage] });
    }
  };
  const addClaim = (claim: Claim) => {
    if (user) setUser({ ...user, claims: [claim, ...(user.claims || [])] });
  };
  const changeLanguage = (lang: Language) => setLanguage(lang);

  return (
    <AuthContext.Provider value={{ user, role, token, language, login, logout, updateUser, addCoverage, addClaim, changeLanguage, isRideActive, setIsRideActive, hasPromptedLocation, setHasPromptedLocation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
"""

login_tsx = r"""import React, { useState } from 'react';
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
      router.replace(email === 'admin@ws.com' ? '/admin/dashboard' : '/(tabs)');
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
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a0a0a0' },
  formContainer: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333333', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18, color: '#ffffff', fontSize: 16 },
  loginButton: { backgroundColor: '#3b82f6', borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', marginTop: 12, minHeight: 60 },
  loginButtonDisabled: { backgroundColor: '#60a5fa' },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)', borderRadius: 12, padding: 12, marginBottom: 24 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  loginButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingBottom: 20 },
  footerText: { color: '#a0a0a0', fontSize: 15 },
  footerLink: { color: '#3b82f6', fontSize: 15, fontWeight: 'bold' },
});
"""

with open('context/AuthContext.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(auth_context)
print('AuthContext.tsx done')

with open('app/auth/login.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(login_tsx)
print('login.tsx done')
