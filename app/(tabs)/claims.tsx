import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const UI = {
  primary: '#16A34A',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  danger: '#EF4444',
  warning: '#F59E0B',
  border: '#E2E8F0',
};

export default function ClaimsScreen() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchClaims = async () => {
      try {
        const { data, error } = await supabase
          .from('claims')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setClaims(data || []);
      } catch (err) {
        console.error("Fetch claims error:", err);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [user?.id]);

  const getStatusDetails = (status: any) => {
    const s = status?.toLowerCase() || '';
    if (s === "paid") return { color: UI.primary, icon: 'check-circle', label: 'Paid' };
    if (s === "approved") return { color: '#2563EB', icon: 'check', label: 'Approved' };
    if (s === "pending") return { color: UI.warning, icon: 'clock', label: 'Pending' };
    return { color: UI.danger, icon: 'x-circle', label: 'Rejected' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Claims</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={UI.primary} size="large" style={{ marginTop: 40 }} />
        ) : claims.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={UI.textSecondary} />
            <Text style={styles.emptyText}>No claims found.</Text>
          </View>
        ) : (
          claims.map((claim) => {
            const status = getStatusDetails(claim.claim_status);
            return (
              <View key={claim.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.claimTitle}>{claim.claim_type || "Claim"}</Text>
                  <Text style={styles.claimAmount}>₹{claim.payout_amount || 0}</Text>
                </View>
                <View style={styles.cardMiddle}>
                  <Text style={styles.claimId}>ID: {claim.id?.slice(0, 8).toUpperCase()}</Text>
                  <Text style={styles.claimDate}>{new Date(claim.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBox, { backgroundColor: status.color + '10', borderColor: status.color }]}>
                  <Feather name={status.icon as any} size={20} color={status.color} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  headerRow: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: UI.bg },
  header: { fontSize: 32, fontWeight: "bold", color: UI.text },
  contentContainer: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: UI.surface, borderRadius: 14, padding: 20, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: UI.border, boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  claimTitle: { fontSize: 20, fontWeight: "bold", color: UI.text },
  claimAmount: { fontSize: 24, fontWeight: "bold", color: UI.text },
  cardMiddle: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  claimId: { color: UI.textSecondary, fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  claimDate: { color: UI.textSecondary, fontSize: 15 },
  statusBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 12, borderWidth: 1 },
  statusText: { fontWeight: "bold", fontSize: 17, marginLeft: 8 },
  emptyState: { padding: 40, backgroundColor: UI.surface, borderRadius: 14, alignItems: "center", marginTop: 40, boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
  emptyText: { color: UI.textSecondary, fontSize: 18, marginTop: 16, fontWeight: "bold" }
});
