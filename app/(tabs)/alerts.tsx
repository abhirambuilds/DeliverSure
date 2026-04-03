import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext, ThemeColors } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { t } from '@/utils/translations';
import { formatINR } from '../../src/utils/currency';

export default function AlertsScreen() {
  const { user, language } = useAuth();
  const { colors } = useThemeContext();
  const styles = createStyles(colors);

  // Placeholder for alerts data, as the instruction implies a dynamic list
  const alerts = [
    {
      id: '1',
      type: 'high',
      title: 'Severe Weather Warning',
      description: 'Hurricane warnings are in effect for your primary registered address. Please review your coverage limits and secure your property.',
      time: '2 hours ago',
      action: 'Review Policy',
    },
    {
      id: '2',
      type: 'low',
      title: 'Policy Auto-Renewed',
      description: 'Your Homeowner Plus policy has been successfully renewed for another year.',
      time: '5 hours ago',
    },
    {
      id: '3',
      type: 'info',
      title: 'Claim Payment Sent',
      description: `Your claim #0844 payment of ${formatINR(1200)} has been sent to your linked bank account.`,
      time: '3 days ago',
    },
    {
      id: '4',
      type: 'medium',
      title: 'Log in from new device',
      description: "We noticed a login from an unrecognized iPhone in Tampa, FL. If this wasn't you, please secure your account immediately.",
      time: '5 days ago',
      action: 'Secure Account',
    },
  ];

  const getIndicatorStyle = (type: string) => {
    switch (type) {
      case 'high':
        return styles.bgHigh;
      case 'medium':
        return styles.bgMedium;
      case 'low':
        return styles.bgLow;
      case 'info':
        return styles.bgInfo;
      default:
        return styles.bgInfo;
    }
  };

  const getCardStyle = (type: string) => {
    if (type === 'high') {
      return styles.cardHigh;
    }
    return {};
  };

  const getActionButtonStyle = (type: string) => {
    if (type === 'high') {
      return styles.actionButtonHigh;
    }
    return {};
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Notifications</Text>
      <Text style={styles.subtitle}>Stay informed about your policies and account activity.</Text>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="bell-off" size={60} color={colors.textMuted} />
          <Text style={styles.emptyStateText}>No new notifications</Text>
          <Text style={styles.emptyStateSubText}>
            We'll let you know when there's something new for you.
          </Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View key={alert.id} style={[styles.card, getCardStyle(alert.type)]}>
            <View style={styles.alertHeader}>
              <View style={styles.alertTypeContainer}>
                <View style={[styles.indicatorSize, getIndicatorStyle(alert.type)]} />
                <Text style={styles.alertTitle}>{alert.title}</Text>
              </View>
              <Text style={styles.timeText}>{alert.time}</Text>
            </View>
            <Text style={styles.description}>{alert.description}</Text>
            {alert.action && (
              <TouchableOpacity style={[styles.actionButton, getActionButtonStyle(alert.type)]}>
                <Text style={styles.actionButtonText}>{alert.action}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
  },
  cardHigh: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorSize: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bgHigh: { backgroundColor: colors.danger },
  bgMedium: { backgroundColor: colors.warning },
  bgLow: { backgroundColor: '#2563EB' },
  bgInfo: { backgroundColor: colors.success },
  alertTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonHigh: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    marginTop: 40,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
  },
  emptyStateText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
});
