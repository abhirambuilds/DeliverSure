import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, CoverageOption } from '@/context/AuthContext';
import { useThemeContext, ThemeColors } from '@/context/ThemeContext';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { formatINR } from '../../src/utils/currency';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PAYMENT_OPTIONS = [
  { id: 'card', title: 'Credit / Debit Card', icon: 'credit-card', subtitle: '' },
  { id: 'netbanking', title: 'Net Banking', icon: 'monitor', subtitle: 'Select your bank' },
  { id: 'qr', title: 'UPI (Scan & Pay)', icon: 'maximize', subtitle: 'Scan QR code to pay' },
  { id: 'upi', title: 'Other UPI Apps', icon: 'smartphone', subtitle: '' }
];

const AVAILABLE_COVERAGES: CoverageOption[] = [
  {
    id: 'rain',
    name: 'Rain Protection',
    description: 'Coverage against flood and heavy storm water damage.',
    price: 120,
    icon: 'cloud-drizzle'
  },
  {
    id: 'heat',
    name: 'Heat Protection',
    description: 'Coverage for extreme heatwaves causing agricultural or property damage.',
    price: 90,
    icon: 'sun'
  },
  {
    id: 'pollution',
    name: 'Pollution Protection',
    description: 'Health and property coverage during severe smog and poor AQI events.',
    price: 60,
    icon: 'wind'
  },
  {
    id: 'curfew',
    name: 'Curfew Protection',
    description: 'Income protection during mandatory weather-related city lockdowns.',
    price: 150,
    icon: 'lock'
  }
];

export default function CoverageSelectScreen() {
  const router = useRouter();
  const { user, addCoverage } = useAuth();
  const { colors, isDark } = useThemeContext();
  const styles = createStyles(colors);
  
  const [selectedItem, setSelectedItem] = useState<CoverageOption | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [expMonth, setExpMonth] = useState('01');
  const [expYear, setExpYear] = useState(new Date().getFullYear().toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 11}, (_, i) => (currentYear + i).toString());
  const months = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));

  const activeIds = user?.activeCoverages?.map(c => c.id) || [];

  const handlePaymentSelect = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPayment(id);
  };

  const handleSelect = (item: CoverageOption) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleConfirmPurchase = () => {
    setModalVisible(false);
    setTimeout(() => {
      setPaymentModalVisible(true);
    }, 400); // Allow first modal to close
  };

  const handlePaymentOk = () => {
    if (selectedItem) {
      addCoverage(selectedItem);
      setPaymentModalVisible(false);
      Alert.alert(
        "Payment Successful", 
        "Your coverage has been activated.",
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Coverages</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {AVAILABLE_COVERAGES.map(item => {
          const isActive = activeIds.includes(item.id);

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Feather name={item.icon as any} size={24} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {isActive && (
                  <View style={styles.badgeActive}>
                    <Text style={styles.badgeTextActive}>Active</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.description}>{item.description}</Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.price}>{formatINR(item.price)} <Text style={styles.priceSub}>/ week</Text></Text>
                
                <TouchableOpacity 
                  style={[styles.selectButton, isActive && styles.selectButtonDisabled]}
                  onPress={() => handleSelect(item)}
                  disabled={isActive}
                >
                  <Text style={[styles.selectButtonText, isActive && styles.selectButtonTextDisabled]}>
                    {isActive ? 'Purchased' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather name="shield" size={32} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Confirm Purchase</Text>
            <Text style={styles.modalText}>
              Are you sure you want to add <Text style={styles.boldText}>{selectedItem?.name}</Text> to your active coverages for <Text style={styles.boldText}>{formatINR(selectedItem?.price || 0)}/week</Text>?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirmPurchase}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Popup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContent}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.paymentScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.paymentOptionsContainer}>
                {PAYMENT_OPTIONS.map(opt => (
                  <View key={opt.id} style={styles.paymentOptionWrapper}>
                    <TouchableOpacity 
                      style={[
                        styles.paymentOption, 
                        selectedPayment === opt.id && styles.paymentOptionSelected,
                        opt.id === 'card' && selectedPayment === 'card' && styles.paymentOptionSelectedTop
                      ]}
                      onPress={() => handlePaymentSelect(opt.id)}
                    >
                      <View style={styles.paymentOptionIcon}>
                        <Feather name={opt.icon as any} size={24} color={selectedPayment === opt.id ? colors.primary : colors.textMuted} />
                      </View>
                      <View style={styles.paymentOptionTextContainer}>
                        <Text style={styles.paymentOptionTitle}>{opt.title}</Text>
                        {opt.subtitle ? <Text style={styles.paymentOptionSubtitle}>{opt.subtitle}</Text> : null}
                      </View>
                      
                      {opt.id === 'netbanking' && (
                        <Feather name="chevron-down" size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
                      )}

                      <View style={[styles.radioCircle, selectedPayment === opt.id && styles.radioCircleSelected]}>
                        {selectedPayment === opt.id && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>

                    {opt.id === 'card' && selectedPayment === 'card' && (
                      <View style={styles.cardDetailsContainer}>
                        <Text style={styles.cardDetailsTitle}>Card Details</Text>
                        
                        <View style={styles.inputRow}>
                          <Text style={styles.inputLabel}>Card Number</Text>
                          <TextInput 
                            style={styles.textInput} 
                            placeholder="0000 0000 0000 0000" 
                            placeholderTextColor={colors.textMuted} 
                            keyboardType="number-pad"
                          />
                        </View>
                        
                        <View style={styles.inputRow}>
                          <Text style={styles.inputLabel}>Nickname</Text>
                          <TextInput 
                            style={styles.textInput} 
                            placeholder="e.g. Personal Card" 
                            placeholderTextColor={colors.textMuted}
                          />
                        </View>
                        
                        <View style={styles.inputRow}>
                          <Text style={styles.inputLabel}>Expiry Date</Text>
                          <View style={styles.expiryRow}>
                            <View style={styles.pickerContainer}>
                              <Picker
                                selectedValue={expMonth}
                                onValueChange={(itemValue) => setExpMonth(itemValue)}
                                style={styles.picker}
                                dropdownIconColor={colors.textMuted}
                              >
                                {months.map(m => (
                                  <Picker.Item key={m} label={` ${m}`} value={m} color={Platform.OS === 'ios' ? colors.text : undefined} />
                                ))}
                              </Picker>
                            </View>
                            <View style={styles.pickerContainer}>
                              <Picker
                                selectedValue={expYear}
                                onValueChange={(itemValue) => setExpYear(itemValue)}
                                style={styles.picker}
                                dropdownIconColor={colors.textMuted}
                              >
                                {years.map(y => (
                                  <Picker.Item key={y} label={` ${y}`} value={y} color={Platform.OS === 'ios' ? colors.text : undefined} />
                                ))}
                              </Picker>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.paymentFooter}>
              <TouchableOpacity style={styles.paymentOkButton} onPress={handlePaymentOk}>
                <Text style={styles.paymentOkButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.headerRow,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardIconBgSelected,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  price: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceSub: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 'normal',
  },
  selectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonDisabled: {
    backgroundColor: colors.border,
  },
  selectButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectButtonTextDisabled: {
    color: colors.textMuted,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextActive: {
    color: colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardIconBgSelected,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  boldText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  paymentModalContent: {
    backgroundColor: colors.headerRow,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  paymentScroll: {
    padding: 24,
  },
  paymentOptionsContainer: {
    gap: 16,
    paddingBottom: 40,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.cardIconBgSelected,
  },
  paymentOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.cardIconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentOptionWrapper: {
    marginBottom: 0,
  },
  paymentOptionSelectedTop: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  cardDetailsContainer: {
    backgroundColor: colors.cardIconBgSelected,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    paddingTop: 8,
  },
  cardDetailsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    width: 100,
    color: colors.textMuted,
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.headerRow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  expiryRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.headerRow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: colors.text,
    backgroundColor: 'transparent',
    width: '100%',
  },
  paymentOptionTextContainer: {
    flex: 1,
  },
  paymentOptionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentOptionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  paymentFooter: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.headerRow,
  },
  paymentOkButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentOkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
