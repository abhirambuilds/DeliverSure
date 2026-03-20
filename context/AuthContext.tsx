import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/utils/translations';

type Role = 'admin' | 'user' | null;

export interface CoverageOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export interface Claim {
  id: string;
  title: string;
  amount: string;
  date: string;
  status: 'Under Review' | 'Approved & Paid' | 'Denied - Below Deductible';
  proofImage?: string | null;
}

interface User {
  email: string;
  name?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  activeCoverages?: CoverageOption[];
  claims?: Claim[];
}

interface AuthContextType {
  user: User | null;
  role: Role;
  language: Language;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addCoverage: (coverage: CoverageOption) => void;
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

  const login = (email: string) => {
    setUser({ email });
    setHasPromptedLocation(false);
    if (email === "admin@ws.com") {
      setRole('admin');
    } else {
      setRole('user');
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const addCoverage = (coverage: CoverageOption) => {
    if (user) {
      const currentCoverages = user.activeCoverages || [];
      // Prevent duplicates
      if (!currentCoverages.find(c => c.id === coverage.id)) {
        setUser({
          ...user,
          activeCoverages: [...currentCoverages, coverage]
        });
      }
    }
  };

  const addClaim = (claim: Claim) => {
    if (user) {
      const currentClaims = user.claims || [];
      // Add to beginning of list
      setUser({
        ...user,
        claims: [claim, ...currentClaims]
      });
    }
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <AuthContext.Provider value={{ user, role, language, login, logout, updateUser, addCoverage, addClaim, changeLanguage, isRideActive, setIsRideActive, hasPromptedLocation, setHasPromptedLocation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
