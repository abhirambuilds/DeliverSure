import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const FraudAlertsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>Fraud Alerts</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: { color: '#FFFFFF', marginBottom: 20, fontWeight: 'bold' }
});

export default FraudAlertsScreen;
