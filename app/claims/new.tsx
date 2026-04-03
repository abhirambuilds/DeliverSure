import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';

import api from '@/src/services/api';
import { ActivityIndicator, Alert } from 'react-native';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  danger: '#EF4444',
  border: '#E2E8F0',
};

export default function NewClaimScreen() {
  const router = useRouter();
  const [problem, setProblem] = useState('');
  const [amount, setAmount] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleConfirm = async () => {
    setErrorMsg('');
    if (!problem.trim()) { setErrorMsg('Please describe the issue.'); return; }
    if (!amount.trim() || isNaN(Number(amount))) { setErrorMsg('Please enter a valid amount.'); return; }

    setLoading(true);
    try {
      await api.post('/claims/create', {
        title: problem,
        amount: Number(amount),
        reason: "User manual submission"
      });
      Alert.alert("Claim Submitted", "Your claim is now in the database and under review.");
      router.back();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to submit claim. Check active policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color={UI.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>File New Claim</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {errorMsg ? (
          <View style={styles.errorContainer}><Text style={styles.errorText}>{errorMsg}</Text></View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Problem / Reason</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue (e.g. Broken parts)"
            placeholderTextColor="#888888"
            value={problem}
            onChangeText={setProblem}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Estimated Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="500"
            placeholderTextColor="#888888"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.uploadGroup}>
          <Text style={styles.label}>Upload Proof (Optional)</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                <Feather name="x" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Feather name="camera" size={24} color="#2563EB" style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.confirmButton, loading && { opacity: 0.7 }]} onPress={handleConfirm} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>Confirm</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#0F172A',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  uploadGroup: {
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    gap: 16,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
