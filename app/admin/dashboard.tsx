import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase";

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
};

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel directly from Supabase
        const [usersRes, activePoliciesRes, totalClaimsRes, pendingClaimsRes, disruptionsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('coverage_policies').select('id', { count: 'exact', head: true }).eq('policy_status', 'active'),
          supabase.from('claims').select('id', { count: 'exact', head: true }),
          supabase.from('claims').select('id', { count: 'exact', head: true }).eq('claim_status', 'pending'),
          supabase.from('disruption_events').select('id', { count: 'exact', head: true }),
        ]);
        setStats({
          total_users: usersRes.count || 0,
          active_policies: activePoliciesRes.count || 0,
          total_claims: totalClaimsRes.count || 0,
          pending_claims: pendingClaimsRes.count || 0,
          total_disruptions: disruptionsRes.count || 0,
        });
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    setModalVisible(false);
    await logout();
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>System Overview</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => setModalVisible(true)}>
          <Feather name="user" size={24} color={UI.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={UI.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.cardFull}>
            <Feather name="shield" size={40} color={UI.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.cardLabel}>Active Policies</Text>
            <Text style={styles.cardBigVal}>{stats?.active_policies ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Total Claims</Text>
              <Text style={styles.cardVal}>{stats?.total_claims ?? 0}</Text>
            </View>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Pending Review</Text>
              <Text style={[styles.cardVal, { color: '#F59E0B' }]}>{stats?.pending_claims ?? 0}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Total Users</Text>
              <Text style={styles.cardVal}>{stats?.total_users ?? 0}</Text>
            </View>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Disruptions</Text>
              <Text style={[styles.cardVal, { color: '#EF4444' }]}>{stats?.total_disruptions ?? 0}</Text>
            </View>
          </View>

          {/* View Claims Button */}
          <TouchableOpacity style={styles.viewClaimsBtn} onPress={() => router.push('/admin/claims')}>
            <Text style={styles.viewClaimsBtnText}>View All Claims</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={styles.modalTitle}>Admin Menu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={UI.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuLabel}>Admin Email</Text>
              <Text style={styles.menuValue}>{user?.email || "admin@ws.com"}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Feather name="log-out" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={styles.logoutBtnText}>Log Out System</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
  headerText: { justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: UI.text },
  subtitle: { fontSize: 16, color: UI.textSecondary, marginTop: 4 },
  profileBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: UI.surface, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  cardFull: { backgroundColor: UI.surface, borderRadius: 16, padding: 32, marginBottom: 16, alignItems: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  cardLabel: { color: UI.textSecondary, fontSize: 16, marginBottom: 8, fontWeight: '600' },
  cardBigVal: { color: UI.text, fontSize: 56, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  cardHalf: { flex: 1, backgroundColor: UI.surface, borderRadius: 16, padding: 20, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  cardVal: { color: UI.text, fontSize: 32, fontWeight: 'bold' },
  viewClaimsBtn: { backgroundColor: UI.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  viewClaimsBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: UI.text },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuLabel: { color: UI.textSecondary, fontSize: 18 },
  menuValue: { color: UI.text, fontSize: 18, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#FEF2F2', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoutBtnText: { color: '#EF4444', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { height: 56, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: UI.text, fontSize: 18, fontWeight: 'bold' },
});
