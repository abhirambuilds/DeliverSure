import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useThemeContext, ThemeColors } from '@/context/ThemeContext';
import { formatINR } from '../../src/utils/currency';

export default function PayoutsScreen() {
  const { colors } = useThemeContext();
  const styles = createStyles(colors);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Payout History</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Received (YTD)</Text>
        <Text style={styles.summaryValue}>{formatINR(1200)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <View style={styles.card}>
        <View style={styles.transactionRow}>
          <View style={styles.iconContainer}>
            <View style={styles.greenCircle} />
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>Direct Deposit - Claim #0844</Text>
            <Text style={styles.date}>Aug 14, 2025</Text>
          </View>
          <Text style={styles.amountText}>+{formatINR(1200)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.transactionRow}>
          <View style={styles.iconContainer}>
            <View style={styles.grayCircle} />
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>Premium Payment</Text>
            <Text style={styles.date}>Aug 01, 2025</Text>
          </View>
          <Text style={styles.expenseText}>-{formatINR(120)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.transactionRow}>
          <View style={styles.iconContainer}>
            <View style={styles.grayCircle} />
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>Premium Payment</Text>
            <Text style={styles.date}>Jul 01, 2025</Text>
          </View>
          <Text style={styles.expenseText}>-{formatINR(120)}</Text>
        </View>
      </View>

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
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 24,
    marginBottom: 32,
    boxShadow: `0px 4px 8px ${colors.primary}33`,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginRight: 16,
  },
  greenCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: colors.textMuted,
  },
  amountText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.success,
  },
  expenseText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
});
