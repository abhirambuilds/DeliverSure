import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { formatINR } from '../../src/utils/currency';

const fraudAlerts = [
  { user: "User #102", issue: "Multiple claims in 5 mins", city: "Chennai", risk: "High" },
  { user: "User #221", issue: "Location mismatch detected", city: "Hyderabad", risk: "Critical" },
  { user: "User #315", issue: "Duplicate claim attempt", city: "Bangalore", risk: "Moderate" },
  { user: "User #411", issue: "Suspicious GPS detected", city: "Mumbai", risk: "High" },
];

export default function AdminFraudScreen() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(isDark);
  const getBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'Critical': return styles.badgeCritical;
      case 'High': return styles.badgeHigh;
      case 'Moderate': return styles.badgeModerate;
      default: return styles.badgeModerate;
    }
  };

  const getBadgeTextStyle = (risk: string) => {
    switch (risk) {
      case 'Critical': return styles.badgeTextCritical;
      case 'High': return styles.badgeTextHigh;
      case 'Moderate': return styles.badgeTextModerate;
      default: return styles.badgeTextModerate;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Fraud Detection</Text>

      <View style={styles.row}>
        <View style={[styles.card, styles.flexCard]}>
          <Text style={styles.cardTitle}>Flagged Claims</Text>
          <Text style={[styles.cardValue, { color: '#ef4444' }]}>24</Text>
          <Text style={styles.cardSubtitleSmall}>Detected in last 24 hrs</Text>
        </View>
        <View style={[styles.card, styles.flexCard]}>
          <Text style={styles.cardTitle}>Prevented Loss</Text>
          <Text style={[styles.cardValue, { color: '#4ade80' }]}>{formatINR(1200000)}</Text>
          <Text style={styles.cardSubtitleSmall}>Estimated fraud savings</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Fraud Alerts</Text>
        <Text style={styles.cardSubtitle}>AI-detected suspicious activities</Text>

        {fraudAlerts.map((alert, index) => (
          <View key={index} style={[styles.fraudItem, index === fraudAlerts.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.fraudHeaderRow}>
              <Text style={styles.fraudIcon}>⚠️</Text>
              <Text style={styles.fraudUser}>{alert.user}</Text>
            </View>
            <Text style={styles.fraudIssue}>{alert.issue}</Text>
            <View style={styles.fraudFooterRow}>
              <Text style={styles.fraudCity}>{alert.city}</Text>
              <View style={[getBadgeStyle(alert.risk)]}>
                <Text style={getBadgeTextStyle(alert.risk)}>{alert.risk}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Suspicious Activity</Text>
        <View style={styles.alertItem}>
          <Text style={styles.alertText}>User #102 triggered 3 claims in 5 mins</Text>
          <Text style={styles.dateText}>2h ago</Text>
        </View>
        <View style={styles.alertItem}>
          <Text style={styles.alertText}>User #221 filed claim from 50km outside zone</Text>
          <Text style={styles.dateText}>5h ago</Text>
        </View>
        <View style={[styles.alertItem, { borderBottomWidth: 0 }]}>
          <Text style={styles.alertText}>User #315 submitted identical photos</Text>
          <Text style={styles.dateText}>1d ago</Text>
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
    paddingBottom: 60,
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
    justifyContent: 'center',
  },
  cardTitle: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  cardValue: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSubtitleSmall: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  cardSubtitle: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  fraudItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2a2a2a' : '#e0e0e0',
  },
  fraudHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fraudIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  fraudUser: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: 'bold',
  },
  fraudIssue: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  fraudFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fraudCity: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 14,
  },
  badgeCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  badgeTextCritical: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  badgeHigh: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  badgeTextHigh: { color: '#f97316', fontWeight: 'bold', fontSize: 12 },
  badgeModerate: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  badgeTextModerate: { color: '#f59e0b', fontWeight: 'bold', fontSize: 12 },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333333' : '#e0e0e0',
    gap: 12,
  },
  alertText: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 14,
    flex: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  dateText: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 12,
  },
});
