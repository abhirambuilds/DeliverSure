import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const mockPayouts = [
  { id: '101', date: 'Oct 14, 2023', amount: '$45.00', method: 'Bank Transfer' },
  { id: '102', date: 'Jan 17, 2024', amount: '$60.00', method: 'Instant Wallet' },
  { id: '103', date: 'Feb 02, 2024', amount: '$25.00', method: 'Bank Transfer' },
];

const PayoutsScreen = () => {
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Icon name="bank-transfer" size={36} color="#0bdc84" />
        </View>
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.title}>Payout Processed</Text>
          <Text variant="bodyMedium" style={styles.date}>{item.date} • {item.method}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text variant="titleLarge" style={styles.amount}>+{item.amount}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>Payouts Tracker</Text>
      
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Card.Title 
          title="Total Payouts Received" 
          titleStyle={{ color: '#A0A0A0' }}
        />
        <Card.Content>
          <Text variant="displaySmall" style={{ color: '#0bdc84', fontWeight: 'bold' }}>$130.00</Text>
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.historyHeader}>Recent Transfers</Text>
      <FlatList
        data={mockPayouts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    marginBottom: 24,
  },
  historyHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    marginRight: 16,
    backgroundColor: 'rgba(11, 220, 132, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  date: {
    color: '#A0A0A0',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#0bdc84',
    fontWeight: 'bold',
  }
});

export default PayoutsScreen;
