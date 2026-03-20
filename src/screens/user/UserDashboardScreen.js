import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Surface, IconButton } from 'react-native-paper';
import PrimaryButton from '../../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { speakAlert } from '../../utils/voiceUtils';

const UserDashboardScreen = () => {
  const [isCovered, setIsCovered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock Data
  const riskLevel = 'High'; // Triggered to High for Voice Demo
  const premiumAmount = '$4.50';
  const coverageStatusText = isCovered ? 'Active Coverage' : 'Unprotected';
  
  const getRiskColor = (level) => {
    switch(level) {
      case 'Low': return '#0bdc84';
      case 'Medium': return '#FFC107';
      case 'High': return '#FF3B30';
      default: return '#A0A0A0';
    }
  };

  const handleActivate = () => {
    setLoading(true);
    setTimeout(() => {
      setIsCovered(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Risk Indicator Card */}
      <Card style={styles.card}>
        <Card.Title 
          title="Current Threat Level" 
          titleStyle={styles.cardTitle}
          left={(props) => <Icon {...props} name="weather-lightning-rainy" color={getRiskColor(riskLevel)} size={30} />}
        />
        <Card.Content>
          <View style={styles.riskRow}>
            <Text variant="displayMedium" style={{ color: getRiskColor(riskLevel), fontWeight: 'bold' }}>
              {riskLevel}
            </Text>
            <View style={styles.premiumBox}>
              <Text variant="titleMedium" style={{ color: '#A0A0A0' }}>Weekly Premium</Text>
              <Text variant="headlineSmall" style={{ color: '#FFF', fontWeight: 'bold' }}>{premiumAmount}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Coverage Status */}
      <Surface style={[styles.statusSurface, { borderColor: isCovered ? '#0bdc84' : '#FF3B30', borderWidth: 1 }]} elevation={2}>
        <View style={styles.statusHeader}>
          <Icon name={isCovered ? "shield-check" : "shield-alert"} size={28} color={isCovered ? '#0bdc84' : '#FF3B30'} />
          <Text variant="headlineSmall" style={[styles.statusText, { color: isCovered ? '#0bdc84' : '#FF3B30' }]}>
            {coverageStatusText}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.statusSubtext}>
          {isCovered 
            ? "You are fully protected against extreme weather disruptions for the current week." 
            : "Your earnings are currently at risk. Activate coverage to ensure payouts during severe weather."}
        </Text>
      </Surface>

      {/* Activate Button */}
      {!isCovered && (
        <PrimaryButton 
          title="Activate Coverage Now" 
          icon="lightning-bolt"
          onPress={handleActivate} 
          loading={loading}
          style={styles.activateButton}
        />
      )}

      {/* Risk Alerts Section */}
      <View style={styles.alertsContainer}>
        <Text variant="titleLarge" style={styles.alertsHeader}>Risk Alerts</Text>
        
        <Card style={styles.alertCard}>
          <Card.Content style={styles.alertContent}>
            <Icon name="alert-circle" size={24} color="#FFC107" style={styles.alertIcon} />
            <View style={styles.alertTextContainer}>
              <Text variant="titleMedium" style={{ color: '#FFF' }}>Heavy Rain Expected</Text>
              <Text variant="bodyMedium" style={{ color: '#A0A0A0' }}>Showers likely between 2 PM - 5 PM today in your zone.</Text>
            </View>
            <IconButton 
              icon="volume-high" 
              iconColor="#0bdc84" 
              size={24} 
              onPress={() => speakAlert("Heavy rain detected. Insurance claim activated.")} 
            />
          </Card.Content>
        </Card>
      </View>
      
      {/* Bottom padding for scrollview */}
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
  card: {
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#A0A0A0',
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  premiumBox: {
    alignItems: 'flex-end',
  },
  statusSurface: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.8)', // Slightly transparent
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusSubtext: {
    color: '#E0E0E0',
    lineHeight: 22,
  },
  activateButton: {
    marginBottom: 32,
    paddingVertical: 8, // Make button slightly taller for mobile
  },
  alertsContainer: {
    marginTop: 8,
  },
  alertsHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#1E1E1E',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 16,
  },
  alertTextContainer: {
    flex: 1,
  }
});

export default UserDashboardScreen;
