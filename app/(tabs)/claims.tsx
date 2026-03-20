import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext, ThemeColors } from '@/context/ThemeContext';
import { t } from '@/utils/translations';
import { formatINR } from '../../src/utils/currency';

export default function ClaimsScreen() {
  const router = useRouter();
  const { user, language } = useAuth();
  const { colors } = useThemeContext();
  const styles = createStyles(colors);
  
  const claims = user?.claims || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{t(language, 'myClaims')}</Text>
        <TouchableOpacity style={styles.fileButton} onPress={() => router.push('/claims/new')}>
          <Text style={styles.fileButtonText}>{t(language, 'fileNew')}</Text>
        </TouchableOpacity>
      </View>

      {claims.length === 0 ? (
        <>
          {/* Hardcoded defaults for display purposes until a claim is filed */}
          <View style={styles.card}>
            <View style={styles.claimHeader}>
              <Text style={styles.claimTitle}>Wind Damage (Roof)</Text>
              <Text style={styles.claimAmount}>Est. {formatINR(850)}</Text>
            </View>
            <Text style={styles.claimId}>Claim #CLM-1092</Text>
            <Text style={styles.claimDate}>Submitted: Oct 12, 2025</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.statusTextPending}>Under Review</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.claimHeader}>
              <Text style={styles.claimTitle}>Water Leak (Basement)</Text>
              <Text style={styles.claimAmount}>Est. {formatINR(1200)}</Text>
            </View>
            <Text style={styles.claimId}>Claim #CLM-0844</Text>
            <Text style={styles.claimDate}>Submitted: Aug 04, 2025</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: '#4ade80' }]} />
              <Text style={styles.statusTextApproved}>Approved & Paid</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.claimHeader}>
              <Text style={styles.claimTitle}>Hail Damage (Vehicle)</Text>
              <Text style={styles.claimAmount}>Est. {formatINR(450)}</Text>
            </View>
            <Text style={styles.claimId}>Claim #CLM-0621</Text>
            <Text style={styles.claimDate}>Submitted: May 18, 2025</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.statusTextDenied}>Denied - Below Deductible</Text>
            </View>
          </View>
        </>
      ) : (
        claims.map((claim) => (
          <View key={claim.id} style={styles.card}>
            <View style={styles.claimHeader}>
              <Text style={styles.claimTitle}>{claim.title}</Text>
              <Text style={styles.claimAmount}>Est. {formatINR(claim.amount)}</Text>
            </View>
            <Text style={styles.claimId}>Claim #{claim.id}</Text>
            <Text style={styles.claimDate}>Submitted: {claim.date}</Text>
            
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: claim.status === 'Under Review' ? '#f59e0b' : claim.status === 'Approved & Paid' ? '#4ade80' : '#ef4444' }
              ]} />
              <Text style={[
                claim.status === 'Under Review' ? styles.statusTextPending : 
                claim.status === 'Approved & Paid' ? styles.statusTextApproved : 
                styles.statusTextDenied
              ]}>
                {claim.status}
              </Text>
            </View>
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
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  fileButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fileButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  claimTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  claimAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  claimId: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 2,
  },
  claimDate: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardIconBg,
    padding: 12,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTextPending: { color: colors.warning, fontWeight: '600' },
  statusTextApproved: { color: colors.success, fontWeight: '600' },
  statusTextDenied: { color: colors.danger, fontWeight: '600' },
});
