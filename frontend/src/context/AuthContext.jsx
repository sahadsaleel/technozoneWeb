import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      localStorage.setItem('refresh_token', res.data.refresh_token);
      setUser(res.data.user);
      setLoading(false);
      navigate('/', { replace: true }); // replace removes /login from history
      return { success: true };
    } catch (e) {
      setError('Invalid username or password');
      setLoading(false);
      return { success: false };
    }
  }, [navigate]);

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
      // proceed regardless
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login', { replace: true }); // replace removes /dashboard from history
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);