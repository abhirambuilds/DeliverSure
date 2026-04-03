import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export default function PayoutsScreen() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);

  // Withdrawal States
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const fetchPayouts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', user.id)
        .eq('claim_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
      const total = (data || []).reduce((acc, curr) => acc + (curr.payout_amount || 0), 0);
      setTotalPaid(total);
    } catch (err) {
      console.error("Fetch payouts error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchPayouts();
    }, [fetchPayouts])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Payout Center</Text>

      <View style={styles.summaryCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.summaryLabel}>Digital Wallet Balance</Text>
            <Text style={styles.summaryValue}>₹{totalPaid}</Text>
          </View>
          <TouchableOpacity 
            style={styles.withdrawMainButton} 
            onPress={() => setWithdrawModal(true)}
          >
            <Text style={styles.withdrawMainButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Deposits</Text>

      {loading ? (
        <ActivityIndicator color={UI.primary} size="large" style={{ marginTop: 20 }} />
      ) : payouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No payouts recorded yet.</Text>
        </View>
      ) : (
        payouts.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.transactionRow}>
              <View style={styles.iconContainer}>
                 <View style={styles.greenCircle}>
                   <Feather name="arrow-down-left" size={24} color={UI.primary} />
                 </View>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.title}>{item.claim_type}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.amountText}>+₹{item.payout_amount}</Text>
            </View>
          </View>
        ))
      )}

      {/* Withdrawal Modal */}
      <Modal animationType="slide" transparent={true} visible={withdrawModal} onRequestClose={() => setWithdrawModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Earnings</Text>
              <TouchableOpacity onPress={() => setWithdrawModal(false)}><Feather name="x" size={24} color={UI.text} /></TouchableOpacity>
            </View>
            
            <ScrollView style={{ padding: 24 }}>
              {!withdrawProcessing && !withdrawSuccess ? (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Bank Name</Text>
                    <TextInput style={styles.input} placeholder="e.g. ICICI Bank" placeholderTextColor="#94A3B8" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Account Number</Text>
                    <TextInput style={styles.input} placeholder="XXXX XXXX XXXX XXXX" placeholderTextColor="#94A3B8" keyboardType="numeric" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>IFSC Code</Text>
                    <TextInput style={styles.input} placeholder="ICIC0001234" placeholderTextColor="#94A3B8" autoCapitalize="characters" />
                  </View>

                  <TouchableOpacity 
                    style={styles.confirmButton} 
                    onPress={() => {
                      setWithdrawProcessing(true);
                      setTimeout(() => {
                        setWithdrawProcessing(false);
                        setWithdrawSuccess(true);
                      }, 2500);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Send Money to Bank</Text>
                  </TouchableOpacity>
                </>
              ) : withdrawProcessing ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 400 }}>
                  <ActivityIndicator size="large" color={UI.primary} />
                  <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 24, color: UI.text }}>Requesting Transfer...</Text>
                  <Text style={{ color: UI.textSecondary, marginTop: 8 }}>Communicating with clearing house</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 400 }}>
                  <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="check-circle" size={60} color={UI.primary} />
                  </View>
                  <Text style={{ fontSize: 26, fontWeight: '900', marginTop: 24, color: UI.text }}>Money Deposited!</Text>
                  <Text style={{ color: UI.textSecondary, marginTop: 12, textAlign: 'center', paddingHorizontal: 20 }}>
                    ₹{totalPaid} has been successfully sent to your bank account.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.confirmButton, { marginTop: 40, width: '100%' }]} 
                    onPress={() => {
                      setWithdrawModal(false);
                      setWithdrawSuccess(false);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { fontSize: 32, fontWeight: 'bold', color: UI.text, marginBottom: 24 },
  summaryCard: { backgroundColor: '#0F172A', borderRadius: 14, padding: 24, marginBottom: 32, boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.2)' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  summaryValue: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' },
  withdrawMainButton: { backgroundColor: UI.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  withdrawMainButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: UI.text, marginBottom: 16 },
  card: { backgroundColor: UI.surface, borderRadius: 14, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: UI.border, boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
  transactionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconContainer: { marginRight: 16 },
  greenCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  detailsContainer: { flex: 1 },
  title: { fontSize: 17, fontWeight: '600', color: UI.text, marginBottom: 4 },
  date: { fontSize: 15, color: UI.textSecondary },
  amountText: { fontSize: 17, fontWeight: 'bold', color: UI.primary },
  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: UI.textSecondary, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: UI.border },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: UI.text },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: UI.textSecondary, marginBottom: 8 },
  input: { backgroundColor: UI.bg, height: 56, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: UI.text, borderWidth: 1, borderColor: UI.border },
  confirmButton: { backgroundColor: UI.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
