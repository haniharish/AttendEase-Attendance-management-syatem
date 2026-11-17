import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check initial authentication state (via HTTP-only cookie or token)
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCurrentUser();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      sessionStorage.removeItem('attendease_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle Login
  const login = async ({ email, password, rememberMe }) => {
    setError(null);
    try {
      const data = await loginUser({ email, password, rememberMe });
      if (data?.success && data?.user) {
        setUser(data.user);
        if (data.token) {
          sessionStorage.setItem('attendease_token', data.token);
        }
        return { success: true, user: data.user };
      }
      throw new Error(data?.message || 'Login failed.');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Handle Student Registration
  const register = async ({ name, email, password, confirmPassword }) => {
    setError(null);
    try {
      const data = await registerUser({ name, email, password, confirmPassword });
      if (data?.success && data?.user) {
        setUser(data.user);
        if (data.token) {
          sessionStorage.setItem('attendease_token', data.token);
        }
        return { success: true, user: data.user };
      }
      throw new Error(data?.message || 'Registration failed.');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Handle Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Logout network error (clearing local state anyway):', err);
    } finally {
      sessionStorage.removeItem('attendease_token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
