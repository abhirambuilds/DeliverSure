import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { t } from '@/utils/translations';
import { supabase } from '@/src/lib/supabase';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export default function AlertsScreen() {
  const { language } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('disruption_events')
          .select('*')
          .order('event_time', { ascending: false })
          .limit(10);

        if (error) throw error;
        setAlerts(data || []);
      } catch (err) {
        console.error("Fetch alerts error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getAlertDetails = (type: string) => {
    if (type.toLowerCase() === 'rain') return { icon: 'cloud-drizzle', color: '#2563EB', title: 'Rain Alert' };
    if (type.toLowerCase() === 'smoke') return { icon: 'wind', color: UI.warning, title: 'Smoke/Pollution' };
    return { icon: 'alert-triangle', color: UI.danger, title: 'System Warning' };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Safety Alerts</Text>

      {loading ? (
        <ActivityIndicator color={UI.primary} size="large" style={{ marginTop: 20 }} />
      ) : alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No weather alerts in your area.</Text>
        </View>
      ) : (
        alerts.map((alert) => {
          const details = getAlertDetails(alert.event_type);
          return (
            <TouchableOpacity key={alert.id} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: details.color + '10' }]}>
                <Feather name={details.icon as any} size={24} color={details.color} />
              </View>
              <View style={styles.textContainer}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>{details.title}</Text>
                  <Text style={styles.cardTime}>{new Date(alert.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.cardDescription}>
                  {alert.event_type === 'rain' ? `Heavy rainfall detected in ${alert.zone}. Observed value: ${alert.observed_value}mm.` : `Environmental disruption detected.`}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: alert.severity === 'high' ? UI.danger + '10' : UI.warning + '10' }]}>
                  <Text style={[styles.typeBadgeText, { color: alert.severity === 'high' ? UI.danger : UI.warning }]}>
                    {alert.severity === 'high' ? 'High Severity' : 'Medium Priority'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { fontSize: 32, fontWeight: 'bold', color: UI.text, marginBottom: 24 },
  card: { backgroundColor: UI.surface, borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: UI.border, boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: UI.text },
  cardTime: { fontSize: 13, color: UI.textSecondary },
  cardDescription: { fontSize: 15, color: UI.textSecondary, marginBottom: 12, lineHeight: 20 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: 'bold' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: UI.textSecondary, fontSize: 16 },
});
