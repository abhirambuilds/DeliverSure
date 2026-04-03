import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Language } from '@/utils/translations';

type Role = 'admin' | 'agent' | null;

export interface CoverageOption {
  id: string; name: string; description: string; price: number; icon: string;
}
export const AVAILABLE_COVERAGES: CoverageOption[] = [
  { id: 'rain', name: 'Rain Protection', description: 'Flood and storm damage', price: 12, icon: 'cloud-drizzle' },
  { id: 'heat', name: 'Heat Protection', description: 'Extreme heatwave illness', price: 8, icon: 'sun' },
  { id: 'smog', name: 'Air Quality Shield', description: 'Severe pollution health aid', price: 10, icon: 'wind' },
];
export interface Claim {
  id: string; title: string; amount: string; date: string;
  status: 'Under Review' | 'Approved & Paid' | 'Denied - Below Deductible';
  proofImage?: string | null;
}
interface User {
  id: string;
  email: string; name?: string; phone?: string;
  activeCoverages?: CoverageOption[];
  role?: Role;
}
interface AuthContextType {
  user: User | null; role: Role; language: Language;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addClaim: (claim: Claim) => void;
  changeLanguage: (lang: Language) => void;
  isRideActive: boolean;
  setIsRideActive: (active: boolean) => void;
  hasPromptedLocation: boolean;
  setHasPromptedLocation: (val: boolean) => void;
  refreshUser: () => Promise<void>;
  payoutModalVisible: boolean;
  setPayoutModalVisible: (val: boolean) => void;
  deliveryCount: number;
  setDeliveryCount: React.Dispatch<React.SetStateAction<number>>;
  cumulativeDistance: number;
  setCumulativeDistance: React.Dispatch<React.SetStateAction<number>>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isRideActive, setIsRideActive] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [cumulativeDistance, setCumulativeDistance] = useState(0);
  const [lastCheckDate, setLastCheckDate] = useState(new Date().toDateString());

  // Check for daily reset on mount and when date changes
  useEffect(() => {
    const today = new Date().toDateString();
    if (today !== lastCheckDate) {
      console.log("New Day Detected! Resetting daily stats.");
      setDeliveryCount(0);
      setCumulativeDistance(0);
      setLastCheckDate(today);
    }
  }, [lastCheckDate]);

  // Restore session from Supabase on mount
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email || '');
      }
    };
    restoreSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string, email: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const userRole = (profile?.role || (email === 'admin@gmail.com' ? 'admin' : 'agent')) as Role;
      setRole(userRole);

      // Fetch active policy
      let fetchedCoverages: CoverageOption[] = [];
      try {
        const { data: policies } = await supabase
          .from('coverage_policies')
          .select('*')
          .eq('user_id', userId)
          .eq('policy_status', 'active');

        if (policies && policies.length > 0) {
          fetchedCoverages = policies.map(p => ({
            id: p.id,
            name: p.risk_zone,
            price: p.weekly_premium,
            description: 'Active',
            icon: p.risk_zone?.toLowerCase().includes('rain') ? 'cloud-drizzle' : 
                  p.risk_zone?.toLowerCase().includes('heat') ? 'sun' : 'shield'
          }));
        }
      } catch (_) {}

      if (profile) {
        setRole(profile.role as Role);
        setUser({
          id: userId,
          email: profile.email || email,
          name: profile.full_name,
          activeCoverages: fetchedCoverages,
          role: profile.role as Role,
        });
      } else {
        // FIX: If profile is missing, create a basic one to avoid FK errors in the app
        console.log("Auto-repairing missing profile for:", email);
        const newProfile = {
          id: userId,
          email: email,
          full_name: email.split('@')[0],
          role: email === 'admin@gmail.com' ? 'admin' : 'agent'
        };
        const { error: insertErr } = await supabase.from('profiles').upsert(newProfile);
        if (insertErr) console.error("Could not repair profile:", insertErr);
        
        setRole(newProfile.role as Role);
        setUser({
          id: userId,
          email: email,
          name: newProfile.full_name,
          activeCoverages: fetchedCoverages,
          role: newProfile.role as Role,
        });
      }
    } catch (err) {
      console.error('Profile load error:', err);
      // Fail-safe: Ensure role is at least set to something to allow navigation
      setRole(email === 'admin@gmail.com' ? 'admin' : 'agent');
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setHasPromptedLocation(false);
    // onAuthStateChange will call loadProfile automatically
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };
  const addClaim = (claim: Claim) => {};
  const changeLanguage = (lang: Language) => setLanguage(lang);

  return (
    <AuthContext.Provider value={{ 
      user, role, language, login, logout, updateUser, addClaim, changeLanguage, 
      isRideActive, setIsRideActive, hasPromptedLocation, setHasPromptedLocation,
      payoutModalVisible, setPayoutModalVisible, deliveryCount, setDeliveryCount,
      cumulativeDistance, setCumulativeDistance, refreshUser: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await loadProfile(session.user.id, session.user.email || '');
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
