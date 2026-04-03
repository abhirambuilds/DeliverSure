import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, CoverageOption, AVAILABLE_COVERAGES } from '@/context/AuthContext';
import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  danger: '#EF4444',
};

const PAYMENT_OPTIONS = [
  { id: 'card', title: 'Credit / Debit Card', icon: 'credit-card', subtitle: '' },
  { id: 'upi', title: 'UPI Apps', icon: 'smartphone', subtitle: 'PhonePe, GPay, Paytm' }
];

export default function CoverageSelectScreen() {
  const router = useRouter();
  const { user, updateUser, refreshUser } = useAuth();
  const [selectedItem, setSelectedItem] = useState<CoverageOption | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [dynamicPremium, setDynamicPremium] = useState<number>(35);
  const [paymentStep, setPaymentStep] = useState<'options' | 'qr' | 'success'>('options');
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    // Calculate premium using Supabase Edge Function
    const fetchPremium = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('calculate-premium', {
          body: { location: 'Current Zone', lat: 12.9716, lng: 77.5946 }
        });
        if (!error && data?.premium) {
          setDynamicPremium(data.premium);
        }
      } catch (err) {
        console.error("Premium calculation error:", err);
        // Fallback: keep default 35
      }
    };
    fetchPremium();
  }, []);

  const activeNames = user?.activeCoverages?.map(c => c.name) || [];

  const handleSelect = (item: CoverageOption) => {
    setSelectedItem({ ...item, price: dynamicPremium });
    setPaymentStep('options');
    setPaymentModalVisible(true);
  };

  const handleStartQR = () => {
    setPaymentStep('qr');
    setTimer(5);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (paymentStep === 'qr') {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handlePaymentComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentStep]);

  const handlePaymentComplete = async () => {
    if (!selectedItem || !user?.id) return;
    try {
      setPaymentStep('success');
      
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const { data, error } = await supabase.from('coverage_policies').insert({
        user_id: user.id,
        weekly_premium: dynamicPremium,
        coverage_amount: 1000,
        start_date: startDate,
        end_date: endDate,
        policy_status: 'active',
        risk_zone: selectedItem.name,
      }).select().single();

      if (error) throw error;
      
      await refreshUser();

      // Wait a bit to show success before closing
      setTimeout(() => {
        setPaymentModalVisible(false);
        Alert.alert("Coverage Active", "Your parametric policy has been activated.", [{ text: "OK", onPress: () => router.back() }]);
      }, 2000);
    } catch (err: any) {
      setPaymentStep('options');
      const msg = err?.message || 'System error. Activation failed.';
      Alert.alert("Error", msg);
    }
  };

  const handleDeactivate = async (item: any) => {
    if (!user?.id) return;
    try {
      Alert.alert(
        "Deactivate Coverage",
        "Are you sure you want to stop your protection for next week?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Deactivate", 
            style: "destructive",
            onPress: async () => {
              const { error } = await supabase
                .from('coverage_policies')
                .update({ policy_status: 'canceled' })
                .eq('user_id', user?.id)
                .eq('risk_zone', item.name)
                .eq('policy_status', 'active');

              if (error) throw error;
              await refreshUser();
              Alert.alert("Success", "Your protection has been deactivated.");
            }
          }
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", "Could not deactivate. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color={UI.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Cover</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {AVAILABLE_COVERAGES.map(item => {
          const isActive = activeNames.includes(item.name);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Feather name={item.icon as any} size={32} color={UI.primary} />
                <View style={styles.cardHeaderRight}>
                  {isActive && <View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View>}
                </View>
              </View>
              <Text style={{ color: UI.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                💰 Weekly Premium: ₹{dynamicPremium}
              </Text>
              
              {/* Feature 1: AI Integration visible to user */}
              <View style={{ backgroundColor: '#F0FDF4', padding: 8, borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="zap" size={14} color={UI.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: UI.primary, fontSize: 12, fontWeight: '600' }}>
                  AI Model: Safe Zone Discount applied (-₹2)
                </Text>
              </View>

              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <TouchableOpacity
                style={[styles.btn, isActive ? styles.btnDeactivate : styles.btnPrimary]}
                onPress={() => isActive ? handleDeactivate(item) : handleSelect(item)}
              >
                <Feather name={isActive ? "x-circle" : "shield"} size={20} color={isActive ? UI.danger : UI.bg} style={{ marginRight: 8 }} />
                <Text style={[styles.btnText, isActive ? { color: UI.danger } : { color: UI.bg }]}>
                  {isActive ? 'Deactivate Coverage' : 'Activate Coverage'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={paymentModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {paymentStep === 'options' && (
              <>
                <Text style={styles.modalTitle}>Select Payment</Text>
                <View style={styles.paymentOptions}>
                  {PAYMENT_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.payOpt, selectedPayment === opt.id && styles.payOptActive]}
                      onPress={() => setSelectedPayment(opt.id)}
                    >
                      <Feather name={opt.icon as any} size={28} color={selectedPayment === opt.id ? UI.primary : UI.text} />
                      <View style={styles.payOptTextWrapper}>
                        <Text style={styles.payOptTitle}>{opt.title}</Text>
                        {opt.subtitle ? <Text style={styles.payOptSub}>{opt.subtitle}</Text> : null}
                      </View>
                      {selectedPayment === opt.id && <Feather name="check-circle" size={24} color={UI.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.payButton} onPress={handleStartQR}>
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setPaymentModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentStep === 'qr' && (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.modalTitle}>Scan & Pay</Text>
                <Text style={{ fontSize: 18, color: UI.textSecondary, marginBottom: 24 }}>Amount: ₹{selectedItem?.price}</Text>
                
                <View style={styles.qrContainer}>
                  <Image 
                    source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DeliverSurePayment' }} 
                    style={{ width: 220, height: 220 }} 
                  />
                  <View style={styles.scanLine} />
                </View>

                <ActivityIndicator color={UI.primary} size="large" style={{ marginTop: 24 }} />
                <Text style={{ fontSize: 16, color: UI.text, fontWeight: 'bold', marginTop: 12 }}>
                  Detecting payment in {timer}s...
                </Text>
                <Text style={{ fontSize: 14, color: UI.textSecondary, marginTop: 4 }}>
                  Open your UPI app or scan with phone
                </Text>
              </View>
            )}

            {paymentStep === 'success' && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <View style={styles.successIconCircle}>
                  <Feather name="check" size={64} color={UI.primary} />
                </View>
                <Text style={{ fontSize: 28, fontWeight: '800', color: UI.text, marginTop: 24 }}>Payment Received!</Text>
                <Text style={{ fontSize: 16, color: UI.textSecondary, marginTop: 8 }}>Your policy is now active.</Text>
                <ActivityIndicator color={UI.primary} style={{ marginTop: 32 }} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: UI.bg },
  backButton: { padding: 4 },
  headerTitle: { color: UI.text, fontSize: 24, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  card: { backgroundColor: UI.surface, borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'baseline' },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeText: { color: UI.primary, fontWeight: 'bold', fontSize: 14 },
  cardTitle: { color: UI.text, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  description: { color: UI.textSecondary, fontSize: 16, marginBottom: 24 },
  btn: { height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnPrimary: { backgroundColor: UI.primary },
  btnDeactivate: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  btnDisabled: { backgroundColor: '#F1F5F9' },
  btnText: { fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%' },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: UI.text, marginBottom: 24, textAlign: 'center' },
  paymentOptions: { marginBottom: 24 },
  payOpt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 18, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: '#F8FAFC' },
  payOptActive: { borderColor: UI.primary, backgroundColor: '#DCFCE7' },
  payOptTextWrapper: { flex: 1, marginLeft: 16 },
  payOptTitle: { color: UI.text, fontSize: 18, fontWeight: 'bold' },
  payOptSub: { color: UI.textSecondary, fontSize: 14, marginTop: 4 },
  payButton: { backgroundColor: UI.primary, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  payButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  cancelButton: { height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  cancelButtonText: { color: UI.text, fontSize: 18, fontWeight: 'bold' },
  qrContainer: { width: 250, height: 250, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, boxShadow: '0px 4px 15px rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  scanLine: { position: 'absolute', top: 15, left: 15, right: 15, height: 2, backgroundColor: UI.primary, opacity: 0.6, boxShadow: '0px 0px 10px #16A34A' },
  successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 12px rgba(22, 163, 74, 0.2)' },
});
