content = '''import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Switch, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import api from "@/src/services/api";

export default function AdminDashboardScreen() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(isDark);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.log("Admin fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    setModalVisible(false);
    logout();
    router.replace("/auth/login");
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "A";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.subtitleText}>Manage platform operations and analytics.</Text>
        </View>
        <TouchableOpacity style={styles.profileAvatar} onPress={() => setModalVisible(true)}>
          <Text style={styles.profileAvatarText}>{getInitials(user?.name, user?.email)}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#3b82f6" size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Active Policies</Text>
            <Text style={styles.cardValue}>{stats?.active_policies ?? 0}</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.flexCard]}>
              <Text style={styles.cardTitle}>Total Claims</Text>
              <Text style={styles.cardValue}>{stats?.total_claims ?? 0}</Text>
            </View>
            <View style={[styles.card, styles.flexCard]}>
              <Text style={styles.cardTitle}>Pending Review</Text>
              <Text style={styles.cardValue}>{stats?.pending_claims ?? 0}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>System Status</Text>
            <Text style={[styles.cardValue, { color: "#4ade80", fontSize: 20 }]}>Operational</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.flexCard]}>
              <Text style={styles.cardTitle}>Total Users</Text>
              <Text style={styles.cardValue}>{stats?.total_users ?? 0}</Text>
            </View>
            <View style={[styles.card, styles.flexCard]}>
              <Text style={styles.cardTitle}>Total Policies</Text>
              <Text style={styles.cardValue}>{stats?.total_policies ?? 0}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.flexCard]}>
              <Text style={styles.cardTitle}>Disruptions</Text>
              <Text style={styles.cardValue}>{stats?.total_disruptions ?? 0}</Text>
            </View>
            <View style={[styles.card, styles.flexCard]}>
              <Text style={styles.cardTitle}>Approved Claims</Text>
              <Text style={styles.cardValue}>{stats?.approved_claims ?? 0}</Text>
            </View>
          </View>
        </>
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#a0a0a0" />
              </TouchableOpacity>
            </View>
            <ScrollView bounces={false} style={styles.modalScroll}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Profile Info</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email || "admin@ws.com"}</Text>
                </View>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Settings</Text>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Dark Theme</Text>
                  <Switch trackColor={{ false: "#333333", true: "#3b82f6" }} thumbColor="#ffffff" onValueChange={() => toggleTheme()} value={isDark} />
                </View>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? "#0f0f0f" : "#f5f5f5" },
  contentContainer: { padding: 24, paddingTop: 60 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  headerTextContainer: { flex: 1, marginRight: 16 },
  greeting: { color: isDark ? "#ffffff" : "#000000", fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitleText: { fontSize: 15, color: "#aaa", marginTop: 4 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" },
  profileAvatarText: { color: "#ffffff", fontSize: 20, fontWeight: "bold" },
  card: { backgroundColor: isDark ? "#1c1c1c" : "#ffffff", borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: isDark ? "#333333" : "#e0e0e0" },
  row: { flexDirection: "row", gap: 16, marginBottom: 16 },
  flexCard: { flex: 1, marginBottom: 0 },
  cardTitle: { color: isDark ? "#aaa" : "#555", fontSize: 14, marginBottom: 8 },
  cardValue: { color: isDark ? "#ffffff" : "#000000", fontSize: 32, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1a1a1a", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "85%", paddingTop: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#333333" },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#ffffff" },
  closeButton: { padding: 4 },
  modalScroll: { paddingHorizontal: 24, paddingTop: 20 },
  modalSection: { marginBottom: 32 },
  modalSectionTitle: { fontSize: 18, color: "#3b82f6", fontWeight: "600", marginBottom: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2a2a2a" },
  infoLabel: { color: "#aaa", fontSize: 15 },
  infoValue: { color: "#ffffff", fontSize: 15, fontWeight: "500" },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, backgroundColor: "#262626", borderRadius: 12, paddingHorizontal: 16 },
  settingLabel: { color: "#ffffff", fontSize: 16 },
  logoutButton: { marginTop: 24, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.5)", alignItems: "center", backgroundColor: "rgba(239,68,68,0.1)", flexDirection: "row", justifyContent: "center" },
  logoutButtonText: { color: "#ef4444", fontSize: 16, fontWeight: "bold" },
});
'''
with open('D:/Projects/Guidewire/Phase2/DeliverSure/app/admin/dashboard.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('dashboard.tsx done')
