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
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#A0A0A0',
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noThanksText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: '600',
  },
  turnOnButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  turnOnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
