import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, CoverageOption } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '@/src/services/api';

const UI = {
  primary: '#0BDC84',
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
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
  const [dynamicPremium, setDynamicPremium] = useState<number | null>(null);

  useEffect(() => {
    api.post('/premium/calculate', { location: 'Current Zone' })
      .then(res => setDynamicPremium(res.data.premium))
      .catch(() => setDynamicPremium(35));
  }, []);

  const activeIds = user?.activeCoverages?.map(c => c.id) || [];

  const handleSelect = (item: CoverageOption) => {
    setSelectedItem({ ...item, price: dynamicPremium || 35 });
    setPaymentModalVisible(true);
  };

  const handlePaymentOk = async () => {
    if (selectedItem) {
      try {
        const res = await api.post('/policies/activate', {
            user_id: user?.email || "mock_id",
            zone: "Current Zone",
            premium: dynamicPremium || 35,
            coverage_amount: 1000
        });
        
        updateUser({
           activeCoverages: [
             { id: res.data.policy_id, name: 'Rain Protection', description: 'Active', price: res.data.premium, icon: 'shield' }
           ]
        });
        
        setPaymentModalVisible(false);
        Alert.alert("Coverage Active", "Your parametric policy has been legally activated within the database.", [{ text: "OK", onPress: () => router.back() }]);
      } catch (err) {
        Alert.alert("Error activating", "System could not write policy to DB.");
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
                💰 Weekly Premium: {dynamicPremium ? `₹${dynamicPremium}` : 'Calculating...'}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: UI.bg },
  backButton: { padding: 4 },
  headerTitle: { color: UI.text, fontSize: 24, fontWeight: 'bold' },
  scrollContent: { padding: 24 },
  card: { backgroundColor: UI.surface, borderRadius: 16, padding: 20, marginBottom: 20 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'baseline' },
  activeBadge: { backgroundColor: '#1A3324', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeText: { color: UI.primary, fontWeight: 'bold', fontSize: 14 },
  priceText: { color: UI.text, fontSize: 24, fontWeight: 'bold' },
  cardTitle: { color: UI.text, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  description: { color: UI.textSecondary, fontSize: 16, marginBottom: 24 },
  btn: { height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnPrimary: { backgroundColor: UI.primary },
  btnDisabled: { backgroundColor: UI.bg, borderWidth: 1, borderColor: UI.textSecondary },
  btnText: { fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: UI.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: UI.text, marginBottom: 24, textAlign: 'center' },
  paymentOptions: { marginBottom: 24 },
  payOpt: { flexDirection: 'row', alignItems: 'center', backgroundColor: UI.bg, padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: UI.bg },
  payOptActive: { borderColor: UI.primary },
  payOptTextWrapper: { flex: 1, marginLeft: 16 },
  payOptTitle: { color: UI.text, fontSize: 18, fontWeight: 'bold' },
  payOptSub: { color: UI.textSecondary, fontSize: 14, marginTop: 4 },
  payButton: { backgroundColor: UI.primary, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  payButtonText: { color: UI.bg, fontSize: 20, fontWeight: 'bold' },
  cancelButton: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: UI.bg },
  cancelButtonText: { color: UI.text, fontSize: 18, fontWeight: 'bold' }
});
