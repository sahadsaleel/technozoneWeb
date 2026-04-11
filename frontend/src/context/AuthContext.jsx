import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.data);
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true); 
    setError('');
    try {
      const res = await api.login({ username, password });
      
      localStorage.setItem('token', res.data.access_token);
      // Not storing refresh_token in localStorage explicitly unless required, but let's store it
      localStorage.setItem('refresh_token', res.data.refresh_token);
      
      setUser(res.data.user);
      setLoading(false);
      return { success: true };
    } catch (e) {
      // Return 401 generic failure explicitly
      setError('Invalid username or password'); 
      setLoading(false);
      return { success: false };
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true); 
    setError('');
    try {
      const res = await api.register(data);
      setLoading(false);
      return { success: true, message: res.data.message };
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
      setLoading(false);
      return { success: false };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      // Proceed with local logout regardless of server
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
