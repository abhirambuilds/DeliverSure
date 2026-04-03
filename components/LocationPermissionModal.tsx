import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '@/context/AuthContext';
import { BlurView } from 'expo-blur';

export default function LocationPermissionModal() {
  const { hasPromptedLocation, setHasPromptedLocation } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!hasPromptedLocation) {
      setIsVisible(true);
    }
  }, [hasPromptedLocation]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  };

  const handleTurnOn = async () => {
    try {
      const granted = await requestLocationPermission();
      setHasPromptedLocation(true);
      setIsVisible(false);
      if (!granted) {
        Alert.alert("Location is required for coverage features");
      }
    } catch (error) {
      console.log('Error requesting location permission', error);
      setHasPromptedLocation(true);
      setIsVisible(false);
    }
  };

  const handleNoThanks = () => {
    setHasPromptedLocation(true);
    setIsVisible(false);
    Alert.alert("Some features may not work without location");
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleNoThanks}
    >
      <BlurView intensity={20} tint="light" style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Enable Location Accuracy</Text>
          <Text style={styles.description}>
            To continue, your device needs to use location services for better risk detection and coverage activation.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.noThanksButton} 
              onPress={handleNoThanks}
              activeOpacity={0.7}
            >
              <Text style={styles.noThanksText}>No, thanks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.turnOnButton} 
              onPress={handleTurnOn}
              activeOpacity={0.7}
            >
              <Text style={styles.turnOnText}>Turn on</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    maxWidth: 400,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  noThanksButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  noThanksText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  turnOnButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  turnOnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
