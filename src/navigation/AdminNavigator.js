import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Placeholder Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ClaimsMonitorScreen from '../screens/admin/ClaimsMonitorScreen';
import RiskOverviewScreen from '../screens/admin/RiskOverviewScreen';
import FraudAlertsScreen from '../screens/admin/FraudAlertsScreen';
import LossRatioScreen from '../screens/admin/LossRatioScreen';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'chart-line';
          else if (route.name === 'Claims Monitor') iconName = 'clipboard-text-search-outline';
          else if (route.name === 'Risk Overview') iconName = 'map-marker-radius';
          else if (route.name === 'Fraud Alerts') iconName = 'shield-alert';
          else if (route.name === 'Loss Ratio') iconName = 'chart-pie';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF3B30', // Red accent for admin
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Claims Monitor" component={ClaimsMonitorScreen} />
      <Tab.Screen name="Risk Overview" component={RiskOverviewScreen} />
      <Tab.Screen name="Fraud Alerts" component={FraudAlertsScreen} />
      <Tab.Screen name="Loss Ratio" component={LossRatioScreen} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
