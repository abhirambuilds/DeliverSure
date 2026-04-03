import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '@/utils/storage';
import { authAPI, profileAPI } from '@/src/services/api';
import { Language } from '@/utils/translations';

type Role = 'admin' | 'user' | null;

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
}
interface AuthContextType {
  user: User | null; role: Role; token: string | null; language: Language;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void; updateUser: (data: Partial<User>) => void;
  addCoverage: (coverage: CoverageOption) => void; addClaim: (claim: Claim) => void;
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
        setRole((savedRole as Role) || 'user');
        try {
          const res = await profileAPI.getMe();
          const profile = res.data.profile;
          setUser({ email: profile.full_name, name: profile.full_name });
        } catch {}
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { access_token } = res.data;
    const userRole: Role = email === 'admin@ws.com' ? 'admin' : 'user';
    await storage.setItem('userToken', access_token);
    await storage.setItem('userRole', userRole);
    setToken(access_token); setRole(userRole);
    setUser({ email }); setHasPromptedLocation(false);
  };

  const logout = async () => {
    await storage.removeItem('userToken');
    await storage.removeItem('userRole');
    setUser(null); setRole(null); setToken(null);
  };

  const updateUser = (data: Partial<User>) => { if (user) setUser({ ...user, ...data }); };
  const addCoverage = (coverage: CoverageOption) => {
    if (user) {
      const current = user.activeCoverages || [];
      if (!current.find(c => c.id === coverage.id))
        setUser({ ...user, activeCoverages: [...current, coverage] });
    }
  };
  const addClaim = (claim: Claim) => {
    if (user) setUser({ ...user, claims: [claim, ...(user.claims || [])] });
  };
  const changeLanguage = (lang: Language) => setLanguage(lang);

  return (
    <AuthContext.Provider value={{ user, role, token, language, login, logout, updateUser, addCoverage, addClaim, changeLanguage, isRideActive, setIsRideActive, hasPromptedLocation, setHasPromptedLocation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
