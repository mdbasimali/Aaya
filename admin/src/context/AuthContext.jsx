import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  const checkAuth = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    // If no stored token and on /login page, skip redundant call that causes console 401
    if (!token && typeof window !== 'undefined' && window.location.pathname.endsWith('/login')) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/admin/auth/me');
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post('/admin/auth/login', { email, password });
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('admin_token', data.token);
    }
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch {
      // proceed even if logout call fails
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
      setAdmin(null);
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
