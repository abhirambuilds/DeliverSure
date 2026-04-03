import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  text: string;
  card: string;
  border: string;
  textMuted: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  cardIconBg: string;
  cardIconBgSelected: string;
  headerRow: string;
}

const lightColors: ThemeColors = {
  background: '#F8FAFC',
  text: '#0F172A',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textMuted: '#64748B',
  primary: '#16A34A',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  overlay: 'rgba(15, 23, 42, 0.4)',
  cardIconBg: '#F1F5F9',
  cardIconBgSelected: '#DCFCE7',
  headerRow: '#FFFFFF',
};

const darkColors: ThemeColors = lightColors;

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleTheme = () => {
    // Disabled for this redesign
  };

  if (!isLoaded) return null;

  const colors = lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within an AppThemeProvider');
  }
  return context;
}
