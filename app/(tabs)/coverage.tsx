import React, { useEffect, useState } from "react";
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
