import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import api from "@/src/services/api";

const UI = {
  primary: '#0BDC84',
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
};

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.log("Admin fetch error"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    setModalVisible(false);
    logout();
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Overview</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => setModalVisible(true)}>
          <Feather name="user" size={24} color={UI.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={UI.primary} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.cardFull}>
            <Feather name="shield" size={32} color={UI.primary} style={{ marginBottom: 12 }} />
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
              <Text style={[styles.cardVal, { color: '#FFA500' }]}>{stats?.pending_claims ?? 0}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Total Users</Text>
              <Text style={styles.cardVal}>{stats?.total_users ?? 0}</Text>
            </View>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Disruptions</Text>
              <Text style={[styles.cardVal, { color: '#FF4D4D' }]}>{stats?.total_disruptions ?? 0}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Admin Menu Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Menu</Text>
            <View style={styles.menuRow}>
              <Text style={styles.menuLabel}>Email</Text>
              <Text style={styles.menuValue}>{user?.email || "admin@ws.com"}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Feather name="log-out" size={20} color="#FF4D4D" style={{ marginRight: 12 }} />
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
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
  profileBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: UI.surface, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  cardFull: { backgroundColor: UI.surface, borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  cardLabel: { color: UI.textSecondary, fontSize: 16, marginBottom: 8 },
  cardBigVal: { color: UI.text, fontSize: 48, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  cardHalf: { flex: 1, backgroundColor: UI.surface, borderRadius: 16, padding: 20 },
  cardVal: { color: UI.text, fontSize: 32, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: UI.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: UI.text, marginBottom: 24 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  menuLabel: { color: UI.textSecondary, fontSize: 18 },
  menuValue: { color: UI.text, fontSize: 18, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', backgroundColor: UI.bg, padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#FF4D4D' },
  logoutBtnText: { color: '#FF4D4D', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { padding: 16, borderRadius: 12, backgroundColor: UI.bg, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: UI.text, fontSize: 18, fontWeight: 'bold' }
});
