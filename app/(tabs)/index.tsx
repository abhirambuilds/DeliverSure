import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Modal, Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useThemeContext } from "@/context/ThemeContext";
import { t, LANGUAGES } from "@/utils/translations";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { supabase } from "@/src/lib/supabase";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  danger: '#EF4444',
  warning: '#F59E0B',
  border: '#E2E8F0',
};

export default function HomeScreen() {
  const { user, logout, language, changeLanguage, isRideActive, setIsRideActive } = useAuth();
  const { toggleTheme } = useThemeContext();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [rideTime, setRideTime] = useState(0);
  const [rideDistance, setRideDistance] = useState(0);
  const [weatherStatus, setWeatherStatus] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [autoClaimStatus, setAutoClaimStatus] = useState(false);
  const [payoutState, setPayoutState] = useState<'pending' | 'approved' | 'paid'>('pending');
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [dashboardData, setDashboardData] = useState({ active: false, premium: 0, protected: 1000, claimsCount: 0 });

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const [policyRes, claimsRes] = await Promise.all([
          supabase.from('coverage_policies').select('*').eq('user_id', user.id).eq('policy_status', 'active').single(),
          supabase.from('claims').select('id').eq('user_id', user.id),
        ]);
        setDashboardData({
          active: !!policyRes.data,
          premium: policyRes.data?.weekly_premium || 0,
          protected: policyRes.data?.coverage_amount || 1000,
          claimsCount: claimsRes.data?.length || 0,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRideActive) {
      interval = setInterval(() => {
        setRideTime(prev => prev + 1);
        setRideDistance(prev => prev + 0.015);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRideActive]);

  const handleStartRide = async () => {
    if (user?.role === 'admin') {
      Alert.alert("Admin Mode", "Admins cannot start delivery rides.");
      return;
    }
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert("Location Required", "Please enable location to track your delivery.");
          return;
        }
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsRideActive(true);
      setRideTime(0);
      setRideDistance(0);
      setWeatherLoading(true);
      setWeatherStatus(null);
      setAutoClaimStatus(false);

      const loc = await Location.getCurrentPositionAsync({});

      // Call Supabase Edge Function for delivery start
      const { data, error } = await supabase.functions.invoke('start-delivery', {
        body: {
          user_id: user?.id,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        },
      });

      if (error) throw error;

      setWeatherStatus(data.weather);

      if (data.claim_created && data.claim?.id) {
        setAutoClaimStatus(true);
        setPayoutState('pending');
        setPayoutAmount(data.payout || 500);

        // Listen to real-time claim status updates from Supabase
        supabase
          .channel(`claim-${data.claim.id}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'claims', filter: `id=eq.${data.claim.id}` },
            (payload) => {
              const newStatus = payload.new.claim_status;
              if (newStatus === 'approved' || newStatus === 'paid') {
                setPayoutState(newStatus);
              }
            }
          )
          .subscribe();
      }
    } catch (e: any) {
      console.error('Delivery Error', e);
      setWeatherStatus({ rain_status: false, zone: 'Unknown' });
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleEndRide = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRideActive(false);
  };

  const handleLogout = async () => {
    setModalVisible(false);
    await logout();
    router.replace('/auth/login');
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{t(language, 'welcome')}</Text>
            <Text style={styles.subtitleText}>Stay safe on the road.</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileAvatar, isRideActive && styles.disabledOpacity]}
            onPress={() => setModalVisible(true)}
            disabled={isRideActive}
          >
            <Text style={styles.profileAvatarText}>{getInitials(user?.name, user?.email)}</Text>
          </TouchableOpacity>
        </View>

        {/* Ride Status Card */}
        <View style={styles.mainCard}>
          {!isRideActive ? (
            <TouchableOpacity
              style={[styles.rideButton, styles.rideButtonPrimary, { height: 64, width: '100%', borderRadius: 16 }]}
              onPress={handleStartRide}
            >
              <Text style={[styles.rideButtonText, { color: UI.bg, fontSize: 22 }]}>Start Delivery 🚴</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.mainCardHeader}>
                <Feather name="activity" size={24} color={UI.primary} />
                <Text style={styles.mainCardTitle}>Delivery in Progress</Text>
              </View>

              <View style={{ marginBottom: 20, gap: 12, backgroundColor: UI.bg, padding: 16, borderRadius: 12 }}>
                <Text style={{ color: UI.text, fontSize: 16, fontWeight: 'bold' }}>🟢 Delivery Started</Text>
                <Text style={{ color: UI.text, fontSize: 16, fontWeight: 'bold' }}>📍 Tracking your route</Text>

                {weatherLoading ? (
                  <Text style={{ color: UI.text, fontSize: 16, fontWeight: 'bold' }}>🌦 Checking weather conditions...</Text>
                ) : weatherStatus && (
                  weatherStatus.rain_status ? (
                    <View style={{ marginTop: 8, padding: 12, backgroundColor: UI.surface, borderRadius: 8, borderWidth: 1, borderColor: UI.danger, gap: 4 }}>
                      <Text style={{ color: UI.danger, fontSize: 16, fontWeight: 'bold' }}>🌧 Heavy Rain Detected</Text>
                      <Text style={{ color: UI.warning, fontSize: 16, fontWeight: 'bold' }}>⚠️ Income at risk</Text>
                      <Text style={{ color: UI.primary, fontSize: 16, fontWeight: 'bold' }}>🛡 Protection active</Text>
                      {autoClaimStatus && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: UI.border, gap: 4 }}>
                          <Text style={{ color: UI.text, fontSize: 16, fontWeight: 'bold' }}>📄 Claim Created</Text>
                          {payoutState === 'pending' && <Text style={{ color: UI.warning, fontSize: 16, fontWeight: 'bold' }}>⏳ Processing...</Text>}
                          {payoutState === 'approved' && <Text style={{ color: '#2563EB', fontSize: 16, fontWeight: 'bold' }}>💰 Approving ₹{payoutAmount}...</Text>}
                          {payoutState === 'paid' && (
                            <>
                              <Text style={{ color: UI.primary, fontSize: 16, fontWeight: 'bold' }}>💰 ₹{payoutAmount} credited</Text>
                              <Text style={{ color: UI.primary, fontSize: 16, fontWeight: 'bold' }}>✅ Payment Successful</Text>
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={{ marginTop: 8, padding: 12, backgroundColor: UI.surface, borderRadius: 8, borderWidth: 1, borderColor: UI.primary, gap: 4 }}>
                      <Text style={{ color: UI.warning, fontSize: 16, fontWeight: 'bold' }}>☀️ No disruption</Text>
                      <Text style={{ color: UI.text, fontSize: 16, fontWeight: 'bold' }}>Continue working</Text>
                    </View>
                  )
                )}
              </View>

              <TouchableOpacity style={[styles.rideButton, styles.rideButtonDanger]} onPress={handleEndRide}>
                <Text style={[styles.rideButtonText, { color: UI.text }]}>End Delivery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dashboard Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <Text style={styles.gridCardTitle}>Coverage</Text>
            <View style={styles.gridCardValueRow}>
              <Text style={styles.gridCardEmoji}>🛡</Text>
              <Text style={[styles.gridCardValue, dashboardData.active ? { color: UI.primary } : { color: UI.warning }]}>
                {dashboardData.active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridCardTitle}>Premium</Text>
            <View style={styles.gridCardValueRow}>
              <Text style={styles.gridCardEmoji}>💰</Text>
              <Text style={styles.gridCardValue}>₹{dashboardData.premium}</Text>
            </View>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridCardTitle}>Protected</Text>
            <View style={styles.gridCardValueRow}>
              <Text style={styles.gridCardEmoji}>💵</Text>
              <Text style={styles.gridCardValue}>₹{dashboardData.protected}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.gridCard} onPress={() => router.push('/claims')}>
            <Text style={styles.gridCardTitle}>Claims</Text>
            <View style={styles.gridCardValueRow}>
              <Text style={styles.gridCardEmoji}>📄</Text>
              <Text style={styles.gridCardValue}>{dashboardData.claimsCount} list</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* STICKY CTA */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            router.navigate('/(tabs)/coverage');
            setTimeout(() => { router.push('/coverage/select'); }, 100);
          }}
        >
          <Feather name="shield" size={24} color={UI.bg} style={{ marginRight: 12 }} />
          <Text style={styles.ctaText}>Start Protection</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={32} color={UI.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView bounces={false} style={styles.modalScroll}>
              <View style={styles.modalCard}>
                <View style={styles.modalRow}><Text style={styles.modalLabel}>Name</Text><Text style={styles.modalValue}>{user?.name || "Not set"}</Text></View>
                <View style={styles.modalRow}><Text style={styles.modalLabel}>Email</Text><Text style={styles.modalValue}>{user?.email}</Text></View>
              </View>
              <Text style={styles.sectionTitle}>Language</Text>
              <View style={styles.modalCard}>
                {LANGUAGES.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.langRow} onPress={() => changeLanguage(item.id)}>
                    <Text style={[styles.langText, language === item.id && { color: UI.primary, fontWeight: 'bold' }]}>{item.label}</Text>
                    {language === item.id && <Feather name="check" size={24} color={UI.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={20} color={UI.danger} style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTextContainer: { flex: 1 },
  greeting: { color: UI.text, fontSize: 28, fontWeight: 'bold' },
  subtitleText: { fontSize: 16, color: UI.textSecondary, marginTop: 4 },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: UI.surface, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  profileAvatarText: { color: UI.text, fontSize: 20, fontWeight: 'bold' },
  disabledOpacity: { opacity: 0.5 },
  mainCard: { backgroundColor: UI.surface, borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  mainCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  mainCardTitle: { color: UI.text, fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  rideButton: { height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rideButtonPrimary: { backgroundColor: UI.primary },
  rideButtonDanger: { backgroundColor: UI.danger },
  rideButtonText: { fontSize: 18, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, justifyContent: 'space-between' },
  gridCard: { width: '48%', backgroundColor: UI.surface, padding: 16, borderRadius: 14, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  gridCardTitle: { color: UI.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  gridCardValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gridCardEmoji: { fontSize: 24 },
  gridCardValue: { color: UI.text, fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { color: UI.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: 'rgba(248, 250, 252, 0.9)' },
  ctaButton: { backgroundColor: UI.primary, height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  ctaText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', paddingTop: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: UI.text },
  modalScroll: { padding: 24 },
  modalCard: { backgroundColor: UI.bg, borderRadius: 14, padding: 16, marginBottom: 24 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: UI.border },
  modalLabel: { color: UI.textSecondary, fontSize: 16 },
  modalValue: { color: UI.text, fontSize: 16, fontWeight: 'bold' },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: UI.border },
  langText: { color: UI.text, fontSize: 17, fontWeight: '500' },
  logoutButton: { marginTop: 12, height: 56, borderRadius: 12, backgroundColor: '#FEF2F2', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  logoutText: { color: UI.danger, fontSize: 17, fontWeight: 'bold' },
});
