import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Migrate old tokens for backwards compatibility
    tokenStorage.migrateOldTokens();
    
    // Check if user is logged in on app start
    const token = tokenStorage.getToken();
    const userData = tokenStorage.getUserData();
    
    if (token && userData && !tokenStorage.isTokenExpired()) {
      setUser(userData);
      console.log('🔐 User session restored');
    } else if (token && tokenStorage.isTokenExpired()) {
      console.warn('🔒 Token expired, clearing session');
      tokenStorage.clearAuth();
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Use enhanced token storage
      if (tokenStorage.setToken(token) && tokenStorage.setUserData(userData)) {
        setUser(userData);
        console.log('🔐 Login successful, session secured');
        return { success: true };
      } else {
        throw new Error('Failed to secure login session');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      console.error('🔒 Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register({ name, email, password });
      const { token, user: userData } = response.data;
      
      // Use enhanced token storage
      if (tokenStorage.setToken(token) && tokenStorage.setUserData(userData)) {
        setUser(userData);
        console.log('🔐 Registration successful, session secured');
        return { success: true };
      } else {
        throw new Error('Failed to secure registration session');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      console.error('🔒 Registration failed:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.guestLogin();
      const { token, user: userData } = response.data;
      
      // Use enhanced token storage
      if (tokenStorage.setToken(token) && tokenStorage.setUserData(userData)) {
        setUser(userData);
        console.log('🔐 Guest login successful, session secured');
        return { success: true };
      } else {
        throw new Error('Failed to secure guest session');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Guest login failed';
      setError(errorMessage);
      console.error('🔒 Guest login failed:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.clearAuth();
    setUser(null);
    setError(null);
    console.log('🔐 User logged out, session cleared');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    guestLogin,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
