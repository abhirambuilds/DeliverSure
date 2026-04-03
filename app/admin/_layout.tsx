import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function AdminTabLayout() {
  const { user, role } = useAuth();

  // Route protection: Must be logged in
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // Redirect non-admins to the user tabs
  if (role !== 'admin') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Feather size={24} name="grid" color={color} />,
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: 'Claims',
          tabBarIcon: ({ color }) => <Feather size={24} name="file-text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="risk"
        options={{
          title: 'Risk',
          tabBarIcon: ({ color }) => <Feather size={24} name="alert-triangle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fraud"
        options={{
          title: 'Fraud',
          tabBarIcon: ({ color }) => <Feather size={24} name="shield" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lossratio"
        options={{
          title: 'Loss Ratio',
          tabBarIcon: ({ color }) => <Feather size={24} name="pie-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}
