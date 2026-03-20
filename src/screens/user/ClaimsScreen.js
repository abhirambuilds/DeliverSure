import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const mockClaims = [
  { id: '1', date: 'Oct 12, 2023', type: 'Heavy Rain Alert', status: 'Paid', amount: '$45.00' },
  { id: '2', date: 'Nov 04, 2023', type: 'Storm Warning', status: 'Triggered', amount: 'Pending' },
  { id: '3', date: 'Jan 15, 2024', type: 'Severe Heatwave', status: 'Paid', amount: '$60.00' },
];

const ClaimsScreen = () => {
  const renderItem = ({ item }) => {
    const isPaid = item.status === 'Paid';
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Icon 
              name={isPaid ? "check-circle" : "clock-fast"} 
              size={32} 
              color={isPaid ? '#0bdc84' : '#FFC107'} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text variant="titleMedium" style={styles.title}>{item.type}</Text>
            <Text variant="bodyMedium" style={styles.date}>{item.date}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text 
              variant="labelLarge" 
              style={[styles.statusBadge, { color: isPaid ? '#0bdc84' : '#FFC107', borderColor: isPaid ? '#0bdc84' : '#FFC107' }]}
            >
              {item.status}
            </Text>
            {isPaid && <Text variant="titleSmall" style={styles.amount}>{item.amount}</Text>}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>Claim History</Text>
      <FlatList
        data={mockClaims}
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
    marginBottom: 20,
    fontWeight: 'bold',
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
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  amount: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});

export default ClaimsScreen;
