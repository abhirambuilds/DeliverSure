import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import LocationPermissionModal from '@/components/LocationPermissionModal';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, role, isRideActive } = useAuth();

  // Route protection: Must be logged in
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // Admin redirect
  if (role === 'admin') {
    return <Redirect href="/admin/dashboard" />;
  }

  const handleTabPress = (e: any) => {
    if (isRideActive) {
      e.preventDefault();
      Alert.alert("Ride Active", "End ride to access other features");
    }
  };

  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="coverage"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Coverage',
          tabBarIcon: ({ color }) => <Feather size={24} name="shield" color={color} />,
        }}
      />
      <Tabs.Screen
        name="claims"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Claims',
          tabBarIcon: ({ color }) => <Feather size={24} name="file-text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="payouts"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Payouts',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="wallet-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Feather size={24} name="alert-circle" color={color} />,
        }}
      />
    </Tabs>
    <LocationPermissionModal />
    </>
  );
}
