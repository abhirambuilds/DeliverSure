import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { formatINR } from '../../src/utils/currency';

export default function AdminLossRatioScreen() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(isDark);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Loss Ratio</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Loss Ratio</Text>
        <Text style={[styles.cardValue, { color: '#f59e0b', fontSize: 40 }]}>68.4%</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.flexCard]}>
          <Text style={styles.cardTitle}>Premiums Earned</Text>
          <Text style={styles.statsValue}>{formatINR(42500000)}</Text>
        </View>
        <View style={[styles.card, styles.flexCard]}>
          <Text style={styles.cardTitle}>Losses Incurred</Text>
          <Text style={styles.statsValue}>{formatINR(29100000)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historical Data (Last 3 Years)</Text>
        <View style={styles.yearRow}>
           <Text style={styles.yearText}>2025</Text>
           <Text style={styles.ratioStale}>62.1%</Text>
        </View>
        <View style={styles.yearRow}>
           <Text style={styles.yearText}>2024</Text>
           <Text style={styles.ratioStale}>71.2%</Text>
        </View>
        <View style={[styles.yearRow, { borderBottomWidth: 0 }]}>
           <Text style={styles.yearText}>2023</Text>
           <Text style={styles.ratioStale}>58.9%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f0f0f' : '#f5f5f5',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#000000',
    marginBottom: 24,
  },
  card: {
    backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDark ? '#333333' : '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  flexCard: {
    flex: 1,
    marginBottom: 0,
  },
  cardTitle: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    color: isDark ? '#ffffff' : '#000000',
    fontWeight: 'bold',
  },
  statsValue: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333333' : '#e0e0e0',
  },
  yearText: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 16,
  },
  ratioStale: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 16,
    fontWeight: '600',
  }
});
