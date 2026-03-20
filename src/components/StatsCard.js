import React from 'react';
import { Card, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

const StatsCard = ({ title, value, icon, valueColor }) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.title}>{title}</Text>
          <Text variant="headlineMedium" style={[styles.value, valueColor && { color: valueColor }]}>{value}</Text>
        </View>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4, // Android shadow
    backgroundColor: '#1E1E1E' // Dark theme card default
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#A0A0A0', // Muted text for dark mode
    marginBottom: 4,
  },
  value: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  iconContainer: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
  }
});

export default StatsCard;
