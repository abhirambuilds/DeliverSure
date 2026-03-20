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
    padding: 24,
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
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: colors.success,
  },
  grayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardIconBg,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  expenseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
