import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { t } from "@/utils/translations";
import { supabase } from "@/src/lib/supabase";

export default function CoverageScreen() {
  const { user, language } = useAuth();
  const router = useRouter();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchPolicy = async () => {
      try {
        const { data, error } = await supabase
          .from('coverage_policies')
          .select('*')
          .eq('user_id', user.id)
          .eq('policy_status', 'active')
          .single();
        setPolicy(error ? null : data);
      } catch {
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [user?.id]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{t(language, "myCoverage")}</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{t(language, "totalProtected")}</Text>
        <Text style={styles.summaryValue}>{policy ? `₹${policy.coverage_amount}` : "₹0"}</Text>
      </View>
      <Text style={styles.sectionTitle}>{t(language, "activePolicies")}</Text>
      {loading ? (
        <ActivityIndicator color="#16A34A" size="large" style={{ marginTop: 40 }} />
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
          <View style={styles.flexRow}><Text style={styles.label}>Weekly Premium</Text><Text style={styles.value}>₹{policy.weekly_premium}</Text></View>
          <View style={styles.flexRow}><Text style={styles.label}>Coverage Amount</Text><Text style={styles.value}>₹{policy.coverage_amount}</Text></View>
          <View style={styles.flexRow}><Text style={styles.label}>Zone</Text><Text style={styles.value}>{policy.risk_zone}</Text></View>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/coverage/select")}>
        <Text style={styles.addButtonText}>{t(language, "addNewCoverage")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { fontSize: 32, fontWeight: "bold", color: '#0F172A', marginBottom: 24 },
  summaryCard: { backgroundColor: '#16A34A', borderRadius: 14, padding: 24, marginBottom: 32, boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  summaryLabel: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: '600', marginBottom: 8 },
  summaryValue: { color: "#FFFFFF", fontSize: 40, fontWeight: "bold" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: '#0F172A', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: '#0F172A' },
  badgeActive: { backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTextActive: { color: '#16A34A', fontSize: 14, fontWeight: "bold" },
  policyDetail: { color: '#64748B', fontSize: 16, marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  flexRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  label: { color: '#64748B', fontSize: 16 },
  value: { color: '#0F172A', fontSize: 16, fontWeight: "600" },
  addButton: { marginTop: 16, height: 56, borderRadius: 12, borderWidth: 2, borderColor: '#16A34A', alignItems: "center", justifyContent: 'center' },
  addButtonText: { color: '#16A34A', fontSize: 18, fontWeight: "bold" },
  emptyState: { padding: 32, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: "center", marginBottom: 16 },
  emptyStateText: { color: '#64748B', fontSize: 16, textAlign: "center" },
});
