import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '@/utils/storage';
import api from '@/src/services/api';
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
  email: string; name?: string; phone?: string; dob?: string; gender?: string;
  activeCoverages?: CoverageOption[]; claims?: Claim[];
  role?: Role;
}
interface AuthContextType {
  user: User | null; role: Role; token: string | null; language: Language;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void; updateUser: (data: Partial<User>) => void;
  addClaim: (claim: Claim) => void;
  changeLanguage: (lang: Language) => void; isRideActive: boolean;
  setIsRideActive: (active: boolean) => void; hasPromptedLocation: boolean;
  setHasPromptedLocation: (val: boolean) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isRideActive, setIsRideActive] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);

  useEffect(() => {
    const restore = async () => {
      const savedToken = await storage.getItem('userToken');
      const savedRole = await storage.getItem('userRole');
      if (savedToken) {
        setToken(savedToken);
        setRole((savedRole as Role) || 'agent');
        try {
          const res = await api.get('/profiles/me');
          const profile = res.data.profile;
          const userRole = profile.role || 'agent';
          
          setRole(userRole as Role);
          await storage.setItem('userRole', userRole);

          let fetchedCoverages: any[] = [];
          try {
            const polRes = await api.get('/policies/active');
            if (polRes.data?.policy) {
              fetchedCoverages = [{ id: polRes.data.policy.id, name: 'Active Protection', price: polRes.data.policy.weekly_premium, icon: 'shield' }];
            }
          } catch (e) { console.log('No active policy found at restore') }
          
          setUser({ 
            email: profile.email || profile.full_name, 
            name: profile.full_name, 
            activeCoverages: fetchedCoverages,
            role: userRole as Role
          });
        } catch (err) {
          console.error("Session restore error:", err);
          logout();
        }
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user_id } = res.data;
      
      await storage.setItem('userToken', access_token);
      setToken(access_token);

      // Fetch profile to get real role
      const profRes = await api.get('/profiles/me');
      const profile = profRes.data.profile;
      const userRole = profile.role || 'agent';

      await storage.setItem('userRole', userRole);
      setRole(userRole as Role);
      
      setUser({ 
        email: profile.email || profile.full_name, 
        name: profile.full_name,
        role: userRole as Role
      });
      
      setHasPromptedLocation(false);
    } catch (err: any) {
      console.error("Login Error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem('userToken');
      await storage.removeItem('userRole');
    } catch (e) { console.error("Logout storage error", e); }
    setUser(null); setRole(null); setToken(null);
  };

  const updateUser = (data: Partial<User>) => { if (user) setUser({ ...user, ...data }); };

  const addClaim = (claim: Claim) => {
    if (user) setUser({ ...user, claims: [claim, ...(user.claims || [])] });
  };
  const changeLanguage = (lang: Language) => setLanguage(lang);

  return (
    <AuthContext.Provider value={{ user, role, token, language, login, logout, updateUser, addClaim, changeLanguage, isRideActive, setIsRideActive, hasPromptedLocation, setHasPromptedLocation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
