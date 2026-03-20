import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not logged in
  const [role, setRole] = useState(null); // 'worker' or 'admin'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const loadSession = async () => {
      try {
        const storedRole = await SecureStore.getItemAsync('userRole');
        const token = await SecureStore.getItemAsync('userToken');
        
        if (token && storedRole) {
          setRole(storedRole);
          setUser({ token }); // Placeholder user object
        }
      } catch (e) {
        console.error("Failed to load session", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Mock logic to determine role based on email
      let roleType = 'worker'; // worker is user role
      if (email && email.toLowerCase() === 'admin@ws.com') {
        roleType = 'admin';
      }

      // Mock login process - in real app, verify backend credentials
      const token = "mock-jwt-token";
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userRole', roleType);
      
      setUser({ token });
      setRole(roleType);
    } catch (e) {
      console.error("Login Error", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userRole');
      setUser(null);
      setRole(null);
    } catch (e) {
      console.error("Logout Error", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
