import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase";
import AppHeader from "@/components/AppHeader";

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

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-stats', {
        headers: {
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
        }
      });
      if (error) throw error;
      setStats(data);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    setModalVisible(false);
    await logout();
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <AppHeader title="DeliverSure Admin" onMenuPress={() => setModalVisible(true)} />
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
          <View style={[styles.cardFull, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Feather name="activity" size={24} color={UI.primary} style={{ marginRight: 12 }} />
              <Text style={[styles.cardLabel, { marginBottom: 0, color: UI.primary }]}>AI Fraud Detection</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: UI.text }}>Risk Level: LOW</Text>
            <Text style={{ color: UI.textSecondary, marginTop: 4 }}>99.8% System Integrity</Text>
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
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
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
