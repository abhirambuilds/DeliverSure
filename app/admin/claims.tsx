import React, { useState } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatINR } from '../../src/utils/currency';

const claimsData = [
  { name: "Rahul", reason: "Rain", amount: 400, date: "2026-03-18", city: "Chennai", status: "Paid" },
  { name: "Arjun", reason: "AQI", amount: 250, date: "2026-03-18", city: "Bangalore", status: "Processing" },
  { name: "Kiran", reason: "Heat", amount: 600, date: "2026-03-17", city: "Hyderabad", status: "Paid" },
  { name: "Vikram", reason: "Rain", amount: 350, date: "2026-03-17", city: "Mumbai", status: "Processing" },
  { name: "Ravi", reason: "Curfew", amount: 800, date: "2026-03-16", city: "Delhi", status: "Paid" },
  { name: "Suresh", reason: "Heat", amount: 500, date: "2026-03-16", city: "Chennai", status: "Processing" },
  { name: "Manoj", reason: "AQI", amount: 300, date: "2026-03-15", city: "Delhi", status: "Paid" },
  { name: "Ajay", reason: "Rain", amount: 450, date: "2026-03-15", city: "Bangalore", status: "Paid" },
  { name: "Deepak", reason: "Heat", amount: 700, date: "2026-03-14", city: "Hyderabad", status: "Processing" },
  { name: "Anil", reason: "AQI", amount: 280, date: "2026-03-14", city: "Mumbai", status: "Paid" },
  { name: "Prakash", reason: "Rain", amount: 520, date: "2026-03-13", city: "Chennai", status: "Paid" },
  { name: "Venu", reason: "Curfew", amount: 900, date: "2026-03-13", city: "Delhi", status: "Processing" },
  { name: "Gopal", reason: "Heat", amount: 610, date: "2026-03-12", city: "Bangalore", status: "Paid" },
  { name: "Ramesh", reason: "AQI", amount: 260, date: "2026-03-12", city: "Hyderabad", status: "Processing" },
  { name: "Sunil", reason: "Rain", amount: 480, date: "2026-03-11", city: "Mumbai", status: "Paid" },
];

export default function AdminClaimsScreen() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(isDark);
  const [filter, setFilter] = useState("Today");
  const [cityFilter, setCityFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const getFilteredData = () => {
    return claimsData.filter(item => {
      if (filter === "Today") {
        return item.date === "2026-03-18";
      }
      if (filter === "This Week") {
        return item.date >= "2026-03-12";
      }
      if (filter === "By City") {
        return item.city === cityFilter;
      }
      return true;
    });
  };

  const activeDisplayFilter = filter === "By City" ? cityFilter : filter;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Claims & Payout</Text>
          <Text style={styles.subtitle}>Filter: {activeDisplayFilter}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Feather name="filter" size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: 100 }]}>Name</Text>
              <Text style={[styles.tableHeaderText, { width: 90 }]}>Reason</Text>
              <Text style={[styles.tableHeaderText, { width: 90 }]}>Amount</Text>
              <Text style={[styles.tableHeaderText, { width: 110 }]}>Date</Text>
              <Text style={[styles.tableHeaderText, { width: 110 }]}>City</Text>
              <Text style={[styles.tableHeaderText, { width: 100, textAlign: 'right' }]}>Status</Text>
            </View>
            
            {getFilteredData().map((claim, index) => (
              <View key={index} style={[styles.tableRow, index === getFilteredData().length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.tableCell, { width: 100 }]}>{claim.name}</Text>
                <Text style={[styles.tableCell, { width: 90 }]}>{claim.reason}</Text>
                <Text style={[styles.tableCell, { width: 90 }]}>{formatINR(claim.amount)}</Text>
                <Text style={[styles.tableCell, { width: 110 }]}>{claim.date}</Text>
                <Text style={[styles.tableCell, { width: 110 }]}>{claim.city}</Text>
                <Text style={[
                  claim.status === 'Paid' ? styles.statusTextPaid : styles.statusTextProcessing, 
                  { width: 100, textAlign: 'right' }
                ]}>
                  {claim.status}
                </Text>
              </View>
            ))}
            
            {getFilteredData().length === 0 && (
              <Text style={styles.emptyText}>No claims found for this filter.</Text>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeaderRow}>
               <Text style={styles.modalTitle}>Filter Claims</Text>
               <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                 <Feather name="x" size={20} color="#a0a0a0" />
               </TouchableOpacity>
             </View>

             <Text style={styles.modalSectionTitle}>Time</Text>
             {['Today', 'This Week'].map(opt => (
               <TouchableOpacity 
                 key={opt} 
                 style={styles.modalOption}
                 onPress={() => {
                   setFilter(opt);
                   setModalVisible(false);
                 }}
               >
                 <Text style={[styles.modalOptionText, filter === opt && styles.modalOptionTextActive]}>{opt}</Text>
               </TouchableOpacity>
             ))}
             
             <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>City</Text>
             {['Chennai', 'Bangalore', 'Hyderabad', 'Delhi', 'Mumbai'].map(city => (
               <TouchableOpacity 
                 key={city} 
                 style={styles.modalOption}
                 onPress={() => {
                   setFilter('By City');
                   setCityFilter(city);
                   setModalVisible(false);
                 }}
               >
                 <Text style={[styles.modalOptionText, filter === 'By City' && cityFilter === city && styles.modalOptionTextActive]}>{city}</Text>
               </TouchableOpacity>
             ))}
           </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f0f0f' : '#f5f5f5',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterButtonText: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? '#333333' : '#e0e0e0',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333333' : '#e0e0e0',
    marginBottom: 8,
  },
  tableHeaderText: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2a2a2a' : '#e0e0e0',
  },
  tableCell: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 15,
  },
  emptyText: {
    color: isDark ? '#aaa' : '#555',
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusTextPaid: {
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusTextProcessing: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
    borderRadius: 16,
    width: '100%',
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? '#333333' : '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSectionTitle: {
    color: isDark ? '#aaa' : '#555',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2a2a2a' : '#e0e0e0',
  },
  modalOptionText: {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: 16,
  },
  modalOptionTextActive: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});
