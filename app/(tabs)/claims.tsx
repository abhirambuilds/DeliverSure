import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext, ThemeColors } from '@/context/ThemeContext';
import { t } from '@/utils/translations';
import { claimsAPI } from '@/src/services/api';

export default function ClaimsScreen() {
  const router = useRouter();
  const { language } = useAuth();
  const { colors } = useThemeContext();
  const styles = createStyles(colors);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    claimsAPI.list()
      .then(res => setClaims(res.data.claims || []))
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    if (status === "approved") return colors.success;
    if (status === "pending") return "#f59e0b";
    return colors.danger;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{t(language, "myClaims")}</Text>
        <TouchableOpacity style={styles.fileButton} onPress={() => router.push("/claims/new")}>
          <Text style={styles.fileButtonText}>{t(language, "fileNew")}</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : claims.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No claims yet.</Text>
        </View>
      ) : (
        claims.map((claim) => (
          <View key={claim.id} style={styles.card}>
            <View style={styles.claimHeader}>
              <Text style={styles.claimTitle}>{claim.claim_type || "Claim"}</Text>
              <Text style={styles.claimAmount}>Rs.{claim.payout_amount || 0}</Text>
            </View>
            <Text style={styles.claimId}>Claim #{claim.id?.slice(0, 8)}</Text>
            <Text style={styles.claimDate}>Submitted: {new Date(claim.created_at).toLocaleDateString()}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(claim.claim_status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(claim.claim_status) }]}>
                {claim.claim_status?.charAt(0).toUpperCase() + claim.claim_status?.slice(1)}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  header: { fontSize: 32, fontWeight: "bold", color: colors.text },
  fileButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  fileButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  claimHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  claimTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, flex: 1 },
  claimAmount: { fontSize: 16, fontWeight: "600", color: colors.text, marginLeft: 12 },
  claimId: { color: colors.textMuted, fontSize: 14, marginBottom: 2 },
  claimDate: { color: colors.textMuted, fontSize: 14, marginBottom: 16 },
  statusContainer: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cardIconBg, padding: 12, borderRadius: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontWeight: "600" },
  emptyState: { padding: 24, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  emptyStateText: { color: colors.textMuted, fontSize: 14, textAlign: "center" },
});
