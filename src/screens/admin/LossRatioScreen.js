import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import StatsCard from '../../components/StatsCard';

const screenWidth = Dimensions.get("window").width;

const LossRatioScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API Call
    setTimeout(() => {
      setData({
        totalPremiums: 125000,
        totalPayouts: 85000,
        currentRatio: 68, // 68%
        weeklyTrend: {
          labels: ["W1", "W2", "W3", "W4", "W5"],
          datasets: [{ data: [55, 62, 85, 92, 68] }]
        }
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  // Determine highlight color based on ratio logic
  let ratioColor = '#0bdc84'; // Green < 70%
  if (data.currentRatio >= 70 && data.currentRatio <= 90) {
    ratioColor = '#FFC107'; // Yellow 70-90%
  } else if (data.currentRatio > 90) {
    ratioColor = '#FF3B30'; // Red > 90%
  }

  const chartConfig = {
    backgroundGradientFrom: "#1E1E1E",
    backgroundGradientTo: "#1E1E1E",
    color: (opacity = 1) => `rgba(11, 220, 132, ${opacity})`, // Green chart line
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#121212"
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>Loss Ratio Analytics</Text>

      {/* Main Ratio Card */}
      <Card style={[styles.card, { borderColor: ratioColor, borderWidth: 1 }]}>
        <Card.Title title="Current Month Loss Ratio" titleStyle={{ color: '#A0A0A0' }} />
        <Card.Content style={styles.ratioContainer}>
          <Text variant="displayLarge" style={{ color: ratioColor, fontWeight: 'bold' }}>
            {data.currentRatio}%
          </Text>
          <Text variant="bodyMedium" style={{ color: '#E0E0E0', marginTop: 8 }}>
            Target: &lt; 70%
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <View style={styles.halfCard}>
          <StatsCard 
            title="Premiums" 
            value={`$${(data.totalPremiums / 1000).toFixed(1)}k`} 
            valueColor="#00A8FF"
          />
        </View>
        <View style={styles.halfCard}>
          <StatsCard 
            title="Payouts" 
            value={`$${(data.totalPayouts / 1000).toFixed(1)}k`} 
            valueColor="#FF3B30"
          />
        </View>
      </View>

      <Text variant="titleLarge" style={styles.chartHeader}>5-Week Trend (%)</Text>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={data.weeklyTrend}
          width={screenWidth - 32} // Padding offset
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix="%"
        />
      </View>
      
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
  header: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  ratioContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -16, // Counteract standard padding inside row
  },
  halfCard: {
    flex: 1,
  },
  chartHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  }
});

export default LossRatioScreen;
