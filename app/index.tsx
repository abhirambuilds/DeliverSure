import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user, role } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        // Wait until role is loaded before redirecting
        if (role === 'admin') {
          router.replace('/admin/dashboard');
        } else if (role === 'agent') {
          router.replace('/(tabs)');
        }
        // If role is null, we stay on splash longer until it loads
      } else {
        router.replace('/auth/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, role, router]);

  return (
    <View style={styles.container}>
      <Feather name="shield" size={80} color="#16A34A" />
      <Text style={styles.title}>DeliverSure</Text>
      <Text style={styles.subtitle}>Protecting your daily earnings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '500',
  },
});
