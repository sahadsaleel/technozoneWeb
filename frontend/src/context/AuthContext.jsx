import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const clearError = () => setError('');

  const login = useCallback(async (email, password) => {
    setLoading(true); setError('');
    try {
      const res = await api.login({ email, password });
      if (res.data.requiresOTP) {
        setLoading(false);
        return { requiresOTP: true, email };
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setLoading(false);
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
      setLoading(false);
      return { success: false };
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true); setError('');
    try {
      const res = await api.register(data);
      setLoading(false);
      return { success: true, email: data.email, message: res.data.message };
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
      setLoading(false);
      return { success: false };
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    setLoading(true); setError('');
    try {
      const res = await api.verifyOTP({ email, otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setLoading(false);
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.message || 'OTP verification failed');
      setLoading(false);
      return { success: false };
    }
  }, []);

  const resendOTP = useCallback(async (email) => {
    setLoading(true); setError('');
    try {
      const res = await api.resendOTP({ email });
      setLoading(false);
      return { success: true, message: res.data.message, debug: res.data.debug };
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to resend OTP');
      setLoading(false);
      return { success: false };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, verifyOTP, resendOTP, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
