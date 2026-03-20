import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function AdminRiskScreen() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(isDark);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Risk Analysis</Text>

      <View style={styles.row}>
        <View style={[styles.card, styles.flexCard]}>
          <Text style={styles.cardTitle}>Global Risk Level</Text>
          <Text style={[styles.cardValue, { color: '#f59e0b' }]}>Elevated</Text>
        </View>
        <View style={[styles.card, styles.flexCard]}>
          <Text style={styles.cardTitle}>Active Weather Events</Text>
          <Text style={styles.cardValue}>12</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>City Risk Overview</Text>
        
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Chennai</Text>
          <View style={styles.badgeHigh}><Text style={styles.badgeTextHigh}>High</Text></View>
        </View>
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Bangalore</Text>
          <View style={styles.badgeMedium}><Text style={styles.badgeTextMedium}>Medium</Text></View>
        </View>
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Hyderabad</Text>
          <View style={styles.badgeLow}><Text style={styles.badgeTextLow}>Low</Text></View>
        </View>
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Mumbai</Text>
          <View style={styles.badgeHigh}><Text style={styles.badgeTextHigh}>High</Text></View>
        </View>
        <View style={[styles.zoneItem, { borderBottomWidth: 0 }]}>
          <Text style={styles.zoneName}>Delhi</Text>
          <View style={styles.badgeMedium}><Text style={styles.badgeTextMedium}>Medium</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.cardTitle}>Live Disruption Monitor</Text>
            <Text style={styles.cardSubtitle}>Real-time events affecting active coverage</Text>
          </View>
          <View style={styles.liveTagContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.disruptionItem}>
              <View style={styles.disruptionLeft}>
                <Text>🌧️</Text>
                <Text style={[styles.eventName, { color: '#3b82f6' }]} numberOfLines={1} ellipsizeMode="tail">Rain Alert</Text>
              </View>
              <View style={styles.disruptionCenter}>
                <Text style={styles.eventCity} numberOfLines={1} ellipsizeMode="tail">Chennai</Text>
              </View>
              <View style={styles.disruptionRight}>
                <View style={styles.badgeLow}><Text style={styles.badgeTextLow} numberOfLines={1} ellipsizeMode="tail">Active</Text></View>
              </View>
            </View>

            <View style={styles.disruptionItem}>
              <View style={styles.disruptionLeft}>
                <Text>🌡️</Text>
                <Text style={[styles.eventName, { color: '#f97316' }]} numberOfLines={1} ellipsizeMode="tail">Heatwave Warning</Text>
              </View>
              <View style={styles.disruptionCenter}>
                <Text style={styles.eventCity} numberOfLines={1} ellipsizeMode="tail">Hyderabad</Text>
              </View>
              <View style={styles.disruptionRight}>
                <View style={styles.badgeLow}><Text style={styles.badgeTextLow} numberOfLines={1} ellipsizeMode="tail">Active</Text></View>
              </View>
            </View>

            <View style={styles.disruptionItem}>
              <View style={styles.disruptionLeft}>
                <Text>😷</Text>
                <Text style={[styles.eventName, { color: '#eab308' }]} numberOfLines={1} ellipsizeMode="tail">AQI Alert</Text>
              </View>
              <View style={styles.disruptionCenter}>
                <Text style={styles.eventCity} numberOfLines={1} ellipsizeMode="tail">Delhi</Text>
              </View>
              <View style={styles.disruptionRight}>
                <View style={styles.badgeMedium}><Text style={styles.badgeTextMedium} numberOfLines={1} ellipsizeMode="tail">Moderate</Text></View>
              </View>
            </View>

            <View style={[styles.disruptionItem, { borderBottomWidth: 0 }]}>
              <View style={styles.disruptionLeft}>
                <Text>🚨</Text>
                <Text style={[styles.eventName, { color: '#ef4444' }]} numberOfLines={1} ellipsizeMode="tail">Curfew Restriction</Text>
              </View>
              <View style={styles.disruptionCenter}>
                <Text style={styles.eventCity} numberOfLines={1} ellipsizeMode="tail">Mumbai</Text>
              </View>
              <View style={styles.disruptionRight}>
                <View style={styles.badgeHigh}><Text style={styles.badgeTextHigh} numberOfLines={1} ellipsizeMode="tail">Critical</Text></View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Prediction – Next 7 Days</Text>
        <Text style={styles.cardSubtitle}>AI-based prediction of disruptions affecting gig workers</Text>
        
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Chennai</Text>
          <Text style={styles.predictionText}>Heavy Rain Expected 🌧️</Text>
        </View>
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Bangalore</Text>
          <Text style={styles.predictionText}>Stable Conditions ☁️</Text>
        </View>
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Hyderabad</Text>
          <Text style={styles.predictionText}>Rising Heat 🌡️</Text>
        </View>
        <View style={styles.zoneItem}>
          <Text style={styles.zoneName}>Mumbai</Text>
          <Text style={styles.predictionText}>High Rain Risk 🌧️</Text>
        </View>
        <View style={[styles.zoneItem, { borderBottomWidth: 0 }]}>
          <Text style={styles.zoneName}>Delhi</Text>
          <Text style={styles.predictionText}>AQI Worsening 😷</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333333' : '#e0e0e0',
  },
  zoneName: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  badgeHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  badgeTextHigh: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
  badgeMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  badgeTextMedium: { color: '#f59e0b', fontWeight: 'bold', fontSize: 13 },
  badgeLow: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  badgeTextLow: { color: '#4ade80', fontWeight: 'bold', fontSize: 13 },
  cardSubtitle: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  predictionText: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '500',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  liveTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: -2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disruptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333333' : '#e0e0e0',
  },
  disruptionLeft: {
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disruptionCenter: {
    width: 100,
    marginLeft: 16,
    alignItems: 'flex-start',
  },
  disruptionRight: {
    width: 110,
    marginLeft: 16,
    alignItems: 'flex-end',
  },
  eventName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventCity: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 14,
  },
});
