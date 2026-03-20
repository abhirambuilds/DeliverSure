import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Modal, Switch, LayoutAnimation, Platform, UIManager } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";
import { useThemeContext, ThemeColors } from "@/context/ThemeContext";
import { t, LANGUAGES, Language } from "@/utils/translations";
import { useRouter, useNavigation } from "expo-router";
import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { Alert } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { user, logout, language, changeLanguage, isRideActive, setIsRideActive, hasPromptedLocation } = useAuth();
  const [locationGranted, setLocationGranted] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
    })();
  }, [hasPromptedLocation]);

  const handleEnableLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setLocationGranted(true);
    } else {
      Alert.alert("Location Required", "Location is required for coverage features");
    }
  };
  const { theme, colors, toggleTheme, isDark } = useThemeContext();
  const router = useRouter();
  const navigation = useNavigation();
  const styles = createStyles(colors);
  
  const [modalVisible, setModalVisible] = useState(false);

  const [rideTime, setRideTime] = useState(0);
  const [rideDistance, setRideDistance] = useState(0);

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

  const handleStartRide = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRideActive(true);
    setRideTime(0);
    setRideDistance(0);
  };

  const handleEndRide = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRideActive(false);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLogout = () => {
    setModalVisible(false);
    logout();
    router.replace('/auth/login');
  };

  // Helper for avatar initials
  const getInitials = (name?: string, email?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <ThemedText type="title" style={styles.greeting}>{t(language, 'welcome')}</ThemedText>
          <ThemedText style={styles.subtitleText}>{t(language, 'subtitle')}</ThemedText>
        </View>
        <TouchableOpacity 
          style={[styles.profileAvatar, isRideActive && styles.disabledButton]} 
          onPress={() => setModalVisible(true)}
          disabled={isRideActive}
        >
          <Text style={styles.profileAvatarText}>{getInitials(user?.name, user?.email)}</Text>
        </TouchableOpacity>
      </View>

      {!locationGranted && (
        <View style={styles.locationBanner}>
          <View style={styles.locationBannerLeft}>
            <Feather name="map-pin" size={20} color="#ef4444" />
            <Text style={styles.locationBannerText}>Location is OFF</Text>
          </View>
          <TouchableOpacity style={styles.enableNowButton} onPress={handleEnableLocation}>
            <Text style={styles.enableNowButtonText}>Enable Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.activateButton, isRideActive && styles.disabledButton]}
        disabled={isRideActive}
        onPress={() => {
          router.navigate('/(tabs)/coverage');
          setTimeout(() => {
            router.push('/coverage/select');
          }, 100);
        }}
      >
        <Text style={styles.activateButtonText}>{t(language, 'activateCoverage')}</Text>
      </TouchableOpacity>

      {/* Ride Controls */}
      <View style={styles.rideButtonsContainer}>
        <TouchableOpacity 
          style={[styles.rideButton, isRideActive && styles.rideButtonActive]} 
          onPress={handleStartRide}
          disabled={isRideActive}
        >
          <Text style={styles.rideButtonText}>Start Ride</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.rideButton, !isRideActive && styles.rideButtonDisabled, { backgroundColor: '#ef4444' }]} 
          onPress={handleEndRide}
          disabled={!isRideActive}
        >
          <Text style={styles.rideButtonText}>End Ride</Text>
        </TouchableOpacity>
      </View>

      {/* Ride Stats Dropdown */}
      {isRideActive && (
        <View style={styles.rideStatsCard}>
          <View style={styles.rideStatsRow}>
            <Feather name="map-pin" size={24} color="#3b82f6" style={styles.rideIcon} />
            <Text style={styles.rideStatsText}>Distance Covered: {rideDistance.toFixed(2)} km</Text>
          </View>
          <View style={styles.rideStatsRow}>
            <Feather name="clock" size={24} color="#f59e0b" style={styles.rideIcon} />
            <Text style={styles.rideStatsText}>Time: {formatTime(rideTime)}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t(language, 'riskAlerts')}</ThemedText>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.alertIndicator, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.cardTitle}>High Wind Warning</Text>
          </View>
          <Text style={styles.cardDescription}>
            Severe winds expected in your area tomorrow. Ensure property is secured.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.alertIndicator, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.cardTitle}>Heavy Rain Advisory</Text>
          </View>
          <Text style={styles.cardDescription}>
            Moderate to heavy rainfall expected over the weekend.
          </Text>
        </View>

      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t(language, 'quickStats')}</ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>{t(language, 'activeClaims')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>{t(language, 'drafts')}</Text>
          </View>
        </View>
      </View>

      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile & Settings</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#a0a0a0" />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false} style={styles.modalScroll}>
              
              {/* Profile Info Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Profile Info</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{user?.name || "Not set"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user?.phone || "Not set"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>DOB</Text>
                  <Text style={styles.infoValue}>{user?.dob || "Not set"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{user?.gender || "Not set"}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.editProfileButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/profile/edit');
                  }}
                >
                  <Feather name="edit-2" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>

              {/* Language Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Language</Text>
                <View style={{ gap: 4 }}>
                  {LANGUAGES.map((item) => {
                    const isSelected = language === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.langRow, isSelected && styles.langRowSelected]}
                        onPress={() => changeLanguage(item.id)}
                      >
                        <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                          {item.label}
                        </Text>
                        {isSelected && <Feather name="check" size={20} color="#3b82f6" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Settings Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Settings</Text>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Dark Theme</Text>
                  <Switch
                    trackColor={{ false: '#e5e5ea', true: colors.primary }}
                    thumbColor={isDark ? '#ffffff' : '#ffffff'}
                    ios_backgroundColor="#e5e5ea"
                    onValueChange={toggleTheme}
                    value={isDark}
                  />
                </View>
              </View>

              {/* Logout inside Modal */}
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  locationBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationBannerText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enableNowButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableNowButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  rideButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  rideButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  rideButtonActive: {
    backgroundColor: '#1E40AF',
    opacity: 0.5,
  },
  rideButtonDisabled: {
    opacity: 0.5,
  },
  rideButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rideStatsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rideStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideIcon: {
    marginRight: 12,
    width: 28,
  },
  rideStatsText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  activateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 16,
    fontSize: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 15,
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  editProfileButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  editProfileButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 16,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  langRowSelected: {
    backgroundColor: colors.cardIconBgSelected,
  },
  langText: {
    color: colors.text,
    fontSize: 16,
  },
  langTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
