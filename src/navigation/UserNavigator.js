import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Placeholder Screens
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import CoverageScreen from '../screens/user/CoverageScreen';
import ClaimsScreen from '../screens/user/ClaimsScreen';
import PayoutsScreen from '../screens/user/PayoutsScreen';
import AlertsScreen from '../screens/user/AlertsScreen';

const Tab = createBottomTabNavigator();

const UserNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Coverage') iconName = 'shield-check-outline';
          else if (route.name === 'Claims') iconName = 'file-document-outline';
          else if (route.name === 'Payouts') iconName = 'cash-multiple';
          else if (route.name === 'Alerts') iconName = 'bell-outline';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0bdc84', // Green accent
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={UserDashboardScreen} />
      <Tab.Screen name="Coverage" component={CoverageScreen} />
      <Tab.Screen name="Claims" component={ClaimsScreen} />
      <Tab.Screen name="Payouts" component={PayoutsScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
    </Tab.Navigator>
  );
};

export default UserNavigator;
