import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, CoverageOption } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

const PAYMENT_OPTIONS = [
  { id: 'card', title: 'Credit / Debit Card', icon: 'credit-card', subtitle: '' },
  { id: 'upi', title: 'UPI Apps', icon: 'smartphone', subtitle: 'PhonePe, GPay, Paytm' }
];

const AVAILABLE_COVERAGES: CoverageOption[] = [
  { id: 'rain', name: 'Rain Protection', description: 'Flood and storm damage', price: 0, icon: 'cloud-drizzle' },
  { id: 'heat', name: 'Heat Protection', description: 'Extreme heatwave and illness', price: 0, icon: 'sun' },
  { id: 'pollution', name: 'Pollution Shield', description: 'Health coverage for severe smog', price: 0, icon: 'wind' },
];

export default function CoverageSelectScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [selectedItem, setSelectedItem] = useState<CoverageOption | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [dynamicPremium, setDynamicPremium] = useState<number>(35);

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

  const activeIds = user?.activeCoverages?.map(c => c.id) || [];

  const handleSelect = (item: CoverageOption) => {
    setSelectedItem({ ...item, price: dynamicPremium });
    setPaymentModalVisible(true);
  };

  const handlePaymentOk = async () => {
    if (!selectedItem || !user?.id) return;
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const { data, error } = await supabase.from('coverage_policies').insert({
        user_id: user.id,
        weekly_premium: dynamicPremium,
        coverage_amount: 1000,
        start_date: startDate,
        end_date: endDate,
        policy_status: 'active',
        risk_zone: 'Current Zone',
      }).select().single();

      if (error) throw error;

      updateUser({
        activeCoverages: [
          { id: data.id, name: selectedItem.name, description: 'Active', price: dynamicPremium, icon: 'shield' }
        ]
      });

      setPaymentModalVisible(false);
      Alert.alert("Coverage Active", "Your parametric policy has been activated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err: any) {
      const msg = err?.message || 'System could not write policy to DB.';
      if (msg.toLowerCase().includes('already')) {
        Alert.alert("Already Active", "You already have an active policy.");
      } else {
        Alert.alert("Error", msg);
      }
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
          const isActive = activeIds.includes(item.id);
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
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <TouchableOpacity
                style={[styles.btn, isActive ? styles.btnDisabled : styles.btnPrimary]}
                onPress={() => handleSelect(item)}
                disabled={isActive}
              >
                <Feather name={isActive ? "check-circle" : "shield"} size={20} color={isActive ? UI.textSecondary : UI.bg} style={{ marginRight: 8 }} />
                <Text style={[styles.btnText, isActive ? { color: UI.textSecondary } : { color: UI.bg }]}>
                  {isActive ? 'Protected' : 'Activate Coverage'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={paymentModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pay ₹{selectedItem?.price}</Text>
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
            <TouchableOpacity style={styles.payButton} onPress={handlePaymentOk}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setPaymentModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  btnPrimary: { backgroundColor: UI.primary, boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  btnDisabled: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: UI.border },
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
});
