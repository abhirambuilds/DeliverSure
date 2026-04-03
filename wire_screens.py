import os

claims_tsx = open('app/(tabs)/claims.tsx', 'r', encoding='utf-8').read()

# Just replace the imports and add real data fetching at top
new_claims = '''import React, { useEffect, useState } from 'react';
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
'''

coverage_tsx = '''import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useThemeContext, ThemeColors } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { t } from "@/utils/translations";
import { policiesAPI } from "@/src/services/api";

export default function CoverageScreen() {
  const { language } = useAuth();
  const { colors } = useThemeContext();
  const router = useRouter();
  const styles = createStyles(colors);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    policiesAPI.getActive()
      .then(res => setPolicy(res.data.policy || null))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{t(language, "myCoverage")}</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{t(language, "totalProtected")}</Text>
        <Text style={styles.summaryValue}>{policy ? "Rs." + policy.coverage_amount : "Rs.0"}</Text>
      </View>
      <Text style={styles.sectionTitle}>{t(language, "activePolicies")}</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : !policy ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active coverage yet.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{policy.risk_zone} Coverage</Text>
            <View style={styles.badgeActive}><Text style={styles.badgeTextActive}>Active</Text></View>
          </View>
          <Text style={styles.policyDetail}>Policy #{policy.id?.slice(0, 8)}</Text>
          <Text style={styles.policyDetail}>{policy.start_date} to {policy.end_date}</Text>
          <View style={styles.divider} />
          <View style={styles.flexRow}>
            <Text style={styles.label}>Weekly Premium</Text>
            <Text style={styles.value}>Rs.{policy.weekly_premium}</Text>
          </View>
          <View style={styles.flexRow}>
            <Text style={styles.label}>Coverage Amount</Text>
            <Text style={styles.value}>Rs.{policy.coverage_amount}</Text>
          </View>
          <View style={styles.flexRow}>
            <Text style={styles.label}>Zone</Text>
            <Text style={styles.value}>{policy.risk_zone}</Text>
          </View>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/coverage/select")}>
        <Text style={styles.addButtonText}>{t(language, "addNewCoverage")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
'''

styles_claims = """
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
"""

styles_coverage = """
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { fontSize: 32, fontWeight: "bold", color: colors.text, marginBottom: 24 },
  summaryCard: { backgroundColor: colors.primary, borderRadius: 16, padding: 24, marginBottom: 32 },
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 8 },
  summaryValue: { color: "#ffffff", fontSize: 36, fontWeight: "bold" },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: colors.text, marginBottom: 16 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  badgeActive: { backgroundColor: "rgba(16, 185, 129, 0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTextActive: { color: colors.success, fontSize: 12, fontWeight: "bold" },
  policyDetail: { color: colors.textMuted, fontSize: 14, marginBottom: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  flexRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: colors.textMuted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: "600" },
  addButton: { marginTop: 16, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, alignItems: "center" },
  addButtonText: { color: colors.primary, fontSize: 16, fontWeight: "bold" },
  emptyState: { padding: 24, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center", marginBottom: 16 },
  emptyStateText: { color: colors.textMuted, fontSize: 14, textAlign: "center" },
});
"""

with open('app/(tabs)/claims.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_claims + styles_claims)
print('claims.tsx done')

with open('app/(tabs)/coverage.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(coverage_tsx + styles_coverage)
print('coverage.tsx done')
