import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Modal, Alert, LayoutAnimation, Platform, UIManager, Animated, Easing, ActivityIndicator, TextInput } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useThemeContext } from "@/context/ThemeContext";
import { t, LANGUAGES } from "@/utils/translations";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Feather } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { supabase } from "@/src/lib/supabase";
import AppHeader from "@/components/AppHeader";

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
  const { 
    user, logout, language, changeLanguage, isRideActive, setIsRideActive,
    deliveryCount, setDeliveryCount, cumulativeDistance, setCumulativeDistance,
    payoutModalVisible, setPayoutModalVisible, hasPromptedLocation, setHasPromptedLocation, refreshUser
  } = useAuth();
  const [bikeAnim] = useState(new Animated.Value(0));
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
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [dashboardData, setDashboardData] = useState({ active: false, premium: 0, protected: 1000, claimsCount: 0 });
  const [claimAnim] = useState(new Animated.Value(0));
  const [moneyAnims] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      const fetchData = async () => {
        try {
          const [policyRes, claimsRes] = await Promise.all([
            supabase.from('coverage_policies').select('*').eq('user_id', user.id).eq('policy_status', 'active'),
            supabase.from('claims').select('*').eq('user_id', user.id),
          ]);
          
          const policies = policyRes.data || [];
          const totalPremium = policies.reduce((acc, p) => acc + (p.weekly_premium || 0), 0);
          const totalProtected = policies.reduce((acc, p) => acc + (p.coverage_amount || 1000), 0);
          
          const claims = claimsRes.data || [];
          const earnings = claims.filter(c => c.claim_status === 'paid').reduce((acc, c) => acc + (c.payout_amount || 0), 0);
          setTotalEarnings(earnings);

          setDashboardData({
            active: policies.length > 0,
            premium: totalPremium,
            protected: totalProtected,
            claimsCount: claims.length,
          });
        } catch (err) {
          console.error("Dashboard fetch error:", err);
        }
      };
      fetchData();
    }, [user?.id])
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRideActive) {
      interval = setInterval(() => {
        setRideTime(prev => prev + 1);
        const delta = 0.042;
        setRideDistance(prev => prev + delta);
        setCumulativeDistance(prev => (prev || 0) + delta);
      }, 1000);
      
      // Animate bike
      Animated.loop(
        Animated.sequence([
          Animated.timing(bikeAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(bikeAnim, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      ).start();
    } else {
      bikeAnim.stopAnimation();
    }
    return () => clearInterval(interval);
  }, [isRideActive]);

  const handleStartRide = async () => {
    if (!user) return;
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
      const newCount = deliveryCount + 1;
      setDeliveryCount(newCount);
      setRideTime(0);
      setWeatherLoading(true);
      setWeatherStatus(null);
      setAutoClaimStatus(false);

      const loc = await Location.getCurrentPositionAsync({});

      const hasRainCover = user?.activeCoverages?.some(c => c.name === 'Rain Protection');
      const hasHeatCover = user?.activeCoverages?.some(c => c.name === 'Heat Protection');

      let forceTrigger = null;
      if (newCount === 3 && hasRainCover) forceTrigger = 'rain';
      if (newCount === 5 && hasHeatCover) forceTrigger = 'heat';

      let functionData = null;
      try {
        const { data, error } = await supabase.functions.invoke('start-delivery', {
          body: {
            user_id: user?.id,
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            trigger_scenario: forceTrigger
          },
        });
        if (error) throw error;
        functionData = data;
      } catch (e) {
        console.log("Function error:", e);
        throw e;
      }

      setWeatherStatus(functionData.weather);

      if (functionData.claim_created && functionData.claim?.id) {
        setAutoClaimStatus(true);
        setPayoutAmount(functionData.payout || 500);
        setPayoutState(functionData.claim.claim_status || 'pending');
        
        // Immediate sync to avoid re-login requirement
        await refreshUser();

        // Trigger WOW animations
        Animated.parallel([
          Animated.spring(claimAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
          ...moneyAnims.map((anim, i) => 
            Animated.sequence([
              Animated.delay(i * 300),
              Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true })
            ])
          )
        ]).start();

        supabase
          .channel(`claim-${functionData.claim.id}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'claims', filter: `id=eq.${functionData.claim.id}` },
            (payload) => {
              const newStatus = payload.new.claim_status;
              if (newStatus === 'approved' || newStatus === 'paid') {
                setPayoutState(newStatus);
                if (newStatus === 'paid') setPayoutModalVisible(true);
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

  const handleLogout = async () => {
    setModalVisible(false);
    await logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => setModalVisible(true)} />
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* Ride Status Card */}
        <View style={styles.mainCard}>
          {!isRideActive ? (
            <TouchableOpacity
              style={[styles.rideButton, styles.rideButtonPrimary, { height: 72, width: '100%', borderRadius: 18, elevation: 8, shadowColor: UI.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }]}
              onPress={handleStartRide}
            >
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Feather name="play" size={20} color={UI.bg} />
              </View>
              <Text style={[styles.rideButtonText, { color: UI.bg, fontSize: 22 }]}>Start Delivery</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeRideContainer}>
              <View style={[styles.activeRideCard, { borderLeftWidth: 6, borderLeftColor: weatherStatus?.rain_status ? UI.danger : UI.primary }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={styles.activeRideLabel}>CURRENT DELIVERY #{deliveryCount}</Text>
                      {autoClaimStatus && (
                         <Animated.View style={{ 
                           backgroundColor: '#DCFCE7', 
                           paddingHorizontal: 10, 
                           paddingVertical: 4, 
                           borderRadius: 6, 
                           marginLeft: 12,
                           transform: [{ scale: claimAnim }],
                           borderWidth: 1,
                           borderColor: UI.primary
                         }}>
                           <Text style={{ fontSize: 11, color: UI.primary, fontWeight: '900' }}>💰 CLAIM TRIGGERED +₹{payoutAmount}</Text>
                         </Animated.View>
                      )}
                    </View>
                    <Text style={styles.activeRideTime}>{Math.floor(rideTime / 60)}m {rideTime % 60}s</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.activeRideLabel}>DISTANCE</Text>
                    <Text style={styles.activeRideDistance}>{rideDistance.toFixed(2)} km</Text>
                  </View>
                </View>

                <View style={[styles.animationTrack, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]}>
                    <Animated.View style={[
                      styles.bikeContainer,
                      {
                        transform: [
                          {
                            translateX: bikeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-30, 290]
                            })
                          },
                          {
                            translateY: bikeAnim.interpolate({
                              inputRange: [0, 0.25, 0.5, 0.75, 1],
                              outputRange: [0, -3, 0, -3, 0]
                            })
                          },
                          {
                            rotate: bikeAnim.interpolate({
                              inputRange: [0, 0.25, 0.5, 0.75, 1],
                              outputRange: ['0deg', '4deg', '0deg', '-4deg', '0deg']
                            })
                          }
                        ]
                      }
                    ]}>
                      <View style={{ alignItems: 'center' }}>
                        {/* Floating Money Icons */}
                        {moneyAnims.map((anim, i) => (
                          <Animated.Text
                            key={i}
                            style={{
                              position: 'absolute',
                              top: -20,
                              fontSize: 24,
                              fontWeight: 'bold',
                              color: '#16A34A',
                              opacity: anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
                              transform: [
                                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) },
                                { translateX: (i - 1) * 20 },
                                { scale: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.5, 1] }) }
                              ]
                            }}
                          >
                            ₹
                          </Animated.Text>
                        ))}
                        
                        <Feather name="truck" size={32} color={UI.primary} />
                        {weatherStatus?.rain_status && (
                           <Feather name="shield" size={16} color={UI.primary} style={{ position: 'absolute', top: -12 }} />
                        )}
                      </View>
                    </Animated.View>
                  <View style={styles.roadLine} />
                  {/* Rain drops simulation if raining */}
                  {weatherStatus?.rain_status && [1,2,3,4,5].map(i => (
                    <View key={i} style={{ position: 'absolute', top: 5, left: (i*50), width: 2, height: 8, backgroundColor: '#60A5FA', borderRadius: 1, opacity: 0.4 }} />
                  ))}
                </View>
                
                {weatherLoading ? (
                   <View style={{ alignItems: 'center', marginVertical: 14 }}>
                     <ActivityIndicator color={UI.primary} />
                     <Text style={{ fontSize: 12, color: UI.textSecondary, marginTop: 4 }}>Scanning Local Atmosphere...</Text>
                   </View>
                ) : weatherStatus && (
                    <View style={[styles.weatherBadge, { backgroundColor: weatherStatus.rain_status ? '#FEF2F2' : '#F0FDF4', borderRadius: 12, borderWidth: 1, borderColor: weatherStatus.rain_status ? '#FEE2E2' : '#DCFCE7' }]}>
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: weatherStatus.rain_status ? '#FECACA' : '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                        <Feather name={weatherStatus.rain_status ? "cloud-rain" : "sun"} size={24} color={weatherStatus.rain_status ? UI.danger : UI.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.weatherText, { color: weatherStatus.rain_status ? UI.danger : UI.primary, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }]}>
                          Live View • {weatherStatus.city || 'Delhi NCR'}
                        </Text>
                        <Text style={{ fontWeight: '800', fontSize: 18, color: UI.text }}>
                          {weatherStatus.condition} • {weatherStatus.temp}°C
                        </Text>
                      </View>
                      {weatherStatus.rain_status && (
                        <View style={{ backgroundColor: UI.danger, width: 8, height: 8, borderRadius: 4, marginRight: 8 }} />
                      )}
                    </View>
                )}

                <TouchableOpacity style={[styles.stopRideButton, { marginTop: 8 }]} onPress={() => setIsRideActive(false)}>
                  <Feather name="square" size={14} color={UI.danger} style={{ marginRight: 8 }} />
                  <Text style={styles.stopRideButtonText}>Stop Delivery</Text>
                </TouchableOpacity>
              </View>
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
            <Text style={styles.gridCardTitle}>Wallet Balance</Text>
            <View style={styles.gridCardValueRow}>
              <Text style={styles.gridCardEmoji}>💰</Text>
              <Text style={styles.gridCardValue}>₹{totalEarnings}</Text>
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
            <Text style={styles.gridCardTitle}>Total Claims</Text>
            <View style={styles.gridCardValueRow}>
              <Text style={styles.gridCardEmoji}>📄</Text>
              <Text style={styles.gridCardValue}>{dashboardData.claimsCount} saved</Text>
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

      {/* Payout Modal */}
      <Modal animationType="fade" transparent={true} visible={payoutModalVisible} onRequestClose={() => setPayoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: 'auto', paddingBottom: 40 }]}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Feather name="check-circle" size={48} color={UI.primary} />
              </View>
              <Text style={{ fontSize: 28, fontWeight: '800', color: UI.text }}>Payout Confirmed!</Text>
              <Text style={{ fontSize: 18, color: UI.textSecondary, textAlign: 'center', marginTop: 8 }}>
                Heavy rain detected in your zone. Income loss protection triggered.
              </Text>
            </View>
            
            <View style={{ backgroundColor: UI.bg, borderRadius: 16, padding: 24, marginBottom: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: UI.textSecondary, fontWeight: '600' }}>AMOUNT CREDITED</Text>
              <Text style={{ fontSize: 48, fontWeight: '900', color: UI.text, marginTop: 4 }}>₹{payoutAmount}</Text>
            </View>

            <TouchableOpacity style={styles.ctaButton} onPress={() => setPayoutModalVisible(false)}>
              <Text style={styles.ctaText}>Great!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal animationType="slide" transparent={true} visible={withdrawModal} onRequestClose={() => setWithdrawModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Earnings</Text>
              <TouchableOpacity onPress={() => setWithdrawModal(false)}><Feather name="x" size={24} color={UI.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {!withdrawProcessing && !withdrawSuccess ? (
                <>
                  <View style={{ backgroundColor: '#F0F9FF', padding: 20, borderRadius: 16, marginBottom: 24 }}>
                    <Text style={{ fontSize: 14, color: '#0369A1', fontWeight: 'bold' }}>AVAILABLE FOR WITHDRAWAL</Text>
                    <Text style={{ fontSize: 36, fontWeight: '900', color: '#0369A1', marginTop: 4 }}>₹{totalEarnings}</Text>
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Bank Name</Text>
                    <TextInput style={styles.input} placeholder="e.g. HDFC Bank" placeholderTextColor="#94A3B8" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Account Number</Text>
                    <TextInput style={styles.input} placeholder="XXXX XXXX XXXX XXXX" placeholderTextColor="#94A3B8" keyboardType="numeric" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>IFSC Code</Text>
                    <TextInput style={styles.input} placeholder="HDFC0001234" placeholderTextColor="#94A3B8" autoCapitalize="characters" />
                  </View>

                  <TouchableOpacity 
                    style={[styles.ctaButton, { marginTop: 24 }]} 
                    onPress={() => {
                      setWithdrawProcessing(true);
                      setTimeout(() => {
                        setWithdrawProcessing(false);
                        setWithdrawSuccess(true);
                      }, 2500);
                    }}
                  >
                    <Text style={styles.ctaText}>Confirm Transfer</Text>
                  </TouchableOpacity>
                </>
              ) : withdrawProcessing ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 400 }}>
                  <ActivityIndicator size="large" color={UI.primary} />
                  <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 24, color: UI.text }}>Processing Transfer...</Text>
                  <Text style={{ color: UI.textSecondary, marginTop: 8 }}>Verifying bank details with the node</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 400 }}>
                  <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="check" size={60} color={UI.primary} />
                  </View>
                  <Text style={{ fontSize: 26, fontWeight: '900', marginTop: 24, color: UI.text }}>Money Deposited!</Text>
                  <Text style={{ color: UI.textSecondary, marginTop: 12, textAlign: 'center', paddingHorizontal: 40 }}>
                    ₹{totalEarnings} has been successfully credited to your bank account.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.ctaButton, { marginTop: 40, width: '80%' }]} 
                    onPress={() => {
                      setWithdrawModal(false);
                      setWithdrawSuccess(false);
                    }}
                  >
                    <Text style={styles.ctaText}>Go Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.sectionTitle}>Settings & Data</Text>
              <View style={styles.modalCard}>
                <TouchableOpacity 
                  style={[styles.langRow, { borderBottomWidth: 0 }]} 
                  onPress={() => {
                    Alert.alert(
                      "Nuclear Reset", 
                      "WARNING: This will permanently delete ALL your Policies, Claims, and History from the cloud database. Are you ABSOLUTELY sure?", 
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "YES, PURGE EVERYTHING", style: "destructive", onPress: async () => {
                           try {
                             if (!user?.id) return;
                             
                             // 1. Clear Claims
                             await supabase.from('claims').delete().eq('user_id', user.id);
                             
                             // 2. Clear Coverage Policies
                             await supabase.from('coverage_policies').delete().eq('user_id', user.id);
                             
                             // 3. Clear Activity Logs
                             await supabase.from('activity_logs').delete().eq('user_id', user.id);

                             // 4. Clear Disruption Events (Safety Alerts)
                             // Since disruption_events don't have user_id, we clear all of them for this demo environment
                             await supabase.from('disruption_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

                             // 5. Clear Local Stats
                             setDeliveryCount(0);
                             setCumulativeDistance(0);
                             
                             // 6. Refresh app state
                             await refreshUser();
                             setModalVisible(false);
                             Alert.alert("Success", "All cloud data, claims, and safety alerts have been purged.");
                           } catch (err) {
                             Alert.alert("Error", "Purge failed. Check connection.");
                           }
                        }}
                      ]
                    );
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Feather name="zap" size={18} color={UI.danger} />
                    </View>
                    <Text style={[styles.langText, { color: UI.danger }]}>Purge Remote DB Data</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={UI.danger} style={{ opacity: 0.5 }} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Feather name="log-out" size={20} color={UI.danger} style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Log Out Account</Text>
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
  contentContainer: { padding: 20, paddingTop: 20, paddingBottom: 100 },
  mainCard: { backgroundColor: UI.surface, borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
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
  activeRideContainer: { marginBottom: 24 },
  activeRideCard: { backgroundColor: UI.surface, borderRadius: 14, padding: 20, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  activeRideLabel: { color: UI.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  activeRideTime: { color: UI.text, fontSize: 24, fontWeight: 'bold' },
  activeRideDistance: { color: UI.text, fontSize: 24, fontWeight: 'bold' },
  animationTrack: { height: 60, backgroundColor: '#F1F5F9', borderRadius: 12, marginVertical: 16, justifyContent: 'center', overflow: 'hidden', paddingHorizontal: 10 },
  bikeContainer: { position: 'relative', width: 40 },
  bikeShadow: { width: 20, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, marginTop: 2, marginLeft: 2 },
  roadLine: { position: 'absolute', bottom: 15, left: 10, right: 10, height: 1, backgroundColor: '#CBD5E1', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  weatherBadge: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, marginBottom: 16 },
  weatherText: { marginLeft: 8, fontWeight: '600', fontSize: 14 },
  stopRideButton: { backgroundColor: '#FEF2F2', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' },
  stopRideButtonText: { color: UI.danger, fontSize: 16, fontWeight: 'bold' },
  formGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: UI.textSecondary, marginBottom: 8 },
  input: { backgroundColor: UI.bg, height: 52, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: UI.text, borderWidth: 1, borderColor: UI.border },
});
