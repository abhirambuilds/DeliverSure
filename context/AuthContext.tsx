import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Language } from '@/utils/translations';

type Role = 'admin' | 'agent' | null;

export interface CoverageOption {
  id: string; name: string; description: string; price: number; icon: string;
}
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
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isRideActive, setIsRideActive] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);

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
        .single();

      const userRole = (profile?.role || 'agent') as Role;
      setRole(userRole);

      // Fetch active policy
      let fetchedCoverages: CoverageOption[] = [];
      try {
        const { data: policy } = await supabase
          .from('coverage_policies')
          .select('*')
          .eq('user_id', userId)
          .eq('policy_status', 'active')
          .single();
        if (policy) {
          fetchedCoverages = [{ id: policy.id, name: 'Active Protection', price: policy.weekly_premium, description: 'Active', icon: 'shield' }];
        }
      } catch (_) {}

      setUser({
        id: userId,
        email: profile?.email || email,
        name: profile?.full_name,
        activeCoverages: fetchedCoverages,
        role: userRole,
      });
    } catch (err) {
      console.error('Profile load error:', err);
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
    <AuthContext.Provider value={{ user, role, language, login, logout, updateUser, addClaim, changeLanguage, isRideActive, setIsRideActive, hasPromptedLocation, setHasPromptedLocation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
