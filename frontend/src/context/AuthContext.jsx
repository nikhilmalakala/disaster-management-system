import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      console.warn('AuthContext: failed to parse stored user', e);
      return null;
    }
  });
  // Start in a loading state until we verify token / fetch user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    console.log('AuthContext: init, token present?', !!token);
    if (!token) {
      // No token -> not authenticated
      if (mounted) setLoading(false);
      return () => (mounted = false);
    }

    (async () => {
      try {
        const res = await getMe();
        console.log('AuthContext: getMe success', res?.data?.user);
        const u = res.data.user || {};
        const normalized = { ...u, id: u.id || u._id, _id: u._id || u.id };
        if (!mounted) return;
        setUser(normalized);
        try { localStorage.setItem('user', JSON.stringify(normalized)); } catch (e) { /* ignore */ }
      } catch (err) {
        console.warn('AuthContext: getMe failed', err?.response?.status || err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (mounted) setUser(null);
      } finally {
        if (mounted) {
          console.log('AuthContext: verification complete, setting loading=false');
          setLoading(false);
        }
      }
    })();

    return () => { mounted = false; };
  }, []);

  const login = (token, userData) => {
    console.log('AuthContext: login storing token and user', { hasToken: !!token, userId: userData?._id || userData?.id });
    // Normalize and store user
    const u = userData || {};
    const normalized = { ...u, id: u.id || u._id, _id: u._id || u.id };
    localStorage.setItem('token', token);
    try {
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch (e) {
      console.warn('AuthContext: failed to store user', e);
    }
    setUser(normalized);
    // Ensure loading is false after login so ProtectedRoute renders immediately
    console.log('AuthContext: login finished, user set, loading=false');
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
