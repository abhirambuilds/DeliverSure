import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '@/src/services/api';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export default function AdminClaimsScreen() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/claims');
      setClaims(res.data.claims || []);
    } catch (err) {
      console.error("Fetch claims error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getFilteredData = () => {
    if (filter === "All") return claims;
    return claims.filter(c => c.claim_status?.toLowerCase() === filter.toLowerCase());
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/admin/claims/approve/${id}`);
      fetchClaims();
    } catch (e) {
      console.error("Approve error", e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Claims Management</Text>
          <Text style={styles.subtitle}>{loading ? 'Refreshing...' : `Managing ${claims.length} claims`}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Feather name="filter" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={UI.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {getFilteredData().length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="folder" size={48} color={UI.textSecondary} />
              <Text style={styles.emptyText}>No claims found.</Text>
            </View>
          ) : (
            getFilteredData().map((claim) => (
              <View key={claim.id} style={styles.claimCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.claimId}>ID: {claim.id.slice(0, 8).toUpperCase()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.claim_status) + '22' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(claim.claim_status) }]}>{claim.claim_status.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.cardRow}>
                  <Text style={styles.label}>User ID:</Text>
                  <Text style={styles.value}>{claim.user_id?.slice(0, 8)}...</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Amount:</Text>
                  <Text style={styles.amountText}>₹{claim.payout_amount}</Text>
                </View>

                {claim.claim_status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.approveBtn]} 
                      onPress={() => handleApprove(claim.id)}
                    >
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]}>
                      <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeaderRow}>
               <Text style={styles.modalTitle}>Filter by Status</Text>
               <TouchableOpacity onPress={() => setModalVisible(false)}>
                 <Feather name="x" size={24} color={UI.textSecondary} />
               </TouchableOpacity>
             </View>
             {['All', 'Pending', 'Approved', 'Paid', 'Rejected'].map(opt => (
               <TouchableOpacity 
                 key={opt} 
                 style={styles.modalOption}
                 onPress={() => { setFilter(opt); setModalVisible(false); }}
               >
                 <Text style={[styles.modalOptionText, filter === opt && { color: UI.primary, fontWeight: 'bold' }]}>{opt}</Text>
               </TouchableOpacity>
             ))}
           </View>
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return '#16A34A';
    case 'approved': return '#2563EB';
    case 'pending': return '#F59E0B';
    case 'rejected': return '#EF4444';
    default: return '#64748B';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  contentContainer: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: UI.text },
  subtitle: { fontSize: 14, color: UI.primary, fontWeight: '600', marginTop: 2 },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: UI.text, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  filterButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  claimCard: { backgroundColor: UI.surface, borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  claimId: { color: UI.textSecondary, fontSize: 12, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: UI.textSecondary, fontSize: 14 },
  value: { color: UI.text, fontSize: 14, fontWeight: '600' },
  amountText: { color: UI.text, fontSize: 18, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16, borderTopWidth: 1, borderTopColor: UI.border, paddingTop: 16 },
  actionBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  approveBtn: { backgroundColor: UI.primary },
  rejectBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: UI.textSecondary, fontSize: 16, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: UI.text },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: UI.border },
  modalOptionText: { fontSize: 16, color: UI.text },
});
