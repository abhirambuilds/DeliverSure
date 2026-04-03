import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
};

export default function NewClaimScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
    if (!user?.id) { setErrorMsg('User not authenticated.'); return; }
    if (!problem.trim()) { setErrorMsg('Please describe the issue.'); return; }
    if (!amount.trim() || isNaN(Number(amount))) { setErrorMsg('Please enter a valid amount.'); return; }

    setLoading(true);
    try {
      // 1. Fetch active policy id (optional but good)
      const { data: policy } = await supabase
        .from('coverage_policies')
        .select('id')
        .eq('user_id', user.id)
        .eq('policy_status', 'active')
        .maybeSingle();
      
      if (!policy) {
        // Fallback or explicit check if needed, already handled by policy?.id downstream
      }

      // 2. Insert claim
      const { error } = await supabase.from('claims').insert({
        user_id: user.id,
        policy_id: policy?.id || null,
        claim_type: problem,
        payout_amount: Number(amount),
        reason: "User manual submission",
        claim_status: 'pending'
      });

      if (error) throw error;

      Alert.alert("Claim Submitted", "Your claim is now in the database and under review.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit claim. Check active policy.");
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
        <Text style={styles.headerTitle}>New Claim</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>What happened?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the disruption (e.g. Sudden flood at work zone)"
            placeholderTextColor={UI.textSecondary}
            multiline
            numberOfLines={4}
            value={problem}
            onChangeText={setProblem}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Claim Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500"
            placeholderTextColor={UI.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Proof Evidence (Optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="camera" size={32} color={UI.textSecondary} />
                <Text style={styles.imageText}>Tap to upload photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={[styles.confirmBtn, loading && { opacity: 0.7 }]} onPress={handleConfirm} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmBtnText}>Submit Claim</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: UI.surface },
  backButton: { padding: 4 },
  headerTitle: { color: UI.text, fontSize: 22, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  inputContainer: { marginBottom: 24 },
  label: { color: UI.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: UI.surface, borderRadius: 12, padding: 16, fontSize: 16, color: UI.text, borderWidth: 1, borderColor: UI.border },
  textArea: { height: 120, textAlignVertical: 'top' },
  imagePicker: { height: 200, backgroundColor: UI.surface, borderRadius: 12, borderWidth: 1, borderColor: UI.border, borderStyle: 'dashed', overflow: 'hidden' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageText: { color: UI.textSecondary, marginTop: 8, fontSize: 14 },
  selectedImage: { width: '100%', height: '100%' },
  errorText: { color: UI.danger, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  confirmBtn: { backgroundColor: UI.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
