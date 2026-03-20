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

const darkColors: ThemeColors = {
  background: '#000000',
  text: '#ffffff',
  card: '#1c1c1e',
  border: '#333333',
  textMuted: '#a0a0a0',
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  overlay: 'rgba(0,0,0,0.7)',
  cardIconBg: 'rgba(255,255,255,0.05)',
  cardIconBgSelected: 'rgba(59, 130, 246, 0.1)',
  headerRow: '#1a1a1a',
};

const lightColors: ThemeColors = {
  background: '#ffffff',
  text: '#000000',
  card: '#f2f2f7',
  border: '#e5e5ea',
  textMuted: '#666666',
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  overlay: 'rgba(0,0,0,0.4)',
  cardIconBg: 'rgba(0,0,0,0.05)',
  cardIconBgSelected: 'rgba(59, 130, 246, 0.1)',
  headerRow: '#f2f2f7',
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('dark'); // Default dark
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('appTheme').then(savedTheme => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
      setIsLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    AsyncStorage.setItem('appTheme', newTheme);
  };

  if (!isLoaded) return null;

  const colors = theme === 'dark' ? darkColors : lightColors;

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
