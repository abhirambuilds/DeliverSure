import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import StatsCard from '../../components/StatsCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminDashboardScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    // In a real app, this would be:
    // try {
    //   const response = await api.get('/admin/dashboard');
    //   setData(response.data);
    // } catch (e) { ... }

    // Mocking an API response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalUsers: 1245,
          activePolicies: 980,
          totalPayouts: 45200,
        });
      }, 800);
    });
  };

  const loadData = async () => {
    setLoading(true);
    const result = await fetchDashboardData();
    setData(result);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const result = await fetchDashboardData();
    setData(result);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#FF3B30"
          colors={["#FF3B30"]}
        />
      }
    >
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.header}>Platform Overview</Text>
        <Text variant="bodyMedium" style={styles.subHeader}>Live Metrics & Analytics</Text>
      </View>

      <StatsCard 
        title="Total Registered Users" 
        value={data.totalUsers.toLocaleString()} 
        icon={<Icon name="account-group" size={28} color="#00A8FF" />}
      />

      <StatsCard 
        title="Active Policies" 
        value={data.activePolicies.toLocaleString()} 
        icon={<Icon name="shield-check" size={28} color="#0bdc84" />}
      />

      <StatsCard 
        title="Total Payouts (USD)" 
        value={`$${data.totalPayouts.toLocaleString()}`} 
        valueColor="#FFC107"
        icon={<Icon name="cash-fast" size={28} color="#FFC107" />}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  header: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subHeader: {
    color: '#A0A0A0',
    marginTop: 4,
  }
});

export default AdminDashboardScreen;
